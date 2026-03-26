"""Shift CRUD operations."""

from typing import Dict, List, Optional
from datetime import datetime, time
from sqlalchemy.orm import Session

from schema import Shift, Employee
from data_structures import ShiftData, ShiftType, Severity
from database import get_db_session
from crud.activity import ActivityCRUD


class ShiftCRUD:
    """Handles all shift-related database operations."""
    
    def __init__(self, db: Session = None):
        self.db = db or get_db_session()
        self.activity = ActivityCRUD(self.db)
    
    # ========================================================================
    # Core Operations
    # ========================================================================
    
    def create(self, data: ShiftData) -> Dict:
        """Create a new shift."""
        # Verify employee exists
        employee = self.db.query(Employee).filter_by(id=data.employee_id).first()
        if not employee:
            raise ValueError(f"Employee {data.employee_id} not found")
        
        # Parse date and times
        shift_date = datetime.fromisoformat(data.date).date()
        start = datetime.combine(shift_date, datetime.strptime(data.start_time, "%H:%M").time())
        end = datetime.combine(shift_date, datetime.strptime(data.end_time, "%H:%M").time())
        
        # Check for overlapping shifts
        overlap = self.db.query(Shift).filter(
            Shift.employee_id == data.employee_id,
            Shift.date == shift_date,
            Shift.is_active == True,
            (Shift.start_time <= end) & (Shift.end_time >= start)
        ).first()
        
        if overlap:
            raise ValueError("Employee already has a shift during this time")
        
        shift = Shift(
            employee_id=data.employee_id,
            shift_type=data.shift_type,
            date=shift_date,
            start_time=start,
            end_time=end,
            department=data.department or employee.department,
            notes=data.notes,
            is_active=True
        )
        self.db.add(shift)
        self.db.flush()
        
        self.activity.log("scheduling", "shift_created", Severity.INFO.value,
                          metadata={"employee": employee.full_name, "date": data.date})
        
        return self._to_dict(shift, employee)
    
    def get_all(self, include_inactive: bool = False, limit: int = 100) -> List[Dict]:
        """Get all shifts."""
        query = self.db.query(Shift).order_by(Shift.date.desc(), Shift.start_time.desc())
        if not include_inactive:
            query = query.filter_by(is_active=True)
        
        shifts = query.limit(limit).all()
        result = []
        for shift in shifts:
            employee = self.db.query(Employee).filter_by(id=shift.employee_id).first()
            result.append(self._to_dict(shift, employee))
        return result
    
    def get_by_id(self, shift_id: str) -> Optional[Dict]:
        """Get shift by ID."""
        shift = self.db.query(Shift).filter_by(id=shift_id).first()
        if not shift:
            return None
        employee = self.db.query(Employee).filter_by(id=shift.employee_id).first()
        return self._to_dict(shift, employee)
    
    def get_by_employee(self, employee_id: str, start: str = None, end: str = None) -> List[Dict]:
        """Get shifts by employee with optional date range."""
        query = self.db.query(Shift).filter_by(employee_id=employee_id, is_active=True)
        
        if start:
            query = query.filter(Shift.date >= datetime.fromisoformat(start).date())
        if end:
            query = query.filter(Shift.date <= datetime.fromisoformat(end).date())
        
        shifts = query.order_by(Shift.date.desc()).all()
        employee = self.db.query(Employee).filter_by(id=employee_id).first()
        return [self._to_dict(s, employee) for s in shifts]
    
    def get_by_date(self, date: str, department: str = None) -> List[Dict]:
        """Get shifts by date."""
        shift_date = datetime.fromisoformat(date).date()
        query = self.db.query(Shift).filter_by(date=shift_date, is_active=True)
        if department:
            query = query.filter_by(department=department)
        
        shifts = query.order_by(Shift.start_time).all()
        result = []
        for shift in shifts:
            employee = self.db.query(Employee).filter_by(id=shift.employee_id).first()
            result.append({
                "id": shift.id,
                "employee_id": shift.employee_id,
                "employee_name": employee.full_name if employee else None,
                "shift_type": shift.shift_type,
                "start": shift.start_time.strftime("%H:%M"),
                "end": shift.end_time.strftime("%H:%M"),
                "duration": (shift.end_time - shift.start_time).seconds / 3600,
                "department": shift.department
            })
        return result
    
    def get_current(self) -> List[Dict]:
        """Get employees currently on shift."""
        now = datetime.now()
        shifts = self.db.query(Shift).filter(
            Shift.date == now.date(),
            Shift.start_time <= now,
            Shift.end_time >= now,
            Shift.is_active == True
        ).all()
        
        result = []
        for shift in shifts:
            employee = self.db.query(Employee).filter_by(id=shift.employee_id).first()
            result.append({
                "id": shift.id,
                "employee_id": shift.employee_id,
                "employee_name": employee.full_name if employee else None,
                "shift_type": shift.shift_type,
                "start": shift.start_time.strftime("%H:%M"),
                "end": shift.end_time.strftime("%H:%M"),
                "remaining": (shift.end_time - now).seconds / 3600
            })
        return result
    
    def update(self, shift_id: str, data: ShiftData) -> Optional[Dict]:
        """Update shift."""
        shift = self.db.query(Shift).filter_by(id=shift_id).first()
        if not shift:
            return None
        
        # Parse new values
        new_date = datetime.fromisoformat(data.date).date() if data.date else shift.date
        new_start = datetime.combine(new_date, datetime.strptime(data.start_time, "%H:%M").time()) if data.start_time else shift.start_time
        new_end = datetime.combine(new_date, datetime.strptime(data.end_time, "%H:%M").time()) if data.end_time else shift.end_time
        
        # Check overlap (excluding self)
        overlap = self.db.query(Shift).filter(
            Shift.employee_id == (data.employee_id or shift.employee_id),
            Shift.date == new_date,
            Shift.id != shift_id,
            Shift.is_active == True,
            (Shift.start_time <= new_end) & (Shift.end_time >= new_start)
        ).first()
        
        if overlap:
            raise ValueError("Employee already has a shift during this time")
        
        # Update fields
        if data.employee_id:
            shift.employee_id = data.employee_id
        if data.shift_type:
            shift.shift_type = data.shift_type
        if data.date:
            shift.date = new_date
        if data.start_time:
            shift.start_time = new_start
        if data.end_time:
            shift.end_time = new_end
        if data.department:
            shift.department = data.department
        if data.notes is not None:
            shift.notes = data.notes
        
        shift.updated_at = datetime.now()
        self.db.flush()
        
        employee = self.db.query(Employee).filter_by(id=shift.employee_id).first()
        return self._to_dict(shift, employee)
    
    def cancel(self, shift_id: str) -> bool:
        """Cancel shift (soft delete)."""
        shift = self.db.query(Shift).filter_by(id=shift_id).first()
        if shift:
            shift.is_active = False
            shift.updated_at = datetime.now()
            self.db.flush()
            return True
        return False
    
    def delete(self, shift_id: str) -> bool:
        """Permanently delete shift."""
        shift = self.db.query(Shift).filter_by(id=shift_id).first()
        if shift:
            self.db.delete(shift)
            return True
        return False
    
    def get_stats(self, start: str = None, end: str = None) -> Dict:
        """Get shift statistics."""
        query = self.db.query(Shift).filter_by(is_active=True)
        
        if start:
            query = query.filter(Shift.date >= datetime.fromisoformat(start).date())
        if end:
            query = query.filter(Shift.date <= datetime.fromisoformat(end).date())
        
        shifts = query.all()
        
        # Count by type
        by_type = {}
        for st in ShiftType:
            by_type[st.value] = sum(1 for s in shifts if s.shift_type == st.value)
        
        # Count by department
        by_dept = {}
        for s in shifts:
            dept = s.department or "Unassigned"
            by_dept[dept] = by_dept.get(dept, 0) + 1
        
        total_hours = sum((s.end_time - s.start_time).seconds / 3600 for s in shifts)
        
        return {
            "total": len(shifts),
            "unique_employees": len(set(s.employee_id for s in shifts)),
            "total_hours": round(total_hours, 2),
            "avg_hours": round(total_hours / len(shifts), 2) if shifts else 0,
            "by_type": by_type,
            "by_department": by_dept
        }
    
    # ========================================================================
    # Helper Methods
    # ========================================================================
    
    def _to_dict(self, shift: Shift, employee: Employee = None) -> Dict:
        """Convert Shift model to dictionary."""
        duration = None
        if shift.start_time and shift.end_time:
            duration = (shift.end_time - shift.start_time).seconds / 3600
        
        return {
            "id": shift.id,
            "employee_id": shift.employee_id,
            "employee_name": employee.full_name if employee else None,
            "employee_number": employee.employee_number if employee else None,
            "department": shift.department,
            "shift_type": shift.shift_type,
            "date": shift.date.isoformat() if shift.date else None,
            "start": shift.start_time.isoformat() if shift.start_time else None,
            "end": shift.end_time.isoformat() if shift.end_time else None,
            "duration": duration,
            "notes": shift.notes,
            "is_active": shift.is_active
        }