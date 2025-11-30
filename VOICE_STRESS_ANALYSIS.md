# 🎤 Voice Stress Analysis Feature

## Overview

The Voice Stress Analysis feature uses **MFCC (Mel-Frequency Cepstral Coefficients)** extraction with **Librosa** and a **CNN-based classifier** to analyze stress levels and emotional states from voice recordings.

## How It Works

### 1. User Input
- **Format**: WAV, MP3, or WebM audio
- **Duration**: 5-30 seconds of natural speech
- **Content**: Users can talk about their day, feelings, or concerns
- **Recording**: Browser-based microphone recording (MediaRecorder API)

### 2. Audio Processing Pipeline

#### Step 1: Audio Preprocessing (Librosa)
```python
# Load audio and resample to 16kHz
y, sr = librosa.load(audio_bytes, sr=16000, mono=True)

# Get duration
duration = librosa.get_duration(y=y, sr=sr)
```

#### Step 2: MFCC Feature Extraction
```python
# Extract 40 MFCC coefficients
mfcc = librosa.feature.mfcc(
    y=audio_data,
    sr=sr,
    n_mfcc=40,      # Number of coefficients
    n_fft=2048,     # FFT window (~25ms)
    hop_length=512  # Frame hop (~10ms)
)
# Output shape: (40, time_steps)
```

**What MFCCs capture:**
- Spectral envelope (timbre and pitch characteristics)
- Formant changes (emotional cues)
- Energy variations (stress indicators)
- Pitch variability (tension markers)

#### Step 3: Additional Audio Features
```python
# Zero Crossing Rate (voice activity)
zcr = librosa.feature.zero_crossing_rate(audio_data)

# Spectral Centroid (brightness, emotion)
spectral_centroid = librosa.feature.spectral_centroid(y=audio_data, sr=sr)

# RMS Energy (loudness, stress)
rms = librosa.feature.rms(y=audio_data)

# Pitch tracking (F0)
pitches, magnitudes = librosa.piptrack(y=audio_data, sr=sr)
```

#### Step 4: CNN Classification (Mock Implementation)
```python
# Current: Statistical analysis on MFCC features
# Production: Train CNN on labeled dataset (RAVDESS, EMO-DB, etc.)

# Mock classification based on variance and std
if mfcc_std > 15 or mfcc_var > 250:
    stress_level = "high"
    emotion = "stressed"
elif mfcc_std > 10 or mfcc_var > 150:
    stress_level = "medium"
    emotion = "anxious"
else:
    stress_level = "low"
    emotion = "calm"
```

## API Endpoints

### POST `/api/voice/voice`
Analyze voice recording for stress and emotional state.

**Request:**
```bash
curl -X POST http://localhost:8001/api/voice/voice \
  -H "Authorization: Bearer <token>" \
  -F "audio=@recording.webm"
```

**Response:**
```json
{
  "stressLevel": "medium",
  "confidence": 0.72,
  "emotion": "anxious",
  "emotionScores": {
    "calm": 0.2,
    "neutral": 0.3,
    "anxious": 0.3,
    "stressed": 0.1,
    "overwhelmed": 0.05
  },
  "timestamp": "2025-11-29T10:30:00",
  "suggestions": [
    "Your voice shows some signs of tension. Try a 5-minute breathing exercise.",
    "Consider taking a short break to reset and refocus.",
    "Progressive muscle relaxation might help release tension."
  ],
  "mfccFeatures": {
    "duration": 12.5,
    "mean_mfcc": -18.3,
    "std_mfcc": 12.4,
    "mean_rms": 0.045,
    "max_rms": 0.12
  }
}
```

### GET `/api/voice/health`
Check service availability.

**Response:**
```json
{
  "status": "healthy",
  "librosa_version": "0.11.0",
  "message": "Voice stress analysis service is ready"
}
```

## Frontend Implementation

### Recording Interface (`VoiceStressAnalysis.tsx`)
- **Microphone Access**: `navigator.mediaDevices.getUserMedia()`
- **Recording**: `MediaRecorder` API with `audio/webm` format
- **Timer**: 30-second maximum with visual countdown
- **Visual Feedback**: Pulsing animation during recording

### Analysis Display
- **Stress Level Badge**: Color-coded (green/yellow/orange/red)
- **Emotion Emoji**: 😌 calm, 😰 anxious, 😓 stressed, 😵 overwhelmed
- **Emotion Breakdown**: Progress bars for each emotion score
- **Personalized Suggestions**: Actionable recommendations based on stress level
- **MFCC Insights**: Technical audio features for advanced users

## Training Your Own CNN Model

### Recommended Datasets
1. **RAVDESS** (Ryerson Audio-Visual Database of Emotional Speech and Song)
   - 7,356 files from 24 actors
   - Emotions: calm, happy, sad, angry, fearful, surprise, disgust
   - Link: https://zenodo.org/record/1188976

2. **EMO-DB** (Berlin Database of Emotional Speech)
   - German language emotional speech
   - 7 emotions, 10 actors

3. **Custom Dataset**
   - Record "stressed" vs "normal" speech samples
   - Minimum: 500+ samples per class
   - Label with stress levels: low, medium, high, very_high

### CNN Architecture Example
```python
from tensorflow.keras import layers, models

model = models.Sequential([
    # Input: (40, 173, 1) - MFCC matrix as grayscale image
    layers.Conv2D(32, (3, 3), activation='relu', input_shape=(40, 173, 1)),
    layers.MaxPooling2D((2, 2)),
    
    layers.Conv2D(64, (3, 3), activation='relu'),
    layers.MaxPooling2D((2, 2)),
    
    layers.Conv2D(128, (3, 3), activation='relu'),
    layers.MaxPooling2D((2, 2)),
    
    layers.Flatten(),
    layers.Dense(128, activation='relu'),
    layers.Dropout(0.5),
    
    # Output: 4 stress levels
    layers.Dense(4, activation='softmax')
])

model.compile(
    optimizer='adam',
    loss='categorical_crossentropy',
    metrics=['accuracy']
)
```

### Training Process
1. **Collect & label audio data** (stressed vs normal speech)
2. **Extract MFCCs** for all samples using Librosa
3. **Normalize features** (subtract mean, divide by std)
4. **Resize/pad** to fixed shape (40, 173)
5. **Train CNN** on labeled MFCC "images"
6. **Save model** (`.h5` or `.keras`)
7. **Load in backend** and replace `MockStressClassifier`

### Integration with Real Model
```python
import tensorflow as tf

# Load trained model
model = tf.keras.models.load_model('models/stress_classifier.keras')

# Prepare MFCC input
mfcc_resized = resize_and_normalize(mfcc)  # (1, 40, 173, 1)

# Predict
predictions = model.predict(mfcc_resized)
stress_level_idx = np.argmax(predictions[0])
confidence = float(predictions[0][stress_level_idx])

classes = ["low", "medium", "high", "very_high"]
stress_level = classes[stress_level_idx]
```

## Dependencies

### Backend
```txt
librosa==0.11.0
soundfile==0.13.1
numpy>=1.22.3
scipy>=1.6.0
```

Install with:
```bash
pip install librosa soundfile
```

### Frontend
- Built-in `MediaRecorder` API (no extra packages needed)
- Framer Motion for animations (already installed)

## Stress Detection Indicators

Voice features that correlate with stress:

1. **Pitch (F0)**
   - ↑ Higher pitch → More stress/anxiety
   - Rapid pitch changes → Emotional arousal

2. **Speaking Rate**
   - ↑ Faster speech → Anxiety/stress
   - ↓ Slower speech → Depression/fatigue

3. **Energy/Loudness (RMS)**
   - ↑ Higher volume → Anger/frustration
   - ↓ Lower volume → Sadness/depression

4. **Spectral Characteristics**
   - ↑ Higher spectral centroid → Tension
   - Voice tremor (frequency modulation) → Stress

5. **MFCC Variance**
   - ↑ Higher variance → Emotional variability
   - Stable MFCCs → Calm/neutral state

## Future Enhancements

1. **Real-time Analysis**
   - Stream audio chunks during recording
   - Progressive stress detection

2. **Multi-language Support**
   - Train models on different languages
   - Language detection from audio

3. **Historical Tracking**
   - Store voice analysis results
   - Trend analysis over time
   - Correlate with chat sessions

4. **Advanced Features**
   - Speaker identification
   - Age/gender estimation
   - Multi-emotion classification

5. **Model Improvements**
   - Attention mechanisms (Transformer-based)
   - Multi-modal analysis (voice + text)
   - Transfer learning from pre-trained models

## Usage Guide

### For Users
1. Navigate to Home → Click "🎤 Voice Stress Analysis"
2. Click microphone button to start recording
3. Speak naturally for 5-30 seconds
4. Click "Stop Recording"
5. Click "Analyze Voice" to get results
6. Review stress level, emotion breakdown, and suggestions
7. Try "Record Again" or "Try Coping Activities"

### For Developers
1. Backend is at `backend/app/routes/voice_analysis.py`
2. Frontend is at `frontend/src/pages/VoiceStressAnalysis.tsx`
3. Replace `MockStressClassifier` with trained CNN model
4. Adjust MFCC parameters for your needs (n_mfcc, n_fft, hop_length)
5. Add custom emotion classes in classifier

## Technical Specifications

- **Sample Rate**: 16 kHz (16,000 Hz)
- **MFCC Coefficients**: 40
- **FFT Window**: 2048 samples (~25ms at 16kHz)
- **Hop Length**: 512 samples (~10ms at 16kHz)
- **Frame Duration**: ~25ms
- **Frame Overlap**: ~15ms
- **Max File Size**: 10 MB
- **Supported Formats**: WAV, MP3, WebM, OGG

## Privacy & Security

- ✅ Audio files are **not stored** on the server
- ✅ Processing happens **in-memory only**
- ✅ Results are returned immediately
- ✅ Optional user authentication
- ✅ No third-party API calls
- ✅ Runs entirely on your infrastructure

## Troubleshooting

### "Failed to access microphone"
- **Solution**: Grant browser microphone permissions
- Check browser settings → Privacy → Microphone

### "Recording too short"
- **Solution**: Speak for at least 5 seconds
- Timer shows current duration

### "Analysis failed"
- **Solution**: Check backend logs for errors
- Verify Librosa is installed: `pip list | grep librosa`

### "Librosa not installed"
- **Solution**: Run `pip install librosa soundfile`
- Restart backend server

## Performance

- **MFCC Extraction**: ~0.5-1.5 seconds for 10s audio
- **CNN Inference**: ~50-200ms (depends on model)
- **Total Analysis Time**: ~1-2 seconds
- **Memory Usage**: ~100-200 MB during processing

## Resources

- **Librosa Documentation**: https://librosa.org/doc/latest/
- **MFCC Tutorial**: https://en.wikipedia.org/wiki/Mel-frequency_cepstrum
- **RAVDESS Dataset**: https://zenodo.org/record/1188976
- **Speech Emotion Recognition**: https://arxiv.org/abs/2104.11066

---

**Status**: ✅ Implemented with mock classifier
**Next Step**: Train CNN model on labeled stress/emotion dataset
**Deployed**: Backend (port 8001), Frontend (voice-analysis route)
