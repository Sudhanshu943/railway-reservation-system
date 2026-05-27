#!/usr/bin/env python3
"""
Start both Backend (FastAPI) and Frontend (Next.js) services
"""

import subprocess
import sys
import time
import os
from pathlib import Path

def check_command(cmd):
    """Check if a command is available"""
    try:
        subprocess.run([cmd, "--version"], capture_output=True, check=True)
        return True
    except (subprocess.CalledProcessError, FileNotFoundError):
        return False

def main():
    print("Starting Railway Reservation System...")
    print()

    # Check dependencies
    if not check_command("python" if sys.platform == "win32" else "python3"):
        print("ERROR: Python is not installed or not in PATH")
        return 1

    if not check_command("node"):
        print("ERROR: Node.js is not installed or not in PATH")
        return 1

    root_dir = Path(__file__).parent
    backend_dir = root_dir / "backend"
    frontend_dir = root_dir / "frontend"

    processes = []

    try:
        # Start Backend
        print("Starting Backend (FastAPI)...")
        backend_cmd = [
            sys.executable, "-m", "pip", "install", "-r", str(backend_dir / "requirements.txt")
        ]
        subprocess.run(backend_cmd, check=True)

        backend_cmd = [
            sys.executable, "-m", "uvicorn", "main:app",
            "--reload", "--host", "0.0.0.0", "--port", "8000"
        ]
        backend_process = subprocess.Popen(
            backend_cmd,
            cwd=str(backend_dir),
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE
        )
        processes.append(backend_process)
        print("✓ Backend started on http://localhost:8000")

        time.sleep(2)

        # Start Frontend
        print("Starting Frontend (Next.js)...")
        frontend_cmd = ["npm", "install"]
        subprocess.run(frontend_cmd, cwd=str(frontend_dir), check=True)

        frontend_cmd = ["npm", "run", "dev"]
        frontend_process = subprocess.Popen(
            frontend_cmd,
            cwd=str(frontend_dir),
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE
        )
        processes.append(frontend_process)
        print("✓ Frontend started on http://localhost:3000")

        print()
        print("=" * 50)
        print("Services running:")
        print("- Backend: http://localhost:8000")
        print("- Frontend: http://localhost:3000")
        print("- API Docs: http://localhost:8000/docs")
        print("=" * 50)
        print("Press Ctrl+C to stop all services")
        print()

        # Wait for processes
        for process in processes:
            process.wait()

    except KeyboardInterrupt:
        print("\nShutting down services...")
        for process in processes:
            process.terminate()
        for process in processes:
            process.wait()
        print("Services stopped.")
        return 0
    except Exception as e:
        print(f"ERROR: {e}")
        for process in processes:
            process.terminate()
        return 1

if __name__ == "__main__":
    sys.exit(main())
