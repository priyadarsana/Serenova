# Voice Transcription Speed Optimization Guide

## Current Issue
Transcription is slow because it uploads audio to Groq's Whisper API servers.

## Optimizations Implemented

### 1. ✅ Faster Whisper Model
Changed from `whisper-large-v3` to `whisper-large-v3-turbo`:
- **2-3x faster** transcription
- Maintains high accuracy
- Optimized for speed

### 2. Additional Optimizations You Can Try

#### Option A: Compress Audio Before Upload (Recommended)
Add audio compression to reduce upload time:

```python
# Add this function to voice_analysis.py
def compress_audio_for_transcription(audio_bytes: bytes) -> bytes:
    """Compress audio to reduce upload time while maintaining quality."""
    import subprocess
    
    with tempfile.NamedTemporaryFile(suffix='.webm', delete=False) as input_file:
        input_file.write(audio_bytes)
        input_path = input_file.name
    
    output_path = input_path.replace('.webm', '_compressed.webm')
    
    try:
        # Use ffmpeg to compress (requires ffmpeg installed)
        subprocess.run([
            'ffmpeg', '-i', input_path,
            '-c:a', 'libopus',  # Opus codec for better compression
            '-b:a', '32k',      # Lower bitrate (speech quality)
            '-ac', '1',         # Mono
            '-ar', '16000',     # 16kHz sample rate
            output_path
        ], check=True, capture_output=True)
        
        with open(output_path, 'rb') as f:
            return f.read()
    finally:
        os.remove(input_path)
        if os.path.exists(output_path):
            os.remove(output_path)
```

#### Option B: Client-Side Compression (Best for Production)
Compress audio in the browser before sending:

```typescript
// In VoiceStressAnalysis.tsx
const compressAudio = async (audioBlob: Blob): Promise<Blob> => {
  // Use Web Audio API to downsample
  const audioContext = new AudioContext({ sampleRate: 16000 })
  const arrayBuffer = await audioBlob.arrayBuffer()
  const audioBuffer = await audioContext.decodeAudioData(arrayBuffer)
  
  // Create compressed blob
  // ... implementation
}
```

#### Option C: Use Distil-Whisper (Fastest, Slightly Lower Accuracy)
If Groq supports it, use distil-whisper models:
- Up to 6x faster
- 95% accuracy of full model
- Great for real-time applications

## Performance Comparison

| Model | Speed | Accuracy | Best For |
|-------|-------|----------|----------|
| whisper-large-v3 | Slow | Highest | Critical accuracy |
| whisper-large-v3-turbo | **Fast** | High | **General use** ✅ |
| distil-whisper | Fastest | Good | Real-time apps |

## Expected Improvements

With `whisper-large-v3-turbo`:
- **Before**: 10-15 seconds for 30s audio
- **After**: 4-6 seconds for 30s audio
- **Improvement**: ~60% faster

## Testing

1. Record a 10-20 second voice sample
2. Check browser console for timing logs
3. Should see faster transcription times

## Future Enhancements

1. **Streaming Transcription**: Process audio chunks in real-time
2. **Local Whisper**: Run Whisper locally (no upload needed)
3. **WebSocket**: Stream audio instead of uploading full file
4. **Caching**: Cache common phrases/words
