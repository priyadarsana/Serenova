import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, useReducedMotion } from 'framer-motion'
import AnimatedCard from '../components/AnimatedCard'
import PrimaryButton from '../components/PrimaryButton'

export default function Consent() {
  const [agreedToTerms, setAgreedToTerms] = useState(false)
  const [agreedToPrivacy, setAgreedToPrivacy] = useState(false)
  const nav = useNavigate()
  const shouldReduceMotion = useReducedMotion()

  const handleContinue = () => {
    if (agreedToTerms && agreedToPrivacy) {
      localStorage.setItem('auroraConsent', 'true')
      localStorage.setItem('auroraConsentDate', new Date().toISOString())
      nav('/home')
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-4 p-4">
      <motion.div
        initial={shouldReduceMotion ? {} : { opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <h1 className="text-2xl font-semibold mb-2">Welcome to Aurora Mind</h1>
        <p className="text-slate-600">Before we begin, please review these important points.</p>
      </motion.div>

      <AnimatedCard className="p-6">
        <h3 className="font-semibold mb-3 flex items-center gap-2">
          ⚠️ This is NOT Medical Care
        </h3>
        <div className="space-y-2 text-sm text-slate-700">
          <p>Aurora Mind is a <strong>wellness companion app</strong>, not a medical device or therapy replacement.</p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li>We use AI to help you understand your emotions</li>
            <li>We cannot diagnose mental health conditions</li>
            <li>We cannot prescribe treatments or medications</li>
            <li>We are not a substitute for professional mental healthcare</li>
          </ul>
        </div>
      </AnimatedCard>

      <AnimatedCard delay={0.1} className="p-6">
        <h3 className="font-semibold mb-3 flex items-center gap-2">
          🔒 Your Privacy & Data
        </h3>
        <div className="space-y-2 text-sm text-slate-700">
          <p><strong>What we collect:</strong></p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li>Your check-in conversations and emotional data</li>
            <li>Usage patterns to improve the app experience</li>
            <li>No personally identifiable information unless you provide it</li>
          </ul>
          <p className="mt-3"><strong>How we protect it:</strong></p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li>All data is encrypted in transit (HTTPS)</li>
            <li>Emotion analysis runs locally on your device when possible</li>
            <li>AI chatbot uses local open-source models (Ollama)</li>
            <li>You can delete your data anytime in Settings</li>
          </ul>
          <p className="mt-3"><strong>What we DON'T do:</strong></p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li>We don't sell your data to third parties</li>
            <li>We don't share your conversations with anyone</li>
            <li>We don't use your data for advertising</li>
          </ul>
        </div>
      </AnimatedCard>

      <AnimatedCard delay={0.2} className="p-6">
        <h3 className="font-semibold mb-3 flex items-center gap-2">
          🆘 Crisis Situations
        </h3>
        <div className="space-y-2 text-sm text-slate-700">
          <p>If you are experiencing a mental health crisis or have thoughts of self-harm or suicide:</p>
          <div className="bg-red-50 border border-red-200 rounded p-3 my-3">
            <p className="font-medium text-red-800">Call 988 Suicide & Crisis Lifeline</p>
            <p className="text-red-700 text-xs mt-1">Or text HOME to 741741 · Available 24/7</p>
          </div>
          <p>Our AI will detect crisis keywords and provide emergency resources, but please reach out to professionals immediately.</p>
        </div>
      </AnimatedCard>

      <AnimatedCard delay={0.3} className="p-6">
        <h3 className="font-semibold mb-3">Your Consent</h3>
        <div className="space-y-3">
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={agreedToTerms}
              onChange={(e) => setAgreedToTerms(e.target.checked)}
              className="mt-1"
            />
            <span className="text-sm text-slate-700">
              I understand that Aurora Mind is <strong>not a medical service</strong> and does not replace professional mental healthcare.
            </span>
          </label>

          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={agreedToPrivacy}
              onChange={(e) => setAgreedToPrivacy(e.target.checked)}
              className="mt-1"
            />
            <span className="text-sm text-slate-700">
              I agree to the data collection and privacy practices described above.
            </span>
          </label>
        </div>

        <div className="mt-6">
          <PrimaryButton
            onClick={handleContinue}
            disabled={!agreedToTerms || !agreedToPrivacy}
            className="w-full"
          >
            I Understand - Continue to App
          </PrimaryButton>
        </div>
      </AnimatedCard>

      <p className="text-xs text-center text-slate-500">
        By continuing, you acknowledge that you have read and understood these terms.
      </p>
    </div>
  )
}
