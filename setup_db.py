#!/usr/bin/env python3
"""
Railway Reservation System - Database Setup Helper
This script helps you set up Neon DB connection
"""

import os
import sys
from pathlib import Path

def create_env_file(backend_path):
    """Create .env file with template"""
    env_file = backend_path / ".env"
    
    if env_file.exists():
        print("✓ .env file already exists")
        return
    
    env_content = """# Neon DB Connection String
# Get this from: https://console.neon.tech/
DATABASE_URL=postgresql://username:password@ep-xxxxx.neon.tech/dbname?sslmode=require

# JWT Secret Key (generate a secure random string)
SECRET_KEY=your-secret-key-here-change-this-in-production

# Algorithm for JWT
ALGORITHM=HS256

# Token Expiration (in minutes)
ACCESS_TOKEN_EXPIRE_MINUTES=30
"""
    
    with open(env_file, 'w') as f:
        f.write(env_content)
    
    print(f"✓ Created .env file at {env_file}")
    print("  Please edit it with your Neon connection details")

def verify_requirements(backend_path):
    """Verify all required packages are installed"""
    try:
        import dotenv
        import sqlalchemy
        import psycopg2
        print("✓ All required packages are installed")
        return True
    except ImportError as e:
        print(f"✗ Missing package: {e}")
        print("  Run: pip install -r requirements.txt")
        return False

def test_connection(backend_path):
    """Test database connection"""
    try:
        sys.path.insert(0, str(backend_path))
        from database import engine
        
        connection = engine.connect()
        print("✓ Database connection successful!")
        connection.close()
        return True
    except Exception as e:
        print(f"✗ Connection failed: {e}")
        print("  Make sure DATABASE_URL in .env is correct")
        return False

def main():
    print("=" * 60)
    print("Railway Reservation System - Database Setup")
    print("=" * 60)
    print()
    
    # Get project paths
    project_root = Path(__file__).parent
    backend_path = project_root / "backend"
    
    print(f"Project Root: {project_root}")
    print(f"Backend Path: {backend_path}")
    print()
    
    # Step 1: Create .env file
    print("[1/3] Checking .env file...")
    create_env_file(backend_path)
    print()
    
    # Step 2: Verify requirements
    print("[2/3] Verifying requirements...")
    if not verify_requirements(backend_path):
        print("\n✗ Installation failed. Please run:")
        print(f"  cd {backend_path}")
        print("  pip install -r requirements.txt")
        return False
    print()
    
    # Step 3: Test connection
    print("[3/3] Testing database connection...")
    if test_connection(backend_path):
        print()
        print("=" * 60)
        print("✓ Setup Complete!")
        print("=" * 60)
        print()
        print("Next steps:")
        print("1. Start the backend: python -m uvicorn main:app --reload")
        print("2. Visit API docs: http://localhost:8000/docs")
        print("3. Frontend can now connect to the API")
        print()
        return True
    else:
        print()
        print("=" * 60)
        print("✗ Setup needs manual configuration")
        print("=" * 60)
        print()
        print("Please follow NEON_SETUP_GUIDE.txt for manual setup")
        return False

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
