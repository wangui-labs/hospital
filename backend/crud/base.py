"""Base CRUD class with common operations."""

from typing import Dict, List, Optional, Any, TypeVar, Generic
from sqlalchemy.orm import Session

T = TypeVar('T')

class BaseCRUD(Generic[T]):
    """Base class for CRUD operations."""
    
    def __init__(self, model: Any, db_session: Session):
        self.model = model
        self.db = db_session
    
    def get_by_id(self, id: str) -> Optional[T]:
        """Get entity by ID."""
        return self.db.query(self.model).filter_by(id=id).first()
    
    def get_all(self, limit: int = 100) -> List[T]:
        """Get all entities with limit."""
        return self.db.query(self.model).limit(limit).all()
    
    def delete(self, id: str) -> bool:
        """Delete entity by ID."""
        entity = self.get_by_id(id)
        if entity:
            self.db.delete(entity)
            return True
        return False