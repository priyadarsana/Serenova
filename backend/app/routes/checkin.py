from fastapi import APIRouter
from pydantic import BaseModel
from datetime import datetime

router = APIRouter()

class QuickMoodRequest(BaseModel):
    userId: str
    mood: str
    timestamp: str

@router.post('/quick')
def quick_checkin(req: QuickMoodRequest):
    # Save to DB
    return {'status': 'ok', 'message': 'Mood logged'}
