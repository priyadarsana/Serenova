import React, { useState, useEffect } from 'react'
import { Routes, Route, Link, useNavigate } from 'react-router-dom'
import { motion, useReducedMotion } from 'framer-motion'
import AnimatedCard from '../components/AnimatedCard'
import PrimaryButton from '../components/PrimaryButton'

const list = [
  { id: 'breathing-3m', title: '3-minute breathing', duration: 3, category: 'Breathing', icon: '🫁' },
  { id: 'grounding-5senses', title: '3-minute grounding', duration: 3, category: 'Grounding', icon: '🌿' },
  { id: 'journal-gratitude', title: '3-minute gratitude', duration: 3, category: 'Journaling', icon: '📔' }
]

const categories = ['All', 'Breathing', 'Grounding', 'Journaling']

function Breathing3Min() {
  const [phase, setPhase] = useState<'intro' | 'minute1' | 'minute2' | 'minute3' | 'complete'>('intro')
  const [timeLeft, setTimeLeft] = useState(180) // 3 minutes in seconds
  const [isActive, setIsActive] = useState(false)
  const shouldReduceMotion = useReducedMotion()
  const nav = useNavigate()

  useEffect(() => {
    let interval: number | null = null

    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((time) => {
          const newTime = time - 1
          
          // Update phases based on time
          if (newTime === 120) setPhase('minute2')
          else if (newTime === 60) setPhase('minute3')
          else if (newTime === 0) {
            setPhase('complete')
            setIsActive(false)
          }
          
          return newTime
        })
      }, 1000)
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isActive, timeLeft])

  const startExercise = () => {
    setIsActive(true)
    setPhase('minute1')
  }

  const resetExercise = () => {
    setIsActive(false)
    setPhase('intro')
    setTimeLeft(180)
  }

  const getPhaseContent = () => {
    switch (phase) {
      case 'intro':
        return {
          title: '3-Minute Breathing Space',
          subtitle: 'A mindful pause to reset',
          instructions: [
            'Find a comfortable seated position',
            'You can close your eyes or keep a soft gaze downward',
            'This exercise has three phases, one minute each',
            'Simply follow the breathing circle and gentle prompts'
          ]
        }
      case 'minute1':
        return {
          title: 'Step 1: Awareness',
          subtitle: 'Notice what\'s here',
          instructions: [
            'Notice any thoughts passing through your mind',
            'Acknowledge emotions present right now',
            'Feel sensations in your body',
            'No need to change anything—just observe'
          ]
        }
      case 'minute2':
        return {
          title: 'Step 2: Gathering',
          subtitle: 'Focus on the breath',
          instructions: [
            'Bring attention to your breathing',
            'Feel the breath entering and leaving',
            'Notice the gentle rise and fall',
            'Let the breath anchor you in this moment'
          ]
        }
      case 'minute3':
        return {
          title: 'Step 3: Expanding',
          subtitle: 'Whole body awareness',
          instructions: [
            'Expand awareness to your whole body',
            'Feel yourself breathing as a complete being',
            'Notice the space you occupy',
            'Sense your body from head to toe'
          ]
        }
      case 'complete':
        return {
          title: 'Well Done!',
          subtitle: 'You completed the breathing space',
          instructions: [
            'Notice how you feel right now',
            'Carry this sense of calm with you',
            'You can return to this practice anytime',
            'Regular practice strengthens mindfulness'
          ]
        }
    }
  }

  const content = getPhaseContent()
  const minutes = Math.floor(timeLeft / 60)
  const seconds = timeLeft % 60

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 z-50 overflow-y-auto">
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        {/* Close button */}
        <button
          onClick={() => nav('/activities')}
          className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center rounded-full bg-white/50 hover:bg-white/80 transition-colors"
        >
          ✕
        </button>

        {/* Timer */}
        {isActive && phase !== 'complete' && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute top-6 left-1/2 -translate-x-1/2 text-2xl font-light text-gray-600"
          >
            {minutes}:{seconds.toString().padStart(2, '0')}
          </motion.div>
        )}

        <div className="max-w-lg w-full">
          {/* Breathing Circle */}
          <div className="flex items-center justify-center mb-8 h-80">
            {isActive && phase !== 'complete' ? (
              <div className="relative">
                {/* Outer glow rings */}
                <motion.div
                  className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-400/20 to-purple-400/20 blur-2xl"
                  animate={{
                    scale: shouldReduceMotion ? 1 : [1, 1.4, 1],
                    opacity: shouldReduceMotion ? 0.3 : [0.3, 0.6, 0.3]
                  }}
                  transition={{
                    duration: 10,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                  style={{ width: '280px', height: '280px' }}
                />

                {/* Main breathing circle */}
                <motion.div
                  className="relative rounded-full bg-gradient-to-br from-blue-400 to-purple-500 shadow-2xl flex items-center justify-center"
                  animate={shouldReduceMotion ? {} : {
                    scale: [1, 1.5, 1.5, 1], // Inhale (4s), hold (1s), exhale (4s), hold (1s)
                  }}
                  transition={{
                    duration: 10,
                    repeat: Infinity,
                    ease: "easeInOut",
                    times: [0, 0.4, 0.5, 0.9] // 4s in, 1s hold, 4s out, 1s hold
                  }}
                  style={{ width: '200px', height: '200px' }}
                >
                  {/* Breathing text overlay */}
                  <motion.div
                    className="text-white font-light text-xl text-center"
                    animate={shouldReduceMotion ? {} : {
                      opacity: [0, 1, 1, 0, 0, 1, 1, 0]
                    }}
                    transition={{
                      duration: 10,
                      repeat: Infinity,
                      times: [0, 0.1, 0.35, 0.4, 0.5, 0.6, 0.85, 0.9]
                    }}
                  >
                    <motion.span
                      animate={{
                        opacity: [1, 0, 0, 0, 0, 0, 0, 1]
                      }}
                      transition={{
                        duration: 10,
                        repeat: Infinity,
                        times: [0, 0.4, 0.4, 0.5, 0.5, 0.9, 0.9, 1]
                      }}
                    >
                      Breathe In
                    </motion.span>
                    <motion.span
                      className="absolute inset-0 flex items-center justify-center"
                      animate={{
                        opacity: [0, 0, 0, 0, 1, 0, 0, 0]
                      }}
                      transition={{
                        duration: 10,
                        repeat: Infinity,
                        times: [0, 0.4, 0.4, 0.5, 0.5, 0.9, 0.9, 1]
                      }}
                    >
                      Breathe Out
                    </motion.span>
                  </motion.div>
                </motion.div>
              </div>
            ) : (
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="w-48 h-48 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 shadow-xl flex items-center justify-center"
              >
                <span className="text-6xl">{phase === 'complete' ? '✨' : '🫁'}</span>
              </motion.div>
            )}
          </div>

          {/* Content Card */}
          <AnimatedCard className="p-8 text-center">
            <motion.div
              key={phase}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h2 className="text-2xl font-semibold text-gray-800 mb-2">
                {content.title}
              </h2>
              <p className="text-purple-600 font-medium mb-6">
                {content.subtitle}
              </p>

              <div className="space-y-3 mb-8 text-left">
                {content.instructions.map((instruction, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 + 0.2 }}
                    className="flex items-start gap-3"
                  >
                    <span className="text-purple-400 mt-1">•</span>
                    <span className="text-gray-600 flex-1">{instruction}</span>
                  </motion.div>
                ))}
              </div>

              {phase === 'intro' && (
                <PrimaryButton
                  onClick={startExercise}
                  variant="primary"
                  className="w-full"
                >
                  Begin Exercise
                </PrimaryButton>
              )}

              {phase === 'complete' && (
                <div className="space-y-3">
                  <PrimaryButton
                    onClick={resetExercise}
                    variant="primary"
                    className="w-full"
                  >
                    Practice Again
                  </PrimaryButton>
                  <button
                    onClick={() => nav('/activities')}
                    className="w-full py-2 text-gray-600 hover:text-gray-800 transition-colors"
                  >
                    Back to Activities
                  </button>
                </div>
              )}
            </motion.div>
          </AnimatedCard>

          {/* Pause/Reset controls during exercise */}
          {isActive && phase !== 'complete' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-4 flex gap-3 justify-center"
            >
              <button
                onClick={() => setIsActive(false)}
                className="px-6 py-2 bg-white/80 hover:bg-white rounded-full text-gray-700 font-medium transition-colors"
              >
                Pause
              </button>
              <button
                onClick={resetExercise}
                className="px-6 py-2 bg-white/80 hover:bg-white rounded-full text-gray-700 font-medium transition-colors"
              >
                Reset
              </button>
            </motion.div>
          )}

          {!isActive && phase !== 'intro' && phase !== 'complete' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-4 text-center"
            >
              <PrimaryButton
                onClick={() => setIsActive(true)}
                variant="primary"
                className="px-8"
              >
                Resume
              </PrimaryButton>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  )
}

function Grounding5Senses() {
  const [phase, setPhase] = useState<'intro' | 'senses' | 'body' | 'breath' | 'complete'>('intro')
  const [timeLeft, setTimeLeft] = useState(180) // 3 minutes in seconds
  const [isActive, setIsActive] = useState(false)
  const shouldReduceMotion = useReducedMotion()
  const nav = useNavigate()

  useEffect(() => {
    let interval: number | null = null

    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((time) => {
          const newTime = time - 1
          
          // Update phases based on time remaining - each minute
          if (newTime === 120) setPhase('body') // Minute 2 starts at 2:00
          else if (newTime === 60) setPhase('breath') // Minute 3 starts at 1:00
          else if (newTime === 0) {
            setPhase('complete')
            setIsActive(false)
          }
          
          return newTime
        })
      }, 1000)
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isActive, timeLeft])

  const startExercise = () => {
    setIsActive(true)
    setPhase('senses')
  }

  const resetExercise = () => {
    setIsActive(false)
    setPhase('intro')
    setTimeLeft(180)
  }

  const getPhaseContent = () => {
    switch (phase) {
      case 'intro':
        return {
          title: '3-Minute Grounding',
          subtitle: 'A gentle return to the present',
          instructions: [
            'This 3-minute exercise combines grounding and breathing',
            'Each minute focuses on a different aspect',
            'Follow the prompts and the breathing circle',
            'Allow yourself to settle into the present moment'
          ]
        }
      case 'senses':
        return {
          title: 'Minute 1: Notice Your Senses',
          subtitle: '5-4-3-2-1 grounding',
          instructions: [
            '👁️ Name 5 things you can SEE around you',
            '🖐️ Notice 4 things you can TOUCH or feel',
            '👂 Identify 3 things you can HEAR right now',
            '👃 Acknowledge 2 things you can SMELL',
            '👅 Name 1 thing you can TASTE'
          ]
        }
      case 'body':
        return {
          title: 'Minute 2: Body Awareness',
          subtitle: 'Feel your physical presence',
          instructions: [
            'Feel your feet firmly on the floor',
            'Notice where your body touches the chair',
            'Relax your shoulders, release tension',
            'Soften your jaw, unclench if needed',
            'Feel the weight of your body fully supported'
          ]
        }
      case 'breath':
        return {
          title: 'Minute 3: Calming Breath',
          subtitle: 'Breathe in 4, out 6',
          instructions: [
            'Follow the breathing circle',
            'Breathe IN slowly for 4 counts',
            'Breathe OUT gently for 6 counts',
            'Let each breath calm your nervous system',
            'You are safe, here and now'
          ]
        }
      case 'complete':
        return {
          title: 'You\'re Grounded',
          subtitle: 'Well done',
          instructions: [
            'Notice how you feel now compared to when you started',
            'You\'ve reconnected with the present moment',
            'This is a skill that strengthens with practice',
            'Use this technique whenever you need to feel grounded'
          ]
        }
    }
  }

  const content = getPhaseContent()
  const minutes = Math.floor(timeLeft / 60)
  const seconds = timeLeft % 60

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-green-50 via-teal-50 to-blue-50 z-50 overflow-y-auto">
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        {/* Close button */}
        <button
          onClick={() => nav('/activities')}
          className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center rounded-full bg-white/50 hover:bg-white/80 transition-colors"
        >
          ✕
        </button>

        {/* Timer */}
        {isActive && phase !== 'complete' && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute top-6 left-1/2 -translate-x-1/2 text-2xl font-light text-gray-600"
          >
            {minutes}:{seconds.toString().padStart(2, '0')}
          </motion.div>
        )}

        <div className="max-w-lg w-full">
          {/* Grounding Circle */}
          <div className="flex items-center justify-center mb-8 h-80">
            {isActive && phase !== 'complete' ? (
              <div className="relative">
                {/* Outer glow - different animation based on phase */}
                <motion.div
                  className="absolute inset-0 rounded-full bg-gradient-to-br from-green-400/20 to-teal-400/20 blur-2xl"
                  animate={{
                    scale: shouldReduceMotion ? 1 : phase === 'breath' ? [1, 1.4, 1] : [1, 1.1, 1],
                    opacity: shouldReduceMotion ? 0.3 : phase === 'breath' ? [0.3, 0.6, 0.3] : [0.2, 0.4, 0.2]
                  }}
                  transition={{
                    duration: phase === 'breath' ? 10 : 3,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                  style={{ width: '280px', height: '280px' }}
                />

                {/* Main circle - breathing animation only in breath phase */}
                <motion.div
                  className="relative rounded-full bg-gradient-to-br from-green-400 to-teal-500 shadow-2xl flex items-center justify-center"
                  animate={shouldReduceMotion ? {} : phase === 'breath' ? {
                    scale: [1, 1.5, 1.5, 1], // Full breathing cycle
                  } : {
                    scale: [1, 1.05, 1], // Gentle pulse for other phases
                  }}
                  transition={{
                    duration: phase === 'breath' ? 10 : 3,
                    repeat: Infinity,
                    ease: "easeInOut",
                    times: phase === 'breath' ? [0, 0.4, 0.5, 0.9] : undefined
                  }}
                  style={{ width: '200px', height: '200px' }}
                >
                  {/* Phase-specific content */}
                  {phase === 'breath' ? (
                    <motion.div
                      className="text-white font-light text-xl text-center"
                      animate={shouldReduceMotion ? {} : {
                        opacity: [0, 1, 1, 0, 0, 1, 1, 0]
                      }}
                      transition={{
                        duration: 10,
                        repeat: Infinity,
                        times: [0, 0.1, 0.35, 0.4, 0.5, 0.6, 0.85, 0.9]
                      }}
                    >
                      <motion.span
                        animate={{
                          opacity: [1, 0, 0, 0, 0, 0, 0, 1]
                        }}
                        transition={{
                          duration: 10,
                          repeat: Infinity,
                          times: [0, 0.4, 0.4, 0.5, 0.5, 0.9, 0.9, 1]
                        }}
                      >
                        In 4
                      </motion.span>
                      <motion.span
                        className="absolute inset-0 flex items-center justify-center"
                        animate={{
                          opacity: [0, 0, 0, 0, 1, 0, 0, 0]
                        }}
                        transition={{
                          duration: 10,
                          repeat: Infinity,
                          times: [0, 0.4, 0.4, 0.5, 0.5, 0.9, 0.9, 1]
                        }}
                      >
                        Out 6
                      </motion.span>
                    </motion.div>
                  ) : (
                    <span className="text-5xl">
                      {phase === 'senses' ? '👁️' : phase === 'body' ? '🫂' : '🌿'}
                    </span>
                  )}
                </motion.div>
              </div>
            ) : (
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="w-48 h-48 rounded-full bg-gradient-to-br from-green-400 to-teal-500 shadow-xl flex items-center justify-center"
              >
                <span className="text-6xl">{phase === 'complete' ? '✨' : '🌿'}</span>
              </motion.div>
            )}
          </div>

          {/* Content Card */}
          <AnimatedCard className="p-8 text-center">
            <motion.div
              key={phase}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h2 className="text-2xl font-semibold text-gray-800 mb-2">
                {content.title}
              </h2>
              <p className="text-teal-600 font-medium mb-6">
                {content.subtitle}
              </p>

              <div className="space-y-3 mb-8 text-left">
                {content.instructions.map((instruction, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 + 0.2 }}
                    className="flex items-start gap-3"
                  >
                    <span className="text-teal-400 mt-1">•</span>
                    <span className="text-gray-600 flex-1">{instruction}</span>
                  </motion.div>
                ))}
              </div>

              {phase === 'intro' && (
                <PrimaryButton
                  onClick={startExercise}
                  variant="primary"
                  className="w-full"
                >
                  Begin Exercise
                </PrimaryButton>
              )}

              {phase === 'complete' && (
                <div className="space-y-3">
                  <PrimaryButton
                    onClick={resetExercise}
                    variant="primary"
                    className="w-full"
                  >
                    Practice Again
                  </PrimaryButton>
                  <button
                    onClick={() => nav('/activities')}
                    className="w-full py-2 text-gray-600 hover:text-gray-800 transition-colors"
                  >
                    Back to Activities
                  </button>
                </div>
              )}
            </motion.div>
          </AnimatedCard>

          {/* Pause/Reset controls during exercise */}
          {isActive && phase !== 'complete' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-4 flex gap-3 justify-center"
            >
              <button
                onClick={() => setIsActive(false)}
                className="px-6 py-2 bg-white/80 hover:bg-white rounded-full text-gray-700 font-medium transition-colors"
              >
                Pause
              </button>
              <button
                onClick={resetExercise}
                className="px-6 py-2 bg-white/80 hover:bg-white rounded-full text-gray-700 font-medium transition-colors"
              >
                Reset
              </button>
            </motion.div>
          )}

          {!isActive && phase !== 'intro' && phase !== 'complete' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-4 text-center"
            >
              <PrimaryButton
                onClick={() => setIsActive(true)}
                variant="primary"
                className="px-8"
              >
                Resume
              </PrimaryButton>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  )
}

function GratitudeJournal() {
  const [step, setStep] = useState<1 | 2 | 3 | 'complete'>(1)
  const [presentGratitude, setPresentGratitude] = useState('')
  const [selfAppreciation, setSelfAppreciation] = useState('')
  const [futureLookingForward, setFutureLookingForward] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const nav = useNavigate()

  const getStepContent = () => {
    switch (step) {
      case 1:
        return {
          title: 'Present Gratitude',
          prompt: 'What are you grateful for today?',
          placeholder: 'List things from today that brought you joy, comfort, or peace...\n\nExamples:\n• A warm cup of coffee this morning\n• A conversation with a friend\n• The sunshine through my window',
          value: presentGratitude,
          onChange: setPresentGratitude
        }
      case 2:
        return {
          title: 'Self-Appreciation',
          prompt: 'What did you do well today?',
          placeholder: 'Acknowledge something you did well, no matter how small...\n\nExamples:\n• I was patient with myself when things got hard\n• I reached out to someone I care about\n• I took a break when I needed one',
          value: selfAppreciation,
          onChange: setSelfAppreciation
        }
      case 3:
        return {
          title: 'Future Hope',
          prompt: 'What are you looking forward to?',
          placeholder: 'Name something you\'re looking forward to, big or small...\n\nExamples:\n• Trying a new recipe this weekend\n• A book I\'m reading\n• Spending time with loved ones',
          value: futureLookingForward,
          onChange: setFutureLookingForward
        }
      default:
        return {
          title: 'Present Gratitude',
          prompt: 'What are you grateful for today?',
          placeholder: 'List things from today that brought you joy, comfort, or peace...',
          value: presentGratitude,
          onChange: setPresentGratitude
        }
    }
  }

  const handleNext = () => {
    if (step === 1) setStep(2)
    else if (step === 2) setStep(3)
    else if (step === 3) handleComplete()
  }

  const handleBack = () => {
    if (step === 2) setStep(1)
    else if (step === 3) setStep(2)
  }

  const handleComplete = async () => {
    setIsSaving(true)
    
    try {
      const token = localStorage.getItem('authToken')
      if (!token) {
        // Guest mode - just show completion
        setStep('complete')
        setIsSaving(false)
        return
      }

      // Save to backend
      const response = await fetch('http://localhost:8001/api/gratitude/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          presentGratitude,
          selfAppreciation,
          futureLookingForward,
          completedAt: new Date().toISOString()
        })
      })

      if (response.ok) {
        console.log('Gratitude entry saved successfully')
      } else {
        console.error('Failed to save gratitude entry')
      }
    } catch (error) {
      console.error('Error saving gratitude entry:', error)
    } finally {
      setIsSaving(false)
      setStep('complete')
    }
  }

  const handleRestart = () => {
    setStep(1)
    setPresentGratitude('')
    setSelfAppreciation('')
    setFutureLookingForward('')
  }

  if (step === 'complete') {
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 z-50 overflow-y-auto">
        <div className="min-h-screen flex flex-col items-center justify-center p-4">
          <button
            onClick={() => nav('/activities')}
            className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center rounded-full bg-white/50 hover:bg-white/80 transition-colors"
          >
            ✕
          </button>

          <div className="max-w-2xl w-full">
            <AnimatedCard className="p-8">
              <div className="text-center mb-8">
                <div className="text-6xl mb-4">✨</div>
                <h2 className="text-2xl font-semibold text-gray-800 mb-2">
                  Nice Work!
                </h2>
                <p className="text-gray-600">
                  You just completed a gratitude check-in
                </p>
              </div>

              <div className="space-y-6">
                <div className="bg-amber-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-amber-900 mb-2">🌟 Present Gratitude</h3>
                  <p className="text-gray-700 whitespace-pre-wrap">{presentGratitude || '(Skipped)'}</p>
                </div>

                <div className="bg-orange-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-orange-900 mb-2">🏆 Self-Appreciation</h3>
                  <p className="text-gray-700 whitespace-pre-wrap">{selfAppreciation || '(Skipped)'}</p>
                </div>

                <div className="bg-yellow-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-yellow-900 mb-2">🌈 Future Hope</h3>
                  <p className="text-gray-700 whitespace-pre-wrap">{futureLookingForward || '(Skipped)'}</p>
                </div>
              </div>

              <div className="mt-8 space-y-3">
                <PrimaryButton
                  onClick={handleRestart}
                  variant="primary"
                  className="w-full"
                >
                  Practice Again
                </PrimaryButton>
                <button
                  onClick={() => nav('/activities')}
                  className="w-full py-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Back to Activities
                </button>
              </div>
            </AnimatedCard>
          </div>
        </div>
      </div>
    )
  }

  const content = getStepContent()
  const canProceed = content.value.trim().length > 0

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 z-50 overflow-y-auto">
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        {/* Close button */}
        <button
          onClick={() => nav('/activities')}
          className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center rounded-full bg-white/50 hover:bg-white/80 transition-colors"
        >
          ✕
        </button>

        <div className="max-w-2xl w-full">
          {/* Progress Stepper */}
          <div className="flex items-center justify-center mb-8 gap-2">
            {[1, 2, 3].map((num) => (
              <div key={num} className="flex items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-colors ${
                    step >= num
                      ? 'bg-gradient-to-br from-amber-400 to-orange-500 text-white'
                      : 'bg-white/60 text-gray-400'
                  }`}
                >
                  {num}
                </div>
                {num < 3 && (
                  <div
                    className={`w-16 h-1 mx-1 rounded transition-colors ${
                      step > num ? 'bg-amber-400' : 'bg-white/60'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>

          <AnimatedCard className="p-8">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-semibold text-gray-800 mb-2">
                {content.title}
              </h2>
              <p className="text-lg text-gray-600">
                {content.prompt}
              </p>
            </div>

            <textarea
              value={content.value}
              onChange={(e) => content.onChange(e.target.value)}
              placeholder={content.placeholder}
              className="w-full h-64 p-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent resize-none text-gray-700"
              autoFocus
            />

            <div className="mt-6 flex gap-3">
              {step > 1 && (
                <button
                  onClick={handleBack}
                  className="px-6 py-3 bg-white border-2 border-gray-200 rounded-xl text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                >
                  ← Back
                </button>
              )}
              <PrimaryButton
                onClick={handleNext}
                variant="primary"
                className="flex-1"
                disabled={!canProceed || isSaving}
              >
                {isSaving ? 'Saving...' : step === 3 ? 'Complete' : 'Next →'}
              </PrimaryButton>
            </div>

            <div className="mt-4 text-center">
              <button
                onClick={handleNext}
                className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
              >
                Skip this step →
              </button>
            </div>
          </AnimatedCard>
        </div>
      </div>
    </div>
  )
}

export default function Activities(){
  const [activeCategory, setActiveCategory] = useState('All')
  const shouldReduceMotion = useReducedMotion()
  const filtered = activeCategory === 'All' ? list : list.filter(a => a.category === activeCategory)

  return (
    <Routes>
      <Route path="breathing-3m" element={<Breathing3Min />} />
      <Route path="grounding-5senses" element={<Grounding5Senses />} />
      <Route path="journal-gratitude" element={<GratitudeJournal />} />
      <Route path="/" element={
        <div className="min-h-screen pb-20 relative overflow-hidden" style={{
          background: 'linear-gradient(135deg, #EEF3FF 0%, #F9F5FF 100%)'
        }}>
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

          {/* Decorative pixel elements */}
          <div className="absolute top-10 right-10 w-16 h-16 pixel-box bg-purple-200 opacity-10" />
          <div className="absolute top-40 left-5 w-12 h-12 pixel-box bg-blue-200 opacity-10" />
          <div className="absolute bottom-20 right-20 w-20 h-20 pixel-box bg-purple-300 opacity-10" />

          <div className="max-w-2xl mx-auto px-4 pt-6">
            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6"
            >
              <h2 className="text-4xl font-bold text-gray-800 pixel-text-heading mb-2">Mindful Activities</h2>
              <p className="text-lg text-gray-600 pixel-text">Short practices to calm your mind</p>
            </motion.div>

            {/* Category chips */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="flex gap-2 mb-6 flex-wrap"
            >
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`pixel-button px-6 py-2 text-base font-medium transition-all pixel-text ${
                    activeCategory === cat
                      ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </motion.div>

            {/* Activity cards */}
            <div className="grid gap-4">
              {filtered.map((a, i) => (
                <Link key={a.id} to={a.id}>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 + 0.2 }}
                    className="pixel-card hover-lift bg-white p-6 flex items-center gap-5 cursor-pointer"
                  >
                    <motion.div
                      className="text-5xl"
                      whileHover={shouldReduceMotion ? {} : { scale: 1.1, rotate: 5 }}
                      transition={{ duration: 0.2 }}
                    >
                      {a.icon}
                    </motion.div>
                    <div className="flex-1">
                      <div className="text-lg font-bold text-gray-800 pixel-text-heading mb-1">{a.title}</div>
                      <div className="text-base text-gray-600 pixel-text">{a.duration} minutes · {a.category}</div>
                    </div>
                    <div className="text-gray-400 text-2xl">→</div>
                  </motion.div>
                </Link>
              ))}
            </div>

            {/* Empty state if no activities match filter */}
            {filtered.length === 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="pixel-card bg-white p-8 text-center mt-8"
              >
                <p className="text-lg text-gray-600 pixel-text">No activities found in this category</p>
              </motion.div>
            )}
          </div>
        </div>
      } />
    </Routes>
  )
}
