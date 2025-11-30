"""
Minimal test server without any complex imports
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

app = FastAPI(title='Aurora Mind API - TEST')

app.add_middleware(
    CORSMiddleware,
    allow_origins=['*'],
    allow_credentials=True,
    allow_methods=['*'],
    allow_headers=['*']
)

@app.get('/')
def root():
    return {'message': 'Test server running', 'status': 'OK'}

@app.get('/health')
def health():
    return {'status': 'healthy'}

if __name__ == "__main__":
    print("Starting minimal test server on http://127.0.0.1:8000")
    uvicorn.run(app, host="127.0.0.1", port=8000)
