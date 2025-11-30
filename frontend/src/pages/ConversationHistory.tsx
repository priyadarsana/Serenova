import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import AnimatedCard from '../components/AnimatedCard'
import PrimaryButton from '../components/PrimaryButton'

interface Conversation {
  sessionId: string
  savedAt: string
  messageCount: number
  mainEmotion: string
  riskLevel: string
}

interface ConversationDetail {
  sessionId: string
  messages: Array<{ role: string; content: string }>
  intakeSummary: string
  mainEmotion: string
  riskLevel: string
  savedAt: string
}

interface Analysis {
  stressIndicators: string[]
  emotionalPatterns: string[]
  concernedTopics: string[]
  suggestions: string[]
  overallStressLevel: string
}

export default function ConversationHistory() {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [selectedConv, setSelectedConv] = useState<ConversationDetail | null>(null)
  const [analysis, setAnalysis] = useState<Analysis | null>(null)
  const [loading, setLoading] = useState(true)
  const nav = useNavigate()

  useEffect(() => {
    loadConversations()
  }, [])

  const loadConversations = async () => {
    try {
      const token = localStorage.getItem('authToken')
      const userId = localStorage.getItem('userId')
      
      console.log('🔍 Loading conversations...', { token, userId })
      
      if (!token) {
        console.error('No auth token found')
        nav('/auth')
        return
      }
      
      const res = await fetch('http://localhost:8001/api/conversations/list', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (!res.ok) {
        if (res.status === 401) {
          nav('/auth')
          return
        }
        throw new Error('Failed to load conversations')
      }
      
      const data = await res.json()
      console.log('📋 Loaded conversations:', data)
      
      setConversations(data.conversations)
      
      // Check for token mismatch issue
      if (token && userId && token !== userId) {
        console.warn('⚠️ TOKEN MISMATCH DETECTED!')
        console.warn('  authToken:', token)
        console.warn('  userId:', userId)
        console.warn('  This means you are using an old login.')
        console.warn('  SOLUTION: Log out and log back in to get new token format.')
      }
    } catch (error) {
      console.error('Failed to load conversations:', error)
    } finally {
      setLoading(false)
    }
  }

  const viewConversation = async (sessionId: string) => {
    try {
      const token = localStorage.getItem('authToken')
      if (!token) {
        nav('/auth')
        return
      }
      
      const res = await fetch(`http://localhost:8001/api/conversations/${sessionId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (!res.ok) {
        if (res.status === 401 || res.status === 403) {
          alert('You do not have access to this conversation')
          return
        }
        throw new Error('Failed to load conversation')
      }
      
      const data = await res.json()
      setSelectedConv(data)
      
      // Auto-analyze
      analyzeConversation(sessionId)
    } catch (error) {
      console.error('Failed to load conversation:', error)
    }
  }

  const analyzeConversation = async (sessionId: string) => {
    try {
      const token = localStorage.getItem('authToken')
      if (!token) return
      
      const res = await fetch(`http://localhost:8001/api/conversations/analyze/${sessionId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (!res.ok) {
        if (res.status === 401 || res.status === 403) {
          return
        }
        throw new Error('Failed to analyze')
      }
      
      const data = await res.json()
      setAnalysis(data)
    } catch (error) {
      console.error('Failed to analyze conversation:', error)
    }
  }

  const deleteConversation = async (sessionId: string) => {
    if (!confirm('Are you sure you want to delete this conversation? This action cannot be undone.')) {
      return
    }

    try {
      const token = localStorage.getItem('authToken')
      if (!token) {
        alert('Please log in to delete conversations')
        return
      }

      const res = await fetch(`http://localhost:8001/api/conversations/${sessionId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (!res.ok) {
        if (res.status === 401 || res.status === 403) {
          alert('You do not have permission to delete this conversation')
          return
        }
        throw new Error('Failed to delete conversation')
      }

      // Remove from local state
      setConversations(prev => prev.filter(c => c.sessionId !== sessionId))
      
      // Clear selected conversation if this was the one
      if (selectedConv?.sessionId === sessionId) {
        setSelectedConv(null)
        setAnalysis(null)
      }

      console.log('✅ Conversation deleted successfully')
    } catch (error) {
      console.error('Failed to delete conversation:', error)
      alert('Failed to delete conversation. Please try again.')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg text-gray-600">Loading conversations...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-4">
      <div className="max-w-6xl mx-auto pt-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Conversation History & Analysis
          </h1>
          <p className="text-gray-600">
            View your past conversations and get AI-powered insights
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Conversation List */}
          <div className="md:col-span-1">
            <AnimatedCard className="p-4">
              <h2 className="font-semibold text-lg mb-4">Your Conversations</h2>
              
              {conversations.length === 0 ? (
                <p className="text-gray-500 text-sm">No conversations yet. Start chatting with Aurora!</p>
              ) : (
                <div className="space-y-2">
                  {conversations.map((conv) => (
                    <div
                      key={conv.sessionId}
                      className={`relative w-full p-3 rounded-lg border-2 transition-all ${
                        selectedConv?.sessionId === conv.sessionId
                          ? 'border-purple-400 bg-purple-50'
                          : 'border-gray-200 hover:border-purple-300'
                      }`}
                    >
                      <button
                        onClick={() => viewConversation(conv.sessionId)}
                        className="w-full text-left"
                      >
                        <div className="text-sm font-medium text-gray-800 mb-1">
                          {new Date(conv.savedAt).toLocaleDateString()}
                        </div>
                        <div className="text-xs text-gray-600">
                          {conv.messageCount} messages • {conv.mainEmotion}
                        </div>
                        <div className={`text-xs mt-1 inline-block px-2 py-0.5 rounded ${
                          conv.riskLevel === 'high' ? 'bg-red-100 text-red-700' :
                          conv.riskLevel === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-green-100 text-green-700'
                        }`}>
                          {conv.riskLevel} risk
                        </div>
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
          </div>

          {/* Conversation Detail & Analysis */}
          <div className="md:col-span-2 space-y-4">
            {!selectedConv ? (
              <AnimatedCard className="p-8 text-center">
                <div className="text-gray-500">
                  <span className="text-4xl mb-4 block">💬</span>
                  Select a conversation to view details and analysis
                </div>
              </AnimatedCard>
            ) : (
              <>
                {/* Analysis Results */}
                {analysis && (
                  <AnimatedCard className="p-6">
                    <h3 className="font-bold text-xl mb-4">📊 Conversation Analysis</h3>
                    
                    <div className="mb-6">
                      <div className="text-sm text-gray-600 mb-2">Overall Stress Level</div>
                      <div className={`inline-block px-4 py-2 rounded-lg font-semibold ${
                        analysis.overallStressLevel === 'High' ? 'bg-red-100 text-red-700' :
                        analysis.overallStressLevel === 'Moderate' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-green-100 text-green-700'
                      }`}>
                        {analysis.overallStressLevel}
                      </div>
                    </div>

                    {analysis.stressIndicators.length > 0 && (
                      <div className="mb-4">
                        <h4 className="font-semibold text-gray-800 mb-2">🚨 Stress Indicators</h4>
                        <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                          {analysis.stressIndicators.map((indicator, i) => (
                            <li key={i}>{indicator}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {analysis.emotionalPatterns.length > 0 && (
                      <div className="mb-4">
                        <h4 className="font-semibold text-gray-800 mb-2">💭 Emotional Patterns</h4>
                        <div className="flex flex-wrap gap-2">
                          {analysis.emotionalPatterns.map((pattern, i) => (
                            <span key={i} className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm">
                              {pattern}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {analysis.concernedTopics.length > 0 && (
                      <div className="mb-4">
                        <h4 className="font-semibold text-gray-800 mb-2">📌 Topics of Concern</h4>
                        <div className="flex flex-wrap gap-2">
                          {analysis.concernedTopics.map((topic, i) => (
                            <span key={i} className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                              {topic}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">💡 Suggestions</h4>
                      <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                        {analysis.suggestions.map((suggestion, i) => (
                          <li key={i}>{suggestion}</li>
                        ))}
                      </ul>
                    </div>
                  </AnimatedCard>
                )}

                {/* Conversation Messages */}
                <AnimatedCard className="p-6">
                  <h3 className="font-bold text-lg mb-4">💬 Conversation</h3>
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {selectedConv.messages.map((msg, i) => (
                      <div
                        key={i}
                        className={`p-3 rounded-lg ${
                          msg.role === 'user'
                            ? 'bg-purple-100 ml-8'
                            : 'bg-gray-100 mr-8'
                        }`}
                      >
                        <div className="text-xs font-semibold text-gray-600 mb-1">
                          {msg.role === 'user' ? 'You' : 'Aurora'}
                        </div>
                        <div className="text-sm text-gray-800">{msg.content}</div>
                      </div>
                    ))}
                  </div>
                </AnimatedCard>
              </>
            )}
          </div>
        </div>

        <div className="text-center mt-8">
          <PrimaryButton onClick={() => nav('/')}>
            Back to Home
          </PrimaryButton>
        </div>
      </div>
    </div>
  )
}
