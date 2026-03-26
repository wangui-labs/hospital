"""
Hospital Activity Dashboard API
FastAPI backend with WebSocket support
"""
from fastapi import FastAPI, HTTPException, WebSocket, WebSocketDisconnect, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer
from typing import Dict, Optional, List
from pydantic import BaseModel, Field
from contextlib import asynccontextmanager
import logging

from database import init_db, get_db_session, create_default_users, verify_db
from crud import (
    UserCRUD, EmployeeCRUD, DepartmentCRUD, PatientCRUD, 
    RoomCRUD, BadgeCRUD, ShiftCRUD, ActivityCRUD, AdmissionCRUD
)
from data_structures import (
    UserData, EmployeeData, PatientData, RoomData, BadgeData, ShiftData
)
from websocket_manager import manager

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# ============================================================================
# DATABASE DEPENDENCY
# ============================================================================

def get_db():
    """Dependency to get a database session for each request"""
    with get_db_session() as db:
        yield db

# ============================================================================
# PYDANTIC MODELS
# ============================================================================

class LoginRequest(BaseModel):
    username: str
    password: str

class CreateUserRequest(BaseModel):
    username: str = Field(..., min_length=3, max_length=64)
    email: str = Field(..., pattern=r'^[\w\.-]+@[\w\.-]+\.\w+$')
    password: str = Field(..., min_length=4)
    role: str = Field(..., pattern=r'^(admin|doctor|nurse|receptionist|security|manager)$')

class CreateEmployeeRequest(BaseModel):
    user_id: Optional[str] = None
    first_name: str = Field(..., min_length=1, max_length=128)
    last_name: str = Field(..., min_length=1, max_length=128)
    employee_number: str = Field(..., min_length=1, max_length=64)
    department: str = Field(..., min_length=1, max_length=128)
    job_title: str = Field(..., min_length=1, max_length=128)
    phone: Optional[str] = None

class CreateBadgeRequest(BaseModel):
    employee_id: str
    badge_number: str = Field(..., min_length=1, max_length=64)
    access_level: str = Field(..., pattern=r'^(basic|standard|elevated|admin)$')

class CreateRoomRequest(BaseModel):
    room_number: str = Field(..., min_length=1, max_length=32)
    ward: str = Field(..., min_length=1, max_length=128)
    room_type: str = Field(..., pattern=r'^(private|shared|icu|emergency|recovery|isolation)$')
    capacity: int = Field(..., ge=1, le=10)
    floor: int = Field(..., ge=0, le=50)

class UpdateRoomRequest(BaseModel):
    status: str = Field(..., pattern=r'^(available|occupied|cleaning|maintenance)$')

class CreatePatientRequest(BaseModel):
    mrn: str = Field(..., min_length=1, max_length=64)
    first_name: str = Field(..., min_length=1, max_length=128)
    last_name: str = Field(..., min_length=1, max_length=128)
    date_of_birth: str = Field(..., pattern=r'^\d{4}-\d{2}-\d{2}$')
    gender: str = Field(..., pattern=r'^(male|female|other|prefer_not_to_say)$')
    blood_type: Optional[str] = Field(None, pattern=r'^(A\+|A-|B\+|B-|AB\+|AB-|O\+|O-|unknown)$')
    contact_phone: Optional[str] = None
    contact_email: Optional[str] = None

class CreateShiftRequest(BaseModel):
    employee_id: str
    shift_type: str = Field(..., pattern=r'^(morning|afternoon|night|oncall)$')
    date: str = Field(..., pattern=r'^\d{4}-\d{2}-\d{2}$')
    start_time: str = Field(..., pattern=r'^\d{2}:\d{2}$')
    end_time: str = Field(..., pattern=r'^\d{2}:\d{2}$')
    notes: Optional[str] = None

class CreateAdmissionRequest(BaseModel):
    patient_id: str
    room_id: str
    attending_employee_id: str
    admission_reason: str = Field(..., min_length=1)
    priority: str = Field("routine", pattern=r'^(routine|urgent|emergency)$')

# ============================================================================
# FASTAPI APPLICATION
# ============================================================================

@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("🚀 Starting Hospital Dashboard API...")
    
    init_db()
    create_default_users()
    verify_db()
    
    logger.info("✅ Database initialized")
    logger.info("🔐 Default users: admin/admin, user/user, system/system")
    logger.info("💡 Database is clean - add your own data!")
    yield
    
    logger.info("🛑 Shutting down Hospital Dashboard API...")

app = FastAPI(
    title="Hospital Activity Dashboard", 
    version="2.0.0",
    lifespan=lifespan,
    description="Real-time hospital management system with WebSocket support"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000", 
        "http://127.0.0.1:3000",
        "http://localhost:8000",
        "http://127.0.0.1:8000"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

security = HTTPBearer()

# ============================================================================
# AUTHENTICATION ENDPOINTS
# ============================================================================

@app.post("/api/login", tags=["Authentication"])
async def login(request: LoginRequest, db=Depends(get_db)):
    user_crud = UserCRUD(db)
    
    user = user_crud.authenticate(request.username, request.password)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid username or password")
    
    activity_crud = ActivityCRUD(db)
    activity_crud.log(
        'auth', 
        f"{user['username']} logged in", 
        'info', 
        user_id=user['id'],
        metadata={"username": user['username'], "role": user['role']}
    )
    
    return {
        "user_id": user['id'],
        "username": user['username'],
        "role": user['role'],
        "message": f"Welcome {user['username']}"
    }

# ============================================================================
# ADMIN ENDPOINTS
# ============================================================================

@app.get("/api/admin/users", tags=["Admin"])
async def admin_get_users(db=Depends(get_db)):
    user_crud = UserCRUD(db)
    users = user_crud.get_all()
    return {"users": users}

@app.post("/api/admin/users", tags=["Admin"])
async def admin_create_user(request: CreateUserRequest, db=Depends(get_db)):
    try:
        user_crud = UserCRUD(db)
        user_data = UserData(
            username=request.username,
            email=request.email,
            password=request.password,
            role=request.role
        )
        user = user_crud.create(user_data)
        
        activity_crud = ActivityCRUD(db)
        activity_crud.log('auth', f"New user created: {request.username}", 'info')
        
        await manager.broadcast({
            "type": "user_created",
            "data": user
        })
        
        return user
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.get("/api/admin/employees", tags=["Admin"])
async def admin_get_employees(db=Depends(get_db)):
    employee_crud = EmployeeCRUD(db)
    employees = employee_crud.get_all()
    return {"employees": employees}

@app.post("/api/admin/employees", tags=["Admin"])
async def admin_create_employee(request: CreateEmployeeRequest, db=Depends(get_db)):
    try:
        employee_crud = EmployeeCRUD(db)
        employee_data = EmployeeData(
            user_id=request.user_id,
            first_name=request.first_name,
            last_name=request.last_name,
            employee_number=request.employee_number,
            department=request.department,
            job_title=request.job_title,
            phone=request.phone
        )
        employee = employee_crud.create(employee_data)
        
        activity_crud = ActivityCRUD(db)
        activity_crud.log(
            'system',
            f"New employee created: {request.first_name} {request.last_name}", 
            'info',
            employee_id=employee['id']
        )
        
        await manager.broadcast({
            "type": "employee_created",
            "data": employee
        })
        
        return employee
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.delete("/api/admin/employees/{employee_id}", tags=["Admin"])
async def admin_delete_employee(employee_id: str, db=Depends(get_db)):
    try:
        employee_crud = EmployeeCRUD(db)
        result = employee_crud.delete(employee_id)
        if result:
            activity_crud = ActivityCRUD(db)
            activity_crud.log('system', f"Employee deleted: {employee_id}", 'warning')
            await manager.broadcast({
                "type": "employee_deleted",
                "data": {"id": employee_id}
            })
            return {"message": "Employee deleted successfully"}
        raise HTTPException(status_code=404, detail="Employee not found")
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.get("/api/admin/badges", tags=["Admin"])
async def admin_get_badges(db=Depends(get_db)):
    badge_crud = BadgeCRUD(db)
    badges = badge_crud.get_all()
    return {"badges": badges}

@app.post("/api/admin/badges", tags=["Admin"])
async def admin_create_badge(request: CreateBadgeRequest, db=Depends(get_db)):
    try:
        badge_crud = BadgeCRUD(db)
        badge_data = BadgeData(
            employee_id=request.employee_id,
            badge_number=request.badge_number,
            access_level=request.access_level
        )
        badge = badge_crud.create(badge_data)
        
        activity_crud = ActivityCRUD(db)
        activity_crud.log('badge', f"New badge issued: {request.badge_number}", 'info')
        
        await manager.broadcast({
            "type": "badge_created",
            "data": badge
        })
        
        return badge
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.get("/api/admin/rooms", tags=["Admin"])
async def admin_get_rooms(db=Depends(get_db)):
    room_crud = RoomCRUD(db)
    rooms = room_crud.get_all()
    return {"rooms": rooms}

@app.post("/api/admin/rooms", tags=["Admin"])
async def admin_create_room(request: CreateRoomRequest, db=Depends(get_db)):
    try:
        room_crud = RoomCRUD(db)
        room_data = RoomData(
            room_number=request.room_number,
            ward=request.ward,
            room_type=request.room_type,
            capacity=request.capacity,
            floor=request.floor
        )
        room = room_crud.create(room_data)
        
        activity_crud = ActivityCRUD(db)
        activity_crud.log('room', f"New room created: {request.room_number}", 'info')
        
        await manager.broadcast({
            "type": "room_created",
            "data": room
        })
        
        return room
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.put("/api/admin/rooms/{room_id}", tags=["Admin"])
async def admin_update_room(room_id: str, request: UpdateRoomRequest, db=Depends(get_db)):
    try:
        room_crud = RoomCRUD(db)
        result = room_crud.update_status(room_id, request.status)
        if result:
            activity_crud = ActivityCRUD(db)
            activity_crud.log('room', f"Room {room_id} status updated to {request.status}", 'info')
            await manager.broadcast({
                "type": "room_updated",
                "data": {"id": room_id, "status": request.status}
            })
            return {"message": "Room updated successfully"}
        raise HTTPException(status_code=404, detail="Room not found")
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.delete("/api/admin/rooms/{room_id}", tags=["Admin"])
async def admin_delete_room(room_id: str, db=Depends(get_db)):
    try:
        room_crud = RoomCRUD(db)
        result = room_crud.delete(room_id)
        if result:
            activity_crud = ActivityCRUD(db)
            activity_crud.log('room', f"Room deleted: {room_id}", 'warning')
            await manager.broadcast({
                "type": "room_deleted",
                "data": {"id": room_id}
            })
            return {"message": "Room deleted successfully"}
        raise HTTPException(status_code=404, detail="Room not found")
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.get("/api/admin/patients", tags=["Admin"])
async def admin_get_patients(db=Depends(get_db)):
    patient_crud = PatientCRUD(db)
    patients = patient_crud.get_all()
    return {"patients": patients}

@app.post("/api/admin/patients", tags=["Admin"])
async def admin_create_patient(request: CreatePatientRequest, db=Depends(get_db)):
    try:
        patient_crud = PatientCRUD(db)
        patient_data = PatientData(
            mrn=request.mrn,
            first_name=request.first_name,
            last_name=request.last_name,
            date_of_birth=request.date_of_birth,
            gender=request.gender,
            blood_type=request.blood_type,
            contact_phone=request.contact_phone,
            contact_email=request.contact_email
        )
        patient = patient_crud.create(patient_data)
        
        activity_crud = ActivityCRUD(db)
        activity_crud.log(
            'patient', 
            f"New patient registered: {request.first_name} {request.last_name}", 
            'info',
            patient_id=patient['id']
        )
        
        await manager.broadcast({
            "type": "patient_created",
            "data": patient
        })
        
        return patient
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.get("/api/admin/shifts", tags=["Admin"])
async def admin_get_shifts(db=Depends(get_db)):
    shift_crud = ShiftCRUD(db)
    shifts = shift_crud.get_all()
    return {"shifts": shifts}

@app.post("/api/admin/shifts", tags=["Admin"])
async def admin_create_shift(request: CreateShiftRequest, db=Depends(get_db)):
    try:
        shift_crud = ShiftCRUD(db)
        shift_data = ShiftData(
            employee_id=request.employee_id,
            shift_type=request.shift_type,
            date=request.date,
            start_time=request.start_time,
            end_time=request.end_time,
            notes=request.notes
        )
        shift = shift_crud.create(shift_data)
        
        activity_crud = ActivityCRUD(db)
        activity_crud.log('shift', f"New shift scheduled", 'info')
        
        await manager.broadcast({
            "type": "shift_created",
            "data": shift
        })
        
        return shift
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

# ============================================================================
# ADMISSION ENDPOINTS
# ============================================================================

@app.post("/api/admissions", tags=["Admissions"])
async def create_admission_endpoint(request: CreateAdmissionRequest, db=Depends(get_db)):
    try:
        admission_crud = AdmissionCRUD(db)
        admission = admission_crud.create(
            request.patient_id, 
            request.room_id, 
            request.attending_employee_id,
            request.admission_reason, 
            request.priority
        )
        
        activity_crud = ActivityCRUD(db)
        activity_crud.log('admission', f"Patient admitted", 'info', patient_id=request.patient_id)
        
        await manager.broadcast({
            "type": "admission_created",
            "data": admission
        })
        
        return admission
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

# ============================================================================
# PUBLIC ENDPOINTS
# ============================================================================

@app.get("/", tags=["Info"])
async def root():
    return {
        "name": "Hospital Activity Dashboard",
        "version": "2.0.0",
        "status": "running",
        "websocket": "ws://localhost:8000/ws/{user_id}",
        "endpoints": {
            "login": "POST /api/login",
            "activity_log": "GET /api/activity-log",
            "rooms": "GET /api/rooms",
            "admissions": "GET /api/admissions",
            "admin": "GET/POST/PUT/DELETE /api/admin/*"
        }
    }

@app.get("/api/activity-log", tags=["Public"])
async def get_activity(limit: int = 50, db=Depends(get_db)):
    activity_crud = ActivityCRUD(db)
    logs = activity_crud.get_recent(limit)
    return {"logs": logs, "count": len(logs)}

@app.get("/api/rooms", tags=["Public"])
async def get_rooms(db=Depends(get_db)):
    room_crud = RoomCRUD(db)
    rooms = room_crud.get_all()
    return {"rooms": rooms}

@app.get("/api/admissions", tags=["Public"])
async def get_admissions(db=Depends(get_db)):
    admission_crud = AdmissionCRUD(db)
    admissions = admission_crud.get_active()
    return {"admissions": admissions}

@app.post("/api/activity", tags=["Public"])
async def create_activity(
    category: str, 
    action: str, 
    severity: str = "info", 
    user_id: Optional[str] = None,
    db=Depends(get_db)
):
    activity_crud = ActivityCRUD(db)
    activity = activity_crud.log(category, action, severity, user_id=user_id)
    
    await manager.broadcast({
        "type": "activity",
        "data": activity
    })
    
    return activity

# ============================================================================
# WEBSOCKET ENDPOINTS
# ============================================================================

@app.websocket("/ws/{user_id}")
async def websocket_endpoint(websocket: WebSocket, user_id: str):
    await manager.connect(user_id, websocket)
    
    try:
        await manager.send_personal_message(user_id, {
            "type": "connection",
            "status": "connected",
            "message": f"Welcome {user_id}"
        })
        
        while True:
            data = await websocket.receive_text()
            
            if data == "ping":
                await websocket.send_text("pong")
            elif data == "get_stats":
                await manager.send_personal_message(user_id, {
                    "type": "stats",
                    "data": {
                        "active_connections": manager.get_connection_count(),
                        "connected_users": manager.get_connected_users()
                    }
                })
            else:
                await manager.send_personal_message(user_id, {
                    "type": "echo",
                    "data": data
                })
                
    except WebSocketDisconnect:
        manager.disconnect(user_id)
        logger.info(f"WebSocket disconnected: {user_id}")
    except Exception as e:
        logger.error(f"WebSocket error for {user_id}: {e}")
        manager.disconnect(user_id)

# ============================================================================
# HEALTH CHECK
# ============================================================================

@app.get("/health", tags=["Info"])
async def health_check():
    return {
        "status": "healthy",
        "database": "connected",
        "websocket": manager.get_connection_count(),
        "timestamp": "now"
    }