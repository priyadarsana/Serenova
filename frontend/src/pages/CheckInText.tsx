import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, useReducedMotion } from 'framer-motion'
import AnimatedCard from '../components/AnimatedCard'
import PrimaryButton from '../components/PrimaryButton'

const prompts = ['Work', 'Studies', 'Relationships', 'Health']

export default function CheckInText(){
  const [text, setText] = useState('')
  const [loading, setLoading] = useState(false)
  const nav = useNavigate()
  const shouldReduceMotion = useReducedMotion()

  const submit = async () => {
    if (!text.trim()) return
    setLoading(true)
    try {
      const payload = { userId: 'demo', text, timestamp: new Date().toISOString() }
      const res = await fetch('http://localhost:8001/api/analyze/text', { 
        method: 'POST', 
        headers: {'Content-Type':'application/json'}, 
        body: JSON.stringify(payload) 
      })
      const data = await res.json()
      // Store result in sessionStorage to display on results page
      sessionStorage.setItem(`session-${data.sessionId}`, JSON.stringify(data))
      nav(`/results/${data.sessionId}`)
    } catch (error) {
      console.error('Analysis failed:', error)
      alert('Failed to analyze. Please check if backend is running.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <motion.h2
        initial={shouldReduceMotion ? {} : { opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-xl font-semibold"
      >
        Write what's on your mind
      </motion.h2>

      <AnimatedCard className="p-0 overflow-hidden">
        <textarea 
          value={text} 
          onChange={e=>setText(e.target.value)} 
          placeholder="You can write about your day, worries, or anything at all..." 
          className="w-full min-h-[200px] p-4 bg-transparent focus:outline-none resize-none"
        />
      </AnimatedCard>

      <div className="flex gap-2 flex-wrap">
        {prompts.map((prompt, i) => (
          <motion.button
            key={prompt}
            initial={shouldReduceMotion ? {} : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 * i, duration: 0.3 }}
            onClick={() => setText(text + (text ? ' ' : '') + prompt + ': ')}
            className="px-4 py-2 bg-white/60 rounded-full text-sm hover:bg-white transition-colors"
          >
            {prompt}
          </motion.button>
        ))}
      </div>

      <div className="flex gap-3">
        <PrimaryButton onClick={() => nav('/home')} variant="secondary">
          Cancel
        </PrimaryButton>
        <div className="flex-1" />
        <PrimaryButton onClick={submit} variant="primary" className="relative">
          {loading ? (
            <motion.span
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              className="inline-block"
            >
              ⏳
            </motion.span>
          ) : (
            'Analyze my feelings'
          )}
        </PrimaryButton>
      </div>
    </div>
  )
}
