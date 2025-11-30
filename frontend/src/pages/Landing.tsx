import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, useReducedMotion } from 'framer-motion'

export default function Landing() {
  const [showContent, setShowContent] = useState(false)
  const shouldReduceMotion = useReducedMotion()
  const nav = useNavigate()

  useEffect(() => {
    // Redirect to home if already authenticated
    const isAuthenticated = localStorage.getItem('authToken')
    if (isAuthenticated) {
      nav('/home', { replace: true })
      return
    }
    
    const timer = setTimeout(() => setShowContent(true), 500)
    return () => clearTimeout(timer)
  }, [nav])

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.3,
        delayChildren: 0.2
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: 'easeOut'
      }
    }
  }

  const floatingVariants = {
    initial: { y: 0 },
    animate: {
      y: [-10, 10, -10],
      transition: {
        duration: 6,
        repeat: Infinity,
        ease: 'easeInOut'
      }
    }
  }

  const pulseVariants = {
    initial: { scale: 1, opacity: 0.3 },
    animate: {
      scale: [1, 1.2, 1],
      opacity: [0.3, 0.6, 0.3],
      transition: {
        duration: 4,
        repeat: Infinity,
        ease: 'easeInOut'
      }
    }
  }

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          variants={pulseVariants}
          initial="initial"
          animate="animate"
          className="absolute top-20 left-20 w-72 h-72 bg-blue-400 rounded-full blur-3xl"
        />
        <motion.div
          variants={pulseVariants}
          initial="initial"
          animate="animate"
          style={{ animationDelay: '1s' }}
          className="absolute bottom-20 right-20 w-96 h-96 bg-purple-400 rounded-full blur-3xl"
        />
        <motion.div
          variants={pulseVariants}
          initial="initial"
          animate="animate"
          style={{ animationDelay: '2s' }}
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-pink-300 rounded-full blur-3xl"
        />
      </div>

      {/* Main Content */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate={showContent ? "visible" : "hidden"}
        className="relative z-10 flex flex-col items-center justify-center min-h-screen px-6 text-center"
      >
        {/* Logo/Icon */}
        <motion.div
          variants={floatingVariants}
          initial="initial"
          animate="animate"
          className="mb-8"
        >
          <div className="w-24 h-24 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-3xl flex items-center justify-center shadow-2xl">
            <svg
              className="w-14 h-14 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
              />
            </svg>
          </div>
        </motion.div>

        {/* Welcome Message */}
        <motion.h1
          variants={itemVariants}
          className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-4"
        >
          Welcome to Serenova
        </motion.h1>

        <motion.p
          variants={itemVariants}
          className="text-xl md:text-2xl text-slate-700 mb-3 max-w-2xl"
        >
          Your personal mental wellness companion
        </motion.p>

        <motion.p
          variants={itemVariants}
          className="text-lg text-slate-600 mb-12 max-w-xl leading-relaxed"
        >
          Take a moment for yourself. We're here to support your journey to mental wellness with compassion, understanding, and personalized care.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          variants={itemVariants}
          className="w-full max-w-md"
        >
          <motion.button
            whileHover={{ scale: 1.05, boxShadow: '0 20px 40px rgba(0,0,0,0.15)' }}
            whileTap={{ scale: 0.95 }}
            onClick={() => nav('/auth')}
            className="w-full px-8 py-4 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white text-lg font-semibold rounded-2xl shadow-lg transition-all"
          >
            Get Started
          </motion.button>
        </motion.div>

        {/* Features */}
        <motion.div
          variants={itemVariants}
          className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl"
        >
          <motion.div
            whileHover={{ y: -5 }}
            className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg"
          >
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4 mx-auto">
              <svg className="w-7 h-7 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-slate-800 mb-2">Personalized Support</h3>
            <p className="text-slate-600 text-sm">AI-powered insights tailored to your unique journey</p>
          </motion.div>

          <motion.div
            whileHover={{ y: -5 }}
            className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg"
          >
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-4 mx-auto">
              <svg className="w-7 h-7 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-slate-800 mb-2">Private & Secure</h3>
            <p className="text-slate-600 text-sm">Your wellness journey is completely confidential</p>
          </motion.div>

          <motion.div
            whileHover={{ y: -5 }}
            className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg"
          >
            <div className="w-12 h-12 bg-pink-100 rounded-xl flex items-center justify-center mb-4 mx-auto">
              <svg className="w-7 h-7 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-slate-800 mb-2">24/7 Available</h3>
            <p className="text-slate-600 text-sm">Access support whenever you need it, day or night</p>
          </motion.div>
        </motion.div>

        {/* Floating Message */}
        <motion.p
          variants={itemVariants}
          className="mt-12 text-sm text-slate-500 italic"
        >
          "You are stronger than you know, braver than you believe, and loved more than you can imagine."
        </motion.p>
      </motion.div>
    </div>
  )
}
