#!/usr/bin/env python
"""
Simple server starter script
"""
import uvicorn
import sys
import os
import signal
import time

# Add backend to path
sys.path.insert(0, os.path.dirname(__file__))
os.environ['PYTHONPATH'] = os.path.dirname(__file__)

print("="*50)
print("Starting Aurora Mind Backend Server")
print("="*50)

# Prevent Ctrl+C from killing immediately
def signal_handler(sig, frame):
    print("\nReceived signal to shut down")
    sys.exit(0)

signal.signal(signal.SIGINT, signal_handler)

if __name__ == "__main__":
    try:
        print("About to start uvicorn...")
        uvicorn.run(
            "app.main:app",
            host="0.0.0.0",
            port=8001,
            reload=False,
            log_level="info"
        )
        print("Uvicorn returned - this should not happen!")
    except KeyboardInterrupt:
        print("\nShutdown requested by user")
    except Exception as e:
        print(f"\n❌ ERROR: {type(e).__name__}: {e}")
        import traceback
        traceback.print_exc()
        time.sleep(10)  # Keep window open
    finally:
        print("\nServer stopped")
        time.sleep(5)
