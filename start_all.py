"""
Combined server runner - starts both backend and frontend in one process
"""
import subprocess
import sys
import time
import os
from pathlib import Path

def main():
    base_dir = Path(__file__).parent
    backend_dir = base_dir / "backend"
    frontend_dir = base_dir / "frontend"
    
    print("=" * 60)
    print("🌟 AURORA MIND - Starting All Servers")
    print("=" * 60)
    
    # Start backend
    print("\n📡 Starting Backend Server (Python/FastAPI)...")
    backend_cmd = [
        str(backend_dir / ".venv" / "Scripts" / "python.exe"),
        "-m", "uvicorn",
        "app.main:app",
        "--host", "127.0.0.1",
        "--port", "8000"
    ]
    
    backend_env = os.environ.copy()
    backend_env["PYTHONPATH"] = str(backend_dir)
    
    backend_process = subprocess.Popen(
        backend_cmd,
        cwd=str(backend_dir),
        env=backend_env,
        creationflags=subprocess.CREATE_NEW_CONSOLE
    )
    
    print(f"   Backend PID: {backend_process.pid}")
    print("   Backend URL: http://127.0.0.1:8000")
    
    # Wait a bit for backend to start
    time.sleep(3)
    
    # Start frontend
    print("\n🎨 Starting Frontend Server (React/Vite)...")
    frontend_cmd = ["npm.cmd", "run", "dev"]
    
    frontend_process = subprocess.Popen(
        frontend_cmd,
        cwd=str(frontend_dir),
        creationflags=subprocess.CREATE_NEW_CONSOLE
    )
    
    print(f"   Frontend PID: {frontend_process.pid}")
    print("   Frontend URL: http://localhost:3000")
    
    print("\n" + "=" * 60)
    print("✅ SERVERS STARTED!")
    print("=" * 60)
    print("\n📍 Open your browser and visit:")
    print("   👉 http://localhost:3000")
    print("\n⚠️  DO NOT CLOSE THE TWO CMD WINDOWS THAT OPENED")
    print("\n🛑 To stop servers: Close both CMD windows or press CTRL+C there")
    print("\n" + "=" * 60)
    
    # Keep this script running
    print("\nℹ️  This window can be closed - servers run in separate windows")
    print("   Press CTRL+C or close this window to exit (servers will continue)")
    
    try:
        input("\nPress Enter to exit this launcher (servers will keep running)...")
    except KeyboardInterrupt:
        print("\n\nExiting launcher... (servers still running)")
    
    print("\n✅ Launcher closed. Servers are still running.")
    print("   Visit: http://localhost:3000")

if __name__ == "__main__":
    try:
        main()
    except Exception as e:
        print(f"\n❌ Error: {e}")
        input("\nPress Enter to exit...")
        sys.exit(1)
