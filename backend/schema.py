"""
Database schema definitions using SQLAlchemy ORM
Clean, maintainable, and intelligent table definitions
"""
from datetime import datetime
from typing import Optional
import uuid

# SQLAlchemy imports
from sqlalchemy import (
    Column, Integer, String, Float, Boolean, DateTime, BigInteger,
    ForeignKey, Index, CheckConstraint, Text, JSON
)
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

Base = declarative_base()


# ============================================================================
# UTILITY FUNCTIONS
# ============================================================================

def generate_uuid() -> str:
    """Generate a 32-character UUID without hyphens"""
    return uuid.uuid4().hex


# ============================================================================
# MIXINS
# ============================================================================

class TimestampMixin:
    """Adds automatic timestamp tracking to tables"""
    created_at = Column(
        DateTime(timezone=True), 
        server_default=func.now(), 
        nullable=False
    )
    updated_at = Column(
        DateTime(timezone=True), 
        onupdate=func.now()
    )


class BaseMixin(TimestampMixin):
    """Base mixin with ID and timestamps for all tables"""
    id = Column(String(32), primary_key=True, default=generate_uuid)
    
    @property
    def created_iso(self) -> Optional[str]:
        """Return created_at in ISO format"""
        return self.created_at.isoformat() if self.created_at else None
    
    @property
    def updated_iso(self) -> Optional[str]:
        """Return updated_at in ISO format"""
        return self.updated_at.isoformat() if self.updated_at else None


# ============================================================================
# DOMAIN MODELS
# ============================================================================

class Department(Base, BaseMixin):
    """Dynamic department management"""
    __tablename__ = "departments"
    __table_args__ = (
        Index("idx_departments_name", "name"),
        Index("idx_departments_active", "is_active"),
    )
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(128), nullable=False, unique=True)
    color = Column(String(16), nullable=False, default="#5F6368")
    bg_color = Column(String(16), nullable=False, default="#F1F3F4")
    icon = Column(String(8), nullable=True)
    description = Column(String(512), nullable=True)
    is_active = Column(Boolean, nullable=False, default=True)
    
    # Relationships - fixed: no direct relationship to employees (use department_name instead)
    
    def __repr__(self) -> str:
        return f"<Department(name='{self.name}', active={self.is_active})>"


class User(Base, BaseMixin):
    """User authentication and roles"""
    __tablename__ = "users"
    __table_args__ = (
        Index("idx_users_username", "username"),
        Index("idx_users_role", "role"),
        Index("idx_users_email", "email"),
        Index("idx_users_active", "is_active"),
    )
    
    username = Column(String(64), nullable=False, unique=True)
    email = Column(String(255), nullable=False, unique=True)
    password_hash = Column(String(128), nullable=False)
    role = Column(String(32), nullable=False)
    is_active = Column(Boolean, nullable=False, default=True)
    last_login = Column(DateTime(timezone=True), nullable=True)
    
    # Relationships
    employee = relationship("Employee", back_populates="user", uselist=False, cascade="all, delete-orphan")
    activity_logs = relationship("ActivityLog", back_populates="user", cascade="all, delete-orphan")
    
    @property
    def is_admin(self) -> bool:
        """Check if user is admin"""
        return self.role == "admin"
    
    def __repr__(self) -> str:
        return f"<User(username='{self.username}', role='{self.role}')>"


class Employee(Base, BaseMixin):
    """Staff profile information"""
    __tablename__ = "employees"
    __table_args__ = (
        Index("idx_employees_user_id", "user_id"),
        Index("idx_employees_department", "department"),
        Index("idx_employees_number", "employee_number"),
        Index("idx_employees_active", "is_active"),
        Index("idx_employees_name", "first_name", "last_name"),
    )
    
    user_id = Column(
        String(32), 
        ForeignKey("users.id", ondelete="SET NULL"),  # Changed to SET NULL
        nullable=True,  # Changed to True
        unique=True
    )

    first_name = Column(String(128), nullable=False)
    last_name = Column(String(128), nullable=False)
    employee_number = Column(String(64), nullable=False, unique=True)
    department = Column(String(128), nullable=False)  # Store department name, not foreign key
    job_title = Column(String(128), nullable=False)
    phone = Column(String(32), nullable=True)
    emergency_contact = Column(String(256), nullable=True)
    hired_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    is_active = Column(Boolean, nullable=False, default=True)
    
    # Relationships
    user = relationship("User", back_populates="employee")
    badges = relationship("Badge", back_populates="employee", cascade="all, delete-orphan")
    shifts = relationship("Shift", back_populates="employee", cascade="all, delete-orphan")
    admissions = relationship("Admission", back_populates="attending_employee")
    patient_records = relationship("PatientRecord", back_populates="employee")
    badge_swipes = relationship("BadgeSwipe", back_populates="employee")
    activity_logs = relationship("ActivityLog", back_populates="employee")
    
    @property
    def full_name(self) -> str:
        """Return full name of employee"""
        return f"{self.first_name} {self.last_name}"
    
    def __repr__(self) -> str:
        return f"<Employee(full_name='{self.full_name}', number='{self.employee_number}')>"


class Badge(Base, BaseMixin):
    """Access cards issued to employees"""
    __tablename__ = "badges"
    __table_args__ = (
        Index("idx_badges_employee_id", "employee_id"),
        Index("idx_badges_number", "badge_number"),
        Index("idx_badges_active", "is_active"),
        CheckConstraint(
            "access_level IN ('basic','standard','elevated','admin')", 
            name="check_access_level"
        ),
    )
    
    employee_id = Column(
        String(32), 
        ForeignKey("employees.id", ondelete="CASCADE"), 
        nullable=False
    )
    badge_number = Column(String(64), nullable=False, unique=True)
    access_level = Column(String(16), nullable=False, default="basic")
    is_active = Column(Boolean, nullable=False, default=True)
    issued_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    expires_at = Column(DateTime(timezone=True), nullable=True)
    
    # Relationships
    employee = relationship("Employee", back_populates="badges")
    swipes = relationship("BadgeSwipe", back_populates="badge", cascade="all, delete-orphan")
    
    @property
    def is_expired(self) -> bool:
        """Check if badge is expired"""
        if self.expires_at:
            return datetime.utcnow() > self.expires_at
        return False
    
    def __repr__(self) -> str:
        return f"<Badge(number='{self.badge_number}', level='{self.access_level}')>"


class BadgeSwipe(Base, TimestampMixin):
    """Every card tap/swipe event"""
    __tablename__ = "badge_swipes"
    __table_args__ = (
        Index("idx_swipes_employee_id", "employee_id"),
        Index("idx_swipes_badge_id", "badge_id"),
        Index("idx_swipes_location", "location"),
        Index("idx_swipes_at", "swiped_at"),
        CheckConstraint("direction IN ('entry','exit')", name="check_direction"),
        CheckConstraint("result IN ('granted','denied')", name="check_result"),
    )
    
    id = Column(String(32), primary_key=True, default=generate_uuid)
    badge_id = Column(String(32), ForeignKey("badges.id"), nullable=False)
    employee_id = Column(String(32), ForeignKey("employees.id"), nullable=False)
    location = Column(String(128), nullable=False)
    direction = Column(String(8), nullable=False)
    result = Column(String(16), nullable=False)
    swiped_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    
    # Relationships
    badge = relationship("Badge", back_populates="swipes")
    employee = relationship("Employee", back_populates="badge_swipes")
    
    def __repr__(self) -> str:
        return f"<BadgeSwipe(direction='{self.direction}', result='{self.result}')>"


class Shift(Base, BaseMixin):
    """Work schedule & clock-in/out"""
    __tablename__ = "shifts"
    __table_args__ = (
        Index("idx_shifts_employee_id", "employee_id"),
        Index("idx_shifts_start", "start_time"),
        Index("idx_shifts_status", "status"),
        CheckConstraint(
            "shift_type IN ('morning','afternoon','night','oncall')", 
            name="check_shift_type"
        ),
        CheckConstraint(
            "status IN ('scheduled','active','completed','missed','swapped')", 
            name="check_status"
        ),
    )
    
    employee_id = Column(
        String(32), 
        ForeignKey("employees.id", ondelete="CASCADE"), 
        nullable=False
    )
    shift_type = Column(String(16), nullable=False)
    start_time = Column(DateTime(timezone=True), nullable=False)
    end_time = Column(DateTime(timezone=True), nullable=True)
    status = Column(String(16), nullable=False, default="scheduled")
    notes = Column(Text, nullable=True)
    
    # Relationships
    employee = relationship("Employee", back_populates="shifts")
    
    @property
    def duration_hours(self) -> Optional[float]:
        """Calculate shift duration in hours"""
        if self.end_time:
            return (self.end_time - self.start_time).total_seconds() / 3600
        return None
    
    def __repr__(self) -> str:
        return f"<Shift(type='{self.shift_type}', status='{self.status}')>"


class Room(Base, BaseMixin):
    """Physical hospital rooms"""
    __tablename__ = "rooms"
    __table_args__ = (
        Index("idx_rooms_status", "status"),
        Index("idx_rooms_ward", "ward"),
        Index("idx_rooms_number", "room_number"),
        CheckConstraint(
            "room_type IN ('private','shared','icu','emergency','recovery','isolation')", 
            name="check_room_type"
        ),
        CheckConstraint(
            "status IN ('available','occupied','cleaning','maintenance')", 
            name="check_room_status"
        ),
    )
    
    room_number = Column(String(32), nullable=False, unique=True)
    ward = Column(String(128), nullable=False)
    room_type = Column(String(32), nullable=False)
    capacity = Column(Integer, nullable=False, default=1)
    status = Column(String(32), nullable=False, default="available")
    floor = Column(Integer, nullable=True)
    
    # Relationships
    admissions = relationship("Admission", back_populates="room", cascade="all, delete-orphan")
    
    @property
    def is_available(self) -> bool:
        """Check if room is available"""
        return self.status == "available"
    
    def __repr__(self) -> str:
        return f"<Room(number='{self.room_number}', status='{self.status}')>"


class Patient(Base, BaseMixin):
    """Master patient record"""
    __tablename__ = "patients"
    __table_args__ = (
        Index("idx_patients_mrn", "mrn"),
        Index("idx_patients_lastname", "last_name"),
        Index("idx_patients_dob", "date_of_birth"),
        Index("idx_patients_name", "first_name", "last_name"),
        CheckConstraint(
            "gender IN ('male','female','other','prefer_not_to_say')", 
            name="check_gender"
        ),
        CheckConstraint(
            "blood_type IN ('A+','A-','B+','B-','AB+','AB-','O+','O-','unknown')", 
            name="check_blood_type"
        ),
    )
    
    mrn = Column(String(64), nullable=False, unique=True)
    first_name = Column(String(128), nullable=False)
    last_name = Column(String(128), nullable=False)
    date_of_birth = Column(DateTime(timezone=True), nullable=False)
    gender = Column(String(32), nullable=False)
    blood_type = Column(String(8), nullable=True)
    contact_phone = Column(String(32), nullable=True)
    contact_email = Column(String(255), nullable=True)
    emergency_contact = Column(String(256), nullable=True)
    emergency_phone = Column(String(32), nullable=True)
    allergies = Column(Text, nullable=True)
    
    # ========== ADDED VITALS FIELDS ==========
    height_cm = Column(Float, nullable=True)      # Height in centimeters
    weight_kg = Column(Float, nullable=True)      # Weight in kilograms
    temperature_c = Column(Float, nullable=True)  # Temperature in Celsius
    # ==========================================
    
    # Relationships
    admissions = relationship("Admission", back_populates="patient", cascade="all, delete-orphan")
    patient_records = relationship("PatientRecord", back_populates="patient", cascade="all, delete-orphan")
    activity_logs = relationship("ActivityLog", back_populates="patient")
    
    @property
    def full_name(self) -> str:
        """Return full name of patient"""
        return f"{self.first_name} {self.last_name}"
    
    @property
    def age(self) -> Optional[int]:
        """Calculate patient age"""
        if self.date_of_birth:
            today = datetime.utcnow()
            return today.year - self.date_of_birth.year - (
                (today.month, today.day) < (self.date_of_birth.month, self.date_of_birth.day)
            )
        return None
    
    def __repr__(self) -> str:
        return f"<Patient(mrn='{self.mrn}', name='{self.full_name}')>"


class Admission(Base, BaseMixin):
    """Patient room assignment + discharge"""
    __tablename__ = "admissions"
    __table_args__ = (
        Index("idx_admissions_patient_id", "patient_id"),
        Index("idx_admissions_room_id", "room_id"),
        Index("idx_admissions_status", "status"),
        Index("idx_admissions_attending", "attending_employee_id"),
        Index("idx_admissions_admitted", "admitted_at"),
        CheckConstraint(
            "status IN ('active','discharged','transferred','deceased')", 
            name="check_admission_status"
        ),
        CheckConstraint(
            "priority IN ('routine','urgent','emergency')", 
            name="check_priority"
        ),
    )
    
    patient_id = Column(String(32), ForeignKey("patients.id"), nullable=False)
    room_id = Column(String(32), ForeignKey("rooms.id"), nullable=False)
    attending_employee_id = Column(String(32), ForeignKey("employees.id"), nullable=False)
    status = Column(String(32), nullable=False, default="active")
    admission_reason = Column(Text, nullable=False)
    priority = Column(String(16), nullable=False, default="routine")
    admitted_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    discharged_at = Column(DateTime(timezone=True), nullable=True)
    notes = Column(Text, nullable=True)
    
    # Relationships
    patient = relationship("Patient", back_populates="admissions")
    room = relationship("Room", back_populates="admissions")
    attending_employee = relationship("Employee", back_populates="admissions")
    patient_records = relationship("PatientRecord", back_populates="admission")
    
    @property
    def duration_days(self) -> int:
        """Calculate admission duration in days"""
        end = self.discharged_at or datetime.utcnow()
        return (end - self.admitted_at).days
    
    @property
    def is_active(self) -> bool:
        """Check if admission is active"""
        return self.status == "active"
    
    def __repr__(self) -> str:
        return f"<Admission(patient='{self.patient_id}', status='{self.status}')>"


class PatientRecord(Base, BaseMixin):
    """Clinical notes, vitals, results"""
    __tablename__ = "patient_records"
    __table_args__ = (
        Index("idx_records_patient_id", "patient_id"),
        Index("idx_records_employee_id", "employee_id"),
        Index("idx_records_admission", "admission_id"),
        Index("idx_records_type", "record_type"),
        Index("idx_records_flagged", "is_flagged"),
        Index("idx_records_recorded_at", "recorded_at"),
        CheckConstraint(
            "record_type IN ('vital_signs','diagnosis','prescription','lab_result',"
            "'imaging','procedure','nursing_note','discharge_summary','referral')", 
            name="check_record_type"
        ),
        CheckConstraint(
            "priority IN ('low','normal','high','critical')", 
            name="check_record_priority"
        ),
    )
    
    patient_id = Column(String(32), ForeignKey("patients.id"), nullable=False)
    employee_id = Column(String(32), ForeignKey("employees.id"), nullable=False)
    admission_id = Column(String(32), ForeignKey("admissions.id"), nullable=True)
    record_type = Column(String(32), nullable=False)
    title = Column(String(256), nullable=False)
    content = Column(Text, nullable=False)
    priority = Column(String(16), nullable=False, default="normal")
    is_flagged = Column(Boolean, nullable=False, default=False)
    recorded_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    
    # Relationships
    patient = relationship("Patient", back_populates="patient_records")
    employee = relationship("Employee", back_populates="patient_records")
    admission = relationship("Admission", back_populates="patient_records")
    
    def __repr__(self) -> str:
        return f"<PatientRecord(type='{self.record_type}', title='{self.title}')>"


class ActivityLog(Base, BaseMixin):
    """Real-time event stream for monitoring"""
    __tablename__ = "activity_log"
    __table_args__ = (
        Index("idx_activity_user_id", "user_id"),
        Index("idx_activity_patient_id", "patient_id"),
        Index("idx_activity_employee", "employee_id"),
        Index("idx_activity_category", "category"),
        Index("idx_activity_severity", "severity"),
        Index("idx_activity_created_at", "created_at"),
        Index("idx_activity_entity", "entity_type", "entity_id"),
        CheckConstraint(
            "category IN ('auth','patient','admission','room','record',"
            "'badge','shift','system','alert')", 
            name="check_category"
        ),
        CheckConstraint(
            "severity IN ('info','warning','error','critical')", 
            name="check_severity"
        ),
    )
    
    user_id = Column(String(32), ForeignKey("users.id"), nullable=True)
    patient_id = Column(String(32), ForeignKey("patients.id"), nullable=True)
    employee_id = Column(String(32), ForeignKey("employees.id"), nullable=True)
    category = Column(String(32), nullable=False)
    action = Column(String(128), nullable=False)
    entity_type = Column(String(64), nullable=True)
    entity_id = Column(String(32), nullable=True)
    meta_data = Column(JSON, nullable=True)  # Renamed to avoid conflict
    ip_address = Column(String(45), nullable=True)
    severity = Column(String(16), nullable=False, default="info")
    
    # Relationships
    user = relationship("User", back_populates="activity_logs")
    patient = relationship("Patient", back_populates="activity_logs")
    employee = relationship("Employee", back_populates="activity_logs")
    
    def __repr__(self) -> str:
        return f"<ActivityLog(category='{self.category}', action='{self.action}')>"


# ============================================================================
# EXPORTS
# ============================================================================

__all__ = [
    'Base',
    'User',
    'Employee',
    'Department',
    'Badge',
    'BadgeSwipe',
    'Shift',
    'Room',
    'Patient',
    'Admission',
    'PatientRecord',
    'ActivityLog',
    'generate_uuid'
]