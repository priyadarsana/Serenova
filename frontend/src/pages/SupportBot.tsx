import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, useReducedMotion } from 'framer-motion'
import AnimatedCard from '../components/AnimatedCard'
import PrimaryButton from '../components/PrimaryButton'
import { useUser } from '../contexts/UserContext'
import { API_URL } from '../config'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

interface IntakeSummary {
  sessionId: string
  summary: string
  mainEmotion: string
  emotionScore: number
  riskLevel: string
}

export default function SupportBot() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: "Hi, I'm Aurora. I'm here to listen and support you. What would you like to talk about?"
    }
  ])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [crisisDetected, setCrisisDetected] = useState(false)
  const [intakeSummary, setIntakeSummary] = useState<IntakeSummary>({
    sessionId: 'direct-' + Date.now(),
    summary: 'User started chat directly without intake.',
    mainEmotion: 'neutral',
    emotionScore: 0.5,
    riskLevel: 'low'
  })
  const [groqAvailable, setGroqAvailable] = useState<boolean | null>(null)

  const { userId, linkConversation } = useUser()
  const nav = useNavigate()
  const shouldReduceMotion = useReducedMotion()
  const chatEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    // Load user-specific chat history
    const currentUserId = localStorage.getItem('userId')

    if (currentUserId) {
      // Load chat history for this specific user
      const userChatKey = `chatHistory_${currentUserId}`
      const savedChat = localStorage.getItem(userChatKey)

      if (savedChat) {
        try {
          const parsed = JSON.parse(savedChat)
          if (Array.isArray(parsed) && parsed.length > 0) {
            console.log(`Loaded ${parsed.length} messages for user ${currentUserId}`)
            setMessages(parsed)
          }
        } catch (e) {
          console.error('Failed to parse chat history:', e)
        }
      } else {
        console.log('No saved chat history for this user')
      }
    }

    // Load intake summary from session if available
    const stored = sessionStorage.getItem('intakeSummary')
    if (stored) {
      try {
        const parsed = JSON.parse(stored)
        console.log('Loaded intake summary from session:', parsed)
        // Ensure all required fields are present
        if (parsed.sessionId && parsed.summary && parsed.mainEmotion && parsed.riskLevel) {
          setIntakeSummary(parsed)
          console.log('✅ Valid intake summary loaded')
        } else {
          console.warn('⚠️ Incomplete intake summary, using defaults')
        }
      } catch (e) {
        console.error('Failed to parse intake summary', e)
      }
    } else {
      console.log('No intake summary in session, using default')
    }

    // Check if Groq API is available
    checkGroqHealth()
  }, [])

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })

    // Save chat history for current user
    const currentUserId = localStorage.getItem('userId')
    if (currentUserId && messages.length > 1) { // Only save if there's more than just the initial greeting
      const userChatKey = `chatHistory_${currentUserId}`
      localStorage.setItem(userChatKey, JSON.stringify(messages))
      console.log(`Saved ${messages.length} messages for user ${currentUserId}`)
    }

    // Auto-focus input after messages update
    setTimeout(() => {
      inputRef.current?.focus()
    }, 100)
  }, [messages])

  const checkGroqHealth = async () => {
    try {
      const res = await fetch(`${API_URL}/api/support/health`)
      const data = await res.json()
      setGroqAvailable(data.groqAvailable)

      if (!data.groqAvailable) {
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: "⚠️ I'm having trouble connecting to my AI brain. Please configure the Groq API key in the backend .env file. Get a free key at https://console.groq.com/keys. You can still view coping activities and crisis resources below."
        }])
      }
    } catch (error) {
      setGroqAvailable(false)
    }
  }

  const sendMessage = async () => {
    if (!input.trim() || isTyping || groqAvailable === false) return

    // Ensure we have valid intakeSummary data
    const summaryData = intakeSummary || {
      sessionId: 'direct-' + Date.now(),
      summary: 'User started chat directly without intake.',
      mainEmotion: 'neutral',
      emotionScore: 0.5,
      riskLevel: 'low'
    }

    const userMessage: Message = { role: 'user', content: input }
    const messagesWithUser = [...messages, userMessage]
    setMessages(messagesWithUser)
    setInput('')
    setIsTyping(true)

    try {
      const requestBody = {
        userId: 'demo',
        sessionId: summaryData.sessionId,
        intakeSummary: summaryData.summary,
        mainEmotion: summaryData.mainEmotion,
        riskLevel: summaryData.riskLevel,
        messages: messagesWithUser.map(m => ({
          role: m.role,
          content: m.content
        }))
      }

      console.log('Sending request to backend:', requestBody)

      const res = await fetch(`${API_URL}/api/support/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      })

      console.log('Response status:', res.status)

      if (!res.ok) {
        const errorText = await res.text()
        console.error('Backend error:', errorText)
        throw new Error(`HTTP ${res.status}: ${errorText}`)
      }

      const data = await res.json()
      console.log('Got response:', data)

      const newMessages = [...messagesWithUser, {
        role: 'assistant' as const,
        content: data.reply
      }]

      setMessages(newMessages)

      if (data.crisisDetected) {
        setCrisisDetected(true)
      }

      // Auto-save conversation with the updated messages
      saveConversation(newMessages)
    } catch (error) {
      console.error('Chat error:', error)

      let errorMessage = `I'm having trouble responding right now.`

      if (error instanceof Error && error.message.includes('429')) {
        errorMessage = '⏱️ Too many requests. Gemini free tier allows 15 requests per minute. Please wait about 60 seconds and try again.'
      } else if (error instanceof Error && error.message.includes('quota')) {
        errorMessage = '📊 Daily quota exceeded. Gemini free tier allows 1,500 requests per day. The limit will reset in 24 hours.'
      } else if (error instanceof Error) {
        errorMessage = `I'm having trouble responding right now. Error: ${error.message}. Please check the console for details.`
      }

      const errorMessages = [...messagesWithUser, {
        role: 'assistant' as const,
        content: errorMessage
      }]
      setMessages(errorMessages)
      saveConversation(errorMessages)
    } finally {
      setIsTyping(false)
      // Force focus back to input immediately
      setTimeout(() => {
        inputRef.current?.focus()
      }, 0)
    }
  }

  const saveConversation = async (messagesToSave?: Message[]) => {
    try {
      // Use provided messages or current state
      const conversationMessages = messagesToSave || messages
      // Get userId directly from localStorage (set by Auth.tsx)
      const actualUserId = localStorage.getItem('userId') || 'anonymous'

      console.log('💾 Saving conversation...', {
        sessionId: intakeSummary.sessionId,
        userId: actualUserId,
        messageCount: conversationMessages.length
      })

      const response = await fetch(`${API_URL}/api/conversations/save`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: intakeSummary.sessionId,
          userId: actualUserId,
          messages: conversationMessages.map(m => ({
            role: m.role,
            content: m.content,
            timestamp: new Date().toISOString()
          })),
          intakeSummary: intakeSummary.summary,
          mainEmotion: intakeSummary.mainEmotion,
          riskLevel: intakeSummary.riskLevel
        })
      })

      if (response.ok) {
        const result = await response.json()
        console.log('✅ Conversation saved successfully:', result)
      } else {
        const errorText = await response.text()
        console.error('❌ Failed to save conversation:', response.status, errorText)
      }

      // Link conversation to user profile (if using UserContext userId)
      if (userId) {
        await linkConversation(intakeSummary.sessionId)
      }
    } catch (error) {
      console.error('❌ Error saving conversation:', error)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      {/* Header */}
      <motion.div
        initial={shouldReduceMotion ? {} : { opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between px-4 py-3 bg-white border-b flex-shrink-0"
      >
        <div>
          <h2 className="text-xl font-semibold">AI Support Companion</h2>
          <p className="text-xs text-slate-500">Aurora · Not a therapist</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => nav('/conversations')}
            className="px-3 py-1 text-sm border rounded hover:bg-purple-50 hover:border-purple-400"
          >
            📚 History
          </button>
          <button
            onClick={() => nav('/home')}
            className="px-3 py-1 text-sm border rounded hover:bg-slate-50"
          >
            End chat
          </button>
        </div>
      </motion.div>

      {/* Alerts Section */}
      <div className="flex-shrink-0 px-4 pt-4 space-y-2">
        {/* Crisis Alert */}
        {crisisDetected && (
          <AnimatedCard className="p-4 bg-red-50 border-red-200">
            <h3 className="font-medium text-red-800 mb-2">🆘 You deserve support</h3>
            <p className="text-sm text-red-700 mb-3">
              If you're having thoughts of suicide or self-harm, please reach out for help immediately.
            </p>
            <div className="space-y-2">
              <a
                href="tel:988"
                className="block w-full bg-red-600 text-white text-center py-2 rounded font-medium hover:bg-red-700"
              >
                📞 Call 988 Suicide & Crisis Lifeline
              </a>
              <a
                href="tel:911"
                className="block w-full bg-slate-700 text-white text-center py-2 rounded font-medium hover:bg-slate-800"
              >
                🚨 Call 911 Emergency
              </a>
            </div>
          </AnimatedCard>
        )}

        {/* Groq API Status */}
        {groqAvailable === false && (
          <AnimatedCard className="p-4 bg-yellow-50 border-yellow-200">
            <h3 className="font-medium text-yellow-800 mb-1">AI Not Available</h3>
            <p className="text-sm text-yellow-700 mb-2">
              To use the AI chatbot, configure the Groq API:
            </p>
            <ol className="text-xs text-yellow-700 space-y-1 list-decimal list-inside">
              <li>Get a free API key from <a href="https://console.groq.com/keys" target="_blank" rel="noopener" className="underline">Groq Console</a></li>
              <li>Add it to <code className="bg-yellow-100 px-1 rounded">backend/.env</code> as <code className="bg-yellow-100 px-1 rounded">GROQ_API_KEY=your_key</code></li>
              <li>Restart the backend server</li>
              <li>Refresh this page</li>
            </ol>
          </AnimatedCard>
        )}
      </div>

      {/* Chat messages - Scrollable container */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        <div className="max-w-2xl mx-auto space-y-4">
          {messages.map((msg, i) => (
            <motion.div
              key={i}
              initial={shouldReduceMotion ? {} : { opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[85%] p-3 rounded-2xl whitespace-pre-wrap ${msg.role === 'user'
                    ? 'bg-[var(--color-primary)] text-white'
                    : 'bg-slate-100 text-slate-800'
                  }`}
              >
                {msg.content}
              </div>
            </motion.div>
          ))}

          {isTyping && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex justify-start"
            >
              <div className="bg-slate-100 text-slate-800 p-3 rounded-2xl">
                <div className="flex gap-1">
                  <motion.span animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1, repeat: Infinity }}>●</motion.span>
                  <motion.span animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1, repeat: Infinity, delay: 0.2 }}>●</motion.span>
                  <motion.span animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1, repeat: Infinity, delay: 0.4 }}>●</motion.span>
                </div>
              </div>
            </motion.div>
          )}

          <div ref={chatEndRef} />
        </div>
      </div>

      {/* Input area - Fixed at bottom */}
      <div className="flex-shrink-0 bg-white border-t shadow-lg">
        <div className="max-w-2xl mx-auto p-4">
          <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={groqAvailable === false ? "AI unavailable - see instructions above" : "Type your message…"}
              className="w-full p-3 bg-white rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              disabled={isTyping || groqAvailable === false}
              autoFocus
            />
            <div className="flex gap-2 mt-3">
              <button
                onClick={() => nav('/activities')}
                className="px-4 py-2 text-sm rounded-lg border border-slate-300 hover:bg-slate-100 transition-colors"
              >
                🧘 Coping tools
              </button>
              <button
                onClick={() => nav('/support')}
                className="px-4 py-2 text-sm rounded-lg border border-slate-300 hover:bg-slate-100 transition-colors"
              >
                📞 Crisis help
              </button>
              <div className="flex-1" />
              <PrimaryButton
                onClick={sendMessage}
                disabled={isTyping || !input.trim() || groqAvailable === false}
              >
                Send
              </PrimaryButton>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
