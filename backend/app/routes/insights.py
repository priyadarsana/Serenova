from fastapi import APIRouter

router = APIRouter()

@router.get('/summary')
def insights_summary(userId: str):
    # Stub: fetch from MongoDB
    return {
        'dailyMood': [
            { 'date': '2025-11-20', 'mood': 'sad', 'riskLevel': 'high' },
            { 'date': '2025-11-21', 'mood': 'calm', 'riskLevel': 'low' }
        ],
        'recentSessions': [
            { 'sessionId': 'demo-1', 'date': '2025-11-21', 'overallLabel': 'Mild stress' }
        ]
    }
