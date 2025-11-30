"""
Groq API integration for mental health chatbot.
Groq provides fast, free inference with generous rate limits (30 req/min).
"""

import os
from typing import List, Dict, Tuple
from groq import Groq

# Crisis keywords for detection
CRISIS_KEYWORDS = [
    'suicide', 'kill myself', 'end my life', 'want to die', 'better off dead',
    'no reason to live', 'suicidal', 'self harm', 'cut myself', 'hurt myself',
    'overdose', 'can\'t go on', 'nothing to live for'
]

def check_groq_available() -> bool:
    """Check if Groq API key is configured."""
    api_key = os.getenv('GROQ_API_KEY')
    return api_key is not None and api_key != '' and api_key != 'your_api_key_here'

def detect_crisis(text: str) -> bool:
    """Detect crisis keywords in text."""
    text_lower = text.lower()
    return any(keyword in text_lower for keyword in CRISIS_KEYWORDS)

def chat_with_groq(
    messages: List[Dict[str, str]],
    context_summary: str,
    emotion: str,
    risk_level: str
) -> Tuple[str, bool]:
    """
    Send conversation to Groq API with context and get response.
    
    Args:
        messages: List of message dicts with 'role' and 'content'
        context_summary: Summary from intake/assessment
        emotion: Main emotion detected
        risk_level: Risk level (low/medium/high)
    
    Returns:
        Tuple of (reply_text, crisis_detected)
    """
    api_key = os.getenv('GROQ_API_KEY')
    if not api_key:
        raise ValueError("GROQ_API_KEY not set in environment")
    
    try:
        client = Groq(api_key=api_key)
        
        # Build system prompt with mental health context
        system_prompt = f"""You are Aurora, a compassionate AI mental health support companion. You provide emotional support, active listening, and gentle guidance.

User Context:
- Assessment/Intake Summary: {context_summary}
- Current Emotion: {emotion}
- Risk Level: {risk_level}

Guidelines:
- Be warm, empathetic, and non-judgmental
- Use active listening techniques (reflect, validate, summarize)
- Ask open-ended questions to understand deeper
- Suggest healthy coping strategies when appropriate
- Keep responses concise (2-4 sentences typically)
- Never diagnose or replace professional therapy
- If user shows crisis signs, encourage professional help
- Use supportive language and emotional validation
- Avoid toxic positivity - acknowledge their pain

Remember: You're a supportive friend, not a therapist. Listen more than you advise."""

        # Prepare messages for Groq API
        api_messages = [{"role": "system", "content": system_prompt}]
        
        # Add conversation history
        for msg in messages:
            api_messages.append({
                "role": msg["role"],
                "content": msg["content"]
            })
        
        # Check for crisis keywords in latest message
        latest_user_message = messages[-1]["content"] if messages else ""
        crisis_detected = detect_crisis(latest_user_message)
        
        # Call Groq API
        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",  # Updated to current model
            messages=api_messages,
            temperature=0.7,
            max_tokens=300,
            top_p=0.9
        )
        
        reply = response.choices[0].message.content
        
        # Append crisis resources if detected
        if crisis_detected:
            crisis_message = "\n\n🚨 **I'm concerned about your safety.** Please reach out to:\n• 988 Suicide & Crisis Lifeline: Call/text 988\n• Crisis Text Line: Text HELLO to 741741\n• Emergency: Call 911"
            reply += crisis_message
        
        return reply, crisis_detected
        
    except Exception as e:
        print(f"Groq API error: {e}")
        raise Exception(f"Failed to get response from Groq: {str(e)}")
