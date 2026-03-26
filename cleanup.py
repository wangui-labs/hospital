#!/usr/bin/env python
"""
Cleanup script for Hospital Activity Dashboard
Removes virtual environment, node_modules, and cache files
"""

import os
import shutil
import sys
from pathlib import Path

# Base directory
BASE_DIR = Path(__file__).parent.absolute()

# Directories to remove
DIRS_TO_REMOVE = [
    BASE_DIR / ".venv",           # Python virtual environment
    BASE_DIR / "frontend" / "node_modules",  # Node.js dependencies
    BASE_DIR / "backend" / "__pycache__",    # Python cache
    BASE_DIR / "backend" / "crud" / "__pycache__",  # CRUD cache
]

# Files to remove
FILES_TO_REMOVE = [
    BASE_DIR / "backend" / "hospital.db",      # SQLite database
    BASE_DIR / "backend" / "hospital.db-shm",  # SQLite shared memory
    BASE_DIR / "backend" / "hospital.db-wal",  # SQLite write-ahead log
]

def remove_directory(path):
    """Remove a directory and all its contents"""
    try:
        if path.exists() and path.is_dir():
            shutil.rmtree(path)
            print(f"✅ Removed directory: {path}")
            return True
        else:
            print(f"⚠️  Directory not found: {path}")
            return False
    except Exception as e:
        print(f"❌ Error removing {path}: {e}")
        return False

def remove_file(path):
    """Remove a file"""
    try:
        if path.exists() and path.is_file():
            path.unlink()
            print(f"✅ Removed file: {path}")
            return True
        else:
            print(f"⚠️  File not found: {path}")
            return False
    except Exception as e:
        print(f"❌ Error removing {path}: {e}")
        return False

def cleanup():
    """Main cleanup function"""
    print("=" * 60)
    print("🧹 HOSPITAL ACTIVITY DASHBOARD CLEANUP")
    print("=" * 60)
    print(f"Base directory: {BASE_DIR}")
    print()
    
    # Confirm with user
    print("This will remove:")
    print("  - Python virtual environment (.venv)")
    print("  - Node modules (node_modules)")
    print("  - Python cache files (__pycache__)")
    print("  - SQLite database files (hospital.db*)")
    print()
    
    response = input("Are you sure you want to continue? (y/N): ").strip().lower()
    if response != 'y':
        print("❌ Cleanup cancelled.")
        return
    
    print("\n" + "-" * 60)
    print("Removing directories...")
    print("-" * 60)
    
    # Remove directories
    for dir_path in DIRS_TO_REMOVE:
        remove_directory(dir_path)
    
    print("\n" + "-" * 60)
    print("Removing files...")
    print("-" * 60)
    
    # Remove files
    for file_path in FILES_TO_REMOVE:
        remove_file(file_path)
    
    print("\n" + "=" * 60)
    print("✅ Cleanup complete!")
    print("=" * 60)
    print("\nTo reinstall the environment:")
    print("  Backend:")
    print("    cd backend")
    print("    python -m venv .venv")
    print("    .venv\\Scripts\\activate")
    print("    pip install -r ../requirements.txt")
    print()
    print("  Frontend:")
    print("    cd frontend")
    print("    npm install")
    print("    npm start")
    print()

if __name__ == "__main__":
    try:
        cleanup()
    except KeyboardInterrupt:
        print("\n\n❌ Cleanup interrupted by user.")
        sys.exit(1)
    except Exception as e:
        print(f"\n❌ Unexpected error: {e}")
        sys.exit(1)