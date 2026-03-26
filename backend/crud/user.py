"""User CRUD operations."""

from typing import Dict, List, Optional
from datetime import datetime
from sqlalchemy.orm import Session

from schema import User
from data_structures import UserData, UserRole
from database import hash_password, verify_password, get_db_session


class UserCRUD:
    """Handles all user-related database operations."""
    
    def __init__(self, db: Session = None):
        self.db = db or get_db_session()
    
    # ========================================================================
    # Core Operations
    # ========================================================================
    
    def authenticate(self, username: str, password: str) -> Optional[Dict]:
        """Authenticate user with username and password."""
        user = self.db.query(User).filter_by(username=username, is_active=True).first()
        if user and verify_password(password, user.password_hash):
            user.last_login = datetime.now()
            self.db.flush()
            return self._to_dict(user)
        return None
    
    def create(self, data: UserData) -> Dict:
        """Create a new user."""
        user = User(
            username=data.username,
            email=data.email,
            password_hash=hash_password(data.password),
            role=data.role,
            is_active=data.is_active
        )
        self.db.add(user)
        self.db.flush()
        return self._to_dict(user)
    
    def get_all(self) -> List[Dict]:
        """Get all users."""
        users = self.db.query(User).order_by(User.created_at.desc()).all()
        return [self._to_dict(u) for u in users]
    
    def get_by_id(self, user_id: str) -> Optional[Dict]:
        """Get user by ID."""
        user = self.db.query(User).filter_by(id=user_id).first()
        return self._to_dict(user) if user else None
    
    def get_by_username(self, username: str) -> Optional[Dict]:
        """Get user by username."""
        user = self.db.query(User).filter_by(username=username).first()
        return self._to_dict(user) if user else None
    
    def update(self, user_id: str, data: UserData) -> Optional[Dict]:
        """Update user details."""
        user = self.db.query(User).filter_by(id=user_id).first()
        if not user:
            return None
        
        if data.username:
            user.username = data.username
        if data.email:
            user.email = data.email
        if data.password:
            user.password_hash = hash_password(data.password)
        if data.role:
            user.role = data.role
        if data.is_active is not None:
            user.is_active = data.is_active
        
        self.db.flush()
        return self._to_dict(user)
    
    def delete(self, user_id: str) -> bool:
        """Delete user by ID."""
        user = self.db.query(User).filter_by(id=user_id).first()
        if user:
            self.db.delete(user)
            return True
        return False
    
    def deactivate(self, user_id: str) -> bool:
        """Deactivate user account."""
        user = self.db.query(User).filter_by(id=user_id).first()
        if user:
            user.is_active = False
            self.db.flush()
            return True
        return False
    
    # ========================================================================
    # Helper Methods
    # ========================================================================
    
    def _to_dict(self, user: User) -> Dict:
        """Convert User model to dictionary."""
        return {
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "role": user.role,
            "is_active": user.is_active,
            "last_login": user.last_login.isoformat() if user.last_login else None,
            "created_at": user.created_at.isoformat() if user.created_at else None
        }