"""
Database module - Core database infrastructure only
"""
import os
import hashlib
import logging
from contextlib import contextmanager
from datetime import datetime
from typing import Optional, Dict, List

from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker

from schema import Base, Department, User
from data_structures import (
    Severity, UserRole, ShiftType, AccessLevel, RoomStatus,
    UserData, EmployeeData, PatientData, RoomData, BadgeData, ShiftData,
    DEFAULT_DEPARTMENTS, DB_TABLES
)

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# ============================================================================
# DATABASE CONFIGURATION
# ============================================================================

DB_PATH = os.path.join(os.path.dirname(__file__), "hospital.db")
DB_URL = f"sqlite:///{DB_PATH}"
DB_TIMEOUT = 20.0
ECHO_SQL = False

_engine = None
_SessionLocal = None

# ============================================================================
# UTILITY FUNCTIONS
# ============================================================================

def hash_password(password: str) -> str:
    return hashlib.sha256(password.encode()).hexdigest()

def verify_password(password: str, hash_value: str) -> bool:
    return hash_password(password) == hash_value

# ============================================================================
# DATABASE CONNECTION
# ============================================================================

def get_engine():
    global _engine
    if _engine is None:
        _engine = create_engine(DB_URL, echo=ECHO_SQL, connect_args={"timeout": DB_TIMEOUT})
    return _engine

def get_session():
    global _SessionLocal
    if _SessionLocal is None:
        engine = get_engine()
        _SessionLocal = sessionmaker(bind=engine)
    return _SessionLocal()

@contextmanager
def get_db_session():
    session = get_session()
    try:
        yield session
        session.commit()
    except Exception as e:
        session.rollback()
        logger.error(f"Database error: {e}")
        raise e
    finally:
        session.close()

# ============================================================================
# DATABASE INITIALIZATION
# ============================================================================

def init_db(create_tables: bool = True, seed_data: bool = True) -> bool:
    try:
        engine = get_engine()
        
        if create_tables:
            Base.metadata.create_all(engine)
            logger.info("✅ Database tables created")
        
        with engine.connect() as conn:
            conn.execute(text("PRAGMA journal_mode=WAL"))
            conn.execute(text("PRAGMA synchronous=NORMAL"))
            conn.execute(text("PRAGMA cache_size=10000"))
            conn.commit()
            logger.info("✅ WAL mode enabled")
        
        if seed_data:
            seed_default_data()
        
        logger.info("✅ Database initialized successfully")
        return True
        
    except Exception as e:
        logger.error(f"❌ Failed to initialize database: {e}")
        return False

def seed_default_data():
    with get_db_session() as session:
        if session.query(Department).count() == 0:
            for dept_data in DEFAULT_DEPARTMENTS:
                department = Department(**dept_data)
                session.add(department)
            session.flush()
            logger.info("✅ Seeded default departments")

def create_default_users():
    """Create default admin, user, and system accounts"""
    with get_db_session() as session:
        default_users = [
            {"username": "admin", "email": "admin@hospital.com", "password": "admin", "role": "admin"},
            {"username": "user", "email": "user@hospital.com", "password": "user", "role": "doctor"},
            {"username": "system", "email": "system@hospital.com", "password": "system", "role": "system"},
        ]
        
        for user_data in default_users:
            existing_user = session.query(User).filter_by(username=user_data["username"]).first()
            if not existing_user:
                user = User(
                    username=user_data["username"],
                    email=user_data["email"],
                    password_hash=hash_password(user_data["password"]),
                    role=user_data["role"],
                    is_active=True
                )
                session.add(user)
        
        session.flush()
        logger.info("✅ Default users created (admin/admin, user/user, system/system)")

def verify_db():
    with get_db_session() as session:
        print("\n" + "="*60)
        print("📊 DATABASE STATISTICS")
        print("="*60)
        
        total_rows = 0
        for table_name in DB_TABLES:
            try:
                result = session.execute(text(f"SELECT COUNT(*) FROM {table_name}"))
                count = result.scalar()
                total_rows += count
                print(f"   {table_name:<20} ➜ {count:>6} rows")
            except Exception as e:
                print(f"   {table_name:<20} ➜ {'ERROR':>6}")
        
        print("-"*60)
        print(f"   {'TOTAL':<20} ➜ {total_rows:>6} rows")
        print("="*60 + "\n")


if __name__ == "__main__":
    print("\n" + "🏥 HOSPITAL DATABASE SETUP")
    print("="*60)
    
    if os.path.exists(DB_PATH):
        try:
            os.remove(DB_PATH)
            print("🗑️  Removed old database")
        except PermissionError:
            print("⚠️  Database file is locked")
            import sys
            sys.exit(1)
    
    if init_db(create_tables=True, seed_data=True):
        create_default_users()
        verify_db()
        
        print("✅ Database ready for use")
        print(f"📁 Database location: {DB_PATH}")
        print("🔐 Default credentials:")
        print("   • admin / admin (Administrator)")
        print("   • user / user (Doctor)")
        print("   • system / system (System Account)")
        print("="*60 + "\n")
    else:
        print("❌ Failed to initialize database")