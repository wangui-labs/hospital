"""Admission CRUD operations."""

from typing import Dict, List, Optional
from datetime import datetime
from sqlalchemy.orm import Session

from schema import Admission, Patient, Room, Employee
from data_structures import RoomStatus
from database import get_db_session


class AdmissionCRUD:
    """Handles all admission-related database operations."""
    
    def __init__(self, db: Session = None):
        self.db = db or get_db_session()
    
    # ========================================================================
    # Core Operations
    # ========================================================================
    
    def create(self, patient_id: str, room_id: str, doctor_id: str,
               reason: str, priority: str = 'routine') -> Dict:
        """Create a new admission."""
        # Verify patient exists
        patient = self.db.query(Patient).filter_by(id=patient_id).first()
        if not patient:
            raise ValueError(f"Patient with ID {patient_id} not found")
        
        # Verify room exists and is available
        room = self.db.query(Room).filter_by(id=room_id).first()
        if not room:
            raise ValueError(f"Room with ID {room_id} not found")
        if room.status != RoomStatus.AVAILABLE.value:
            raise ValueError(f"Room {room.room_number} is not available (status: {room.status})")
        
        # Verify doctor exists
        doctor = self.db.query(Employee).filter_by(id=doctor_id).first()
        if not doctor:
            raise ValueError(f"Employee with ID {doctor_id} not found")
        
        # Update room status to occupied
        room.status = RoomStatus.OCCUPIED.value
        
        admission = Admission(
            patient_id=patient_id,
            room_id=room_id,
            attending_employee_id=doctor_id,
            admission_reason=reason,
            priority=priority,
            status='active'
        )
        self.db.add(admission)
        self.db.flush()
        return self._to_dict(admission)
    
    def get_all(self, limit: int = 100, include_inactive: bool = False) -> List[Dict]:
        """Get all admissions with optional filtering."""
        query = self.db.query(Admission).order_by(Admission.admitted_at.desc())
        
        if not include_inactive:
            query = query.filter_by(status='active')
        
        admissions = query.limit(limit).all()
        return [self._to_dict(a) for a in admissions]
    
    def get_by_id(self, admission_id: str) -> Optional[Dict]:
        """Get admission by ID."""
        admission = self.db.query(Admission).filter_by(id=admission_id).first()
        if not admission:
            return None
        return self._to_dict(admission)
    
    def get_active(self) -> List[Dict]:
        """Get currently active admissions."""
        admissions = self.db.query(Admission).filter_by(status='active').all()
        return [self._to_dict(a) for a in admissions]
    
    def get_by_patient(self, patient_id: str) -> List[Dict]:
        """Get admissions by patient."""
        admissions = self.db.query(Admission).filter_by(patient_id=patient_id).all()
        return [self._to_dict(a) for a in admissions]
    
    def get_by_room(self, room_id: str) -> List[Dict]:
        """Get admissions by room."""
        admissions = self.db.query(Admission).filter_by(room_id=room_id).all()
        return [self._to_dict(a) for a in admissions]
    
    def get_by_doctor(self, doctor_id: str) -> List[Dict]:
        """Get admissions by attending doctor."""
        admissions = self.db.query(Admission).filter_by(attending_employee_id=doctor_id).all()
        return [self._to_dict(a) for a in admissions]
    
    def get_by_date_range(self, start_date: str, end_date: str) -> List[Dict]:
        """Get admissions within a date range."""
        start = datetime.fromisoformat(start_date)
        end = datetime.fromisoformat(end_date)
        
        admissions = self.db.query(Admission).filter(
            Admission.admitted_at >= start,
            Admission.admitted_at <= end
        ).order_by(Admission.admitted_at.desc()).all()
        
        return [self._to_dict(a) for a in admissions]
    
    def update(self, admission_id: str, reason: str = None, 
               priority: str = None, notes: str = None) -> Optional[Dict]:
        """Update admission details."""
        admission = self.db.query(Admission).filter_by(id=admission_id).first()
        if not admission:
            return None
        
        if reason:
            admission.admission_reason = reason
        if priority:
            admission.priority = priority
        if notes is not None:
            admission.notes = notes
        
        self.db.flush()
        return self._to_dict(admission)
    
    def discharge(self, admission_id: str) -> bool:
        """Discharge patient (end admission)."""
        admission = self.db.query(Admission).filter_by(id=admission_id).first()
        if not admission:
            return False
        
        if admission.status == 'active':
            admission.status = 'discharged'
            admission.discharged_at = datetime.utcnow()
            
            # Update room status to available
            room = self.db.query(Room).filter_by(id=admission.room_id).first()
            if room:
                room.status = RoomStatus.AVAILABLE.value
            
            self.db.flush()
            return True
        return False
    
    def transfer(self, admission_id: str, new_room_id: str) -> Optional[Dict]:
        """Transfer patient to a different room."""
        admission = self.db.query(Admission).filter_by(id=admission_id).first()
        if not admission:
            raise ValueError(f"Admission with ID {admission_id} not found")
        
        if admission.status != 'active':
            raise ValueError(f"Cannot transfer inactive admission (status: {admission.status})")
        
        # Get new room
        new_room = self.db.query(Room).filter_by(id=new_room_id).first()
        if not new_room:
            raise ValueError(f"Room with ID {new_room_id} not found")
        
        if new_room.status != RoomStatus.AVAILABLE.value:
            raise ValueError(f"Room {new_room.room_number} is not available")
        
        # Free up old room
        old_room = self.db.query(Room).filter_by(id=admission.room_id).first()
        if old_room:
            old_room.status = RoomStatus.AVAILABLE.value
        
        # Assign new room
        new_room.status = RoomStatus.OCCUPIED.value
        admission.room_id = new_room_id
        
        self.db.flush()
        return self._to_dict(admission)
    
    def delete(self, admission_id: str) -> bool:
        """Permanently delete admission record."""
        admission = self.db.query(Admission).filter_by(id=admission_id).first()
        if not admission:
            return False
        
        # If admission was active, free up the room
        if admission.status == 'active':
            room = self.db.query(Room).filter_by(id=admission.room_id).first()
            if room:
                room.status = RoomStatus.AVAILABLE.value
        
        self.db.delete(admission)
        self.db.flush()
        return True
    
    # ========================================================================
    # Statistics
    # ========================================================================
    
    def get_statistics(self) -> Dict:
        """Get admission statistics."""
        total = self.db.query(Admission).count()
        active = self.db.query(Admission).filter_by(status='active').count()
        discharged = self.db.query(Admission).filter_by(status='discharged').count()
        
        # Priority breakdown
        emergency = self.db.query(Admission).filter_by(priority='emergency').count()
        urgent = self.db.query(Admission).filter_by(priority='urgent').count()
        routine = self.db.query(Admission).filter_by(priority='routine').count()
        
        # Average length of stay for discharged patients
        discharged_admissions = self.db.query(Admission).filter_by(status='discharged').all()
        total_days = 0
        for admission in discharged_admissions:
            if admission.discharged_at and admission.admitted_at:
                days = (admission.discharged_at - admission.admitted_at).days
                total_days += max(0, days)
        
        avg_length = round(total_days / len(discharged_admissions), 1) if discharged_admissions else 0
        
        # Admissions by month (last 6 months)
        from datetime import timedelta
        today = datetime.utcnow().date()
        six_months_ago = today - timedelta(days=180)
        
        monthly = {}
        admissions = self.db.query(Admission).filter(
            Admission.admitted_at >= six_months_ago
        ).all()
        
        for admission in admissions:
            month_key = admission.admitted_at.strftime('%Y-%m')
            monthly[month_key] = monthly.get(month_key, 0) + 1
        
        return {
            "total": total,
            "active": active,
            "discharged": discharged,
            "by_priority": {
                "emergency": emergency,
                "urgent": urgent,
                "routine": routine
            },
            "average_length_of_stay_days": avg_length,
            "monthly_admissions": monthly
        }
    
    # ========================================================================
    # Helper Methods
    # ========================================================================
    
    def _to_dict(self, admission: Admission) -> Dict:
        """Convert Admission model to dictionary."""
        patient = self.db.query(Patient).filter_by(id=admission.patient_id).first()
        room = self.db.query(Room).filter_by(id=admission.room_id).first()
        doctor = self.db.query(Employee).filter_by(id=admission.attending_employee_id).first()
        
        # Calculate length of stay
        length_of_stay = None
        end_date = admission.discharged_at or datetime.utcnow()
        if admission.admitted_at:
            days = (end_date - admission.admitted_at).days
            length_of_stay = max(0, days)
        
        return {
            "id": admission.id,
            "patient_id": admission.patient_id,
            "patient_name": patient.full_name if patient else None,
            "patient_mrn": patient.mrn if patient else None,
            "room_id": admission.room_id,
            "room_number": room.room_number if room else None,
            "room_ward": room.ward if room else None,
            "doctor_id": admission.attending_employee_id,
            "doctor_name": doctor.full_name if doctor else None,
            "reason": admission.admission_reason,
            "priority": admission.priority,
            "status": admission.status,
            "admitted_at": admission.admitted_at.isoformat() if admission.admitted_at else None,
            "discharged_at": admission.discharged_at.isoformat() if admission.discharged_at else None,
            "length_of_stay_days": length_of_stay,
            "notes": admission.notes
        }