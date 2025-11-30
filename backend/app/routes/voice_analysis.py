"""
Voice stress analysis using MFCC + Librosa + CNN.
Analyzes user's voice to detect stress levels and emotional state.
"""

from fastapi import APIRouter, UploadFile, File, HTTPException, Depends
from pydantic import BaseModel
from typing import Optional, List
import librosa
import numpy as np
from datetime import datetime
import io
import tempfile
import os
from groq import Groq
from app.core.auth import get_optional_user, get_current_user
from app.core.database import get_database
import soundfile as sf

router = APIRouter()

class VoiceAnalysisResult(BaseModel):
    stressLevel: str  # "low", "medium", "high", "very_high"
    confidence: float
    emotion: str
    emotionScores: dict
    timestamp: str
    suggestions: List[str]
    mfccFeatures: Optional[dict] = None

class TranscriptionResult(BaseModel):
    success: bool
    transcript: str
    language: Optional[str] = None
    duration: Optional[float] = None

# CNN model placeholder - you'll need to train and load your actual model
# For now, we'll use a mock analysis based on MFCC features
class MockStressClassifier:
    """
    Mock classifier for demonstration.
    Replace this with your actual trained CNN model.
    """
    
    def __init__(self):
        self.classes = ["calm", "neutral", "stressed", "very_stressed"]
        self.emotions = ["calm", "neutral", "anxious", "stressed", "overwhelmed"]
    
    def predict(self, mfcc_features):
        """
        Mock prediction based on MFCC features.
        In production, this should load and run your trained CNN model.
        """
        # Calculate statistics from MFCCs
        mfcc_mean = np.mean(mfcc_features)
        mfcc_std = np.std(mfcc_features)
        mfcc_var = np.var(mfcc_features)
        mfcc_max = np.max(mfcc_features)
        mfcc_min = np.min(mfcc_features)
        mfcc_range = mfcc_max - mfcc_min
        
        # Calculate dynamic features for more variability
        # Energy (higher energy can indicate stress/excitement)
        energy_score = mfcc_var / 100.0
        
        # Spectral variability (rapid changes suggest stress)
        temporal_var = np.var(np.diff(np.mean(mfcc_features, axis=0)))
        variability_score = min(temporal_var / 50.0, 1.0)
        
        # Combined stress score (0-1)
        stress_score = (energy_score * 0.4 + variability_score * 0.3 + (mfcc_std / 30.0) * 0.3)
        stress_score = min(max(stress_score, 0), 1)  # Clamp to 0-1
        
        # Determine stress level based on score
        if stress_score > 0.7:
            stress_level = "high"
            emotion = "stressed"
            confidence = 0.75 + (stress_score * 0.15)
        elif stress_score > 0.45:
            stress_level = "medium"
            emotion = "anxious"
            confidence = 0.70 + (stress_score * 0.15)
        elif stress_score > 0.25:
            stress_level = "low"
            emotion = "neutral"
            confidence = 0.72 + (stress_score * 0.10)
        else:
            stress_level = "low"
            emotion = "calm"
            confidence = 0.80 + ((1 - stress_score) * 0.15)
        
        # Generate realistic emotion scores based on stress
        base_calm = max(0.1, 1 - stress_score)
        base_stress = stress_score
        
        emotion_scores = {
            "calm": round(base_calm * 0.7, 2),
            "neutral": round(0.2 + (0.3 if 0.3 < stress_score < 0.6 else 0.1), 2),
            "anxious": round(base_stress * 0.5 if stress_score > 0.4 else 0.15, 2),
            "stressed": round(base_stress * 0.7 if stress_score > 0.5 else 0.10, 2),
            "overwhelmed": round(base_stress * 0.9 if stress_score > 0.7 else 0.05, 2)
        }
        
        # Normalize emotion scores
        total = sum(emotion_scores.values())
        if total > 0:
            emotion_scores = {k: round(v/total, 2) for k, v in emotion_scores.items()}
        
        return stress_level, emotion, round(confidence, 2), emotion_scores

# Initialize mock classifier
classifier = MockStressClassifier()

def get_groq_client():
    """Get Groq client for Whisper transcription."""
    # Re-import to ensure latest environment variables
    from dotenv import load_dotenv
    from pathlib import Path
    
    # Reload .env file
    env_path = Path(__file__).parent.parent.parent / '.env'
    load_dotenv(dotenv_path=env_path, override=True)
    
    api_key = os.getenv('GROQ_API_KEY')
    if not api_key:
        print("❌ GROQ_API_KEY not found in environment!")
        print(f"   Looking for .env at: {env_path}")
        print(f"   File exists: {env_path.exists()}")
        raise ValueError("GROQ_API_KEY not set in environment. Please add it to the .env file.")
    
    print(f"✅ GROQ_API_KEY loaded: {api_key[:20]}...")
    return Groq(api_key=api_key)

def extract_mfcc_features(audio_file_bytes: bytes, sample_rate: int = 16000):
    """
    Extract MFCC features from audio using Librosa.
    
    Args:
        audio_file_bytes: Raw audio file bytes (WAV format)
        sample_rate: Target sample rate (16kHz recommended)
    
    Returns:
        mfcc_features: 2D numpy array of shape (n_mfcc, time_steps)
        audio_duration: Duration in seconds
        features_dict: Additional audio features for analysis
    """
    try:
        # Load audio from bytes (WAV format works directly with librosa/soundfile)
        audio_data, sr = librosa.load(io.BytesIO(audio_file_bytes), sr=sample_rate, mono=True)
        
        # Get duration
        duration = librosa.get_duration(y=audio_data, sr=sr)
        
        # Extract MFCC features (optimized settings)
        # Reduced n_mfcc from 40 to 20 for faster processing
        mfcc = librosa.feature.mfcc(
            y=audio_data,
            sr=sr,
            n_mfcc=20,
            n_fft=2048,
            hop_length=512
        )
        
        # Additional features for better stress detection
        zcr = librosa.feature.zero_crossing_rate(audio_data)
        spectral_centroid = librosa.feature.spectral_centroid(y=audio_data, sr=sr)
        rms = librosa.feature.rms(y=audio_data)
        
        # Package features (removed slow pitch detection)
        features_dict = {
            "duration": float(duration),
            "mean_mfcc": float(np.mean(mfcc)),
            "std_mfcc": float(np.std(mfcc)),
            "var_mfcc": float(np.var(mfcc)),
            "mean_zcr": float(np.mean(zcr)),
            "mean_spectral_centroid": float(np.mean(spectral_centroid)),
            "mean_rms": float(np.mean(rms)),
            "mfcc_shape": list(mfcc.shape)
        }
        
        return mfcc, duration, features_dict
        
    except Exception as e:
        raise ValueError(f"Failed to extract MFCC features: {str(e)}")

def get_suggestions_for_stress_level(stress_level: str, emotion: str) -> List[str]:
    """Generate personalized suggestions based on stress level."""
    
    suggestions_map = {
        "low": [
            "Your stress levels are healthy! Keep up your current coping strategies.",
            "Consider journaling to maintain your positive mental state.",
            "Regular exercise can help sustain your emotional well-being."
        ],
        "medium": [
            "Try some deep breathing exercises to help reduce stress.",
            "Consider taking short breaks throughout your day.",
            "Talking to a friend or loved one might help.",
            "Mindfulness meditation could be beneficial for you."
        ],
        "high": [
            "Your stress levels seem elevated. Consider talking to a mental health professional.",
            "Practice progressive muscle relaxation to help manage tension.",
            "Limit caffeine intake and ensure you're getting enough sleep.",
            "Reach out to our support resources if you need someone to talk to.",
            "Physical activity like a short walk can help reduce stress hormones."
        ],
        "very_high": [
            "We strongly recommend speaking with a mental health professional.",
            "Contact our crisis support line if you need immediate help.",
            "Practice grounding techniques: focus on your breath and surroundings.",
            "Reach out to someone you trust - you don't have to face this alone.",
            "Consider emergency support services if you're in crisis."
        ]
    }
    
    return suggestions_map.get(stress_level, suggestions_map["medium"])

@router.post("/voice", response_model=VoiceAnalysisResult)
async def analyze_voice(
    audio: UploadFile = File(...),
    current_user: Optional[str] = Depends(get_optional_user)
):
    """
    Analyze voice recording for stress detection.
    
    Extracts MFCC features and runs through CNN classifier to detect:
    - Stress level (low/medium/high/very_high)
    - Emotional state
    - Confidence score
    
    Returns analysis results with personalized suggestions.
    """
    try:
        # Validate file type
        if not audio.content_type or not audio.content_type.startswith('audio/'):
            raise HTTPException(
                status_code=400,
                detail="Invalid file type. Please upload a WAV or MP3 audio file."
            )
        
        # Read audio file
        audio_bytes = await audio.read()
        
        # Validate file size (max 10MB)
        if len(audio_bytes) > 10 * 1024 * 1024:
            raise HTTPException(
                status_code=400,
                detail="File too large. Maximum size is 10MB."
            )
        
        # Extract MFCC features using Librosa
        print(f"🎤 Processing audio file: {audio.filename}")
        mfcc_features, duration, features_dict = extract_mfcc_features(audio_bytes)
        
        # Validate duration
        if duration < 3:
            raise HTTPException(
                status_code=400,
                detail="Recording too short. Please provide at least 3 seconds of speech."
            )
        elif duration > 60:
            raise HTTPException(
                status_code=400,
                detail="Recording too long. Please limit to 60 seconds."
            )
        
        print(f"✅ MFCC features extracted: shape {mfcc_features.shape}, duration {duration:.2f}s")
        
        # Run through classifier (CNN model)
        stress_level, emotion, confidence, emotion_scores = classifier.predict(mfcc_features)
        
        # Generate suggestions
        suggestions = get_suggestions_for_stress_level(stress_level, emotion)
        
        # Prepare result
        result = VoiceAnalysisResult(
            stressLevel=stress_level,
            confidence=confidence,
            emotion=emotion,
            emotionScores=emotion_scores,
            timestamp=datetime.now().isoformat(),
            suggestions=suggestions,
            mfccFeatures=features_dict
        )
        
        print(f"📊 Analysis complete: {stress_level} stress, {emotion} emotion, {confidence:.0%} confidence")
        
        # Save to database if user is logged in
        print(f"🔐 Current user: {current_user}")
        if current_user:
            try:
                db = get_database()
                if db is not None:
                    voice_analysis_doc = {
                        "userId": current_user,
                        "stressLevel": stress_level,
                        "confidence": confidence,
                        "emotion": emotion,
                        "emotionScores": emotion_scores,
                        "duration": duration,
                        "analyzedAt": datetime.now(),
                        "suggestions": suggestions
                    }
                    db.voice_analyses.insert_one(voice_analysis_doc)
                    print(f"✅ Voice analysis saved for user {current_user}")
                else:
                    print(f"⚠️ Database not available, skipping save")
            except Exception as e:
                print(f"⚠️ Failed to save voice analysis: {str(e)}")
                import traceback
                traceback.print_exc()
                # Don't fail the request if saving fails
        else:
            print(f"⚠️ No user logged in, voice analysis NOT saved to database")
        
        return result
        
    except HTTPException:
        raise
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        print(f"❌ Error analyzing voice: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to analyze voice recording: {str(e)}"
        )

@router.post("/transcribe", response_model=TranscriptionResult)
async def transcribe_audio(
    file: UploadFile = File(...),
    current_user: Optional[str] = Depends(get_optional_user)
):
    """
    Transcribe audio using Groq Whisper API.
    Fallback for browsers without Web Speech API (Brave, Firefox).
    """
    try:
        # Read audio file
        audio_bytes = await file.read()
        
        # Validate file size (max 25MB for Whisper)
        if len(audio_bytes) > 25 * 1024 * 1024:
            raise HTTPException(
                status_code=400,
                detail="File too large. Maximum size is 25MB for transcription."
            )
        
        # Save to temporary file (Groq API requires file path)
        with tempfile.NamedTemporaryFile(delete=False, suffix='.webm') as tmp_file:
            tmp_file.write(audio_bytes)
            tmp_path = tmp_file.name
        
        try:
            # Get Groq client
            print(f"🔑 Checking GROQ_API_KEY: {os.getenv('GROQ_API_KEY')[:20]}..." if os.getenv('GROQ_API_KEY') else "❌ GROQ_API_KEY not found!")
            groq_client = get_groq_client()
            
            # Transcribe using Groq Whisper
            print(f"🎤 Transcribing audio with Groq Whisper: {file.filename}")
            print(f"   Audio size: {len(audio_bytes)} bytes")
            
            with open(tmp_path, "rb") as audio_file:
                audio_data = audio_file.read()
                print(f"   File read: {len(audio_data)} bytes")
                
                transcription = groq_client.audio.transcriptions.create(
                    file=(file.filename, audio_data),
                    model="whisper-large-v3",
                    response_format="json",
                    language="en",  # Can be made dynamic
                    temperature=0.0
                )
            
            print(f"✅ Transcription complete: {len(transcription.text)} characters")
            
            return TranscriptionResult(
                success=True,
                transcript=transcription.text,
                language=getattr(transcription, 'language', 'en'),
                duration=getattr(transcription, 'duration', None)
            )
            
        finally:
            # Clean up temp file
            if os.path.exists(tmp_path):
                os.remove(tmp_path)
                
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Transcription error: {type(e).__name__}: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(
            status_code=500,
            detail=f"Transcription failed: {type(e).__name__}: {str(e)}"
        )

@router.get("/health")
async def voice_analysis_health():
    """Check if voice analysis service is available."""
    try:
        # Check if librosa is available
        import librosa
        return {
            "status": "healthy",
            "librosa_version": librosa.__version__,
            "message": "Voice stress analysis service is ready"
        }
    except ImportError:
        return {
            "status": "unhealthy",
            "message": "Librosa not installed. Run: pip install librosa"
        }

@router.get("/history")
def get_voice_analysis_history(current_user: str = Depends(get_current_user)):
    """Get voice analysis history for the current user."""
    try:
        db = get_database()
        
        if db is None:
            return {
                "success": True,
                "count": 0,
                "analyses": [],
                "message": "Database not configured"
            }
        
        # Get all voice analyses for this user, sorted by date (newest first)
        analyses = list(db.voice_analyses.find(
            {"userId": current_user}
        ).sort("analyzedAt", -1).limit(50))
        
        # Convert MongoDB ObjectId to string and format dates
        for analysis in analyses:
            analysis['_id'] = str(analysis['_id'])
            if 'analyzedAt' in analysis:
                analysis['analyzedAt'] = analysis['analyzedAt'].isoformat()
        
        return {
            "success": True,
            "count": len(analyses),
            "analyses": analyses
        }
    except Exception as e:
        print(f"❌ Error fetching voice analysis history: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(
            status_code=500,
            detail=f"Failed to fetch voice analysis history: {str(e)}"
        )
