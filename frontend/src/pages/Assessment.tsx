import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import AnimatedCard from '../components/AnimatedCard'
import PrimaryButton from '../components/PrimaryButton'

interface Question {
  id: number
  text: string
  category: 'depression' | 'anxiety' | 'stress'
}

interface Answer {
  questionId: number
  score: number
}

const questions: Question[] = [
  // Depression questions (PHQ-9 inspired)
  { id: 1, text: "Little interest or pleasure in doing things", category: 'depression' },
  { id: 2, text: "Feeling down, depressed, or hopeless", category: 'depression' },
  { id: 3, text: "Trouble falling asleep, staying asleep, or sleeping too much", category: 'depression' },
  { id: 4, text: "Feeling tired or having little energy", category: 'depression' },
  
  // Anxiety questions (GAD-7 inspired)
  { id: 5, text: "Feeling nervous, anxious, or on edge", category: 'anxiety' },
  { id: 6, text: "Not being able to stop or control worrying", category: 'anxiety' },
  { id: 7, text: "Worrying too much about different things", category: 'anxiety' },
  { id: 8, text: "Trouble relaxing", category: 'anxiety' },
  
  // Stress questions
  { id: 9, text: "Feeling overwhelmed by responsibilities", category: 'stress' },
  { id: 10, text: "Difficulty concentrating on tasks", category: 'stress' },
  { id: 11, text: "Feeling irritable or easily frustrated", category: 'stress' },
  { id: 12, text: "Physical symptoms (headaches, muscle tension, stomach issues)", category: 'stress' },
]

const options = [
  { label: 'Not at all', score: 0 },
  { label: 'Several days', score: 1 },
  { label: 'More than half the days', score: 2 },
  { label: 'Nearly every day', score: 3 },
]

export default function Assessment() {
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<Answer[]>([])
  const nav = useNavigate()

  const handleAnswer = (score: number) => {
    const newAnswers = [...answers, { questionId: questions[currentQuestion].id, score }]
    setAnswers(newAnswers)

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1)
    } else {
      // Assessment complete - calculate results
      calculateResults(newAnswers)
    }
  }

  const calculateResults = (allAnswers: Answer[]) => {
    // Calculate scores by category
    const depressionScore = allAnswers
      .filter(a => questions.find(q => q.id === a.questionId)?.category === 'depression')
      .reduce((sum, a) => sum + a.score, 0)
    
    const anxietyScore = allAnswers
      .filter(a => questions.find(q => q.id === a.questionId)?.category === 'anxiety')
      .reduce((sum, a) => sum + a.score, 0)
    
    const stressScore = allAnswers
      .filter(a => questions.find(q => q.id === a.questionId)?.category === 'stress')
      .reduce((sum, a) => sum + a.score, 0)

    // Determine severity levels (out of 12 for depression/anxiety, out of 12 for stress)
    const getLevel = (score: number, maxScore: number) => {
      const percentage = (score / maxScore) * 100
      if (percentage < 25) return 'Minimal'
      if (percentage < 50) return 'Mild'
      if (percentage < 75) return 'Moderate'
      return 'Severe'
    }

    const depressionLevel = getLevel(depressionScore, 12)
    const anxietyLevel = getLevel(anxietyScore, 12)
    const stressLevel = getLevel(stressScore, 12)

    // Determine overall risk level
    const totalScore = depressionScore + anxietyScore + stressScore
    const maxTotalScore = 36
    let riskLevel: string
    let mainEmotion: string

    if (totalScore >= maxTotalScore * 0.66) {
      riskLevel = 'high'
      mainEmotion = 'sadness'
    } else if (totalScore >= maxTotalScore * 0.33) {
      riskLevel = 'medium'
      mainEmotion = 'fear'
    } else {
      riskLevel = 'low'
      mainEmotion = 'neutral'
    }

    // Create summary
    const summary = `Assessment Results: Depression (${depressionLevel}, ${depressionScore}/12), Anxiety (${anxietyLevel}, ${anxietyScore}/12), Stress (${stressLevel}, ${stressScore}/12). Total score: ${totalScore}/36.`

    // Store in session
    const assessmentData = {
      sessionId: 'assessment-' + Date.now(),
      summary,
      mainEmotion,
      emotionScore: totalScore / maxTotalScore,
      riskLevel,
      depressionScore,
      depressionLevel,
      anxietyScore,
      anxietyLevel,
      stressScore,
      stressLevel,
      totalScore,
      maxTotalScore
    }

    sessionStorage.setItem('intakeSummary', JSON.stringify(assessmentData))
    sessionStorage.setItem('assessmentResults', JSON.stringify(assessmentData))

    // Navigate to results page
    nav('/assessment/results')
  }

  const progress = ((currentQuestion + 1) / questions.length) * 100

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-4">
      <div className="max-w-2xl mx-auto pt-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Mental Health Assessment
          </h1>
          <p className="text-gray-600">
            Over the last 2 weeks, how often have you been bothered by the following?
          </p>
        </motion.div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>Question {currentQuestion + 1} of {questions.length}</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>

        {/* Question Card */}
        <AnimatedCard className="p-8 mb-6">
          <motion.div
            key={currentQuestion}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <h2 className="text-xl font-semibold text-gray-800 mb-6">
              {questions[currentQuestion].text}
            </h2>

            <div className="space-y-3">
              {options.map((option, index) => (
                <motion.button
                  key={index}
                  onClick={() => handleAnswer(option.score)}
                  className="w-full p-4 text-left rounded-xl border-2 border-gray-200 hover:border-purple-400 hover:bg-purple-50 transition-all duration-200"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <span className="font-medium text-gray-700">{option.label}</span>
                </motion.button>
              ))}
            </div>
          </motion.div>
        </AnimatedCard>

        {/* Back Button */}
        {currentQuestion > 0 && (
          <div className="text-center">
            <button
              onClick={() => {
                setCurrentQuestion(currentQuestion - 1)
                setAnswers(answers.slice(0, -1))
              }}
              className="text-gray-600 hover:text-gray-800 underline"
            >
              ← Go back
            </button>
          </div>
        )}

        {/* Disclaimer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-xl"
        >
          <p className="text-sm text-yellow-800">
            <strong>Note:</strong> This assessment is not a diagnostic tool. It's designed to help you understand your mental health better. For clinical diagnosis and treatment, please consult a licensed mental health professional.
          </p>
        </motion.div>
      </div>
    </div>
  )
}
