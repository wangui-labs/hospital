"""Data Structures Module - Constants, Enums, DataClasses."""

from dataclasses import dataclass
from enum import Enum
from typing import Optional


# ============================================================================
# ENUMS
# ============================================================================

class Severity(str, Enum):
    INFO = "info"
    WARNING = "warning"
    ERROR = "error"
    CRITICAL = "critical"


class UserRole(str, Enum):
    ADMIN = "admin"
    DOCTOR = "doctor"
    NURSE = "nurse"
    RECEPTIONIST = "receptionist"
    SECURITY = "security"
    MANAGER = "manager"


class ShiftType(str, Enum):
    MORNING = "morning"
    AFTERNOON = "afternoon"
    NIGHT = "night"
    ONCALL = "oncall"


class AccessLevel(str, Enum):
    BASIC = "basic"
    STANDARD = "standard"
    ELEVATED = "elevated"
    ADMIN = "admin"


class RoomStatus(str, Enum):
    AVAILABLE = "available"
    OCCUPIED = "occupied"
    CLEANING = "cleaning"
    MAINTENANCE = "maintenance"


# ============================================================================
# DATA CLASSES
# ============================================================================

@dataclass
class UserData:
    username: str
    email: str
    role: str
    password: Optional[str] = None
    is_active: bool = True
    id: Optional[str] = None


@dataclass
class EmployeeData:
    user_id: str
    first_name: str
    last_name: str
    employee_number: str
    department: str
    job_title: str
    phone: Optional[str] = None
    emergency_contact: Optional[str] = None
    id: Optional[str] = None


@dataclass
class PatientData:
    mrn: str
    first_name: str
    last_name: str
    date_of_birth: str
    gender: str
    blood_type: Optional[str] = None
    contact_phone: Optional[str] = None
    contact_email: Optional[str] = None
    height_cm: Optional[float] = None      # ADD
    weight_kg: Optional[float] = None      # ADD
    temperature_c: Optional[float] = None  # ADD
    id: Optional[str] = None


@dataclass
class RoomData:
    room_number: str
    ward: str
    room_type: str
    capacity: int
    floor: Optional[int] = None
    status: str = RoomStatus.AVAILABLE.value
    id: Optional[str] = None


@dataclass
class BadgeData:
    employee_id: str
    badge_number: str
    access_level: str = AccessLevel.STANDARD.value
    is_active: bool = True
    id: Optional[str] = None


@dataclass
class ShiftData:
    employee_id: str
    shift_type: str
    date: str
    start_time: str
    end_time: str
    department: Optional[str] = None
    notes: Optional[str] = None
    id: Optional[str] = None


# ============================================================================
# CONSTANTS
# ============================================================================

DEFAULT_DEPARTMENTS = [
    {"name": "Emergency", "color": "#EA4335", "bg_color": "#FCE8E6", 
     "icon": "🚨", "description": "Emergency Medicine"},
    {"name": "ICU", "color": "#EA4335", "bg_color": "#FCE8E6", 
     "icon": "🫀", "description": "Intensive Care Unit"},
    {"name": "Surgery", "color": "#34A853", "bg_color": "#E6F4EA", 
     "icon": "🔪", "description": "General Surgery"},
    {"name": "Cardiology", "color": "#EA4335", "bg_color": "#FCE8E6", 
     "icon": "❤️", "description": "Heart Care"},
    {"name": "Neurology", "color": "#1B6EF3", "bg_color": "#E8F0FE", 
     "icon": "🧠", "description": "Brain and Nervous System"},
    {"name": "Pediatrics", "color": "#1B6EF3", "bg_color": "#E8F0FE", 
     "icon": "👶", "description": "Children Health"},
    {"name": "Nursing", "color": "#34A853", "bg_color": "#E6F4EA", 
     "icon": "👩‍⚕️", "description": "Nursing Services"},
    {"name": "Radiology", "color": "#B45309", "bg_color": "#FEF3C7", 
     "icon": "📷", "description": "Medical Imaging"},
    {"name": "Pharmacy", "color": "#34A853", "bg_color": "#E6F4EA", 
     "icon": "💊", "description": "Pharmaceutical Services"},
    {"name": "Administration", "color": "#5F6368", "bg_color": "#F1F3F4", 
     "icon": "📋", "description": "Hospital Administration"},
    {"name": "Security", "color": "#EA4335", "bg_color": "#FCE8E6", 
     "icon": "🛡️", "description": "Campus Security"},
    {"name": "IT", "color": "#1B6EF3", "bg_color": "#E8F0FE", 
     "icon": "💻", "description": "Information Technology"},
    {"name": "Human Resources", "color": "#5F6368", "bg_color": "#F1F3F4", 
     "icon": "👥", "description": "HR and Staffing"},
    {"name": "Maintenance", "color": "#5F6368", "bg_color": "#F1F3F4", 
     "icon": "🔧", "description": "Facilities Management"},
]

# Default users for seeding
DEFAULT_USERS = [
    {"username": "admin", "email": "admin@hospital.com", "password": "admin", "role": UserRole.ADMIN.value},
    {"username": "user", "email": "user@hospital.com", "password": "user", "role": UserRole.DOCTOR.value},
]

# Database table names for verification
DB_TABLES = [
    "users", "employees", "badges", "badge_swipes", "shifts", 
    "rooms", "patients", "admissions", "patient_records", "activity_log", "departments"
]