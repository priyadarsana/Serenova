# Testing the Full Flow

## 1. Start Backend (Terminal 1)
```powershell
cd backend
.\.venv\Scripts\Activate.ps1  # if not already activated
uvicorn app.main:app --reload --port 8000
```

Wait for: "Application startup complete" (first run downloads model ~250MB)

## 2. Start Frontend (Terminal 2)
```powershell
cd frontend
npm run dev
```

Visit: http://localhost:3000

## 3. Test Text Emotion Analysis

1. Click **"Type how you feel"**
2. Write something emotional, e.g.:
   - Happy: "I just got the job I wanted! I'm so excited and grateful!"
   - Sad: "I'm feeling really lonely and down today. Nothing seems to help."
   - Anxious: "I'm so worried about the exam tomorrow. I can't stop thinking about it."
3. Click **"Analyze my feelings"**
4. See the results with:
   - Emotion label and confidence score
   - Empathetic message tailored to your emotion
   - Personalized suggestions
   - Risk level indicator

## Example Test Inputs

### High Joy
```
I can't believe it! I finally finished my project and my team loved it. 
I feel so proud and happy right now. This is the best day!
```

### Medium Sadness
```
I've been feeling pretty down lately. Work is stressful and I miss 
spending time with friends. Everything just feels heavy.
```

### High Fear/Anxiety
```
I'm terrified about the presentation tomorrow. My heart won't stop racing 
and I keep imagining everything going wrong. I don't think I can do this.
```

### Anger
```
I'm so frustrated with how I've been treated. Nobody listens and I feel 
completely disrespected. This is not okay.
```

## What to Verify

✅ Backend receives request and returns analysis
✅ Emotion label matches the text sentiment
✅ Empathetic message is appropriate for the emotion
✅ Suggestions are relevant to the risk level
✅ High-risk emotions show support warning
✅ Results page displays all data correctly
✅ Animations work smoothly

## Quick API Test (Optional)

Test the endpoint directly:
```powershell
curl -X POST http://localhost:8000/api/analyze/text `
  -H "Content-Type: application/json" `
  -d '{"text": "I am so happy today!", "userId": "test"}'
```
