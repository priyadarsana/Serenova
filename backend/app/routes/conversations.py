"""
Conversation storage and analysis endpoints.
Stores chat conversations in MongoDB Atlas (with file fallback).
"""

from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import List, Optional, Dict
from datetime import datetime
import json
import os
from app.core.groq_client import chat_with_groq
from app.core.database import get_collection, clean_for_storage
from app.core.auth import get_current_user, get_optional_user

router = APIRouter()

# Fallback file-based storage
CONVERSATIONS_DIR = "data/conversations"
os.makedirs(CONVERSATIONS_DIR, exist_ok=True)

class Message(BaseModel):
    role: str
    content: str
    timestamp: Optional[str] = None

class ConversationSaveRequest(BaseModel):
    sessionId: str
    userId: Optional[str] = "anonymous"
    messages: List[Message]
    intakeSummary: Optional[str] = None
    mainEmotion: Optional[str] = None
    riskLevel: Optional[str] = None

class ConversationResponse(BaseModel):
    sessionId: str
    messages: List[Message]
    savedAt: str
    messageCount: int

class AnalysisResponse(BaseModel):
    sessionId: str
    stressIndicators: List[str]
    emotionalPatterns: List[str]
    concernedTopics: List[str]
    suggestions: List[str]
    overallStressLevel: str

class AIInsightsResponse(BaseModel):
    sessionId: str
    aiSummary: str
    keyThemes: List[str]
    emotionalJourney: str
    strengthsObserved: List[str]
    growthAreas: List[str]
    personalizedRecommendations: List[str]
    urgencyLevel: str
    progressIndicators: str

async def save_conversation_to_db(conversation_data: dict):
    """Save conversation to MongoDB or file."""
    conv_col = get_collection('conversations')
    
    if conv_col is not None:
        # MongoDB storage - clean data to minimize storage (M0 512MB limit)
        cleaned_data = clean_for_storage(conversation_data)
        conv_col.update_one(
            {'_id': conversation_data['sessionId']},
            {'$set': cleaned_data},
            upsert=True
        )
    else:
        # File storage fallback
        filepath = os.path.join(CONVERSATIONS_DIR, f"{conversation_data['sessionId']}.json")
        with open(filepath, 'w', encoding='utf-8') as f:
            json.dump(conversation_data, f, indent=2)

async def get_conversation_from_db(session_id: str) -> Optional[dict]:
    """Get conversation from MongoDB or file."""
    conv_col = get_collection('conversations')
    
    if conv_col is not None:
        # MongoDB storage
        return conv_col.find_one({'_id': session_id})
    else:
        # File storage fallback
        filepath = os.path.join(CONVERSATIONS_DIR, f"{session_id}.json")
        if not os.path.exists(filepath):
            return None
        with open(filepath, 'r', encoding='utf-8') as f:
            return json.load(f)

async def list_conversations_from_db(user_id: Optional[str] = None) -> List[dict]:
    """List conversations from MongoDB or file, filtered by user_id if provided."""
    conv_col = get_collection('conversations')
    
    if conv_col is not None:
        # MongoDB storage
        conversations = []
        query = {'userId': user_id} if user_id else {}
        for doc in conv_col.find(query).sort('savedAt', -1):
            conversations.append({
                "sessionId": doc['sessionId'],
                "savedAt": doc['savedAt'],
                "messageCount": doc['messageCount'],
                "mainEmotion": doc.get('mainEmotion', 'neutral'),
                "riskLevel": doc.get('riskLevel', 'low')
            })
        return conversations
    else:
        # File storage fallback
        conversations = []
        for filename in os.listdir(CONVERSATIONS_DIR):
            if filename.endswith('.json'):
                filepath = os.path.join(CONVERSATIONS_DIR, filename)
                with open(filepath, 'r', encoding='utf-8') as f:
                    data = json.load(f)
                    # Filter by userId if provided
                    if user_id and data.get('userId') != user_id:
                        continue
                    conversations.append({
                        "sessionId": data["sessionId"],
                        "savedAt": data["savedAt"],
                        "messageCount": data["messageCount"],
                        "mainEmotion": data.get("mainEmotion", "neutral"),
                        "riskLevel": data.get("riskLevel", "low")
                    })
        return sorted(conversations, key=lambda x: x['savedAt'], reverse=True)

@router.post("/save")
async def save_conversation(request: ConversationSaveRequest):
    """Save a conversation for later analysis."""
    try:
        conversation_data = {
            "sessionId": request.sessionId,
            "userId": request.userId,
            "messages": [msg.dict() for msg in request.messages],
            "intakeSummary": request.intakeSummary,
            "mainEmotion": request.mainEmotion,
            "riskLevel": request.riskLevel,
            "savedAt": datetime.now().isoformat(),
            "messageCount": len(request.messages)
        }
        
        await save_conversation_to_db(conversation_data)
        
        return {
            "success": True,
            "sessionId": request.sessionId,
            "savedAt": conversation_data["savedAt"]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to save conversation: {str(e)}")

@router.get("/list")
async def list_conversations(user_id: str = Depends(get_current_user)):
    """List all saved conversations for the authenticated user."""
    try:
        conversations = await list_conversations_from_db(user_id)
        return {"conversations": conversations, "total": len(conversations)}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to list conversations: {str(e)}")

@router.get("/{session_id}")
async def get_conversation(session_id: str, user_id: str = Depends(get_current_user)):
    """Retrieve a specific conversation (user must own it)."""
    try:
        data = await get_conversation_from_db(session_id)
        if not data:
            raise HTTPException(status_code=404, detail="Conversation not found")
        
        # Verify user owns this conversation
        if data.get('userId') != user_id:
            raise HTTPException(status_code=403, detail="Access denied")
        
        return data
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to retrieve conversation: {str(e)}")

@router.delete("/{session_id}")
async def delete_conversation(session_id: str, user_id: str = Depends(get_current_user)):
    """Delete a specific conversation (user must own it)."""
    try:
        # First verify the conversation exists and user owns it
        data = await get_conversation_from_db(session_id)
        if not data:
            raise HTTPException(status_code=404, detail="Conversation not found")
        
        if data.get('userId') != user_id:
            raise HTTPException(status_code=403, detail="Access denied")
        
        # Delete from MongoDB or file
        conv_col = get_collection('conversations')
        
        if conv_col is not None:
            # MongoDB storage
            result = conv_col.delete_one({'_id': session_id})
            if result.deleted_count == 0:
                raise HTTPException(status_code=404, detail="Conversation not found")
        else:
            # File storage fallback
            filepath = os.path.join(CONVERSATIONS_DIR, f"{session_id}.json")
            if os.path.exists(filepath):
                os.remove(filepath)
            else:
                raise HTTPException(status_code=404, detail="Conversation not found")
        
        return {"success": True, "message": "Conversation deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to delete conversation: {str(e)}")

@router.post("/analyze/{session_id}")
async def analyze_conversation(session_id: str, user_id: str = Depends(get_current_user)) -> AnalysisResponse:
    """Analyze a conversation for stress patterns and insights (user must own it)."""
    try:
        # Get conversation
        data = await get_conversation_from_db(session_id)
        if not data:
            raise HTTPException(status_code=404, detail="Conversation not found")
        
        # Verify user owns this conversation
        if data.get('userId') != user_id:
            raise HTTPException(status_code=403, detail="Access denied")
        
        messages = data["messages"]
        user_messages = [msg for msg in messages if msg["role"] == "user"]
        
        # Analyze patterns
        stress_indicators = []
        emotional_patterns = []
        concerned_topics = []
        
        # Combine all user text
        all_text = " ".join([msg["content"].lower() for msg in user_messages])
        
        # Stress indicators
        stress_keywords = {
            "overwhelmed": "Feeling overwhelmed",
            "anxious": "Experiencing anxiety",
            "worried": "Excessive worry",
            "can't sleep": "Sleep difficulties",
            "exhausted": "Chronic exhaustion",
            "pressure": "High pressure feelings",
            "stressed": "Direct stress mention",
            "too much": "Overload feelings",
            "can't handle": "Coping difficulties",
            "breaking down": "Emotional breakdown signs"
        }
        
        for keyword, indicator in stress_keywords.items():
            if keyword in all_text:
                stress_indicators.append(indicator)
        
        # Emotional patterns
        emotion_keywords = {
            "sad": "Sadness",
            "angry": "Anger",
            "frustrated": "Frustration",
            "hopeless": "Hopelessness",
            "lonely": "Loneliness",
            "scared": "Fear",
            "guilty": "Guilt",
            "ashamed": "Shame",
            "numb": "Emotional numbness"
        }
        
        for keyword, emotion in emotion_keywords.items():
            if keyword in all_text:
                emotional_patterns.append(emotion)
        
        # Topics of concern
        topic_keywords = {
            "work": "Work-related stress",
            "school": "Academic pressure",
            "relationship": "Relationship issues",
            "family": "Family concerns",
            "health": "Health worries",
            "money": "Financial stress",
            "future": "Future uncertainty",
            "job": "Career concerns",
            "exam": "Test anxiety",
            "deadline": "Time pressure"
        }
        
        for keyword, topic in topic_keywords.items():
            if keyword in all_text:
                concerned_topics.append(topic)
        
        # Determine overall stress level
        indicator_count = len(stress_indicators) + len(emotional_patterns)
        if indicator_count >= 8:
            stress_level = "High"
        elif indicator_count >= 4:
            stress_level = "Moderate"
        else:
            stress_level = "Low to Mild"
        
        # Generate suggestions
        suggestions = []
        if "sleep" in all_text or "tired" in all_text:
            suggestions.append("Practice sleep hygiene - consistent bedtime, no screens 1hr before sleep")
        if "overwhelmed" in all_text or "too much" in all_text:
            suggestions.append("Break tasks into smaller steps, prioritize 3 most important items")
        if "anxious" in all_text or "worried" in all_text:
            suggestions.append("Try 4-7-8 breathing: inhale 4 counts, hold 7, exhale 8")
        if "lonely" in all_text or "alone" in all_text:
            suggestions.append("Reach out to a friend or join a support group")
        if len(suggestions) == 0:
            suggestions.append("Continue journaling your thoughts and feelings")
            suggestions.append("Practice mindfulness or meditation for 10 minutes daily")
        
        return AnalysisResponse(
            sessionId=session_id,
            stressIndicators=stress_indicators,
            emotionalPatterns=emotional_patterns,
            concernedTopics=concerned_topics,
            suggestions=suggestions,
            overallStressLevel=stress_level
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to analyze conversation: {str(e)}")

@router.post("/ai-insights/{session_id}", response_model=AIInsightsResponse)
async def get_ai_insights(session_id: str, user_id: str = Depends(get_current_user)):
    """Get deep AI-powered insights from a conversation using Groq (user must own it)."""
    try:
        # Load conversation
        conversation = await get_conversation_from_db(session_id)
        if not conversation:
            raise HTTPException(status_code=404, detail="Conversation not found")
        
        # Verify user owns this conversation
        if conversation.get('userId') != user_id:
            raise HTTPException(status_code=403, detail="Access denied")
        
        # Extract user messages only
        user_messages = [msg["content"] for msg in conversation["messages"] if msg["role"] == "user"]
        
        if not user_messages:
            # Return default insights if no user messages
            return AIInsightsResponse(
                sessionId=session_id,
                aiSummary="No conversation data available yet.",
                keyThemes=["Initial assessment"],
                emotionalJourney="Beginning wellness journey",
                strengthsObserved=["Taking first steps", "Self-awareness"],
                growthAreas=["Continued engagement"],
                personalizedRecommendations=["Continue sharing your thoughts", "Practice self-reflection"],
                urgencyLevel="low",
                progressIndicators="Initiated conversation"
            )
        
        conversation_text = "\n".join(user_messages)
        
        # Create AI analysis prompt
        analysis_prompt = f"""You are a compassionate mental health analyst. Analyze this conversation and provide detailed insights.

CONVERSATION:
{conversation_text}

Provide a comprehensive analysis in the following JSON format:
{{
  "summary": "A 2-3 sentence empathetic summary of what the person is experiencing",
  "keyThemes": ["theme1", "theme2", "theme3"],
  "emotionalJourney": "Describe the emotional progression through the conversation",
  "strengthsObserved": ["strength1", "strength2"],
  "growthAreas": ["area1", "area2"],
  "recommendations": ["recommendation1", "recommendation2", "recommendation3"],
  "urgencyLevel": "low/moderate/high",
  "progressIndicators": "What signs of progress or positive coping are present?"
}}

Focus on being supportive, identifying resilience, and providing actionable insights."""

        # Get AI analysis
        try:
            ai_response = await chat_with_groq(
                message=analysis_prompt,
                context="You are analyzing a mental health conversation to provide supportive insights.",
                session_id=session_id
            )
            
            # Parse JSON response
            import re
            json_match = re.search(r'\{.*\}', ai_response, re.DOTALL)
            if json_match:
                ai_data = json.loads(json_match.group())
            else:
                # Fallback if JSON parsing fails
                ai_data = {
                    "summary": ai_response[:200],
                    "keyThemes": ["General wellbeing"],
                    "emotionalJourney": "Processing emotions",
                    "strengthsObserved": ["Seeking help", "Self-awareness"],
                    "growthAreas": ["Stress management"],
                    "recommendations": ["Continue self-reflection", "Practice self-care"],
                    "urgencyLevel": "moderate",
                    "progressIndicators": "Engaged in conversation"
                }
            
            return AIInsightsResponse(
                sessionId=session_id,
                aiSummary=ai_data.get("summary", ""),
                keyThemes=ai_data.get("keyThemes", []),
                emotionalJourney=ai_data.get("emotionalJourney", ""),
                strengthsObserved=ai_data.get("strengthsObserved", []),
                growthAreas=ai_data.get("growthAreas", []),
                personalizedRecommendations=ai_data.get("recommendations", []),
                urgencyLevel=ai_data.get("urgencyLevel", "moderate"),
                progressIndicators=ai_data.get("progressIndicators", "")
            )
            
        except Exception as ai_error:
            # Fallback to basic analysis if AI fails
            print(f"AI analysis error: {str(ai_error)}")
            return AIInsightsResponse(
                sessionId=session_id,
                aiSummary="Analysis in progress. Please check back soon.",
                keyThemes=["General wellbeing"],
                emotionalJourney="Processing emotions and experiences",
                strengthsObserved=["Seeking support", "Self-awareness", "Willingness to engage"],
                growthAreas=["Stress management", "Emotional regulation"],
                personalizedRecommendations=["Continue self-reflection", "Practice mindfulness", "Stay engaged with support"],
                urgencyLevel="moderate",
                progressIndicators="Actively engaged in wellness journey"
            )
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error in ai-insights: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to get AI insights: {str(e)}")
