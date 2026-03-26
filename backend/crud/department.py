"""Department CRUD operations."""

from typing import Dict, List, Optional
from sqlalchemy.orm import Session

from schema import Department
from data_structures import DEFAULT_DEPARTMENTS
from database import get_db_session


class DepartmentCRUD:
    """Handles all department-related database operations."""
    
    def __init__(self, db: Session = None):
        self.db = db or get_db_session()
    
    # ========================================================================
    # Core Operations
    # ========================================================================
    
    def create(self, name: str, color: str, bg_color: str, 
               icon: str = None, description: str = None) -> Dict:
        """Create a new department."""
        dept = Department(
            name=name,
            color=color,
            bg_color=bg_color,
            icon=icon,
            description=description,
            is_active=True
        )
        self.db.add(dept)
        self.db.flush()
        return self._to_dict(dept)
    
    def get_all(self) -> List[Dict]:
        """Get all departments."""
        depts = self.db.query(Department).order_by(Department.name).all()
        return [self._to_dict(d) for d in depts]
    
    def get_by_id(self, dept_id: str) -> Optional[Dict]:
        """Get department by ID."""
        dept = self.db.query(Department).filter_by(id=dept_id).first()
        return self._to_dict(dept) if dept else None
    
    def get_by_name(self, name: str) -> Optional[Dict]:
        """Get department by name."""
        dept = self.db.query(Department).filter_by(name=name).first()
        return self._to_dict(dept) if dept else None
    
    def update(self, dept_id: str, **kwargs) -> Optional[Dict]:
        """Update department details."""
        dept = self.db.query(Department).filter_by(id=dept_id).first()
        if not dept:
            return None
        
        for key, value in kwargs.items():
            if hasattr(dept, key) and value is not None:
                setattr(dept, key, value)
        
        self.db.flush()
        return self._to_dict(dept)
    
    def delete(self, dept_id: str) -> bool:
        """Delete department by ID."""
        dept = self.db.query(Department).filter_by(id=dept_id).first()
        if dept:
            self.db.delete(dept)
            return True
        return False
    
    def seed_default(self) -> List[Dict]:
        """Seed default departments."""
        if self.db.query(Department).count() == 0:
            for dept_data in DEFAULT_DEPARTMENTS:
                dept = Department(**dept_data)
                self.db.add(dept)
            self.db.flush()
        return self.get_all()
    
    # ========================================================================
    # Helper Methods
    # ========================================================================
    
    def _to_dict(self, dept: Department) -> Dict:
        """Convert Department model to dictionary."""
        return {
            "id": dept.id,
            "name": dept.name,
            "color": dept.color,
            "bg_color": dept.bg_color,
            "icon": dept.icon,
            "description": dept.description,
            "is_active": dept.is_active
        }