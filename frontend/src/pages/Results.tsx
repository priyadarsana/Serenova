import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { motion, useReducedMotion } from 'framer-motion'
import AnimatedCard from '../components/AnimatedCard'
import PrimaryButton from '../components/PrimaryButton'
import GradientProgressBar from '../components/GradientProgressBar'

interface ResultData {
  sessionId: string
  overallLabel: string
  overallScore: number
  textEmotion?: { label: string; score: number }
  voiceEmotion?: { label: string; score: number }
  riskLevel: string
  empatheticMessage: string
  suggestions: string[]
}

export default function Results(){
  const { sessionId } = useParams()
  const shouldReduceMotion = useReducedMotion()
  const [data, setData] = useState<ResultData | null>(null)

  useEffect(() => {
    // Try to load from sessionStorage
    const stored = sessionStorage.getItem(`session-${sessionId}`)
    if (stored) {
      setData(JSON.parse(stored))
    } else {
      // Fallback mock data
      setData({
        sessionId: sessionId || 'demo',
        overallLabel: 'Sadness',
        overallScore: 0.67,
        textEmotion: { label: 'sadness', score: 0.8 },
        riskLevel: 'medium',
        empatheticMessage: `You seem really weighed down right now. Your feelings are valid, and you don't have to pretend you're okay. Try talking to someone you trust or writing down what's hurting you.`,
        suggestions: ['Try a 3-minute breathing exercise', 'Write down three things that went okay today']
      })
    }
  }, [sessionId])

  if (!data) return <div className="text-center p-8">Loading...</div>
  
  return (
    <div className="max-w-2xl mx-auto space-y-5">
      {/* Overall mood card */}
      <AnimatedCard className="p-6">
        <h3 className="font-semibold text-lg">You may be feeling: {data.overallLabel}</h3>
        <p className="text-sm text-slate-500 mt-1">This is not a diagnosis, just a gentle reflection.</p>
        <div className="mt-4">
          <GradientProgressBar score={data.overallScore} />
        </div>
      </AnimatedCard>

      {/* Breakdown row */}
      <div className="grid grid-cols-2 gap-4">
        {data.textEmotion && (
          <AnimatedCard delay={0.1} className="p-5">
            <div className="text-sm text-slate-500 mb-3">From your words</div>
            <motion.div
              animate={shouldReduceMotion ? {} : {
                y: [0, -3, 0]
              }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              className="text-2xl mb-2"
            >
              📝
            </motion.div>
            <div className="text-base">
              <span className="font-medium capitalize">{data.textEmotion.label}</span>
              <span className="text-slate-500 text-sm ml-2">({data.textEmotion.score.toFixed(2)})</span>
            </div>
          </AnimatedCard>
        )}

        {data.voiceEmotion && (
          <AnimatedCard delay={0.15} className="p-5">
            <div className="text-sm text-slate-500 mb-3">From your voice</div>
            <motion.div
              animate={shouldReduceMotion ? {} : {
                scale: [1, 1.1, 1, 1.1, 1]
              }}
              transition={{ duration: 2, ease: 'easeInOut' }}
              className="text-2xl mb-2"
            >
              🎵
            </motion.div>
            <div className="text-base">
              <span className="font-medium capitalize">{data.voiceEmotion.label}</span>
              <span className="text-slate-500 text-sm ml-2">({data.voiceEmotion.score.toFixed(2)})</span>
            </div>
          </AnimatedCard>
        )}
      </div>

      {/* Empathetic message */}
      <AnimatedCard delay={0.2} className="p-6 bg-gradient-to-br from-purple-50 to-indigo-50">
        <div className="text-base leading-relaxed text-slate-700">
          {data.empatheticMessage}
        </div>
      </AnimatedCard>

      {/* Suggestions */}
      <AnimatedCard delay={0.25} className="p-6">
        <div className="font-semibold mb-4">Suggested next steps</div>
        <div className="flex flex-col gap-3">
          {data.suggestions.map((s, i) => (
            <motion.div
              key={i}
              initial={shouldReduceMotion ? {} : { opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.35 + i * 0.1 }}
            >
              <PrimaryButton variant="secondary" className="w-full text-left">
                {s}
              </PrimaryButton>
            </motion.div>
          ))}
        </div>
      </AnimatedCard>

      {/* High risk warning (warm, not alarming) */}
      {data.riskLevel === 'high' && (
        <motion.div
          initial={shouldReduceMotion ? {} : { opacity: 0, scale: 0.95 }}
          animate={shouldReduceMotion ? { opacity: 1 } : { 
            opacity: 1, 
            scale: [0.95, 1.02, 1],
          }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        >
          <AnimatedCard className="p-5 border-2 border-[var(--color-warning)]">
            <div className="text-[var(--color-warning)] font-semibold mb-2">You deserve support</div>
            <p className="text-sm mb-3">If you feel unsafe, please contact a helpline or trusted person.</p>
            <PrimaryButton variant="danger">View support options</PrimaryButton>
          </AnimatedCard>
        </motion.div>
      )}
    </div>
  )
}
