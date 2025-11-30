import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, useReducedMotion } from 'framer-motion'
import AnimatedCard from '../components/AnimatedCard'
import PrimaryButton from '../components/PrimaryButton'
import MoodSlider from '../components/MoodSlider'

export default function Home(){
  const nav = useNavigate()
  const shouldReduceMotion = useReducedMotion()
  
  
  useEffect(() => {
    const isAuthenticated = localStorage.getItem('authToken')
    if (!isAuthenticated) {
      nav('/', { replace: true })
    }
  }, [nav])
  
  
  const userName = localStorage.getItem('userName') || 'Friend'
  const firstName = userName.split(' ')[0]
  const currentHour = new Date().getHours()
  const greeting = currentHour < 12 ? 'Good morning' : currentHour < 18 ? 'Good afternoon' : 'Good evening'

  // Load assessment data
  const getAssessmentSummary = () => {
    try {
      const savedAssessment = localStorage.getItem('mentalHealthAssessment')
      if (savedAssessment) {
        return JSON.parse(savedAssessment)
      }
    } catch (error) {
      console.error('Failed to load assessment:', error)
    }
    return null
  }

  const assessmentData = getAssessmentSummary()

  return (
    <div 
      className="min-h-screen pb-24 relative overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, #EEF3FF 0%, #F9F5FF 100%)'
      }}
    >
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

      <div className="max-w-[600px] mx-auto px-4 py-6 space-y-6 relative">
        {/* Animated greeting */}
        <motion.div
          initial={shouldReduceMotion ? {} : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.25, 0.8, 0.25, 1] }}
          className="pixel-card bg-white/90 backdrop-blur-sm p-6"
        >
          <div className="absolute inset-0 opacity-5 bg-gradient-to-br from-purple-400 via-blue-400 to-purple-400 bg-[length:200%_200%] animate-gradient-slow"></div>
          <div className="relative text-center">
            <p className="text-lg text-gray-500 pixel-text">{greeting},</p>
            <h1 className="text-4xl font-bold mt-1 mb-2 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent pixel-text-heading">{firstName}</h1>
            <p className="text-gray-600 text-base pixel-text">Let's do a gentle check‑in.</p>
          </div>
        </motion.div>

        {/* Assessment Summary Card */}
        {assessmentData && (
          <motion.div
            initial={shouldReduceMotion ? {} : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05, duration: 0.3 }}
            className="pixel-card bg-gradient-to-br from-purple-50 to-blue-50 p-5"
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-gray-800 pixel-text">📋 Your Profile</h3>
              <button
                onClick={() => nav('/insights')}
                className="text-xs text-purple-600 hover:text-purple-700 font-semibold pixel-text"
              >
                View Details →
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="pixel-box bg-white bg-opacity-80 p-2">
                <div className="text-xs text-gray-500 pixel-text">Age</div>
                <div className="font-medium capitalize pixel-text">{assessmentData.ageRange.replace('-', '–')}</div>
              </div>
              <div className="pixel-box bg-white bg-opacity-80 p-2">
                <div className="text-xs text-gray-500 pixel-text">Previous Support</div>
                <div className="font-medium pixel-text">{assessmentData.previousTreatment}</div>
              </div>
            </div>
            {assessmentData.mainFactors && assessmentData.mainFactors.length > 0 && (
              <div className="mt-3">
                <div className="text-xs text-gray-600 mb-2 pixel-text">Focus Areas:</div>
                <div className="flex flex-wrap gap-1">
                  {assessmentData.mainFactors.slice(0, 3).map((factor: string, i: number) => (
                    <span key={i} className="pixel-box px-2 py-1 bg-purple-100 text-purple-700 text-xs pixel-text">
                      {factor}
                    </span>
                  ))}
                  {assessmentData.mainFactors.length > 3 && (
                    <span className="pixel-box px-2 py-1 bg-gray-100 text-gray-600 text-xs pixel-text">
                      +{assessmentData.mainFactors.length - 3}
                    </span>
                  )}
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* Chat with Aurora Button */}
        <motion.div
          initial={shouldReduceMotion ? {} : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.3 }}
          className="pixel-card bg-white/90 backdrop-blur-sm p-6 hover-lift cursor-pointer"
          onClick={() => nav('/support/bot')}
        >
          <div className="flex items-center gap-4">
            <div className="pixel-box w-16 h-16 bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white text-3xl flex-shrink-0 pulse-subtle">
              ✨
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-gray-800 pixel-text-heading mb-1">Chat with Aurora</h3>
              <p className="text-base text-gray-600 pixel-text">Your AI mental health companion</p>
            </div>
          </div>
        </motion.div>

        {/* Assessment Card */}
        <motion.div
          initial={shouldReduceMotion ? {} : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.3 }}
          className="pixel-card bg-white/90 backdrop-blur-sm p-6 hover-lift cursor-pointer"
          onClick={() => nav('/assessment')}
        >
          <div className="flex items-center gap-4">
            <div className="pixel-box w-16 h-16 bg-gradient-to-br from-pink-400 to-purple-500 flex items-center justify-center text-white text-3xl flex-shrink-0">
              📋
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-gray-800 pixel-text-heading mb-1">Mental Health Assessment</h3>
              <p className="text-base text-gray-600 pixel-text">Quick check-in questionnaire</p>
            </div>
          </div>
        </motion.div>

        {/* Conversation history button */}
        <motion.div
          initial={shouldReduceMotion ? {} : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.3 }}
          className="pixel-card bg-white/90 backdrop-blur-sm p-6 hover-lift cursor-pointer"
          onClick={() => nav('/conversations')}
        >
          <div className="flex items-center gap-4">
            <div className="pixel-box w-16 h-16 bg-gradient-to-br from-green-400 to-teal-500 flex items-center justify-center text-white text-3xl flex-shrink-0">
              📚
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-gray-800 pixel-text-heading mb-1">Conversation History</h3>
              <p className="text-base text-gray-600 pixel-text">View past chats & analysis</p>
            </div>
          </div>
        </motion.div>

        {/* Voice Stress Analysis */}
        <motion.div
          initial={shouldReduceMotion ? {} : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.3 }}
          className="pixel-card bg-gradient-to-br from-indigo-50 to-purple-50 p-6 hover-lift cursor-pointer"
          onClick={() => nav('/voice-analysis')}
        >
          <div className="flex items-center gap-4">
            <div className="pixel-box w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white text-3xl flex-shrink-0">
              🎤
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-gray-800 pixel-text-heading mb-1">Voice Stress Analysis</h3>
              <p className="text-base text-gray-600 pixel-text">Record & analyze your voice</p>
            </div>
          </div>
        </motion.div>

        {/* Daily mood tracker */}
        <motion.div
          initial={shouldReduceMotion ? {} : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.3 }}
          className="pixel-card bg-white/90 backdrop-blur-sm p-5"
        >
          <div className="text-sm text-slate-500 mb-3 text-center pixel-text">Tap your mood</div>
          <MoodSlider onSelect={(i) => console.log('Mood selected:', i)} />
        </motion.div>

        {/* Today's suggestion */}
        <motion.div
          initial={shouldReduceMotion ? {} : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.3 }}
          className="pixel-card bg-gradient-to-br from-purple-50 to-blue-50 p-5"
        >
          <div className="text-xs text-slate-500 mb-2 pixel-text">Today's gentle suggestion</div>
          <p className="text-base mb-3 pixel-text">Try a 3‑minute breathing break.</p>
          <button
            onClick={() => nav('/activities/breathing-3m')}
            className="pixel-button bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-2 font-semibold hover:shadow-lg transition-shadow"
          >
            Start now
          </button>
        </motion.div>
      </div>
    </div>
  )
}
