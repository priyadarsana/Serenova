from fastapi import APIRouter, UploadFile, File, Form
from pydantic import BaseModel
import uuid

from app.core.emotion_model import get_emotion_pipe
from app.core.response_templates import build_response
from app.core.chat_utils import combine_user_text

router = APIRouter()

class TextAnalysisRequest(BaseModel):
    userId: str | None = None
    text: str
    timestamp: str | None = None

@router.post('/text')
def analyze_text(req: TextAnalysisRequest):
    # Call Hugging Face emotion model
    emotion_pipe = get_emotion_pipe()
    preds = emotion_pipe(req.text)[0]  # list[dict]: {'label', 'score'}
    top = max(preds, key=lambda x: x["score"])
    label = top["label"].lower()
    score = float(top["score"])

    # Generate empathetic response and suggestions
    risk_level, empathetic_message, suggestions = build_response(label, score)

    session_id = str(uuid.uuid4())
    return {
        'sessionId': session_id,
        'overallLabel': label.title(),
        'overallScore': score,
        'textEmotion': { 'label': label, 'score': score },
        'riskLevel': risk_level,
        'empatheticMessage': empathetic_message,
        'suggestions': suggestions
    }

@router.post('/voice')
async def analyze_voice(userId: str = Form(...), timestamp: str = Form(...), transcribe: str = Form(...), audio: UploadFile = File(None)):
    # Stub: in real version process audio with Librosa + PyTorch CNN
    session_id = str(uuid.uuid4())
    return {
        'sessionId': session_id,
        'overallLabel': 'Mild tension',
        'overallScore': 0.50,
        'voiceEmotion': { 'label': 'tense', 'score': 0.7 },
        'riskLevel': 'low',
        'suggestions': ['Try a grounding exercise']
    }

class ChatTurn(BaseModel):
    role: str  # "user" | "assistant"
    text: str

class ChatAnalyzeRequest(BaseModel):
    userId: str | None = None
    turns: list[ChatTurn]

@router.post('/chat')
async def analyze_chat(req: ChatAnalyzeRequest):
    """Analyze emotions from guided chat conversation"""
    # Combine all user messages
    full_user_text = combine_user_text([t.dict() for t in req.turns])
    
    if not full_user_text.strip():
        return {
            'sessionId': str(uuid.uuid4()),
            'overallLabel': 'Neutral',
            'overallScore': 0.5,
            'textEmotion': {'label': 'neutral', 'score': 0.5},
            'riskLevel': 'low',
            'empatheticMessage': 'Thank you for sharing. Feel free to express more when you\'re ready.',
            'suggestions': ['Take a moment to reflect', 'Try journaling your thoughts']
        }
    
    # Run emotion analysis on combined text
    emotion_pipe = get_emotion_pipe()
    preds = emotion_pipe(full_user_text)[0]
    top = max(preds, key=lambda x: x["score"])
    label = top["label"].lower()
    score = float(top["score"])
    
    # Generate empathetic response
    risk, empathetic_msg, suggestions = build_response(label, score)
    
    return {
        'sessionId': str(uuid.uuid4()),
        'overallLabel': label.title(),
        'overallScore': score,
        'textEmotion': {'label': label, 'score': score},
        'riskLevel': risk,
        'empatheticMessage': empathetic_msg,
        'suggestions': suggestions,
        'analyzedText': full_user_text
    }
