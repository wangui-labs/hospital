"""Employee CRUD operations."""

from typing import Dict, List, Optional
from sqlalchemy.orm import Session

from schema import Employee, User
from data_structures import EmployeeData
from database import get_db_session


class EmployeeCRUD:
    """Handles all employee-related database operations."""
    
    def __init__(self, db: Session = None):
        self.db = db or get_db_session()
    
    # ========================================================================
    # Core Operations
    # ========================================================================
    
    def create(self, data: EmployeeData) -> Dict:
        """Create a new employee."""
        # Verify user exists only if user_id is provided
        if data.user_id:
            user = self.db.query(User).filter_by(id=data.user_id).first()
            if not user:
                raise ValueError(f"User with ID {data.user_id} not found")
        
        employee = Employee(
            user_id=data.user_id,  # Can be None
            first_name=data.first_name,
            last_name=data.last_name,
            employee_number=data.employee_number,
            department=data.department,
            job_title=data.job_title,
            phone=data.phone,
            emergency_contact=data.emergency_contact
        )
        self.db.add(employee)
        self.db.flush()
        return self._to_dict(employee)
    
    def get_all(self) -> List[Dict]:
        """Get all employees."""
        employees = self.db.query(Employee).order_by(Employee.hired_at.desc()).all()
        return [self._to_dict(e) for e in employees]
    
    def get_by_id(self, employee_id: str) -> Optional[Dict]:
        """Get employee by ID."""
        employee = self.db.query(Employee).filter_by(id=employee_id).first()
        return self._to_dict(employee) if employee else None
    
    def get_by_user_id(self, user_id: str) -> Optional[Dict]:
        """Get employee by user ID."""
        employee = self.db.query(Employee).filter_by(user_id=user_id).first()
        return self._to_dict(employee) if employee else None
    
    def get_by_department(self, department: str) -> List[Dict]:
        """Get employees by department."""
        employees = self.db.query(Employee).filter_by(department=department).all()
        return [self._to_dict(e) for e in employees]
    
    def update(self, employee_id: str, data: EmployeeData) -> Optional[Dict]:
        """Update employee details."""
        employee = self.db.query(Employee).filter_by(id=employee_id).first()
        if not employee:
            return None
        
        if data.first_name:
            employee.first_name = data.first_name
        if data.last_name:
            employee.last_name = data.last_name
        if data.department:
            employee.department = data.department
        if data.job_title:
            employee.job_title = data.job_title
        if data.phone:
            employee.phone = data.phone
        if data.emergency_contact:
            employee.emergency_contact = data.emergency_contact
        
        self.db.flush()
        return self._to_dict(employee)
    
    def delete(self, employee_id: str) -> bool:
        """Delete employee by ID."""
        employee = self.db.query(Employee).filter_by(id=employee_id).first()
        if employee:
            self.db.delete(employee)
            return True
        return False
    
    # ========================================================================
    # Helper Methods
    # ========================================================================
    
    def _to_dict(self, employee: Employee) -> Dict:
        """Convert Employee model to dictionary."""
        return {
            "id": employee.id,
            "user_id": employee.user_id,
            "first_name": employee.first_name,
            "last_name": employee.last_name,
            "full_name": employee.full_name,
            "employee_number": employee.employee_number,
            "department": employee.department,
            "job_title": employee.job_title,
            "phone": employee.phone,
            "emergency_contact": employee.emergency_contact,
            "hired_at": employee.hired_at.isoformat() if employee.hired_at else None,
            "is_active": employee.is_active
        }