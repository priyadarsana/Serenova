import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, useReducedMotion } from 'framer-motion'
import AnimatedCard from '../components/AnimatedCard'
import PrimaryButton from '../components/PrimaryButton'

interface Conversation {
  sessionId: string
  savedAt: string
  messageCount: number
  mainEmotion: string
  riskLevel: string
}

interface Message {
  role: string
  content: string
  timestamp?: string
}

interface ConversationDetail {
  sessionId: string
  userId: string
  messages: Message[]
  intakeSummary?: string
  mainEmotion: string
  riskLevel: string
  savedAt: string
  messageCount: number
}

interface AIInsights {
  sessionId: string
  aiSummary: string
  keyThemes: string[]
  emotionalJourney: string
  strengthsObserved: string[]
  growthAreas: string[]
  personalizedRecommendations: string[]
  urgencyLevel: string
  progressIndicators: string
}

interface AssessmentData {
  needImprovement: string
  testFor: string
  ageRange: string
  gender: string
  transgender: boolean
  householdIncome: string
  populations: string[]
  previousTreatment: string
  mainFactors: string[]
  hasInsurance: string
  physicalConditions: string[]
  hasPet: string
}

interface VoiceAnalysis {
  _id: string
  stressLevel: string
  confidence: number
  emotion: string
  emotionScores: Record<string, number>
  duration: number
  analyzedAt: string
  suggestions: string[]
}

export default function Insights(){
  const [activeTab, setActiveTab] = useState<'trends'|'journal'|'ai-insights'|'voice-stress'>('ai-insights')
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [selectedSession, setSelectedSession] = useState<string | null>(null)
  const [selectedConversation, setSelectedConversation] = useState<ConversationDetail | null>(null)
  const [aiInsights, setAiInsights] = useState<AIInsights | null>(null)
  const [assessmentData, setAssessmentData] = useState<AssessmentData | null>(null)
  const [voiceAnalyses, setVoiceAnalyses] = useState<VoiceAnalysis[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const shouldReduceMotion = useReducedMotion()
  const nav = useNavigate()

  useEffect(() => {
    loadConversations()
    loadAssessment()
    loadVoiceAnalyses()
  }, [])

  const loadConversations = async () => {
    try {
      setError(null)
      const token = localStorage.getItem('authToken')
      const userId = localStorage.getItem('userId')
      
      console.log('🔍 Loading conversations...', { token, userId })
      
      if (!token) {
        console.log('No auth token - user may be in guest mode')
        setConversations([])
        return
      }
      
      const res = await fetch('http://localhost:8001/api/conversations/list', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (!res.ok) {
        if (res.status === 401) {
          console.log('Unauthorized - redirecting to auth')
          nav('/auth')
          return
        }
        throw new Error('Failed to load conversations')
      }
      const data = await res.json()
      console.log('📋 Loaded conversations:', data)
      
      setConversations(data.conversations || [])
      
      // Check for token mismatch issue
      if (token && userId && token !== userId) {
        console.warn('⚠️ TOKEN MISMATCH DETECTED!')
        console.warn('  authToken:', token)
        console.warn('  userId:', userId)
        console.warn('  This means you are using an old login.')
        console.warn('  SOLUTION: Log out and log back in to get new token format.')
      }
      
      // Don't auto-load insights - let user select conversation first
    } catch (error) {
      console.error('Failed to load conversations:', error)
      // Don't show error if no conversations exist yet
      setConversations([])
    }
  }

  const loadAssessment = () => {
    try {
      const savedAssessment = localStorage.getItem('mentalHealthAssessment')
      if (savedAssessment) {
        const parsedAssessment = JSON.parse(savedAssessment)
        setAssessmentData(parsedAssessment)
        console.log('📋 Loaded assessment data:', parsedAssessment)
      }
    } catch (error) {
      console.error('Failed to load assessment:', error)
    }
  }

  const loadVoiceAnalyses = async () => {
    try {
      const token = localStorage.getItem('authToken')
      console.log('🔐 Loading voice analyses with token:', token ? token.substring(0, 20) + '...' : 'NO TOKEN')
      
      if (!token) {
        console.warn('⚠️ No auth token found, skipping voice analyses load')
        return
      }

      const response = await fetch('http://localhost:8001/api/voice/history', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      console.log('📡 Voice history response status:', response.status)
      
      if (response.ok) {
        const data = await response.json()
        console.log('✅ Voice analyses loaded:', data)
        setVoiceAnalyses(data.analyses || [])
        console.log('🎤 Set voice analyses count:', data.analyses?.length || 0)
      } else {
        const errorText = await response.text()
        console.error('❌ Failed to load voice analyses:', response.status, errorText)
        setVoiceAnalyses([])
      }
    } catch (error) {
      console.error('❌ Error loading voice analyses:', error)
      setVoiceAnalyses([])
    }
  }

  const loadAIInsights = async (sessionId: string) => {
    if (!sessionId) return
    
    setLoading(true)
    setSelectedSession(sessionId)
    setError(null)
    setAiInsights(null) // Clear previous insights
    setSelectedConversation(null) // Clear previous conversation
    
    try {
      const token = localStorage.getItem('authToken')
      if (!token) {
        setError('Please log in to view insights')
        setLoading(false)
        return
      }
      
      // Load the full conversation details first
      const convRes = await fetch(`http://localhost:8001/api/conversations/${sessionId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (convRes.ok) {
        const convData = await convRes.json()
        setSelectedConversation(convData)
        console.log('📋 Loaded conversation details:', convData)
      }
      
      // Then load AI insights
      const res = await fetch(`http://localhost:8001/api/conversations/ai-insights/${sessionId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (!res.ok) {
        if (res.status === 401 || res.status === 403) {
          setError('You do not have access to this conversation')
          setLoading(false)
          return
        }
        const errorText = await res.text()
        console.error('API Error:', errorText)
        throw new Error(`Failed to load AI insights: ${res.status}`)
      }
      
      const data = await res.json()
      
      // Validate the data
      if (!data || typeof data !== 'object') {
        throw new Error('Invalid response from server')
      }
      
      setAiInsights(data)
      setError(null)
    } catch (error) {
      console.error('Failed to load AI insights:', error)
      setError(error instanceof Error ? error.message : 'Failed to analyze conversation. The AI service may be temporarily unavailable.')
      setAiInsights(null)
    } finally {
      setLoading(false)
    }
  }

  const deleteConversation = async (sessionId: string) => {
    if (!confirm('Are you sure you want to delete this conversation?')) return
    
    try {
      const token = localStorage.getItem('authToken')
      const res = await fetch(`http://localhost:8001/api/conversations/${sessionId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (res.ok) {
        setConversations(conversations.filter(c => c.sessionId !== sessionId))
        if (selectedSession === sessionId) {
          setSelectedSession(null)
          setAiInsights(null)
          setSelectedConversation(null)
        }
      }
    } catch (error) {
      console.error('Failed to delete conversation:', error)
    }
  }

  const getUrgencyColor = (level?: string) => {
    if (!level) return 'bg-gray-100 text-gray-700 border-gray-300'
    switch(level.toLowerCase()) {
      case 'high': return 'bg-red-100 text-red-700 border-red-300'
      case 'moderate': return 'bg-yellow-100 text-yellow-700 border-yellow-300'
      case 'low': return 'bg-green-100 text-green-700 border-green-300'
      default: return 'bg-gray-100 text-gray-700 border-gray-300'
    }
  }

  if (error) {
    return (
      <div className="min-h-screen pb-24 relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #EEF3FF 0%, #F9F5FF 100%)' }}>
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="pixel-card bg-white/90 backdrop-blur-sm p-8 text-center">
            <div className="text-6xl mb-4">😕</div>
            <h2 className="text-xl font-semibold text-slate-800 mb-2 pixel-text">Oops! Something went wrong</h2>
            <p className="text-slate-600 mb-4 pixel-text">{error}</p>
            <button onClick={() => window.location.reload()} className="pixel-button bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-2 font-semibold">
              Refresh Page
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (conversations.length === 0 && !loading) {
    return (
      <div className="min-h-screen pb-24 relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #EEF3FF 0%, #F9F5FF 100%)' }}>
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="pixel-card bg-white/90 backdrop-blur-sm p-8 text-center">
            <div className="text-6xl mb-4">💬</div>
            <h2 className="text-xl font-semibold text-slate-800 mb-2 pixel-text">No Conversations Yet</h2>
            <p className="text-slate-600 mb-4 pixel-text">Start chatting with Aurora to see insights here!</p>
            <button onClick={() => nav('/home')} className="pixel-button bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-2 font-semibold">
              Chat with Aurora
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen pb-24 relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #EEF3FF 0%, #F9F5FF 100%)' }}>
      {/* Animated pixel clouds */}
      <motion.div
        className="fixed left-12 w-32 h-20 pointer-events-none"
        animate={shouldReduceMotion ? {} : { y: ['100vh', '-30vh'] }}
        transition={{ duration: 16, repeat: Infinity, ease: 'linear', repeatType: 'loop' }}
        style={{ opacity: 0.5 }}
      >
        <div className="w-20 h-8 bg-gradient-to-br from-violet-300 to-pink-300 absolute top-0 left-0" style={{ borderRadius: 0, boxShadow: '3px 3px 0 rgba(167,139,250,0.4)' }} />
        <div className="w-24 h-10 bg-gradient-to-br from-violet-300 to-pink-300 absolute top-4 left-8" style={{ borderRadius: 0, boxShadow: '3px 3px 0 rgba(167,139,250,0.4)' }} />
        <div className="w-16 h-6 bg-gradient-to-br from-violet-300 to-pink-300 absolute top-2 left-20" style={{ borderRadius: 0, boxShadow: '3px 3px 0 rgba(167,139,250,0.4)' }} />
      </motion.div>

      <motion.div
        className="fixed right-20 w-40 h-24 pointer-events-none"
        animate={shouldReduceMotion ? {} : { y: ['100vh', '-30vh'] }}
        transition={{ duration: 19, repeat: Infinity, ease: 'linear', repeatType: 'loop', delay: 4 }}
        style={{ opacity: 0.5 }}
      >
        <div className="w-24 h-10 bg-gradient-to-br from-pink-300 to-violet-300 absolute top-0 left-0" style={{ borderRadius: 0, boxShadow: '3px 3px 0 rgba(244,114,182,0.4)' }} />
        <div className="w-32 h-12 bg-gradient-to-br from-pink-300 to-violet-300 absolute top-6 left-10" style={{ borderRadius: 0, boxShadow: '3px 3px 0 rgba(244,114,182,0.4)' }} />
        <div className="w-20 h-8 bg-gradient-to-br from-pink-300 to-violet-300 absolute top-4 left-26" style={{ borderRadius: 0, boxShadow: '3px 3px 0 rgba(244,114,182,0.4)' }} />
      </motion.div>

      <motion.div
        className="fixed left-1/4 w-28 h-16 pointer-events-none"
        animate={shouldReduceMotion ? {} : { y: ['100vh', '-30vh'] }}
        transition={{ duration: 17, repeat: Infinity, ease: 'linear', repeatType: 'loop', delay: 8 }}
        style={{ opacity: 0.5 }}
      >
        <div className="w-16 h-6 bg-gradient-to-br from-violet-300 to-pink-300 absolute top-0 left-0" style={{ borderRadius: 0, boxShadow: '3px 3px 0 rgba(167,139,250,0.4)' }} />
        <div className="w-20 h-10 bg-gradient-to-br from-pink-300 to-violet-300 absolute top-3 left-8" style={{ borderRadius: 0, boxShadow: '3px 3px 0 rgba(244,114,182,0.4)' }} />
        <div className="w-14 h-8 bg-gradient-to-br from-violet-300 to-pink-300 absolute top-2 left-20" style={{ borderRadius: 0, boxShadow: '3px 3px 0 rgba(167,139,250,0.4)' }} />
      </motion.div>

      <motion.div
        className="fixed right-1/3 w-36 h-22 pointer-events-none"
        animate={shouldReduceMotion ? {} : { y: ['100vh', '-30vh'] }}
        transition={{ duration: 21, repeat: Infinity, ease: 'linear', repeatType: 'loop', delay: 12 }}
        style={{ opacity: 0.5 }}
      >
        <div className="w-22 h-9 bg-gradient-to-br from-pink-300 to-violet-300 absolute top-0 left-0" style={{ borderRadius: 0, boxShadow: '3px 3px 0 rgba(244,114,182,0.4)' }} />
        <div className="w-26 h-11 bg-gradient-to-br from-violet-300 to-pink-300 absolute top-5 left-12" style={{ borderRadius: 0, boxShadow: '3px 3px 0 rgba(167,139,250,0.4)' }} />
        <div className="w-18 h-7 bg-gradient-to-br from-pink-300 to-violet-300 absolute top-3 left-24" style={{ borderRadius: 0, boxShadow: '3px 3px 0 rgba(244,114,182,0.4)' }} />
      </motion.div>

      <motion.div
        className="fixed left-2/3 w-30 h-18 pointer-events-none"
        animate={shouldReduceMotion ? {} : { y: ['100vh', '-30vh'] }}
        transition={{ duration: 14, repeat: Infinity, ease: 'linear', repeatType: 'loop', delay: 2 }}
        style={{ opacity: 0.5 }}
      >
        <div className="w-18 h-7 bg-gradient-to-br from-violet-300 to-pink-300 absolute top-0 left-0" style={{ borderRadius: 0, boxShadow: '3px 3px 0 rgba(167,139,250,0.4)' }} />
        <div className="w-22 h-9 bg-gradient-to-br from-pink-300 to-violet-300 absolute top-4 left-6" style={{ borderRadius: 0, boxShadow: '3px 3px 0 rgba(244,114,182,0.4)' }} />
        <div className="w-16 h-6 bg-gradient-to-br from-violet-300 to-pink-300 absolute top-2 left-16" style={{ borderRadius: 0, boxShadow: '3px 3px 0 rgba(167,139,250,0.4)' }} />
      </motion.div>

      <motion.div
        className="fixed left-1/2 w-26 h-16 pointer-events-none"
        animate={shouldReduceMotion ? {} : { y: ['100vh', '-30vh'] }}
        transition={{ duration: 18, repeat: Infinity, ease: 'linear', repeatType: 'loop', delay: 6 }}
        style={{ opacity: 0.5 }}
      >
        <div className="w-16 h-6 bg-gradient-to-br from-pink-300 to-violet-300 absolute top-0 left-0" style={{ borderRadius: 0, boxShadow: '3px 3px 0 rgba(244,114,182,0.4)' }} />
        <div className="w-20 h-8 bg-gradient-to-br from-violet-300 to-pink-300 absolute top-3 left-8" style={{ borderRadius: 0, boxShadow: '3px 3px 0 rgba(167,139,250,0.4)' }} />
        <div className="w-14 h-7 bg-gradient-to-br from-pink-300 to-violet-300 absolute top-1 left-18" style={{ borderRadius: 0, boxShadow: '3px 3px 0 rgba(244,114,182,0.4)' }} />
      </motion.div>

      <motion.div
        className="fixed right-1/2 w-34 h-20 pointer-events-none"
        animate={shouldReduceMotion ? {} : { y: ['100vh', '-30vh'] }}
        transition={{ duration: 20, repeat: Infinity, ease: 'linear', repeatType: 'loop', delay: 10 }}
        style={{ opacity: 0.5 }}
      >
        <div className="w-20 h-8 bg-gradient-to-br from-violet-300 to-pink-300 absolute top-0 left-0" style={{ borderRadius: 0, boxShadow: '3px 3px 0 rgba(167,139,250,0.4)' }} />
        <div className="w-24 h-10 bg-gradient-to-br from-pink-300 to-violet-300 absolute top-5 left-10" style={{ borderRadius: 0, boxShadow: '3px 3px 0 rgba(244,114,182,0.4)' }} />
        <div className="w-18 h-7 bg-gradient-to-br from-violet-300 to-pink-300 absolute top-3 left-22" style={{ borderRadius: 0, boxShadow: '3px 3px 0 rgba(167,139,250,0.4)' }} />
      </motion.div>

      <motion.div
        className="fixed left-1/5 w-28 h-17 pointer-events-none"
        animate={shouldReduceMotion ? {} : { y: ['100vh', '-30vh'] }}
        transition={{ duration: 15, repeat: Infinity, ease: 'linear', repeatType: 'loop', delay: 14 }}
        style={{ opacity: 0.5 }}
      >
        <div className="w-16 h-7 bg-gradient-to-br from-pink-300 to-violet-300 absolute top-0 left-0" style={{ borderRadius: 0, boxShadow: '3px 3px 0 rgba(244,114,182,0.4)' }} />
        <div className="w-20 h-9 bg-gradient-to-br from-violet-300 to-pink-300 absolute top-4 left-8" style={{ borderRadius: 0, boxShadow: '3px 3px 0 rgba(167,139,250,0.4)' }} />
        <div className="w-14 h-6 bg-gradient-to-br from-pink-300 to-violet-300 absolute top-2 left-19" style={{ borderRadius: 0, boxShadow: '3px 3px 0 rgba(244,114,182,0.4)' }} />
      </motion.div>

      {/* Pixel art background elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-10">
        <div className="absolute top-10 left-10 w-16 h-16 pixel-box bg-purple-400"></div>
        <div className="absolute top-32 right-20 w-12 h-12 pixel-box bg-blue-400"></div>
        <div className="absolute top-48 left-1/4 w-8 h-8 pixel-box bg-indigo-400"></div>
      </div>

      <motion.div
        className="max-w-4xl mx-auto px-4 py-6 relative"
        initial={shouldReduceMotion ? {} : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="pixel-card bg-white/90 backdrop-blur-sm p-6 mb-6">
          <h2 className="text-xl font-bold pixel-text-heading bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">Mental Health Insights</h2>
        </div>

        {/* Assessment Summary */}
        {assessmentData && (
          <div className="pixel-card bg-gradient-to-br from-indigo-50 to-purple-50 p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-xl pixel-text">📋 Your Assessment Profile</h3>
              <button
                onClick={() => nav('/mental-health-assessment')}
                className="text-sm text-purple-600 hover:text-purple-800 font-semibold pixel-text"
              >
                Update Assessment
              </button>
            </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="pixel-box p-3 bg-white">
              <div className="text-xs text-gray-500 mb-1 pixel-text">Age Range</div>
              <div className="font-semibold capitalize pixel-text">{assessmentData.ageRange.replace('-', '–')}</div>
            </div>
            <div className="pixel-box p-3 bg-white">
              <div className="text-xs text-gray-500 mb-1 pixel-text">Gender</div>
              <div className="font-semibold capitalize pixel-text">{assessmentData.gender}</div>
            </div>
            {assessmentData.mainFactors.length > 0 && (
              <div className="pixel-box p-3 bg-white md:col-span-2">
                <div className="text-xs text-gray-500 mb-2 pixel-text">Main Contributing Factors</div>
                <div className="flex flex-wrap gap-2">
                  {assessmentData.mainFactors.slice(0, 5).map((factor, i) => (
                    <span key={i} className="pixel-box px-3 py-1 bg-purple-100 text-purple-700 text-sm pixel-text">
                      {factor}
                    </span>
                  ))}
                  {assessmentData.mainFactors.length > 5 && (
                    <span className="pixel-box px-3 py-1 bg-gray-100 text-gray-600 text-sm pixel-text">
                      +{assessmentData.mainFactors.length - 5} more
                    </span>
                  )}
                </div>
              </div>
            )}
            {assessmentData.populations.length > 0 && (
              <div className="pixel-box p-3 bg-white md:col-span-2">
                <div className="text-xs text-gray-500 mb-2 pixel-text">Communities</div>
                <div className="flex flex-wrap gap-2">
                  {assessmentData.populations.map((pop, i) => (
                    <span key={i} className="pixel-box px-3 py-1 bg-blue-100 text-blue-700 text-sm pixel-text">
                      {pop}
                    </span>
                  ))}
                </div>
              </div>
            )}
            <div className="pixel-box p-3 bg-white">
              <div className="text-xs text-gray-500 mb-1 pixel-text">Previous Treatment</div>
              <div className="font-semibold pixel-text">{assessmentData.previousTreatment}</div>
            </div>
            <div className="pixel-box p-3 bg-white">
              <div className="text-xs text-gray-500 mb-1 pixel-text">Health Insurance</div>
              <div className="font-semibold pixel-text">{assessmentData.hasInsurance}</div>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        {(['ai-insights', 'voice-stress', 'trends', 'journal'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pixel-button px-4 py-2 capitalize text-sm font-medium pixel-text transition-all ${
              activeTab === tab 
                ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white' 
                : 'bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            {tab === 'ai-insights' ? '🤖 AI Insights' : 
             tab === 'voice-stress' ? '🎤 Voice Stress' : tab}
          </button>
        ))}
      </div>

      {activeTab === 'voice-stress' && (
        <div className="space-y-6">
          <AnimatedCard className="p-6">
            <h3 className="text-xl font-bold mb-4">Voice Stress Analysis History</h3>
            {voiceAnalyses.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500 mb-4">No voice analyses yet. Try the voice stress analysis feature!</p>
                <PrimaryButton onClick={() => nav('/voice-analysis')}>
                  Start Voice Analysis
                </PrimaryButton>
              </div>
            ) : (
              <div>
                <p className="text-sm text-gray-600 mb-4">
                  Total analyses: {voiceAnalyses.length}
                </p>
                <div className="space-y-4">
                  {voiceAnalyses.slice(0, 10).map((analysis) => {
                    const date = new Date(analysis.analyzedAt)
                    const stressColor = 
                      analysis.stressLevel === 'high' ? 'bg-red-100 text-red-700' :
                      analysis.stressLevel === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-green-100 text-green-700'
                    
                    return (
                      <div key={analysis._id} className="p-4 bg-gray-50 rounded-lg">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <span className={`px-3 py-1 rounded-full text-sm font-semibold ${stressColor}`}>
                              {analysis.stressLevel.toUpperCase()} STRESS
                            </span>
                            <span className="ml-2 text-sm text-gray-600">
                              {analysis.emotion}
                            </span>
                          </div>
                          <div className="text-right text-xs text-gray-500">
                            <div>{date.toLocaleDateString()}</div>
                            <div>{date.toLocaleTimeString()}</div>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-3 mb-3">
                          <div className="text-sm">
                            <span className="text-gray-500">Confidence:</span>
                            <span className="ml-2 font-semibold">
                              {(analysis.confidence * 100).toFixed(0)}%
                            </span>
                          </div>
                          <div className="text-sm">
                            <span className="text-gray-500">Duration:</span>
                            <span className="ml-2 font-semibold">
                              {analysis.duration.toFixed(1)}s
                            </span>
                          </div>
                        </div>

                        {Object.keys(analysis.emotionScores).length > 0 && (
                          <div className="mb-3">
                            <div className="text-xs text-gray-500 mb-2">Emotion Distribution:</div>
                            <div className="flex flex-wrap gap-2">
                              {Object.entries(analysis.emotionScores)
                                .sort(([,a], [,b]) => b - a)
                                .map(([emotion, score]) => (
                                  <span key={emotion} className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded">
                                    {emotion}: {(score * 100).toFixed(0)}%
                                  </span>
                                ))}
                            </div>
                          </div>
                        )}

                        {analysis.suggestions.length > 0 && (
                          <div>
                            <div className="text-xs text-gray-500 mb-2">Suggestions:</div>
                            <ul className="text-sm space-y-1">
                              {analysis.suggestions.map((suggestion, i) => (
                                <li key={i} className="text-gray-700">• {suggestion}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </AnimatedCard>
        </div>
      )}

      {activeTab === 'ai-insights' && (
        <div className="space-y-6">
          {/* Conversation Selector */}
          <AnimatedCard className="p-4">
            <h3 className="font-semibold mb-3">Select a Conversation to Analyze</h3>
            {conversations.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500 mb-4">No conversations yet. Start chatting with Aurora!</p>
                <PrimaryButton onClick={() => nav('/support/bot')}>
                  Start Conversation
                </PrimaryButton>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-2">
                {conversations.slice(0, 6).map((conv) => (
                  <div
                    key={conv.sessionId}
                    className={`relative p-3 rounded-lg border-2 transition-all ${
                      selectedSession === conv.sessionId
                        ? 'border-purple-400 bg-purple-50'
                        : 'border-gray-200'
                    }`}
                  >
                    <button
                      onClick={() => loadAIInsights(conv.sessionId)}
                      className="w-full text-left"
                    >
                      <div className="text-sm font-medium">
                        {new Date(conv.savedAt).toLocaleDateString()} - {conv.mainEmotion}
                      </div>
                      <div className="text-xs text-gray-600">{conv.messageCount} messages</div>
                    </button>
                    <button
                      onClick={() => deleteConversation(conv.sessionId)}
                      className="absolute top-2 right-2 text-red-500 hover:text-red-700 p-1 rounded hover:bg-red-50"
                      title="Delete conversation"
                    >
                      🗑️
                    </button>
                  </div>
                ))}
              </div>
            )}
          </AnimatedCard>

          {/* AI Insights Display */}
          {loading ? (
            <AnimatedCard className="p-8 text-center">
              <div className="text-lg text-gray-600">🤖 AI is analyzing your conversation...</div>
            </AnimatedCard>
          ) : aiInsights ? (
            <div className="space-y-4">
              {/* Assessment Details */}
              {selectedConversation?.intakeSummary && (
                <AnimatedCard className="p-6 bg-gradient-to-br from-indigo-50 to-purple-50">
                  <h3 className="font-bold text-xl mb-3">📋 Initial Assessment</h3>
                  <p className="text-gray-700 leading-relaxed mb-4">{selectedConversation.intakeSummary}</p>
                  <div className="flex gap-3 flex-wrap">
                    <span className={`px-4 py-2 rounded-lg font-semibold ${
                      selectedConversation.riskLevel === 'high' ? 'bg-red-100 text-red-700 border-2 border-red-300' :
                      selectedConversation.riskLevel === 'medium' ? 'bg-yellow-100 text-yellow-700 border-2 border-yellow-300' :
                      'bg-green-100 text-green-700 border-2 border-green-300'
                    }`}>
                      Risk: {selectedConversation.riskLevel}
                    </span>
                    <span className="px-4 py-2 rounded-lg font-semibold bg-blue-100 text-blue-700 border-2 border-blue-300">
                      Emotion: {selectedConversation.mainEmotion}
                    </span>
                  </div>
                </AnimatedCard>
              )}

              {/* Chat Messages */}
              {selectedConversation?.messages && selectedConversation.messages.length > 0 && (
                <AnimatedCard className="p-6">
                  <h3 className="font-bold text-xl mb-4">💬 Conversation Transcript</h3>
                  <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                    {selectedConversation.messages.map((msg, i) => (
                      <div
                        key={i}
                        className={`p-4 rounded-lg ${
                          msg.role === 'user'
                            ? 'bg-blue-50 border-l-4 border-blue-400 ml-8'
                            : 'bg-gray-50 border-l-4 border-purple-400 mr-8'
                        }`}
                      >
                        <div className="text-xs font-semibold mb-1 text-gray-600">
                          {msg.role === 'user' ? '👤 You' : '🤖 Aurora'}
                        </div>
                        <p className="text-gray-800 leading-relaxed">{msg.content}</p>
                        {msg.timestamp && (
                          <div className="text-xs text-gray-500 mt-2">
                            {new Date(msg.timestamp).toLocaleTimeString()}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </AnimatedCard>
              )}

              {/* Summary */}
              <AnimatedCard className="p-6 bg-gradient-to-br from-purple-50 to-blue-50">
                <h3 className="font-bold text-xl mb-3">📝 AI Summary</h3>
                <p className="text-gray-700 leading-relaxed">{aiInsights.aiSummary}</p>
                <div className={`mt-4 inline-block px-4 py-2 rounded-lg border-2 font-semibold ${getUrgencyColor(aiInsights.urgencyLevel)}`}>
                  Urgency: {aiInsights.urgencyLevel.toUpperCase()}
                </div>
              </AnimatedCard>

              {/* Key Themes */}
              <AnimatedCard className="p-6">
                <h3 className="font-bold text-lg mb-3">🎯 Key Themes</h3>
                <div className="flex flex-wrap gap-2">
                  {aiInsights.keyThemes.map((theme, i) => (
                    <span key={i} className="px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                      {theme}
                    </span>
                  ))}
                </div>
              </AnimatedCard>

              {/* Emotional Journey */}
              <AnimatedCard className="p-6">
                <h3 className="font-bold text-lg mb-3">💭 Emotional Journey</h3>
                <p className="text-gray-700 leading-relaxed">{aiInsights.emotionalJourney}</p>
              </AnimatedCard>

              {/* Strengths & Growth */}
              <div className="grid md:grid-cols-2 gap-4">
                <AnimatedCard className="p-6 bg-green-50">
                  <h3 className="font-bold text-lg mb-3">💪 Strengths Observed</h3>
                  <ul className="space-y-2">
                    {aiInsights.strengthsObserved.map((strength, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-green-600 mt-1">✓</span>
                        <span className="text-gray-700">{strength}</span>
                      </li>
                    ))}
                  </ul>
                </AnimatedCard>

                <AnimatedCard className="p-6 bg-orange-50">
                  <h3 className="font-bold text-lg mb-3">🌱 Growth Areas</h3>
                  <ul className="space-y-2">
                    {aiInsights.growthAreas.map((area, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-orange-600 mt-1">→</span>
                        <span className="text-gray-700">{area}</span>
                      </li>
                    ))}
                  </ul>
                </AnimatedCard>
              </div>

              {/* Personalized Recommendations */}
              <AnimatedCard className="p-6 bg-gradient-to-br from-pink-50 to-purple-50">
                <h3 className="font-bold text-lg mb-3">💡 Personalized Recommendations</h3>
                <ul className="space-y-3">
                  {aiInsights.personalizedRecommendations.map((rec, i) => (
                    <li key={i} className="flex items-start gap-3 p-3 bg-white rounded-lg border border-purple-200">
                      <span className="text-2xl">{i + 1}</span>
                      <span className="text-gray-700 flex-1">{rec}</span>
                    </li>
                  ))}
                </ul>
              </AnimatedCard>

              {/* Progress Indicators */}
              <AnimatedCard className="p-6">
                <h3 className="font-bold text-lg mb-3">📈 Progress Indicators</h3>
                <p className="text-gray-700 leading-relaxed">{aiInsights.progressIndicators}</p>
              </AnimatedCard>
            </div>
          ) : null}
        </div>
      )}

      {activeTab === 'trends' && (
        <div className="space-y-6">
          {/* Mood Overview */}
          <AnimatedCard className="p-6">
            <h3 className="font-bold text-xl mb-4">📊 Mood Trends Over Time</h3>
            {conversations.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">No data available yet. Start chatting with Aurora to track your mood!</p>
              </div>
            ) : (
              <>
                {/* Emotion Distribution */}
                <div className="mb-6">
                  <h4 className="font-semibold mb-3">Emotion Distribution</h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                    {(() => {
                      const emotionCounts: Record<string, number> = {}
                      conversations.forEach(conv => {
                        emotionCounts[conv.mainEmotion] = (emotionCounts[conv.mainEmotion] || 0) + 1
                      })
                      
                      const emotionEmojis: Record<string, string> = {
                        'happy': '😊',
                        'sad': '😢',
                        'anxious': '😰',
                        'stressed': '😓',
                        'angry': '😠',
                        'calm': '😌',
                        'neutral': '😐',
                        'excited': '🤩',
                        'worried': '😟',
                        'overwhelmed': '😵'
                      }
                      
                      return Object.entries(emotionCounts)
                        .sort((a, b) => b[1] - a[1])
                        .map(([emotion, count]) => (
                          <div key={emotion} className="p-4 bg-gradient-to-br from-purple-50 to-blue-50 rounded-lg border-2 border-purple-200">
                            <div className="text-3xl mb-2">{emotionEmojis[emotion.toLowerCase()] || '🙂'}</div>
                            <div className="font-semibold capitalize">{emotion}</div>
                            <div className="text-sm text-gray-600">{count} time{count !== 1 ? 's' : ''}</div>
                          </div>
                        ))
                    })()}
                  </div>
                </div>

                {/* Risk Level Trends */}
                <div className="mb-6">
                  <h4 className="font-semibold mb-3">Risk Level Overview</h4>
                  <div className="grid grid-cols-3 gap-4">
                    {(() => {
                      const riskCounts = { low: 0, medium: 0, high: 0 }
                      conversations.forEach(conv => {
                        const level = conv.riskLevel.toLowerCase() as 'low' | 'medium' | 'high'
                        if (level in riskCounts) riskCounts[level]++
                      })
                      
                      return [
                        { level: 'low', color: 'green', emoji: '✅' },
                        { level: 'medium', color: 'yellow', emoji: '⚠️' },
                        { level: 'high', color: 'red', emoji: '🚨' }
                      ].map(({ level, color, emoji }) => (
                        <div key={level} className={`p-4 bg-${color}-50 rounded-lg border-2 border-${color}-300`}>
                          <div className="text-2xl mb-2">{emoji}</div>
                          <div className="font-semibold capitalize">{level} Risk</div>
                          <div className="text-xl font-bold">{riskCounts[level as 'low' | 'medium' | 'high']}</div>
                        </div>
                      ))
                    })()}
                  </div>
                </div>

                {/* Timeline */}
                <div>
                  <h4 className="font-semibold mb-3">Recent Emotional Journey</h4>
                  <div className="space-y-2">
                    {conversations.slice(0, 10).map((conv, i) => (
                      <div key={conv.sessionId} className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-200 hover:border-purple-300 transition-colors">
                        <div className="text-xs text-gray-500 w-24">
                          {new Date(conv.savedAt).toLocaleDateString()}
                        </div>
                        <div className={`flex-1 h-2 rounded-full ${
                          conv.riskLevel === 'high' ? 'bg-red-400' :
                          conv.riskLevel === 'medium' ? 'bg-yellow-400' :
                          'bg-green-400'
                        }`}></div>
                        <div className="capitalize font-medium text-sm w-32">{conv.mainEmotion}</div>
                        <div className="text-xs text-gray-500 w-24">{conv.messageCount} messages</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Summary Stats */}
                <div className="mt-6 p-4 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-lg">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                    <div>
                      <div className="text-2xl font-bold text-purple-600">{conversations.length}</div>
                      <div className="text-sm text-gray-600">Total Sessions</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-purple-600">
                        {Math.round(conversations.reduce((sum, conv) => sum + conv.messageCount, 0) / conversations.length)}
                      </div>
                      <div className="text-sm text-gray-600">Avg Messages</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-purple-600 capitalize">
                        {(() => {
                          const emotionCounts: Record<string, number> = {}
                          conversations.forEach(conv => {
                            emotionCounts[conv.mainEmotion] = (emotionCounts[conv.mainEmotion] || 0) + 1
                          })
                          return Object.entries(emotionCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A'
                        })()}
                      </div>
                      <div className="text-sm text-gray-600">Most Common</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-purple-600">
                        {Math.round((conversations.filter(c => c.riskLevel === 'low').length / conversations.length) * 100)}%
                      </div>
                      <div className="text-sm text-gray-600">Low Risk</div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </AnimatedCard>
        </div>
      )}

      {activeTab === 'journal' && (
        <div className="space-y-3">
          {conversations.slice(0, 10).map((conv, i) => (
            <motion.div
              key={conv.sessionId}
              initial={shouldReduceMotion ? {} : { opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05, duration: 0.3 }}
              className="pixel-card bg-white/90 backdrop-blur-sm p-4 hover-lift cursor-pointer"
              onClick={() => nav('/conversations')}
            >
              <div className="text-sm text-slate-500 pixel-text">
                {new Date(conv.savedAt).toLocaleDateString()}
              </div>
              <div className="font-medium pixel-text">{conv.mainEmotion} - {conv.messageCount} messages</div>
            </motion.div>
          ))}
          {conversations.length === 0 && (
            <div className="pixel-card bg-white/90 backdrop-blur-sm p-8 text-center">
              <p className="text-gray-500 pixel-text">No journal entries yet</p>
            </div>
          )}
        </div>
      )}
      </motion.div>
    </div>
  )
}
