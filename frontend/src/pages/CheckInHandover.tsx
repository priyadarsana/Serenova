import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, useReducedMotion } from 'framer-motion'
import AnimatedCard from '../components/AnimatedCard'
import PrimaryButton from '../components/PrimaryButton'

interface IntakeSummary {
  sessionId: string
  summary: string
  mainEmotion: string
  emotionScore: number
  riskLevel: string
  timestamp: string
}

export default function CheckInHandover() {
  const [summary, setSummary] = useState<IntakeSummary | null>(null)
  const nav = useNavigate()
  const shouldReduceMotion = useReducedMotion()

  useEffect(() => {
    const stored = sessionStorage.getItem('intakeSummary')
    if (!stored) {
      nav('/home')
      return
    }
    setSummary(JSON.parse(stored))
  }, [nav])

  if (!summary) return null

  const emotionEmoji = {
    joy: '😊',
    sadness: '😔',
    anger: '😠',
    fear: '😰',
    love: '🥰',
    surprise: '😮'
  }[summary.mainEmotion] || '💭'

  const riskColor = {
    low: 'text-green-600',
    medium: 'text-yellow-600',
    high: 'text-red-600'
  }[summary.riskLevel]

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <motion.h2
        initial={shouldReduceMotion ? {} : { opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-xl font-semibold text-center"
      >
        Thanks for sharing {emotionEmoji}
      </motion.h2>

      <AnimatedCard className="p-6 space-y-4">
        <div className="text-center">
          <div className="text-6xl mb-4">{emotionEmoji}</div>
          <h3 className="text-lg font-medium mb-2">Here's what I understood:</h3>
        </div>

        <div className="bg-slate-50 rounded-lg p-4 space-y-3">
          <div>
            <span className="text-xs text-slate-500">Main emotion</span>
            <p className="font-medium capitalize">{summary.mainEmotion}</p>
          </div>
          
          <div>
            <span className="text-xs text-slate-500">Summary</span>
            <p className="text-sm">{summary.summary}</p>
          </div>

          {summary.riskLevel === 'high' && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-sm text-red-800 font-medium">
                ⚠️ It sounds like you're going through a difficult time.
              </p>
              <p className="text-xs text-red-700 mt-1">
                If you're having thoughts of self-harm or suicide, please contact emergency services (911) or the 988 Suicide & Crisis Lifeline immediately.
              </p>
            </div>
          )}
        </div>
      </AnimatedCard>

      <AnimatedCard delay={0.1} className="p-6 space-y-4">
        <h3 className="font-medium">What would you like to do next?</h3>
        
        <PrimaryButton 
          onClick={() => nav('/support/bot')} 
          variant="primary"
          className="w-full"
        >
          💬 Talk to AI support companion
        </PrimaryButton>

        <p className="text-xs text-center text-slate-500">
          Our AI companion can listen, validate your feelings, and suggest coping strategies.
          <br />
          <strong>Not a replacement for professional therapy.</strong>
        </p>

        <div className="pt-2 border-t space-y-2">
          <button
            onClick={() => nav('/activities')}
            className="w-full p-3 text-left hover:bg-slate-50 rounded-lg transition-colors"
          >
            <div className="font-medium text-sm">🧘 Try coping activities</div>
            <div className="text-xs text-slate-500">Breathing, journaling, grounding exercises</div>
          </button>

          <button
            onClick={() => nav('/support')}
            className="w-full p-3 text-left hover:bg-slate-50 rounded-lg transition-colors"
          >
            <div className="font-medium text-sm">📞 View crisis resources</div>
            <div className="text-xs text-slate-500">Helplines, emergency contacts, local support</div>
          </button>

          <button
            onClick={() => nav('/home')}
            className="w-full p-3 text-left hover:bg-slate-50 rounded-lg transition-colors text-slate-600"
          >
            <div className="text-sm">← Back to home</div>
          </button>
        </div>
      </AnimatedCard>

      <p className="text-xs text-center text-slate-400 px-4">
        Your conversation is analyzed privately. We don't share your data with third parties.
      </p>
    </div>
  )
}
