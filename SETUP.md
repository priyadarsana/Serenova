# Aurora Mind - AI Mental Health Companion Setup Guide

## 🎯 What You Have Now

A complete mental health support app with:

1. **Guided Intake Chat** - Scripted questions to understand user's feelings
2. **Emotion Analysis** - Free HuggingFace model (DistilBERT) for emotion detection
3. **AI Support Chatbot** - ChatGPT-like companion using local open-source LLM
4. **Crisis Detection** - Automatic keyword scanning with emergency resources
5. **Privacy-First** - All AI runs locally, consent screens, data export/delete

## 📋 Prerequisites

- Node.js 18+ (for frontend)
- Python 3.9+ (for backend)
- Ollama (for AI chatbot)

## 🚀 Setup Instructions

### 1. Install Ollama (AI Chatbot Brain)

**Windows:**
```powershell
# Download from https://ollama.ai/download
# Or use winget:
winget install Ollama.Ollama
```

**After installation:**
```powershell
# Pull the recommended model (Phi-3 Mini - 2.3GB)
ollama pull phi3:mini

# Start Ollama server (runs in background)
ollama serve
```

**Alternative models you can use:**
- `ollama pull gemma:2b` - Google's Gemma 2B (smaller, faster)
- `ollama pull llama3.2:1b` - Llama 3.2 1B (smallest, very fast)
- `ollama pull mistral:7b` - Mistral 7B (larger, more capable)

### 2. Backend Setup

```powershell
cd backend

# Create virtual environment
python -m venv .venv
.\.venv\Scripts\Activate.ps1

# Install dependencies (includes httpx for Ollama communication)
pip install -r requirements.txt

# Start backend server
uvicorn app.main:app --reload --port 8000
```

**Backend will be at:** http://localhost:8000

**First run:** The emotion model (distilbert-base-uncased-emotion) will auto-download (~250MB)

### 3. Frontend Setup

```powershell
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

**Frontend will be at:** http://localhost:5173

## 🔍 How It Works

### Flow 1: Guided Intake Chat

1. User visits `/check-in/chat`
2. App asks 3-6 scripted questions:
   - "How has your day been so far?"
   - "What's been on your mind the most today?"
   - etc.
3. User responds naturally
4. When enough info is gathered (smart detection based on content), calls `POST /api/intake/summary`:
   - Combines all user messages
   - Runs free emotion model
   - Detects risk level (low/medium/high)
   - Checks for crisis keywords
   - Returns summary
5. User sees handover screen with emotion summary
6. User can choose:
   - Talk to AI companion
   - View coping activities
   - View crisis resources

### Flow 2: AI Support Chatbot

1. User clicks "Talk to AI support companion"
2. Goes to `/support/bot`
3. Frontend checks `GET /api/support/health` to verify Ollama is running
4. User chats freely with AI
5. Each message calls `POST /api/support/chat`:
   - Backend checks for crisis keywords
   - Builds context with intake summary + emotion + risk level
   - Sends to Ollama with safety-focused system prompt
   - Ollama (Phi-3) generates empathetic response
   - If crisis detected, appends emergency resources
   - Returns reply to frontend
6. User sees typing indicator, then AI response
7. Crisis alert shown if needed with 988/911 buttons

## 🛡️ Safety Features

### Crisis Keyword Detection
Located in `/backend/app/core/llm_client.py`:
- Scans for: suicide, self-harm, overdose, etc.
- Triggers crisis flag
- Auto-appends emergency resources to AI response

### System Prompt
The AI is constrained to:
- ✅ Listen, validate, reflect feelings
- ✅ Suggest simple coping (breathing, journaling)
- ❌ Cannot diagnose or prescribe
- ❌ Cannot give medical advice
- Must refer to emergency services for crisis

### Emergency Resources
- 988 Suicide & Crisis Lifeline (call/text)
- 911 Emergency Services
- Crisis Text Line (text HOME to 741741)
- Always visible in chat UI

## 📁 Key Files

### Backend
- `/backend/app/routes/intake.py` - Intake summary endpoint
- `/backend/app/routes/support.py` - AI chatbot endpoint
- `/backend/app/core/llm_client.py` - Ollama integration + crisis detection
- `/backend/app/core/emotion_model.py` - HuggingFace emotion model
- `/backend/app/core/chat_utils.py` - Conversation utilities

### Frontend
- `/frontend/src/pages/CheckInChat.tsx` - Guided intake UI
- `/frontend/src/pages/CheckInHandover.tsx` - Summary + handover screen
- `/frontend/src/pages/SupportBot.tsx` - AI chatbot UI
- `/frontend/src/pages/Support.tsx` - Crisis resources page
- `/frontend/src/pages/Consent.tsx` - Privacy consent screen
- `/frontend/src/pages/Settings.tsx` - Data management + privacy

## 🧪 Testing the Complete Flow

1. **Start both servers** (backend on 8000, frontend on 5173)
2. **Ensure Ollama is running**: `ollama serve`
3. **Visit** http://localhost:5173
4. **Click** "Guided chat"
5. **Answer questions** naturally (3-4 messages)
6. **See handover screen** with emotion summary
7. **Click** "Talk to AI support companion"
8. **Chat with AI** - try both casual and crisis-related messages
9. **Observe crisis detection** if you mention keywords

## 🔧 Troubleshooting

### "AI support is temporarily unavailable"
- Make sure Ollama is running: `ollama serve`
- Check model is downloaded: `ollama list`
- If missing: `ollama pull phi3:mini`

### Backend won't start
```powershell
# Reinstall dependencies
cd backend
.\.venv\Scripts\Activate.ps1
pip install --upgrade -r requirements.txt
```

### Emotion model download stuck
- Check internet connection
- Model downloads automatically from HuggingFace on first run
- Takes ~2-5 minutes for 250MB download

### AI responses are slow
- Phi-3 Mini runs on CPU (no GPU needed)
- First response is slower (model loading)
- Try smaller model: `ollama pull gemma:2b`

## 📊 API Endpoints

### Intake
- `POST /api/intake/summary` - Analyze intake conversation
  - Input: `{ userId, turns: [{ role, text }] }`
  - Output: `{ sessionId, summary, mainEmotion, emotionScore, riskLevel }`

### Support
- `GET /api/support/health` - Check Ollama status
  - Output: `{ ollamaAvailable, availableModels, recommendedModel }`
- `POST /api/support/chat` - AI chatbot conversation
  - Input: `{ userId, sessionId, intakeSummary, mainEmotion, riskLevel, messages }`
  - Output: `{ reply, crisisDetected }`

## 🔐 Privacy & Data

- **Emotion analysis**: Runs locally using HuggingFace Transformers
- **AI chatbot**: Runs locally via Ollama (no cloud APIs)
- **No third-party APIs**: Everything happens on your machine
- **Data storage**: Currently localStorage/sessionStorage (in-memory)
- **User controls**: Can download data (JSON) or delete everything

## 🎨 Models Used

1. **Emotion Analysis**
   - Model: `bhadresh-savani/distilbert-base-uncased-emotion`
   - Type: Text classification (6 emotions)
   - Size: ~250MB
   - Runs: Locally via Transformers

2. **AI Chatbot**
   - Model: `phi3:mini` (recommended)
   - Type: Conversational LLM
   - Size: ~2.3GB
   - Runs: Locally via Ollama
   - Alternatives: gemma:2b (1.4GB), llama3.2:1b (1.3GB)

## ✅ What's Complete

- ✅ Guided intake chat with smart question flow
- ✅ Emotion analysis with free model
- ✅ AI chatbot with local LLM
- ✅ Crisis keyword detection
- ✅ Comprehensive helpline resources
- ✅ Consent & privacy screens
- ✅ Data export & delete functionality
- ✅ Safety-focused system prompts
- ✅ Emergency resource integration

## 🚧 Still TODO (Future Enhancements)

- MongoDB integration for persistent storage
- Firebase Authentication
- Voice emotion analysis
- Breathing exercise animations
- Weekly insights/trends charts
- Push notifications for check-ins
- Deployment to Render/Vercel

## 🆘 Crisis Resources (Always Available)

- **988 Suicide & Crisis Lifeline**: Call or text 988
- **Crisis Text Line**: Text HOME to 741741
- **Emergency Services**: Call 911
- **SAMHSA Helpline**: 1-800-662-4357

---

**Note**: Aurora Mind is a wellness tool, NOT a replacement for professional mental healthcare. Always consult qualified providers for mental health concerns.
