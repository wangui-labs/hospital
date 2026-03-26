"""Activity Log CRUD operations."""

from typing import Dict, List, Optional, Any
from sqlalchemy.orm import Session

from schema import ActivityLog, User
from database import get_db_session


class ActivityCRUD:
    """Handles all activity log operations."""
    
    def __init__(self, db: Session = None):
        self.db = db or get_db_session()
    
    # ========================================================================
    # Core Operations
    # ========================================================================
    
    def log(self, category: str, action: str, severity: str = 'info', **kwargs) -> Dict:
        """Add an activity log entry."""
        activity = ActivityLog(
            user_id=kwargs.get('user_id'),
            patient_id=kwargs.get('patient_id'),
            employee_id=kwargs.get('employee_id'),
            category=category,
            action=action,
            entity_type=kwargs.get('entity_type'),
            entity_id=kwargs.get('entity_id'),
            meta_data=kwargs.get('metadata', {}),
            ip_address=kwargs.get('ip_address'),
            severity=severity
        )
        self.db.add(activity)
        self.db.flush()
        return {
            "id": activity.id,
            "category": category,
            "action": action,
            "severity": severity,
            "created_at": activity.created_at.isoformat() if activity.created_at else None
        }
    
    def get_recent(self, limit: int = 100) -> List[Dict]:
        """Get recent activity logs."""
        activities = self.db.query(ActivityLog).order_by(
            ActivityLog.created_at.desc()
        ).limit(limit).all()
        
        logs = []
        for activity in activities:
            log = {
                "id": activity.id,
                "category": activity.category,
                "action": activity.action,
                "severity": activity.severity,
                "entity_type": activity.entity_type,
                "entity_id": activity.entity_id,
                "meta_data": activity.meta_data,
                "ip_address": activity.ip_address,
                "created_at": activity.created_at.isoformat() if activity.created_at else None
            }
            if activity.user_id:
                user = self.db.query(User).filter_by(id=activity.user_id).first()
                if user:
                    log['username'] = user.username
            logs.append(log)
        
        return logs
    
    def get_by_category(self, category: str, limit: int = 100) -> List[Dict]:
        """Get logs by category."""
        activities = self.db.query(ActivityLog).filter_by(
            category=category
        ).order_by(ActivityLog.created_at.desc()).limit(limit).all()
        return [self._to_dict(a) for a in activities]
    
    def get_by_severity(self, severity: str, limit: int = 100) -> List[Dict]:
        """Get logs by severity."""
        activities = self.db.query(ActivityLog).filter_by(
            severity=severity
        ).order_by(ActivityLog.created_at.desc()).limit(limit).all()
        return [self._to_dict(a) for a in activities]
    
    # ========================================================================
    # Helper Methods
    # ========================================================================
    
    def _to_dict(self, activity: ActivityLog) -> Dict:
        """Convert ActivityLog model to dictionary."""
        return {
            "id": activity.id,
            "user_id": activity.user_id,
            "category": activity.category,
            "action": activity.action,
            "severity": activity.severity,
            "entity_type": activity.entity_type,
            "entity_id": activity.entity_id,
            "meta_data": activity.meta_data,
            "ip_address": activity.ip_address,
            "created_at": activity.created_at.isoformat() if activity.created_at else None
        }