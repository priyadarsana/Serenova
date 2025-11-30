"""
LLM integration for AI support chatbot using Google Gemini API.

Gemini has a generous free tier and is more reliable than local models.
Get API key: https://makersuite.google.com/app/apikey
"""

import os
from typing import List, Dict
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")

# Configure Gemini
if GEMINI_API_KEY and GEMINI_API_KEY != "your_api_key_here":
    genai.configure(api_key=GEMINI_API_KEY)

SYSTEM_PROMPT = """You are a kind, non-judgmental mental health support companion named Aurora.

Your role:
- Listen actively and validate the user's feelings
- Reflect back what you hear to show understanding
- Suggest simple coping strategies (breathing exercises, journaling, taking breaks, talking to trusted people)
- Be warm, gentle, and hopeful without being dismissive

Your limitations:
- You are NOT a therapist, counselor, or medical professional
- You CANNOT diagnose mental health conditions
- You CANNOT prescribe medication or treatments
- You CANNOT provide crisis intervention

Safety rules:
- If the user mentions self-harm, suicide, abuse, or feeling unsafe, respond with empathy and IMMEDIATELY encourage them to contact emergency services (911), a crisis helpline (988 Suicide & Crisis Lifeline), or a trusted person
- Keep responses short: 3-6 sentences maximum
- Use simple, clear language
- Never give medical advice

Tone: Warm, empathetic, supportive, like a caring friend who listens without judgment."""

CRISIS_KEYWORDS = [
    'suicide', 'suicidal', 'kill myself', 'end my life', 'want to die', 'better off dead',
    'self-harm', 'self harm', 'hurt myself', 'cutting', 'cut myself',
    'overdose', 'pills', 'not worth living', 'no reason to live',
    'harm myself', 'end it all', 'can\'t go on'
]

def check_gemini_available() -> bool:
    """Check if Gemini API key is configured."""
    return bool(GEMINI_API_KEY and GEMINI_API_KEY != "your_api_key_here")

def detect_crisis(text: str) -> bool:
    """Check if user message contains crisis keywords."""
    text_lower = text.lower()
    return any(keyword in text_lower for keyword in CRISIS_KEYWORDS)

def chat_with_gemini(
    messages: List[Dict[str, str]],
    context_summary: str,
    emotion: str,
    risk_level: str
) -> tuple[str, bool]:
    """
    Send conversation to Google Gemini API and get response.
    
    Args:
        messages: List of {role: "user" | "assistant", content: str}
        context_summary: Summary from intake conversation
        emotion: Detected emotion from intake
        risk_level: Risk assessment from intake
        
    Returns:
        (response_text, crisis_detected)
    """
    if not check_gemini_available():
        return "I need a Gemini API key to work. Please set GEMINI_API_KEY in backend/.env file. Get one free at https://makersuite.google.com/app/apikey", False
    
    # Check for crisis in latest user message
    crisis_detected = False
    if messages and messages[-1]['role'] == 'user':
        crisis_detected = detect_crisis(messages[-1]['content'])
    
    try:
        # Build context
        context = f"{SYSTEM_PROMPT}\n\nContext: User shared earlier - {context_summary}\nDetected emotion: {emotion}\nRisk level: {risk_level}\n\nRespond with empathy and support. Keep it brief (3-6 sentences)."
        
        # Create Gemini model
        model = genai.GenerativeModel(
            model_name='gemini-1.5-flash',
            generation_config={
                'temperature': 0.7,
                'max_output_tokens': 200,
                'top_p': 0.9,
            }
        )
        
        # Build conversation history for Gemini
        chat_history = [
            {'role': 'user', 'parts': [context]},
            {'role': 'model', 'parts': ["I understand. I'll be supportive and empathetic."]},
        ]
        
        # Add user messages (convert role names)
        for msg in messages[:-1]:  # All except last message
            role = 'user' if msg['role'] == 'user' else 'model'
            chat_history.append({
                'role': role,
                'parts': [msg['content']]
            })
        
        # Start chat with history
        chat = model.start_chat(history=chat_history)
        
        # Send last user message
        last_message = messages[-1]['content']
        response = chat.send_message(last_message)
        reply = response.text
        
        # Add crisis safety message if needed
        if crisis_detected:
            reply += "\n\n⚠️ If you are in immediate danger or having thoughts of suicide, please contact emergency services (911) or the 988 Suicide & Crisis Lifeline right now. You deserve support and help is available."
        
        return reply, crisis_detected
        
    except Exception as e:
        print(f"Gemini error: {e}")
        error_msg = str(e)
        
        if "API_KEY" in error_msg or "authentication" in error_msg.lower():
            return "Invalid API key. Please check your GEMINI_API_KEY in backend/.env file.", False
        elif "quota" in error_msg.lower() or "rate" in error_msg.lower():
            return "Too many requests. Please wait a moment and try again.", False
        else:
            return "I'm having trouble responding right now. Please try again in a moment.", False
