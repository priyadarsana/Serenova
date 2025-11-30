import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, useReducedMotion } from 'framer-motion'
import AnimatedCard from '../components/AnimatedCard'
import PrimaryButton from '../components/PrimaryButton'

interface ChatTurn {
  role: 'user' | 'assistant'
  text: string
}

const QUESTIONS = [
  "Hey, how has your day been so far?",
  "What has been on your mind the most today?",
  "How is all of this affecting your sleep, energy, or focus?",
  "Can you tell me more about that?",
  "How long have you been feeling this way?",
  "Is there anything specific that triggered these feelings?"
]

// Minimum messages before we can analyze
const MIN_USER_MESSAGES = 3
// Maximum to prevent infinite conversation
const MAX_USER_MESSAGES = 8

export default function CheckInChat() {
  const [turns, setTurns] = useState<ChatTurn[]>([
    { role: 'assistant', text: QUESTIONS[0] }
  ])
  const [currentInput, setCurrentInput] = useState('')
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const nav = useNavigate()
  const shouldReduceMotion = useReducedMotion()
  const chatEndRef = useRef<HTMLDivElement>(null)

  const userMessageCount = turns.filter(t => t.role === 'user').length

  // Auto-scroll to bottom when new message arrives
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [turns])

  const analyzeConversation = async (finalTurns: ChatTurn[]) => {
    setIsAnalyzing(true)
    try {
      const res = await fetch('http://localhost:8001/api/intake/summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: 'demo',
          turns: finalTurns
        })
      })
      const data = await res.json()
      
      // Store intake summary for AI chatbot
      sessionStorage.setItem('intakeSummary', JSON.stringify(data))
      
      // Navigate to handover screen
      nav('/check-in/handover')
    } catch (error) {
      console.error('Analysis failed:', error)
      alert('Failed to analyze. Please check if backend is running.')
      setIsAnalyzing(false)
    }
  }

  // Determine if we have enough information to analyze
  const hasEnoughInfo = (newTurns: ChatTurn[]): boolean => {
    const userMessages = newTurns.filter(t => t.role === 'user')
    const newUserCount = userMessages.length
    
    // Must have at least MIN_USER_MESSAGES
    if (newUserCount < MIN_USER_MESSAGES) return false
    
    // Auto-stop at MAX_USER_MESSAGES
    if (newUserCount >= MAX_USER_MESSAGES) return true
    
    // After minimum messages, check if user is providing substance
    const lastUserMessage = userMessages[userMessages.length - 1]?.text || ''
    const wordCount = lastUserMessage.trim().split(/\s+/).length
    
    // If user gives detailed responses (>15 words) after 3+ messages, we likely have enough
    if (newUserCount >= MIN_USER_MESSAGES && wordCount > 15) {
      return true
    }
    
    // Check if conversation covers key areas
    const allUserText = userMessages.map(m => m.text.toLowerCase()).join(' ')
    const hasEmotionalContent = /feel|feeling|emotion|mood|sad|happy|anxious|stressed|worried|overwhelmed|tired|energy|sleep/i.test(allUserText)
    const hasDurationContent = /today|yesterday|week|month|days|always|lately|recently|long/i.test(allUserText)
    const hasCauseContent = /because|since|after|when|triggered|started|happened/i.test(allUserText)
    
    // If we have 4+ messages and they cover emotions + context, that's enough
    if (newUserCount >= 4 && hasEmotionalContent && (hasDurationContent || hasCauseContent)) {
      return true
    }
    
    return false
  }

  const handleSend = () => {
    if (!currentInput.trim() || isAnalyzing) return

    // Add user message
    const newTurns = [...turns, { role: 'user' as const, text: currentInput }]
    setTurns(newTurns)
    setCurrentInput('')

    const newUserCount = newTurns.filter(t => t.role === 'user').length

    // Check if we should auto-analyze
    if (hasEnoughInfo(newTurns)) {
      // Wait a moment before analyzing
      setTimeout(() => analyzeConversation(newTurns), 500)
    } else {
      // Add next question
      const nextQuestionIndex = newUserCount
      if (nextQuestionIndex < QUESTIONS.length) {
        setTimeout(() => {
          setTurns(prev => [...prev, { 
            role: 'assistant', 
            text: QUESTIONS[nextQuestionIndex] 
          }])
        }, 800)
      } else {
        // Ran out of questions but still don't have enough info - analyze anyway
        setTimeout(() => analyzeConversation(newTurns), 500)
      }
    }
  }

  const handleEndChat = () => {
    if (turns.filter(t => t.role === 'user').length === 0) {
      nav('/home')
      return
    }
    analyzeConversation(turns)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <motion.h2
        initial={shouldReduceMotion ? {} : { opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-xl font-semibold"
      >
        Let's talk about how you're feeling
      </motion.h2>

      <p className="text-sm text-slate-500 text-center">
        Share what's on your mind. After a few messages, I'll help you understand how you're feeling.
      </p>

      {/* Chat messages */}
      <AnimatedCard className="p-4 space-y-4 min-h-[400px] max-h-[500px] overflow-y-auto">
        {turns.map((turn, i) => (
          <motion.div
            key={i}
            initial={shouldReduceMotion ? {} : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className={`flex ${turn.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] p-3 rounded-2xl ${
                turn.role === 'user'
                  ? 'bg-[var(--color-primary)] text-white'
                  : 'bg-slate-100 text-slate-800'
              }`}
            >
              {turn.text}
            </div>
          </motion.div>
        ))}
        
        {isAnalyzing && (
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
      </AnimatedCard>

      {/* Input area */}
      <AnimatedCard delay={0.2} className="p-4">
        <input
          type="text"
          value={currentInput}
          onChange={e => setCurrentInput(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Type your reply…"
          className="w-full p-3 bg-transparent focus:outline-none"
          disabled={isAnalyzing}
        />
        <div className="flex gap-2 mt-3">
          <button
            onClick={handleEndChat}
            className="px-4 py-2 text-sm rounded border text-slate-600 hover:bg-slate-50"
            disabled={isAnalyzing}
          >
            {userMessageCount === 0 ? 'Skip for now' : 'End chat early'}
          </button>
          <div className="flex-1" />
          {!isAnalyzing && (
            <PrimaryButton onClick={handleSend} disabled={!currentInput.trim()}>
              Send
            </PrimaryButton>
          )}
        </div>
        
        {userMessageCount < MIN_USER_MESSAGES && (
          <p className="text-xs text-slate-400 mt-2 text-center">
            At least {MIN_USER_MESSAGES - userMessageCount} more {MIN_USER_MESSAGES - userMessageCount === 1 ? 'message' : 'messages'} needed
          </p>
        )}
        {userMessageCount >= MIN_USER_MESSAGES && userMessageCount < MAX_USER_MESSAGES && (
          <p className="text-xs text-slate-400 mt-2 text-center">
            I'll analyze when I have enough context, or you can end the chat early
          </p>
        )}
      </AnimatedCard>

      <p className="text-xs text-center text-slate-500">
        This is a safe space. Your conversation is analyzed privately and locally.
      </p>
    </div>
  )
}
