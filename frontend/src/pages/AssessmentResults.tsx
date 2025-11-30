import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import AnimatedCard from '../components/AnimatedCard'
import PrimaryButton from '../components/PrimaryButton'
import { useUser } from '../contexts/UserContext'

interface AssessmentResults {
  depressionScore: number
  depressionLevel: string
  anxietyScore: number
  anxietyLevel: string
  stressScore: number
  stressLevel: string
  totalScore: number
  maxTotalScore: number
  riskLevel: string
  summary: string
}

export default function AssessmentResults() {
  const [results, setResults] = useState<AssessmentResults | null>(null)
  const [saved, setSaved] = useState(false)
  const { addAssessment } = useUser()
  const nav = useNavigate()

  useEffect(() => {
    const stored = sessionStorage.getItem('assessmentResults')
    if (stored) {
      const parsedResults = JSON.parse(stored)
      setResults(parsedResults)
      
      // Auto-save to user profile
      saveToProfile(parsedResults)
    } else {
      nav('/assessment')
    }
  }, [nav])

  const saveToProfile = async (results: AssessmentResults) => {
    try {
      await addAssessment({
        depressionScore: results.depressionScore,
        anxietyScore: results.anxietyScore,
        stressScore: results.stressScore,
        overallScore: results.totalScore,
        severity: results.riskLevel
      })
      setSaved(true)
      console.log('✅ Assessment saved to user profile')
    } catch (error) {
      console.error('Failed to save assessment:', error)
    }
  }

  if (!results) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  }

  const getColorClass = (level: string) => {
    switch (level.toLowerCase()) {
      case 'minimal': return 'bg-green-100 text-green-800 border-green-300'
      case 'mild': return 'bg-yellow-100 text-yellow-800 border-yellow-300'
      case 'moderate': return 'bg-orange-100 text-orange-800 border-orange-300'
      case 'severe': return 'bg-red-100 text-red-800 border-red-300'
      default: return 'bg-gray-100 text-gray-800 border-gray-300'
    }
  }

  const getRecommendation = () => {
    if (results.riskLevel === 'high') {
      return {
        title: '🚨 Immediate Support Recommended',
        message: 'Your responses indicate significant distress. Please consider talking to a mental health professional soon. In the meantime, our AI support can provide helpful coping strategies.',
        urgency: 'high'
      }
    } else if (results.riskLevel === 'medium') {
      return {
        title: '⚠️ Support Recommended',
        message: 'Your responses suggest moderate concerns. Talking to someone can help. Our AI support bot can provide coping strategies and emotional support.',
        urgency: 'medium'
      }
    } else {
      return {
        title: '✅ Preventive Care',
        message: 'Your responses suggest minimal concerns. Maintaining good mental health habits is important. Our AI support can help you build resilience and manage daily stress.',
        urgency: 'low'
      }
    }
  }

  const recommendation = getRecommendation()

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-4">
      <div className="max-w-3xl mx-auto pt-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Your Assessment Results
          </h1>
          <p className="text-gray-600">
            Based on your responses over the past 2 weeks
          </p>
        </motion.div>

        {/* Overall Score */}
        <AnimatedCard className="p-6 mb-6 text-center">
          <h2 className="text-lg font-semibold text-gray-700 mb-3">Overall Score</h2>
          <div className="text-5xl font-bold text-purple-600 mb-2">
            {results.totalScore}/{results.maxTotalScore}
          </div>
          <div className="text-gray-600">Total Assessment Score</div>
        </AnimatedCard>

        {/* Category Breakdown */}
        <div className="grid md:grid-cols-3 gap-4 mb-6">
          <AnimatedCard className="p-5">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-2xl">🧠</span>
              <h3 className="font-semibold text-gray-800">Depression</h3>
            </div>
            <div className="text-2xl font-bold text-blue-600 mb-2">
              {results.depressionScore}/12
            </div>
            <div className={`inline-block px-3 py-1 rounded-full text-sm font-medium border ${getColorClass(results.depressionLevel)}`}>
              {results.depressionLevel}
            </div>
          </AnimatedCard>

          <AnimatedCard className="p-5">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-2xl">💜</span>
              <h3 className="font-semibold text-gray-800">Anxiety</h3>
            </div>
            <div className="text-2xl font-bold text-purple-600 mb-2">
              {results.anxietyScore}/12
            </div>
            <div className={`inline-block px-3 py-1 rounded-full text-sm font-medium border ${getColorClass(results.anxietyLevel)}`}>
              {results.anxietyLevel}
            </div>
          </AnimatedCard>

          <AnimatedCard className="p-5">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-2xl">⚡</span>
              <h3 className="font-semibold text-gray-800">Stress</h3>
            </div>
            <div className="text-2xl font-bold text-pink-600 mb-2">
              {results.stressScore}/12
            </div>
            <div className={`inline-block px-3 py-1 rounded-full text-sm font-medium border ${getColorClass(results.stressLevel)}`}>
              {results.stressLevel}
            </div>
          </AnimatedCard>
        </div>

        {/* Recommendation */}
        <AnimatedCard className={`p-6 mb-6 border-2 ${
          recommendation.urgency === 'high' ? 'bg-red-50 border-red-300' :
          recommendation.urgency === 'medium' ? 'bg-yellow-50 border-yellow-300' :
          'bg-green-50 border-green-300'
        }`}>
          <div className="flex items-start gap-3 mb-3">
            {recommendation.urgency === 'high' && <span className="text-2xl">⚠️</span>}
            <div>
              <h3 className="font-bold text-lg mb-2">{recommendation.title}</h3>
              <p className="text-gray-700">{recommendation.message}</p>
            </div>
          </div>
        </AnimatedCard>

        {/* High Risk Warning */}
        {results.riskLevel === 'high' && (
          <AnimatedCard className="p-6 mb-6 bg-red-50 border-2 border-red-300">
            <h3 className="font-bold text-red-800 mb-3 flex items-center gap-2">
              <span className="text-xl">🚨</span>
              Crisis Resources Available
            </h3>
            <div className="space-y-2 text-sm text-red-800">
              <p><strong>988 Suicide & Crisis Lifeline:</strong> Call or text 988</p>
              <p><strong>Crisis Text Line:</strong> Text "HELLO" to 741741</p>
              <p><strong>Emergency:</strong> Call 911 or go to nearest ER</p>
            </div>
          </AnimatedCard>
        )}

        {/* Action Buttons */}
        <div className="space-y-3 mb-6">
          <PrimaryButton
            onClick={() => nav('/support/bot')}
            className="w-full py-4 text-lg"
          >
            🤖 Talk to AI Support Bot
          </PrimaryButton>

          <button
            onClick={() => nav('/support')}
            className="w-full py-3 rounded-xl border-2 border-purple-300 hover:bg-purple-50 transition-colors font-medium text-purple-700"
          >
            📞 View Crisis Resources & Helplines
          </button>

          <button
            onClick={() => nav('/activities')}
            className="w-full py-3 rounded-xl border-2 border-blue-300 hover:bg-blue-50 transition-colors font-medium text-blue-700"
          >
            🧘 Explore Coping Activities
          </button>
        </div>

        {/* Disclaimer */}
        <AnimatedCard className="p-4 bg-gray-50 border border-gray-200">
          <p className="text-xs text-gray-600 text-center">
            <strong>Disclaimer:</strong> This assessment is a screening tool, not a clinical diagnosis. Results should be discussed with a qualified mental health professional for proper evaluation and treatment.
          </p>
        </AnimatedCard>

        {/* Retake Button */}
        <div className="text-center mt-6 pb-8">
          <button
            onClick={() => {
              sessionStorage.removeItem('assessmentResults')
              nav('/assessment')
            }}
            className="text-gray-600 hover:text-gray-800 underline"
          >
            Retake Assessment
          </button>
        </div>
      </div>
    </div>
  )
}
