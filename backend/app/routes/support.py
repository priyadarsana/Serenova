from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional

from app.core.groq_client import chat_with_groq, check_groq_available

router = APIRouter()

class ChatMessage(BaseModel):
    role: str  # "user" or "assistant"
    content: str

class SupportChatRequest(BaseModel):
    userId: Optional[str] = "anonymous"
    sessionId: str
    intakeSummary: str
    mainEmotion: str
    riskLevel: str
    messages: List[ChatMessage]

class SupportChatResponse(BaseModel):
    reply: str
    crisisDetected: bool

class HealthCheckResponse(BaseModel):
    groqAvailable: bool
    message: str

@router.get("/health", response_model=HealthCheckResponse)
async def check_support_health():
    """Check if Groq API is configured."""
    available = check_groq_available()
    
    if available:
        message = "Groq API is configured and ready (30 req/min, super fast!)"
    else:
        message = "Please set GROQ_API_KEY in backend/.env file. Get free key at https://console.groq.com/keys"
    
    return HealthCheckResponse(
        groqAvailable=available,
        message=message
    )

@router.post("/chat", response_model=SupportChatResponse)
async def support_chat(request: SupportChatRequest):
    """
    AI emotional support chatbot endpoint using Groq.
    
    Groq provides:
    - Fast inference (faster than Gemini!)
    - 30 requests/min (2x Gemini's limit)
    - Free tier
    - Multiple models (llama-3.1-70b-versatile)
    
    NOT a replacement for professional therapy.
    """
    # Check if Groq is configured
    if not check_groq_available():
        raise HTTPException(
            status_code=503,
            detail="Groq API is not configured. Please set GROQ_API_KEY in backend/.env file. Get a free key at https://console.groq.com/keys"
        )
    
    try:
        # Convert messages to format expected by Groq client
        groq_messages = [
            {"role": msg.role, "content": msg.content}
            for msg in request.messages
        ]
        
        # Get response from Groq
        reply, crisis_detected = chat_with_groq(
            messages=groq_messages,
            context_summary=request.intakeSummary,
            emotion=request.mainEmotion,
            risk_level=request.riskLevel
        )
        
        return SupportChatResponse(
            reply=reply,
            crisisDetected=crisis_detected
        )
        
    except Exception as e:
        print(f"Chat error: {e}")
        raise HTTPException(status_code=500, detail=f"Chat failed: {str(e)}")
