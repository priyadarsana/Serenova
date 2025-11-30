import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, useReducedMotion } from 'framer-motion'

const moods = [
  { emoji: '😢', label: 'Very Sad', value: 1 },
  { emoji: '😔', label: 'Sad', value: 2 },
  { emoji: '😐', label: 'Neutral', value: 3 },
  { emoji: '🙂', label: 'Good', value: 4 },
  { emoji: '😊', label: 'Great', value: 5 }
]

const suggestions = [
  { text: 'Try a 3-minute breathing break', action: '/activities/breathing', type: 'breathing' },
  { text: 'Do a quick grounding exercise', action: '/activities/grounding', type: 'grounding' },
  { text: 'Write in your gratitude journal', action: '/activities/journal-gratitude', type: 'gratitude' }
]

export default function Support() {
  const shouldReduceMotion = useReducedMotion()
  const nav = useNavigate()
  const [selectedMood, setSelectedMood] = useState<number | null>(null)
  const [todaySuggestion] = useState(suggestions[Math.floor(Math.random() * suggestions.length)])
  const [userName, setUserName] = useState('Friend')

  useEffect(() => {
    const name = localStorage.getItem('userName')
    if (name) {
      const firstName = name.split(' ')[0]
      setUserName(firstName)
    }
  }, [])

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good morning'
    if (hour < 18) return 'Good afternoon'
    return 'Good evening'
  }

  const handleMoodSelect = (value: number) => {
    setSelectedMood(value)
    // Save mood to backend/localStorage
    const moodEntry = {
      date: new Date().toISOString(),
      mood: value,
      timestamp: Date.now()
    }
    const existingMoods = JSON.parse(localStorage.getItem('moodHistory') || '[]')
    existingMoods.push(moodEntry)
    localStorage.setItem('moodHistory', JSON.stringify(existingMoods))
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: shouldReduceMotion ? 0 : 0.08
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: shouldReduceMotion ? 0 : 0.24,
        ease: [0.25, 0.8, 0.25, 1]
      }
    }
  }

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

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-[600px] mx-auto px-4 py-6 space-y-6"
      >
        {/* Section 1: Welcome Panel */}
        <motion.div 
          variants={itemVariants}
          className="pixel-card bg-white/90 backdrop-blur-sm p-6 relative overflow-hidden group"
        >
          {/* Animated gradient background */}
          <div className="absolute inset-0 opacity-5 bg-gradient-to-br from-purple-400 via-blue-400 to-purple-400 bg-[length:200%_200%] animate-gradient-slow"></div>
          
          <div className="relative flex items-start justify-between gap-4">
            <div className="flex-1">
              <p className="text-lg text-gray-500 pixel-text">{getGreeting()},</p>
              <h1 className="text-4xl font-bold mt-1 mb-2 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent pixel-text-heading">
                {userName}
              </h1>
              <p className="text-gray-600 text-base pixel-text">Let's do a gentle check‑in.</p>
              
              {/* Profile context */}
              <div className="mt-4 pt-4 border-t border-gray-200">
                <button 
                  onClick={() => nav('/profile')}
                  className="text-xs text-purple-600 hover:text-purple-700 flex items-center gap-1 pixel-text transition-colors"
                >
                  <span className="pixel-box w-2 h-2 bg-purple-600 inline-block mr-1"></span>
                  Focus area: Mental wellness
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Avatar with status */}
            <div className="relative flex-shrink-0">
              <div className="w-14 h-14 pixel-box bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white text-xl font-bold">
                {userName.charAt(0)}
              </div>
              <div className="absolute -bottom-1 -right-1 w-4 h-4 pixel-box bg-green-400 border-2 border-white"></div>
            </div>
          </div>
        </motion.div>

        {/* Section 2: Today's Support (Main Actions) */}
        <div className="space-y-4">
          

          {/* Card B: Talk to Aurora */}
          <motion.div
            variants={itemVariants}
            className="pixel-card bg-white/90 backdrop-blur-sm p-6 hover-lift cursor-pointer group relative overflow-hidden"
            onClick={() => nav('/support/bot')}
          >
            <div className="flex items-start gap-4">
              <div className="pixel-box w-12 h-12 bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white text-2xl flex-shrink-0 pulse-subtle">
                💬
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-gray-800 pixel-text-heading mb-1">Chat with Aurora</h3>
                <p className="text-base text-gray-600 pixel-text mb-4">A safe space to talk through what's on your mind.</p>
                <button className="pixel-button bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-2 font-semibold hover:shadow-lg transition-shadow">
                  Open chat
                </button>
              </div>
            </div>
          </motion.div>

          {/* Secondary Links */}
          <motion.div 
            variants={itemVariants}
            className="flex flex-wrap gap-4 px-2"
          >
            <button
              onClick={() => nav('/voice-analysis')}
              className="text-sm text-gray-600 hover:text-purple-600 flex items-center gap-2 pixel-text transition-colors"
            >
              <span className="pixel-box w-3 h-3 bg-purple-500"></span>
              Voice stress analysis
            </button>
            <button
              onClick={() => nav('/insights')}
              className="text-sm text-gray-600 hover:text-purple-600 flex items-center gap-2 pixel-text transition-colors"
            >
              <span className="pixel-box w-3 h-3 bg-blue-500"></span>
              View past check‑ins & insights
            </button>
          </motion.div>
        </div>

        {/* Section 3: Mood & Gentle Suggestion */}
        <div className="space-y-4">
          {/* A. Mood Row */}
          <motion.div
            variants={itemVariants}
            className="pixel-card bg-white/90 backdrop-blur-sm p-6"
          >
<h3 className="text-base font-semibold text-gray-700 pixel-text mb-3">How does today feel?</h3>
            <div className="flex justify-between gap-2 mb-3">
              {moods.map((mood) => (
                <motion.button
                  key={mood.value}
                  onClick={() => handleMoodSelect(mood.value)}
                  className={`pixel-box flex-1 aspect-square flex flex-col items-center justify-center transition-all ${
                    selectedMood === mood.value
                      ? 'bg-purple-100 border-2 border-purple-500'
                      : 'bg-gray-50 hover:bg-gray-100'
                  }`}
                  whileHover={{ scale: shouldReduceMotion ? 1 : 1.05 }}
                  whileTap={{ scale: shouldReduceMotion ? 1 : 0.95 }}
                  animate={selectedMood === mood.value && !shouldReduceMotion ? {
                    scale: [1, 1.1, 1],
                    transition: { duration: 0.3 }
                  } : {}}
                >
                  <span className="text-2xl mb-1">{mood.emoji}</span>
                  <span className="text-xs text-gray-600 pixel-text">{mood.label}</span>
                </motion.button>
              ))}
            </div>
            <p className="text-xs text-gray-500 text-center pixel-text">Tap once to save today's mood</p>
          </motion.div>

          {/* B. Today's Suggestion */}
          <motion.div
            variants={itemVariants}
            className="pixel-card bg-gradient-to-br from-purple-50 to-blue-50 p-6"
          >
            <p className="text-sm text-gray-500 pixel-text mb-2">Today's gentle suggestion</p>
            <div className="flex items-center gap-4">
              {/* Breathing dot animation */}
              <div className="relative flex-shrink-0">
                <motion.div
                  className="w-10 h-10 pixel-box bg-gradient-to-br from-purple-400 to-blue-400"
                  animate={shouldReduceMotion ? {} : {
                    scale: [1, 1.2, 1],
                    opacity: [0.8, 1, 0.8]
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                />
              </div>
              
              <div className="flex-1">
                <p className="text-base font-semibold text-gray-800 pixel-text mb-3">{todaySuggestion.text}</p>
                <button
                  onClick={() => nav(todaySuggestion.action)}
                  className="pixel-button bg-white text-purple-600 px-4 py-2 text-sm font-semibold hover:shadow-md transition-shadow border-2 border-purple-300"
                >
                  Start now
                </button>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Crisis Resources - Compact */}
        <motion.div
          variants={itemVariants}
          className="pixel-card bg-red-50/90 backdrop-blur-sm p-6 border-2 border-red-300"
        >
          <h3 className="font-bold text-red-800 pixel-text mb-2 flex items-center gap-2">
            <span className="pixel-box w-6 h-6 bg-red-500 flex items-center justify-center text-white text-xs">!</span>
            In Immediate Crisis?
          </h3>
          <p className="text-sm text-red-700 pixel-text mb-3">
            If you're in danger, please reach out right now.
          </p>
          <div className="space-y-2">
            <a
              href="tel:988"
              className="block pixel-button bg-red-600 text-white text-center py-2 px-4 font-semibold hover:shadow-lg transition-shadow"
            >
              📞 Call 988 Crisis Lifeline
            </a>
            <a
              href="tel:911"
              className="block pixel-button bg-gray-800 text-white text-center py-2 px-4 font-semibold hover:shadow-lg transition-shadow"
            >
              🚨 Call 911 Emergency
            </a>
          </div>
        </motion.div>

      </motion.div>

      {/* Pixel Art CSS Styles */}
      <style>{`
        .pixel-box {
          box-shadow: 
            2px 0 0 0 rgba(0,0,0,0.1),
            0 2px 0 0 rgba(0,0,0,0.1),
            2px 2px 0 0 rgba(0,0,0,0.1),
            inset -2px -2px 0 0 rgba(0,0,0,0.05);
        }

        .pixel-card {
          border-radius: 0;
          box-shadow: 
            4px 0 0 0 rgba(0,0,0,0.1),
            0 4px 0 0 rgba(0,0,0,0.1),
            4px 4px 0 0 rgba(0,0,0,0.1),
            8px 8px 0 0 rgba(0,0,0,0.05);
          transition: all 0.18s cubic-bezier(0.25, 0.8, 0.25, 1);
        }

        .pixel-card.hover-lift:hover {
          transform: translateY(-4px);
          box-shadow: 
            4px 0 0 0 rgba(0,0,0,0.15),
            0 4px 0 0 rgba(0,0,0,0.15),
            4px 4px 0 0 rgba(0,0,0,0.15),
            8px 8px 0 0 rgba(0,0,0,0.1),
            12px 12px 0 0 rgba(0,0,0,0.05);
        }

        .pixel-button {
          border-radius: 0;
          box-shadow: 
            3px 0 0 0 rgba(0,0,0,0.15),
            0 3px 0 0 rgba(0,0,0,0.15),
            3px 3px 0 0 rgba(0,0,0,0.15);
          transition: all 0.18s cubic-bezier(0.25, 0.8, 0.25, 1);
        }

        .pixel-button:active {
          transform: scale(0.97);
        }

        .pixel-text {
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
          letter-spacing: 0.3px;
        }

        .pulse-subtle {
          animation: pulse-subtle 2.5s ease-in-out infinite;
        }

        @keyframes pulse-subtle {
          0%, 100% {
            transform: scale(1);
            opacity: 1;
          }
          50% {
            transform: scale(1.03);
            opacity: 0.95;
          }
        }

        @keyframes gradient-slow {
          0%, 100% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
        }

        .animate-gradient-slow {
          animation: gradient-slow 25s ease infinite;
        }

        @media (prefers-reduced-motion: reduce) {
          .pixel-card.hover-lift:hover {
            transform: none;
          }
          .pulse-subtle {
            animation: none;
          }
          .animate-gradient-slow {
            animation: none;
          }
        }
      `}</style>
    </div>
  )
}

