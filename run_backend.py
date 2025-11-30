"""
Simple server runner to avoid asyncio cancellation issues
"""
import uvicorn
import os
from pathlib import Path

# Set environment
backend_path = Path(__file__).parent / "backend"
os.environ["PYTHONPATH"] = str(backend_path)

if __name__ == "__main__":
    print("Starting Aurora Mind Backend Server...")
    print(f"PYTHONPATH: {os.environ.get('PYTHONPATH')}")
    print("Server will run on http://127.0.0.1:8000")
    print("Press CTRL+C to stop")
    print("-" * 50)
    
    uvicorn.run(
        "app.main:app",
        host="127.0.0.1",
        port=8000,
        reload=False,
        app_dir=str(backend_path)
    )
