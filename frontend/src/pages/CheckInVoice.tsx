import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, useReducedMotion } from 'framer-motion'
import AnimatedCard from '../components/AnimatedCard'
import PrimaryButton from '../components/PrimaryButton'
import MicButton from '../components/MicButton'

export default function CheckInVoice(){
  const [recording, setRecording] = useState(false)
  const [timer, setTimer] = useState(0)
  const [transcribe, setTranscribe] = useState(true)
  const nav = useNavigate()
  const shouldReduceMotion = useReducedMotion()

  useEffect(() => {
    let interval: NodeJS.Timeout
    if (recording) {
      interval = setInterval(() => setTimer(t => t + 1), 1000)
    }
    return () => clearInterval(interval)
  }, [recording])

  const toggle = () => {
    setRecording(r => !r)
    if (!recording) setTimer(0)
  }

  const analyze = async () => {
    const form = new FormData()
    form.append('userId','demo')
    form.append('timestamp', new Date().toISOString())
    form.append('transcribe', String(transcribe))
    await fetch('/api/analyze/voice', { method: 'POST', body: form })
    nav('/results/demo-session')
  }

  return (
    <div className="max-w-2xl mx-auto text-center space-y-6">
      <motion.div
        initial={shouldReduceMotion ? {} : { opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h2 className="text-xl font-semibold">Talk to me</h2>
        <p className="text-sm text-slate-500 mt-2">Speak freely for 20–60 seconds. You can stop anytime.</p>
      </motion.div>

      {recording && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.3 }}
          className="fixed inset-0 bg-black pointer-events-none z-0"
        />
      )}

      <div className="relative z-10 flex flex-col items-center gap-4">
        <MicButton recording={recording} onClick={toggle} />
        
        <motion.div
          className="text-base font-medium"
          key={timer}
          initial={shouldReduceMotion ? {} : { scale: 1.1 }}
          animate={{ scale: 1 }}
        >
          {recording ? `Recording… ${timer}s` : 'Tap to start'}
        </motion.div>

        <AnimatedCard className="p-4 inline-block">
          <label className="flex items-center gap-2 cursor-pointer">
            <input 
              type="checkbox" 
              checked={transcribe} 
              onChange={e=>setTranscribe(e.target.checked)}
              className="w-4 h-4 accent-[var(--color-primary)]"
            />
            <span className="text-sm">Show transcription after recording</span>
          </label>
        </AnimatedCard>

        {timer > 0 && (
          <motion.div
            initial={shouldReduceMotion ? {} : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex gap-3"
          >
            <PrimaryButton onClick={() => { setRecording(false); setTimer(0) }} variant="secondary">
              Discard
            </PrimaryButton>
            <PrimaryButton onClick={analyze} variant="primary">
              Analyze my feelings
            </PrimaryButton>
          </motion.div>
        )}
      </div>
    </div>
  )
}
