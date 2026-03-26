"""Room CRUD operations."""

from typing import Dict, List, Optional
from datetime import datetime
from sqlalchemy.orm import Session
from sqlalchemy import func

from schema import Room, Admission, Patient
from data_structures import RoomData, RoomStatus
from database import get_db_session


class RoomCRUD:
    """Handles all room-related database operations."""
    
    def __init__(self, db: Session = None):
        self.db = db or get_db_session()
    
    # ========================================================================
    # Core Operations
    # ========================================================================
    
    def create(self, data: RoomData) -> Dict:
        """Create a new room."""
        # Check for duplicate room number
        existing = self.db.query(Room).filter_by(room_number=data.room_number).first()
        if existing:
            raise ValueError(f"Room {data.room_number} already exists")
        
        # Validate capacity
        if data.capacity < 1:
            raise ValueError(f"Room capacity must be at least 1")
        if data.capacity > 20:
            raise ValueError(f"Room capacity cannot exceed 20 beds")
        
        room = Room(
            room_number=data.room_number,
            ward=data.ward,
            room_type=data.room_type,
            capacity=data.capacity,
            floor=data.floor,
            status=data.status
        )
        self.db.add(room)
        self.db.flush()
        return self._to_dict(room)
    
    def get_all(self) -> List[Dict]:
        """Get all rooms."""
        rooms = self.db.query(Room).order_by(Room.floor, Room.room_number).all()
        return [self._to_dict(r) for r in rooms]
    
    def get_by_id(self, room_id: str) -> Optional[Dict]:
        """Get room by ID."""
        room = self.db.query(Room).filter_by(id=room_id).first()
        return self._to_dict(room) if room else None
    
    def get_by_number(self, room_number: str) -> Optional[Dict]:
        """Get room by room number."""
        room = self.db.query(Room).filter_by(room_number=room_number).first()
        return self._to_dict(room) if room else None
    
    def get_available(self) -> List[Dict]:
        """Get all rooms with available beds."""
        rooms = self.db.query(Room).filter_by(status=RoomStatus.AVAILABLE.value).all()
        result = []
        for room in rooms:
            room_dict = self._to_dict(room)
            room_dict['available_beds'] = self._get_available_beds(room.id)
            result.append(room_dict)
        return result
    
    def get_available_rooms_with_beds(self, required_beds: int = 1) -> List[Dict]:
        """Get rooms that can accommodate the required number of beds."""
        rooms = self.db.query(Room).filter_by(status=RoomStatus.AVAILABLE.value).all()
        result = []
        for room in rooms:
            available_beds = self._get_available_beds(room.id)
            if available_beds >= required_beds:
                room_dict = self._to_dict(room)
                room_dict['available_beds'] = available_beds
                result.append(room_dict)
        return result
    
    def get_by_ward(self, ward: str) -> List[Dict]:
        """Get rooms by ward."""
        rooms = self.db.query(Room).filter_by(ward=ward).all()
        return [self._to_dict(r) for r in rooms]
    
    def get_by_status(self, status: str) -> List[Dict]:
        """Get rooms by status."""
        rooms = self.db.query(Room).filter_by(status=status).all()
        return [self._to_dict(r) for r in rooms]
    
    def get_by_room_type(self, room_type: str) -> List[Dict]:
        """Get rooms by type."""
        rooms = self.db.query(Room).filter_by(room_type=room_type).all()
        return [self._to_dict(r) for r in rooms]
    
    def update(self, room_id: str, data: RoomData) -> Optional[Dict]:
        """Update room details."""
        room = self.db.query(Room).filter_by(id=room_id).first()
        if not room:
            return None
        
        # Validate capacity
        if data.capacity < 1:
            raise ValueError(f"Room capacity must be at least 1")
        
        # Check if reducing capacity would conflict with current admissions
        current_occupancy = self._get_current_occupancy(room_id)
        if data.capacity < current_occupancy:
            raise ValueError(
                f"Cannot reduce capacity to {data.capacity} - "
                f"room currently has {current_occupancy} patients admitted"
            )
        
        # Check room number conflict
        if data.room_number != room.room_number:
            existing = self.db.query(Room).filter_by(room_number=data.room_number).first()
            if existing:
                raise ValueError(f"Room {data.room_number} already exists")
            room.room_number = data.room_number
        
        room.ward = data.ward
        room.room_type = data.room_type
        room.capacity = data.capacity
        room.floor = data.floor
        room.status = data.status
        room.updated_at = datetime.now()
        
        self.db.flush()
        return self._to_dict(room)
    
    def update_status(self, room_id: str, status: str) -> bool:
        """Update room status only."""
        room = self.db.query(Room).filter_by(id=room_id).first()
        if room:
            # If marking as occupied, check if room has capacity
            if status == RoomStatus.OCCUPIED.value:
                current_occupancy = self._get_current_occupancy(room_id)
                if current_occupancy == 0:
                    raise ValueError(f"Cannot mark room as occupied - no patients admitted")
            
            room.status = status
            room.updated_at = datetime.now()
            self.db.flush()
            return True
        return False
    
    def delete(self, room_id: str) -> bool:
        """Delete room by ID."""
        room = self.db.query(Room).filter_by(id=room_id).first()
        if not room:
            return False
        
        # Check for any admissions (active or historical)
        admissions = self.db.query(Admission).filter_by(room_id=room_id).first()
        if admissions:
            raise ValueError(f"Cannot delete room {room.room_number} - has admission history")
        
        self.db.delete(room)
        return True
    
    # =========================================================================
    # Bed/Capacity Management
    # =========================================================================
    
    def _get_current_occupancy(self, room_id: str) -> int:
        """Get number of currently admitted patients in room."""
        return self.db.query(Admission).filter(
            Admission.room_id == room_id,
            Admission.status == 'active'
        ).count()
    
    def _get_available_beds(self, room_id: str) -> int:
        """Get number of available beds in room."""
        room = self.db.query(Room).filter_by(id=room_id).first()
        if not room:
            return 0
        
        current_occupancy = self._get_current_occupancy(room_id)
        return max(0, room.capacity - current_occupancy)
    
    def get_room_occupancy(self, room_id: str) -> Dict:
        """Get detailed occupancy information for a room."""
        room = self.db.query(Room).filter_by(id=room_id).first()
        if not room:
            return None
        
        current_occupancy = self._get_current_occupancy(room_id)
        available_beds = room.capacity - current_occupancy
        
        # Get list of patients currently in this room
        patients = self.db.query(Patient).join(Admission).filter(
            Admission.room_id == room_id,
            Admission.status == 'active'
        ).all()
        
        return {
            "room_id": room.id,
            "room_number": room.room_number,
            "capacity": room.capacity,
            "current_occupancy": current_occupancy,
            "available_beds": available_beds,
            "occupancy_percentage": (current_occupancy / room.capacity * 100) if room.capacity > 0 else 0,
            "patients": [
                {
                    "id": p.id,
                    "name": p.full_name,
                    "mrn": p.mrn,
                    "admitted_at": self.db.query(Admission).filter_by(
                        patient_id=p.id, room_id=room_id, status='active'
                    ).first().admitted_at
                }
                for p in patients
            ]
        }
    
    def admit_patient(self, room_id: str, patient_id: str, admission_id: str) -> bool:
        """Admit a patient to a room (increment occupancy)."""
        room = self.db.query(Room).filter_by(id=room_id).first()
        if not room:
            raise ValueError(f"Room {room_id} not found")
        
        available_beds = self._get_available_beds(room_id)
        if available_beds <= 0:
            raise ValueError(f"No available beds in room {room.room_number}")
        
        # Room status should be updated to occupied if it was available
        if room.status == RoomStatus.AVAILABLE.value:
            room.status = RoomStatus.OCCUPIED.value
        
        self.db.flush()
        return True
    
    def discharge_patient(self, room_id: str) -> bool:
        """Discharge a patient from a room (decrement occupancy)."""
        room = self.db.query(Room).filter_by(id=room_id).first()
        if not room:
            raise ValueError(f"Room {room_id} not found")
        
        current_occupancy = self._get_current_occupancy(room_id)
        
        # If this was the last patient, update room status to available
        if current_occupancy - 1 <= 0:
            room.status = RoomStatus.AVAILABLE.value
        
        self.db.flush()
        return True
    
    # =========================================================================
    # Statistics
    # =========================================================================
    
    def get_statistics(self) -> Dict:
        """Get room statistics including bed-level metrics."""
        total = self.db.query(Room).count()
        total_beds = self.db.query(func.sum(Room.capacity)).scalar() or 0
        
        # Count rooms by status
        available_rooms = self.db.query(Room).filter_by(status=RoomStatus.AVAILABLE.value).count()
        occupied_rooms = self.db.query(Room).filter_by(status=RoomStatus.OCCUPIED.value).count()
        cleaning_rooms = self.db.query(Room).filter_by(status=RoomStatus.CLEANING.value).count()
        maintenance_rooms = self.db.query(Room).filter_by(status=RoomStatus.MAINTENANCE.value).count()
        
        # Calculate bed occupancy
        occupied_beds = 0
        for room in self.db.query(Room).all():
            occupied_beds += self._get_current_occupancy(room.id)
        
        bed_occupancy_rate = (occupied_beds / total_beds * 100) if total_beds > 0 else 0
        
        # Rooms by ward with bed counts
        wards = self.db.query(Room.ward).distinct().all()
        by_ward = {}
        for ward in wards:
            if ward[0]:
                ward_rooms = self.db.query(Room).filter_by(ward=ward[0]).all()
                by_ward[ward[0]] = {
                    "room_count": len(ward_rooms),
                    "total_beds": sum(r.capacity for r in ward_rooms),
                    "occupied_beds": sum(self._get_current_occupancy(r.id) for r in ward_rooms)
                }
        
        # Rooms by type with bed counts
        room_types = ['private', 'shared', 'icu', 'emergency', 'recovery', 'isolation']
        by_type = {}
        for room_type in room_types:
            type_rooms = self.db.query(Room).filter_by(room_type=room_type).all()
            if type_rooms:
                by_type[room_type] = {
                    "room_count": len(type_rooms),
                    "total_beds": sum(r.capacity for r in type_rooms),
                    "occupied_beds": sum(self._get_current_occupancy(r.id) for r in type_rooms)
                }
        
        return {
            "total_rooms": total,
            "total_beds": total_beds,
            "occupied_beds": occupied_beds,
            "bed_occupancy_rate": round(bed_occupancy_rate, 1),
            "rooms_by_status": {
                "available": available_rooms,
                "occupied": occupied_rooms,
                "cleaning": cleaning_rooms,
                "maintenance": maintenance_rooms
            },
            "rooms_by_ward": by_ward,
            "rooms_by_type": by_type
        }
    
    # =========================================================================
    # Helper Methods
    # =========================================================================
    
    def _to_dict(self, room: Room) -> Dict:
        """Convert Room model to dictionary."""
        return {
            "id": room.id,
            "room_number": room.room_number,
            "ward": room.ward,
            "room_type": room.room_type,
            "capacity": room.capacity,
            "floor": room.floor,
            "status": room.status,
            "is_available": room.is_available,
            "current_occupancy": self._get_current_occupancy(room.id),
            "available_beds": self._get_available_beds(room.id),
            "created_at": room.created_at.isoformat() if room.created_at else None,
            "updated_at": room.updated_at.isoformat() if room.updated_at else None
        }