from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from pathlib import Path
from app.routes import checkin, analyze, insights, intake, support, conversations, users, auth, assessment, voice_analysis

# Load environment variables from .env file
env_path = Path(__file__).parent.parent / '.env'
load_dotenv(dotenv_path=env_path)

app = FastAPI(title='Aurora Mind API')

app.add_middleware(
    CORSMiddleware,
    allow_origins=['*'],
    allow_credentials=True,
    allow_methods=['*'],
    allow_headers=['*'],
    expose_headers=['*']
)

app.include_router(checkin.router, prefix='/api/checkin', tags=['Check-in'])
app.include_router(analyze.router, prefix='/api/analyze', tags=['Analysis'])
app.include_router(insights.router, prefix='/api/insights', tags=['Insights'])
app.include_router(intake.router, prefix='/api/intake', tags=['Intake'])
app.include_router(support.router, prefix='/api/support', tags=['Support'])
app.include_router(conversations.router, prefix='/api/conversations', tags=['Conversations'])
app.include_router(users.router, prefix='/api/users', tags=['Users'])
app.include_router(auth.router, prefix='/api/auth', tags=['Authentication'])
app.include_router(assessment.router, prefix='/api/assessment', tags=['Assessment'])
app.include_router(voice_analysis.router, prefix='/api/voice', tags=['Voice Analysis'])

@app.get('/')
def root():
    return {'message': 'Aurora Mind API running with MongoDB support (file storage fallback active)'}
