import React, { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import AnimatedCard from '../components/AnimatedCard'
import PrimaryButton from '../components/PrimaryButton'

interface VoiceAnalysisResult {
  stressLevel: string
  confidence: number
  emotion: string
  emotionScores: Record<string, number>
  timestamp: string
  suggestions: string[]
}

const GUIDED_QUESTIONS = [
  "How are you feeling today?",
  "What's been on your mind lately?",
  "Describe a recent situation that made you feel stressed.",
  "What challenges have you been facing?",
  "Tell me about your day so far.",
  "What's something that's been worrying you?",
  "How would you describe your current mood?",
]

export default function VoiceStressAnalysis() {
  const navigate = useNavigate()
  const [isRecording, setIsRecording] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null)
  const [analyzing, setAnalyzing] = useState(false)
  const [result, setResult] = useState<VoiceAnalysisResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [transcript, setTranscript] = useState<string>('')
  const [isTranscribing, setIsTranscribing] = useState(false)
  const [currentQuestion, setCurrentQuestion] = useState<string>('')
  const [audioURL, setAudioURL] = useState<string>('')
  const [isPlaying, setIsPlaying] = useState(false)
  const [audioLevel, setAudioLevel] = useState(0)

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null)
  const mediaStreamRef = useRef<MediaStream | null>(null)
  const timerRef = useRef<number | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const animationFrameRef = useRef<number | null>(null)

  useEffect(() => {
    const randomQuestion = GUIDED_QUESTIONS[Math.floor(Math.random() * GUIDED_QUESTIONS.length)]
    setCurrentQuestion(randomQuestion)
  }, [])

  const convertToWav = async (webmBlob: Blob): Promise<Blob> => {
    // Convert WebM to WAV using Web Audio API
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
    const arrayBuffer = await webmBlob.arrayBuffer()
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer)
    
    // Convert to WAV format
    const wavBuffer = audioBufferToWav(audioBuffer)
    return new Blob([wavBuffer], { type: 'audio/wav' })
  }

  const audioBufferToWav = (audioBuffer: AudioBuffer): ArrayBuffer => {
    const numChannels = audioBuffer.numberOfChannels
    const sampleRate = audioBuffer.sampleRate
    const format = 1 // PCM
    const bitDepth = 16
    
    const bytesPerSample = bitDepth / 8
    const blockAlign = numChannels * bytesPerSample
    
    const data = audioBuffer.getChannelData(0)
    const dataLength = data.length * bytesPerSample
    const buffer = new ArrayBuffer(44 + dataLength)
    const view = new DataView(buffer)
    
    // WAV header
    const writeString = (offset: number, string: string) => {
      for (let i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i))
      }
    }
    
    writeString(0, 'RIFF')
    view.setUint32(4, 36 + dataLength, true)
    writeString(8, 'WAVE')
    writeString(12, 'fmt ')
    view.setUint32(16, 16, true)
    view.setUint16(20, format, true)
    view.setUint16(22, numChannels, true)
    view.setUint32(24, sampleRate, true)
    view.setUint32(28, sampleRate * blockAlign, true)
    view.setUint16(32, blockAlign, true)
    view.setUint16(34, bitDepth, true)
    writeString(36, 'data')
    view.setUint32(40, dataLength, true)
    
    // Write PCM samples
    const volume = 0.8
    let offset = 44
    for (let i = 0; i < data.length; i++) {
      const sample = Math.max(-1, Math.min(1, data[i]))
      view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7FFF, true)
      offset += 2
    }
    
    return buffer
  }

  const transcribeOnServer = async (audioBlob: Blob) => {
    try {
      setIsTranscribing(true)
      
      // Groq Whisper supports WebM directly, no conversion needed for transcription!
      const formData = new FormData()
      formData.append('file', audioBlob, 'recording.webm')
      
      console.log('📡 Transcribing with Groq Whisper...')
      const startTime = Date.now()
      
      const response = await fetch('http://localhost:8001/api/voice/transcribe', {
        method: 'POST',
        body: formData
      })
      
      if (!response.ok) {
        const errorText = await response.text()
        console.error('Transcription failed:', response.status, errorText)
        throw new Error(`Transcription failed: ${response.status} - ${errorText}`)
      }
      
      const data = await response.json()
      const elapsed = ((Date.now() - startTime) / 1000).toFixed(1)
      console.log(`✅ Transcription complete in ${elapsed}s:`, data.transcript)
      
      setTranscript(data.transcript || '')
      
    } catch (error: any) {
      console.error('Transcription error:', error)
      setTranscript(`[Transcription failed: ${error.message || 'Unknown error'}]`)
    } finally {
      setIsTranscribing(false)
    }
  }

  const startRecording = async () => {
    try {
      setError(null)
      setResult(null)
      setAudioBlob(null)
      setTranscript('')

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      mediaStreamRef.current = stream
      
      // Set up audio analyser for visualization
      const audioContext = new AudioContext()
      const analyser = audioContext.createAnalyser()
      const source = audioContext.createMediaStreamSource(stream)
      source.connect(analyser)
      analyser.fftSize = 256
      analyserRef.current = analyser
      
      // Start visualizing audio levels
      const updateAudioLevel = () => {
        if (analyserRef.current) {
          const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount)
          analyserRef.current.getByteFrequencyData(dataArray)
          const average = dataArray.reduce((sum, value) => sum + value, 0) / dataArray.length
          setAudioLevel(average / 255) // Normalize to 0-1
          animationFrameRef.current = requestAnimationFrame(updateAudioLevel)
        }
      }
      updateAudioLevel()
      
      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder
      audioChunksRef.current = []

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data)
        }
      }

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' })
        setAudioBlob(audioBlob)
        
        const url = URL.createObjectURL(audioBlob)
        setAudioURL(url)
        
        stream.getTracks().forEach(track => track.stop())
        
        // Stop audio visualization
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current)
        }
        setAudioLevel(0)
        
        // Transcribe using Groq Whisper
        await transcribeOnServer(audioBlob)
      }

      mediaRecorder.start()
      setIsRecording(true)
      setRecordingTime(0)

      const interval = setInterval(() => {
        setRecordingTime(prev => {
          if (prev >= 30) {
            stopRecording()
            return prev
          }
          return prev + 1
        })
      }, 1000)
      timerRef.current = interval

    } catch (error) {
      console.error('Recording error:', error)
      setError('Could not access microphone. Please check permissions.')
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
      
      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }
      
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach(track => track.stop())
      }
    }
  }

  const analyzeVoice = async () => {
    if (!audioBlob) {
      setError('No audio to analyze')
      return
    }

    try {
      setAnalyzing(true)
      setError(null)

      // Convert to WAV for analysis
      console.log('🔄 Converting audio for analysis...')
      const wavBlob = await convertToWav(audioBlob)

      const formData = new FormData()
      formData.append('audio', wavBlob, 'recording.wav')
      
      const token = localStorage.getItem('authToken')
      const headers: HeadersInit = {}
      if (token) {
        headers['Authorization'] = `Bearer ${token}`
      }

      const response = await fetch('http://localhost:8001/api/voice/voice', {
        method: 'POST',
        headers,
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => null)
        throw new Error(errorData?.detail || 'Analysis failed')
      }

      const data = await response.json()
      setResult(data)
    } catch (err) {
      console.error('Analysis error:', err)
      setError(err instanceof Error ? err.message : 'Failed to analyze voice')
    } finally {
      setAnalyzing(false)
    }
  }

  const togglePlayback = () => {
    if (!audioPlayerRef.current) return

    if (isPlaying) {
      audioPlayerRef.current.pause()
      setIsPlaying(false)
    } else {
      audioPlayerRef.current.play()
      setIsPlaying(true)
    }
  }

  const resetAnalysis = () => {
    setIsRecording(false)
    setRecordingTime(0)
    setAudioBlob(null)
    setAnalyzing(false)
    setResult(null)
    setError(null)
    setTranscript('')
    setIsTranscribing(false)
    setAudioURL('')
    setIsPlaying(false)

    if (audioPlayerRef.current) {
      audioPlayerRef.current.pause()
      audioPlayerRef.current.currentTime = 0
    }

    const randomQuestion = GUIDED_QUESTIONS[Math.floor(Math.random() * GUIDED_QUESTIONS.length)]
    setCurrentQuestion(randomQuestion)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto"
      >
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => navigate('/home')}
            className="flex items-center gap-2 text-gray-700 hover:text-gray-900"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span>Back</span>
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Voice Stress Analysis</h1>
          <div className="w-20"></div>
        </div>

        {!isRecording && !audioBlob && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-2xl mx-auto mb-4 p-4 bg-blue-50 border border-blue-200 rounded-xl"
          >
            <p className="text-sm text-blue-800">
              ℹ️ <strong>Groq Whisper AI</strong> transcription - works in all browsers (Brave, Chrome, Edge, Firefox)
            </p>
          </motion.div>
        )}

        <AnimatedCard>
          {!isRecording && !audioBlob && (
            <div className="text-center space-y-6">
              <div className="w-20 h-20 mx-auto bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
              </div>

              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-2">
                  Analyze Your Voice for Stress
                </h2>
                <p className="text-gray-600 text-sm max-w-md mx-auto">
                  Record a 10-30 second voice sample and get stress analysis with transcription.
                </p>
              </div>

              <div className="bg-indigo-50 rounded-lg p-4 max-w-xl mx-auto">
                <p className="text-sm text-indigo-600 mb-2 font-semibold">💡 Guided Question:</p>
                <p className="text-gray-800 italic">"{currentQuestion}"</p>
                <p className="text-xs text-gray-500 mt-2">
                  Answer this question naturally during your recording
                </p>
              </div>

              <PrimaryButton onClick={startRecording}>
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
                Start Recording
              </PrimaryButton>
            </div>
          )}

          {isRecording && (
            <div className="text-center space-y-4">
              <div className="w-20 h-20 mx-auto bg-red-500 rounded-full flex items-center justify-center animate-pulse">
                <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <circle cx="10" cy="10" r="7" />
                </svg>
              </div>

              <p className="text-2xl font-bold text-gray-900">{recordingTime}s / 30s</p>
              <p className="text-gray-600">🎤 Recording... Speak clearly!</p>

              {/* Audio Level Visualizer */}
              <div className="max-w-md mx-auto px-8">
                <div className="mb-2 text-sm text-gray-500">Voice Intensity</div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-green-500 via-yellow-500 to-red-500 transition-all duration-100"
                    style={{ width: `${audioLevel * 100}%` }}
                  />
                </div>
                {/* Bar visualization */}
                <div className="flex gap-1 justify-center items-end h-16 mt-4">
                  {[...Array(20)].map((_, i) => (
                    <div 
                      key={i}
                      className="w-2 bg-gradient-to-t from-purple-600 to-pink-500 rounded-t transition-all duration-100"
                      style={{ 
                        height: `${Math.max(10, audioLevel * 100 * (0.5 + Math.random() * 0.5))}%`,
                        opacity: audioLevel > 0.1 ? 1 : 0.3
                      }}
                    />
                  ))}
                </div>
              </div>

              <div className="mb-4 bg-blue-50 rounded-lg p-3">
                <p className="text-sm text-blue-700">
                  💬 Your speech will be transcribed after recording
                </p>
              </div>

              <button
                onClick={stopRecording}
                className="mt-2 px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Stop Recording
              </button>
            </div>
          )}

          {audioBlob && !result && (
            <div className="text-center space-y-4">
              <div className="w-20 h-20 mx-auto bg-green-500 rounded-full flex items-center justify-center">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>

              <p className="text-gray-800 font-semibold mb-4">Recording complete ({recordingTime}s)</p>
              
              {isTranscribing && (
                <div className="mb-4 bg-blue-50 rounded-lg p-4 max-w-xl mx-auto border border-blue-200">
                  <div className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5 text-blue-600" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <p className="text-sm text-blue-800">
                      ⏳ Transcribing with Groq Whisper AI...
                    </p>
                  </div>
                </div>
              )}
              
              {transcript && !isTranscribing && (
                <div className="mb-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-5 max-w-2xl mx-auto border-2 border-green-200 shadow-lg">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-xl">📝</span>
                    <p className="text-sm font-bold text-green-900">What you said:</p>
                  </div>
                  <div className="bg-white rounded-lg p-4">
                    <p className="text-base text-gray-800 leading-relaxed italic">
                      "{transcript.trim()}"
                    </p>
                  </div>
                  <div className="mt-3 flex items-center justify-between text-xs text-gray-600">
                    <span>Word count: {transcript.trim().split(/\s+/).filter(w => w.length > 0).length}</span>
                    <span>Duration: {recordingTime}s</span>
                  </div>
                </div>
              )}

              {!transcript && !isTranscribing && (
                <div className="mb-4 bg-yellow-50 rounded-lg p-4 max-w-xl mx-auto border border-yellow-200">
                  <p className="text-sm text-yellow-800 text-center">
                    ⚠️ No speech detected. Try recording again.
                  </p>
                </div>
              )}
              
              {audioURL && (
                <div className="mb-4">
                  <audio ref={audioPlayerRef} src={audioURL} onEnded={() => setIsPlaying(false)} />
                  <button
                    onClick={togglePlayback}
                    className="flex items-center gap-2 mx-auto px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg"
                  >
                    {isPlaying ? (
                      <>
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        Pause
                      </>
                    ) : (
                      <>
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                        </svg>
                        Play
                      </>
                    )}
                  </button>
                </div>
              )}

              {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-700 text-sm">{error}</p>
                </div>
              )}

              <div className="flex gap-3 justify-center">
                <button
                  onClick={analyzeVoice}
                  disabled={analyzing || isTranscribing}
                  className="px-6 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {analyzing ? 'Analyzing...' : isTranscribing ? 'Transcribing...' : 'Analyze Voice'}
                </button>

                <button
                  onClick={resetAnalysis}
                  className="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
                >
                  Re-record
                </button>
              </div>
            </div>
          )}

          {result && (
            <div className="space-y-6">
              <div className="text-center">
                <div className="w-20 h-20 mx-auto bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center mb-4">
                  <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Analysis Complete</h2>
              </div>

              <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Stress Level</h3>
                <div className="flex items-center justify-between">
                  <span className="text-3xl font-bold capitalize text-purple-600">
                    {result.stressLevel.replace('_', ' ')}
                  </span>
                  <span className="text-sm text-gray-600">
                    {Math.round(result.confidence * 100)}% confidence
                  </span>
                </div>
              </div>

              <div className="bg-gradient-to-br from-pink-50 to-purple-50 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Detected Emotion</h3>
                <p className="text-2xl font-bold capitalize text-pink-600">{result.emotion}</p>
              </div>

              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">💡 Suggestions</h3>
                <ul className="space-y-2">
                  {result.suggestions.map((suggestion, index) => (
                    <li key={index} className="flex items-start gap-2 text-gray-700">
                      <span className="text-green-600 font-bold">•</span>
                      <span>{suggestion}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={resetAnalysis}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700"
                >
                  New Analysis
                </button>
                <button
                  onClick={() => navigate('/home')}
                  className="flex-1 px-6 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
                >
                  Back to Home
                </button>
              </div>
            </div>
          )}
        </AnimatedCard>
      </motion.div>
    </div>
  )
}
