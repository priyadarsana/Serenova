from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional
import uuid
from datetime import datetime

from app.core.emotion_model import get_emotion_pipe
from app.core.chat_utils import combine_user_text

router = APIRouter()

class ChatTurn(BaseModel):
    role: str
    text: str

class IntakeSummaryRequest(BaseModel):
    userId: Optional[str] = "anonymous"
    turns: List[ChatTurn]

class IntakeSummaryResponse(BaseModel):
    sessionId: str
    summary: str
    mainEmotion: str
    emotionScore: float
    riskLevel: str
    timestamp: str

def assess_risk_level(emotion: str, score: float, text: str) -> str:
    """Determine risk level based on emotion, confidence, and content."""
    crisis_keywords = [
        'suicide', 'suicidal', 'kill myself', 'end my life', 'want to die',
        'self-harm', 'hurt myself', 'cutting', 'overdose', 'not worth living'
    ]
    
    text_lower = text.lower()
    has_crisis_keyword = any(keyword in text_lower for keyword in crisis_keywords)
    
    if has_crisis_keyword:
        return 'high'
    
    high_risk_emotions = ['sadness', 'fear', 'anger']
    medium_risk_emotions = ['surprise']
    
    if emotion in high_risk_emotions and score > 0.7:
        return 'high'
    elif emotion in high_risk_emotions and score > 0.5:
        return 'medium'
    elif emotion in medium_risk_emotions:
        return 'medium'
    else:
        return 'low'

def build_summary(user_text: str, emotion: str, risk_level: str) -> str:
    """Generate a concise summary for the AI chatbot context."""
    # Extract key phrases (simple version - could be enhanced with NLP)
    sentences = user_text.split('.')
    key_concerns = []
    
    concern_keywords = {
        'work': ['work', 'job', 'boss', 'coworker', 'deadline', 'project'],
        'sleep': ['sleep', 'insomnia', 'tired', 'exhausted', 'rest'],
        'relationships': ['friend', 'family', 'relationship', 'partner', 'lonely'],
        'health': ['health', 'sick', 'pain', 'doctor', 'medication'],
        'anxiety': ['anxious', 'worry', 'stress', 'panic', 'overwhelmed'],
        'mood': ['sad', 'depressed', 'hopeless', 'empty', 'numb']
    }
    
    text_lower = user_text.lower()
    for category, keywords in concern_keywords.items():
        if any(kw in text_lower for kw in keywords):
            key_concerns.append(category)
    
    # Build summary
    concern_text = f" concerning {', '.join(key_concerns[:3])}" if key_concerns else ""
    risk_descriptor = {
        'high': 'experiencing significant distress',
        'medium': 'feeling challenged',
        'low': 'managing but seeking support'
    }[risk_level]
    
    summary = f"User is {risk_descriptor}, expressing {emotion}{concern_text}."
    
    # Add snippet of their own words
    if sentences and sentences[0].strip():
        first_sentence = sentences[0].strip()[:100]
        summary += f' They shared: "{first_sentence}..."'
    
    return summary

@router.post("/summary", response_model=IntakeSummaryResponse)
async def create_intake_summary(request: IntakeSummaryRequest):
    """
    Analyze intake chat conversation and create summary for AI chatbot handover.
    
    This endpoint:
    1. Combines all user messages from the intake conversation
    2. Runs emotion analysis using free HuggingFace model
    3. Assesses risk level based on emotion + keywords
    4. Generates a concise summary for the AI chatbot context
    """
    try:
        # Extract user text
        user_text = combine_user_text(request.turns)
        
        if not user_text.strip():
            raise HTTPException(status_code=400, detail="No user messages found in conversation")
        
        # Run emotion analysis
        emotion_pipe = get_emotion_pipe()
        results = emotion_pipe(user_text)
        
        # Get top emotion
        top_result = max(results[0], key=lambda x: x['score'])
        main_emotion = top_result['label']
        emotion_score = top_result['score']
        
        # Assess risk
        risk_level = assess_risk_level(main_emotion, emotion_score, user_text)
        
        # Build summary
        summary = build_summary(user_text, main_emotion, risk_level)
        
        # Generate session ID
        session_id = str(uuid.uuid4())
        
        return IntakeSummaryResponse(
            sessionId=session_id,
            summary=summary,
            mainEmotion=main_emotion,
            emotionScore=round(emotion_score, 3),
            riskLevel=risk_level,
            timestamp=datetime.utcnow().isoformat()
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")
