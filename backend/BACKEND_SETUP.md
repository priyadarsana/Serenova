# Backend Setup Guide

## Prerequisites
- Python 3.9+
- Virtual environment

## Quick Start

### 1. Create and activate virtual environment
```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
```

### 2. Install dependencies
```powershell
pip install -r requirements.txt
```

**Note**: First run will download the Hugging Face model (~250MB). This happens automatically when the server starts.

### 3. Run the server
```powershell
uvicorn app.main:app --reload --port 8000
```

Server will start at: http://localhost:8000

## API Endpoints

### Text Emotion Analysis
**POST** `/api/analyze/text`

Request:
```json
{
  "userId": "optional-user-id",
  "text": "I'm feeling really stressed about work today",
  "timestamp": "2025-11-27T10:00:00Z"
}
```

Response:
```json
{
  "sessionId": "uuid-here",
  "overallLabel": "Sadness",
  "overallScore": 0.82,
  "textEmotion": { "label": "sadness", "score": 0.82 },
  "riskLevel": "medium",
  "empatheticMessage": "You seem really weighed down right now...",
  "suggestions": [
    "Try a 3-minute breathing exercise",
    "Do one small comforting thing (music, warm drink, short walk)"
  ]
}
```

## AI Model Details

- **Model**: `bhadresh-savani/distilbert-base-uncased-emotion`
- **Type**: DistilBERT fine-tuned for emotion classification
- **Emotions**: joy, sadness, anger, fear, love, surprise
- **License**: Free for commercial use
- **Size**: ~250MB
- **Speed**: ~100-300ms per inference on CPU

## Response Templates

All empathetic messages and suggestions are generated from local templates in `app/core/response_templates.py`. No paid AI APIs are used.

You can customize messages by editing the `TEMPLATES` and `SUGGESTIONS` dictionaries.

## Troubleshooting

**Import errors**: Make sure all dependencies installed
```powershell
pip install -r requirements.txt
```

**Model download fails**: Check internet connection. Model downloads automatically on first run.

**Slow inference**: First request is slower (~2-3s) due to model loading. Subsequent requests are fast (~200ms).
