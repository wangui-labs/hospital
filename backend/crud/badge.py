"""Badge CRUD operations."""

from typing import Dict, List, Optional
from datetime import datetime
from sqlalchemy.orm import Session

from schema import Badge, BadgeSwipe, Employee
from data_structures import BadgeData, AccessLevel, Severity
from database import get_db_session
from crud.activity import ActivityCRUD


class BadgeCRUD:
    """Handles all badge-related database operations."""
    
    def __init__(self, db: Session = None):
        self.db = db or get_db_session()
        self.activity = ActivityCRUD(self.db)
    
    # ========================================================================
    # Core Operations
    # ========================================================================
    
    def create(self, data: BadgeData) -> Dict:
        """Create a new badge."""
        # Check duplicate badge number
        existing = self.db.query(Badge).filter_by(badge_number=data.badge_number).first()
        if existing:
            raise ValueError(f"Badge {data.badge_number} already exists")
        
        # Verify employee exists
        employee = self.db.query(Employee).filter_by(id=data.employee_id).first()
        if not employee:
            raise ValueError(f"Employee {data.employee_id} not found")
        
        badge = Badge(
            employee_id=data.employee_id,
            badge_number=data.badge_number,
            access_level=data.access_level,
            is_active=data.is_active
        )
        self.db.add(badge)
        self.db.flush()
        return self._to_dict(badge, employee)
    
    def get_all(self) -> List[Dict]:
        """Get all badges."""
        badges = self.db.query(Badge).order_by(Badge.issued_at.desc()).all()
        result = []
        for badge in badges:
            employee = self.db.query(Employee).filter_by(id=badge.employee_id).first()
            result.append(self._to_dict(badge, employee))
        return result
    
    def get_by_id(self, badge_id: str) -> Optional[Dict]:
        """Get badge by ID."""
        badge = self.db.query(Badge).filter_by(id=badge_id).first()
        if not badge:
            return None
        employee = self.db.query(Employee).filter_by(id=badge.employee_id).first()
        return self._to_dict(badge, employee)
    
    def get_by_employee(self, employee_id: str) -> Optional[Dict]:
        """Get badge by employee ID."""
        badge = self.db.query(Badge).filter_by(employee_id=employee_id).first()
        if not badge:
            return None
        employee = self.db.query(Employee).filter_by(id=employee_id).first()
        return self._to_dict(badge, employee)
    
    def get_by_number(self, badge_number: str) -> Optional[Dict]:
        """Get badge by badge number."""
        badge = self.db.query(Badge).filter_by(badge_number=badge_number).first()
        if not badge:
            return None
        employee = self.db.query(Employee).filter_by(id=badge.employee_id).first()
        return self._to_dict(badge, employee)
    
    def update_status(self, badge_id: str, is_active: bool) -> bool:
        """Activate or deactivate badge."""
        badge = self.db.query(Badge).filter_by(id=badge_id).first()
        if badge:
            badge.is_active = is_active
            self.db.flush()
            return True
        return False
    
    def update_access_level(self, badge_id: str, level: str) -> bool:
        """Update badge access level."""
        badge = self.db.query(Badge).filter_by(id=badge_id).first()
        if badge:
            badge.access_level = level
            self.db.flush()
            return True
        return False
    
    def delete(self, badge_id: str) -> bool:
        """Delete badge by ID."""
        badge = self.db.query(Badge).filter_by(id=badge_id).first()
        if badge:
            self.db.delete(badge)
            return True
        return False
    
    # ========================================================================
    # Swipe Operations
    # ========================================================================
    
    def record_swipe(self, badge_number: str, door_id: str = None,
                     access_point: str = None, ip: str = None) -> Dict:
        """Record badge swipe attempt."""
        badge = self.db.query(Badge).filter_by(badge_number=badge_number).first()
        
        # Badge not found
        if not badge:
            swipe = BadgeSwipe(badge_id=None, door_id=door_id, access_point=access_point,
                               success=False, failure_reason="badge_not_found")
            self.db.add(swipe)
            self.db.flush()
            self.activity.log("security", "swipe_failed", Severity.WARNING.value,
                              metadata={"badge": badge_number, "reason": "not_found"},
                              ip_address=ip)
            return {"success": False, "reason": "badge_not_found", "swipe_id": swipe.id}
        
        # Badge inactive
        if not badge.is_active:
            swipe = BadgeSwipe(badge_id=badge.id, door_id=door_id, access_point=access_point,
                               success=False, failure_reason="badge_inactive")
            self.db.add(swipe)
            self.db.flush()
            return {"success": False, "reason": "badge_inactive", "swipe_id": swipe.id}
        
        # Badge expired
        if badge.expires_at and badge.expires_at < datetime.now():
            swipe = BadgeSwipe(badge_id=badge.id, door_id=door_id, access_point=access_point,
                               success=False, failure_reason="badge_expired")
            self.db.add(swipe)
            self.db.flush()
            return {"success": False, "reason": "badge_expired", "swipe_id": swipe.id}
        
        # Successful swipe
        # COMMENTED OUT - last_used column not in schema yet
        # badge.last_used = datetime.now()
        
        swipe = BadgeSwipe(badge_id=badge.id, door_id=door_id, access_point=access_point,
                           success=True, failure_reason=None)
        self.db.add(swipe)
        self.db.flush()
        
        employee = self.db.query(Employee).filter_by(id=badge.employee_id).first()
        self.activity.log("security", "swipe_success", Severity.INFO.value,
                          metadata={"badge": badge_number, "employee": employee.full_name if employee else None},
                          ip_address=ip)
        
        return {
            "success": True, "swipe_id": swipe.id, "badge_id": badge.id,
            "employee_name": employee.full_name if employee else None,
            "access_level": badge.access_level
        }
    
    def get_swipes(self, badge_id: str = None, limit: int = 100) -> List[Dict]:
        """Get swipe history."""
        query = self.db.query(BadgeSwipe).order_by(BadgeSwipe.swipe_time.desc())
        if badge_id:
            query = query.filter_by(badge_id=badge_id)
        
        swipes = query.limit(limit).all()
        result = []
        for swipe in swipes:
            badge = None
            employee = None
            if swipe.badge_id:
                badge = self.db.query(Badge).filter_by(id=swipe.badge_id).first()
                if badge:
                    employee = self.db.query(Employee).filter_by(id=badge.employee_id).first()
            
            result.append({
                "id": swipe.id,
                "badge_id": swipe.badge_id,
                "badge_number": badge.badge_number if badge else None,
                "employee_name": employee.full_name if employee else None,
                "door_id": swipe.door_id,
                "access_point": swipe.access_point,
                "success": swipe.success,
                "failure_reason": swipe.failure_reason,
                "swipe_time": swipe.swipe_time.isoformat() if swipe.swipe_time else None
            })
        return result
    
    # ========================================================================
    # Helper Methods
    # ========================================================================
    
    def _to_dict(self, badge: Badge, employee: Employee = None) -> Dict:
        """Convert Badge model to dictionary."""
        return {
            "id": badge.id,
            "employee_id": badge.employee_id,
            "employee_name": employee.full_name if employee else None,
            "employee_number": employee.employee_number if employee else None,
            "department": employee.department if employee else None,
            "badge_number": badge.badge_number,
            "access_level": badge.access_level,
            "is_active": badge.is_active,
            "issued_at": badge.issued_at.isoformat() if badge.issued_at else None,
            "expires_at": badge.expires_at.isoformat() if badge.expires_at else None,
            # COMMENTED OUT - last_used column not in schema yet
            # "last_used": badge.last_used.isoformat() if badge.last_used else None
        }