import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, useReducedMotion } from 'framer-motion'
import AnimatedCard from '../components/AnimatedCard'
import PrimaryButton from '../components/PrimaryButton'
import { API_URL } from '../config'

declare global {
  interface Window {
    google: any;
  }
}

export default function Auth(){
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [verificationCode, setVerificationCode] = useState('')
  const [showVerification, setShowVerification] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const googleButtonRef = React.useRef<HTMLDivElement>(null)
  const shouldReduceMotion = useReducedMotion()
  const nav = useNavigate()

  React.useEffect(() => {
    // Initialize Google Sign-In when script loads
    const initGoogle = () => {
      if (typeof window.google !== 'undefined' && window.google.accounts) {
        console.log('Google Sign-In loaded successfully')
        
        // Initialize with callback
        window.google.accounts.id.initialize({
          client_id: '937531731930-1pq2al5stbldo82trdhdherfmhbtb7u2.apps.googleusercontent.com',
          callback: handleGoogleCallback,
          auto_select: false,
        })
        
        // Render the button
        if (googleButtonRef.current) {
          window.google.accounts.id.renderButton(
            googleButtonRef.current,
            {
              theme: 'outline',
              size: 'large',
              width: googleButtonRef.current.offsetWidth,
              text: 'continue_with',
            }
          )
        }
      } else {
        console.warn('Google Sign-In not yet loaded, will retry...')
        setTimeout(initGoogle, 500)
      }
    }
    
    // Wait for script to load
    setTimeout(initGoogle, 1000)
  }, [])

  const handleGoogleCallback = async (response: any) => {
    console.log('Google callback received:', response)
    setLoading(true)
    setError('')
    
    try {
      console.log('Sending credential to backend...')
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 10000) // 10 second timeout
      
      const res = await fetch(`${API_URL}/api/auth/google`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credential: response.credential }),
        signal: controller.signal
      })

      clearTimeout(timeoutId)

      if (!res.ok) {
        const errorText = await res.text()
        console.error('Backend auth failed:', res.status, errorText)
        throw new Error(`Google authentication failed: ${res.status}`)
      }

      const data = await res.json()
      console.log('Google login response:', data)
      
      // Clear OTHER users' chat history (but preserve this user's if returning)
      const newUserId = data.userId
      Object.keys(localStorage).forEach(key => {
        if (key === 'chatHistory') {
          localStorage.removeItem(key) // Remove old global chat
        } else if (key.startsWith('chatHistory_') && key !== `chatHistory_${newUserId}`) {
          localStorage.removeItem(key) // Remove other users' chats
        }
      })
      
      // Save all user data to localStorage
      localStorage.setItem('authToken', data.token)
      localStorage.setItem('userId', data.userId)
      localStorage.setItem('userName', data.name)
      localStorage.setItem('userEmail', data.email)
      localStorage.setItem('provider', data.provider)
      
      // Set joined date if not exists
      if (!localStorage.getItem('joinedDate')) {
        localStorage.setItem('joinedDate', new Date().toISOString())
      }
      
      localStorage.removeItem('guestMode')
      
      // Trigger custom event to update Header
      window.dispatchEvent(new Event('userDataUpdated'))
      
      console.log('Navigating to next page...')
      
      // Check if user has completed assessment
      const hasCompletedAssessment = localStorage.getItem('mentalHealthAssessment')
      nav(hasCompletedAssessment ? '/home' : '/mental-health-assessment')
    } catch (err: any) {
      console.error('Google sign-in error:', err)
      if (err.name === 'AbortError') {
        setError('Request timed out. Please check your connection and try again.')
      } else {
        setError(`Google sign-in failed: ${err.message || 'Please try again.'}`)
      }
    } finally {
      setLoading(false)
    }
  }

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccessMessage('')

    try {
      if (isLogin) {
        // Login flow (no verification needed)
        const response = await fetch(`${API_URL}/api/auth/email-login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password })
        })

        if (!response.ok) {
          throw new Error('Login failed')
        }

        const data = await response.json()
        console.log('Email login response:', data)
        
        // Clear OTHER users' chat history (but preserve this user's if returning)
        const newUserId = data.userId
        Object.keys(localStorage).forEach(key => {
          if (key === 'chatHistory') {
            localStorage.removeItem(key) // Remove old global chat
          } else if (key.startsWith('chatHistory_') && key !== `chatHistory_${newUserId}`) {
            localStorage.removeItem(key) // Remove other users' chats
          }
        })
        
        // Save all user data to localStorage
        localStorage.setItem('authToken', data.token)
        localStorage.setItem('userId', data.userId)
        localStorage.setItem('userName', data.name)
        localStorage.setItem('userEmail', data.email)
        localStorage.setItem('provider', data.provider)
        
        // Set joined date if not exists
        if (!localStorage.getItem('joinedDate')) {
          localStorage.setItem('joinedDate', new Date().toISOString())
        }
        
        localStorage.removeItem('guestMode')
        
        // Trigger custom event to update Header
        window.dispatchEvent(new Event('userDataUpdated'))
        
        // Check if user has completed assessment
        const hasCompletedAssessment = localStorage.getItem('mentalHealthAssessment')
        nav(hasCompletedAssessment ? '/home' : '/mental-health-assessment')
      } else {
        // Signup flow - direct signup without verification
        const response = await fetch(`${API_URL}/api/auth/email-signup`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password, name })
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.detail || 'Signup failed')
        }

        const data = await response.json()
        console.log('Signup response:', data)
        
        // Clear old global chat history only (new user, so no user-specific history exists)
        localStorage.removeItem('chatHistory')
        
        // Save all user data to localStorage
        localStorage.setItem('authToken', data.token)
        localStorage.setItem('userId', data.userId)
        localStorage.setItem('userName', data.name)
        localStorage.setItem('userEmail', data.email)
        localStorage.setItem('provider', data.provider)
        localStorage.setItem('joinedDate', new Date().toISOString())
        
        localStorage.removeItem('guestMode')
        
        // Trigger custom event to update Header
        window.dispatchEvent(new Event('userDataUpdated'))
        
        // New users always go to assessment
        nav('/mental-health-assessment')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Authentication failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const response = await fetch(`${API_URL}/api/auth/verify-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code: verificationCode })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || 'Verification failed')
      }

      const data = await response.json()
      console.log('Verification response:', data)
      
      // Save all user data to localStorage
      localStorage.setItem('authToken', data.token)
      localStorage.setItem('userId', data.userId)
      localStorage.setItem('userName', data.name)
      localStorage.setItem('userEmail', data.email)
      localStorage.setItem('provider', data.provider)
      localStorage.setItem('joinedDate', new Date().toISOString())
      
      localStorage.removeItem('guestMode')
      
      // Trigger custom event to update Header
      window.dispatchEvent(new Event('userDataUpdated'))
      
      nav('/home')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Verification failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
      <div className="max-w-md mx-auto mt-12">
        <AnimatedCard className="p-8">
          <motion.div
            initial={shouldReduceMotion ? {} : { opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.3 }}
          >
            <h1 className="text-3xl font-bold bg-gradient-to-r from-[var(--color-primary)] to-purple-500 bg-clip-text text-transparent">
              Serenova 
            </h1>
            <p className="text-slate-500 mt-2">
              {isLogin ? 'Welcome back! Sign in to continue.' : 'Create your account to get started.'}
            </p>
          </motion.div>

          {error && (
            <motion.div 
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700"
            >
              {error}
            </motion.div>
          )}

          {successMessage && (
            <motion.div 
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700"
            >
              {successMessage}
            </motion.div>
          )}

          {showVerification ? (
            <form onSubmit={handleVerifyCode} className="mt-6 space-y-4">
              <div className="text-center mb-4">
                <h2 className="text-xl font-semibold text-slate-800">Verify Your Email</h2>
                <p className="text-sm text-slate-600 mt-2">
                  Enter the 6-digit code sent to <strong>{email}</strong>
                </p>
              </div>

              <input 
                className="w-full p-4 border-2 border-slate-200 rounded-[var(--radius-md)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] text-center text-2xl font-bold letter-spacing-wide" 
                placeholder="000000"
                type="text"
                maxLength={6}
                pattern="[0-9]{6}"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
                required
              />

              <PrimaryButton 
                type="submit"
                variant="primary" 
                className="w-full"
                disabled={loading || verificationCode.length !== 6}
              >
                {loading ? 'Verifying...' : 'Verify & Sign Up'}
              </PrimaryButton>

              <button
                type="button"
                onClick={() => {
                  setShowVerification(false)
                  setVerificationCode('')
                  setError('')
                  setSuccessMessage('')
                }}
                className="w-full text-sm text-slate-600 hover:text-[var(--color-primary)] transition-colors"
              >
                ← Back to sign up
              </button>
            </form>
          ) : (
            <>
            <form onSubmit={handleEmailAuth} className="mt-6 space-y-3">
            {!isLogin && (
              <input 
                className="w-full p-3 border border-slate-200 rounded-[var(--radius-md)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]" 
                placeholder="Full Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required={!isLogin}
              />
            )}
            
            <input 
              className="w-full p-3 border border-slate-200 rounded-[var(--radius-md)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]" 
              placeholder="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            
            <input 
              className="w-full p-3 border border-slate-200 rounded-[var(--radius-md)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]" 
              placeholder="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
            />
            
            <PrimaryButton 
              type="submit"
              variant="primary" 
              className="w-full"
              disabled={loading}
            >
              {loading ? 'Please wait...' : (isLogin ? 'Log in' : 'Submit & Sign up')}
            </PrimaryButton>
          </form>

          <div className="mt-4 text-center text-sm text-slate-500">
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <button
              onClick={() => {
                setIsLogin(!isLogin)
                setError('')
                setSuccessMessage('')
                setShowVerification(false)
              }}
              className="text-[var(--color-primary)] font-medium hover:underline"
            >
              {isLogin ? 'Sign up' : 'Log in'}
            </button>
          </div>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-slate-500">Or continue with</span>
            </div>
          </div>

          {/* Google Sign-In Button - Rendered by Google */}
          <div ref={googleButtonRef} className="w-full"></div>

          <div className="mt-6 text-xs text-slate-500 text-center">
            By continuing, you agree to our{' '}
            <a href="#" className="text-[var(--color-primary)] hover:underline">Terms of Service</a>
            {' '}and{' '}
            <a href="#" className="text-[var(--color-primary)] hover:underline">Privacy Policy</a>
          </div>
          </>
          )}
        </AnimatedCard>
      </div>
  )
}
