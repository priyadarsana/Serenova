import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import AnimatedCard from '../components/AnimatedCard'
import PrimaryButton from '../components/PrimaryButton'
import { API_URL } from '../config'

interface AssessmentData {
  needImprovement: string
  testFor: string
  ageRange: string
  gender: string
  transgender: boolean
  householdIncome: string
  populations: string[]
  previousTreatment: string
  mainFactors: string[]
  hasInsurance: string
  physicalConditions: string[]
  hasPet: string
}

export default function MentalHealthAssessment() {
  const navigate = useNavigate()
  const [currentStep, setCurrentStep] = useState(1)
  const totalSteps = 4

  const [formData, setFormData] = useState<AssessmentData>({
    needImprovement: '',
    testFor: '',
    ageRange: '',
    gender: '',
    transgender: false,
    householdIncome: '',
    populations: [],
    previousTreatment: '',
    mainFactors: [],
    hasInsurance: '',
    physicalConditions: [],
    hasPet: ''
  })

  const handleCheckboxChange = (field: 'populations' | 'mainFactors' | 'physicalConditions', value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].includes(value)
        ? prev[field].filter(item => item !== value)
        : [...prev[field], value]
    }))
  }

  const handleSubmit = async () => {
    try {
      const userId = localStorage.getItem('userId')

      // Save assessment to localStorage
      localStorage.setItem('mentalHealthAssessment', JSON.stringify(formData))

      // Save to backend
      const response = await fetch(`${API_URL}/api/assessment/save`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify({
          userId,
          assessmentData: formData,
          completedAt: new Date().toISOString()
        })
      })

      if (response.ok) {
        console.log('✅ Assessment saved successfully')
      }

      // Navigate to home
      navigate('/home')
    } catch (error) {
      console.error('Failed to save assessment:', error)
      // Still navigate to home even if save fails
      navigate('/home')
    }
  }

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return formData.needImprovement && formData.testFor && formData.ageRange && formData.gender
      case 2:
        return formData.householdIncome
      case 3:
        return formData.previousTreatment && formData.mainFactors.length > 0
      case 4:
        return formData.hasInsurance && formData.hasPet
      default:
        return false
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-blue-100 to-pink-100 flex items-center justify-center p-4">
      <AnimatedCard className="w-full max-w-3xl p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Mental Health Assessment</h1>
          <p className="text-gray-600">Help us understand your needs better to provide personalized support</p>

          {/* Progress Bar */}
          <div className="mt-6">
            <div className="flex justify-between mb-2">
              <span className="text-sm text-gray-600">Step {currentStep} of {totalSteps}</span>
              <span className="text-sm text-gray-600">{Math.round((currentStep / totalSteps) * 100)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <motion.div
                className="bg-purple-600 h-2 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${(currentStep / totalSteps) * 100}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </div>
        </div>

        <form onSubmit={(e) => e.preventDefault()}>
          {/* Step 1: Basic Information */}
          {currentStep === 1 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Do you feel like you need to do something to improve your mental health?
                </label>
                <div className="space-y-2">
                  {['Yes', 'No', 'Not sure'].map(option => (
                    <label key={option} className="flex items-center p-3 border-2 rounded-lg cursor-pointer hover:border-purple-400 transition-colors">
                      <input
                        type="radio"
                        name="needImprovement"
                        value={option}
                        checked={formData.needImprovement === option}
                        onChange={(e) => setFormData({ ...formData, needImprovement: e.target.value })}
                        className="mr-3"
                      />
                      <span>{option}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Are you taking this test for yourself or someone else?
                </label>
                <div className="space-y-2">
                  {['For myself', 'For someone else'].map(option => (
                    <label key={option} className="flex items-center p-3 border-2 rounded-lg cursor-pointer hover:border-purple-400 transition-colors">
                      <input
                        type="radio"
                        name="testFor"
                        value={option}
                        checked={formData.testFor === option}
                        onChange={(e) => setFormData({ ...formData, testFor: e.target.value })}
                        className="mr-3"
                      />
                      <span>{option}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Age Range</label>
                <select
                  value={formData.ageRange}
                  onChange={(e) => setFormData({ ...formData, ageRange: e.target.value })}
                  className="w-full p-3 border-2 rounded-lg focus:border-purple-400 focus:outline-none"
                >
                  <option value="">Select age range</option>
                  <option value="under-14">Under 14</option>
                  <option value="14-15">14–15</option>
                  <option value="16-17">16–17</option>
                  <option value="18-24">18–24</option>
                  <option value="25-34">25–34</option>
                  <option value="35-44">35–44</option>
                  <option value="45-54">45–54</option>
                  <option value="55-64">55–64</option>
                  <option value="65+">65+</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Gender</label>
                <select
                  value={formData.gender}
                  onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                  className="w-full p-3 border-2 rounded-lg focus:border-purple-400 focus:outline-none"
                >
                  <option value="">Select gender</option>
                  <option value="female">Female</option>
                  <option value="male">Male</option>
                  <option value="non-binary">Non-binary</option>
                  <option value="prefer-not-to-say">Prefer not to say</option>
                </select>
              </div>

              <div>
                <label className="flex items-center p-3 border-2 rounded-lg cursor-pointer hover:border-purple-400 transition-colors">
                  <input
                    type="checkbox"
                    checked={formData.transgender}
                    onChange={(e) => setFormData({ ...formData, transgender: e.target.checked })}
                    className="mr-3"
                  />
                  <span className="text-sm font-semibold text-gray-700">Transgender</span>
                </label>
              </div>
            </motion.div>
          )}

          {/* Step 2: Demographics & Background */}
          {currentStep === 2 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Household Income (India)</label>
                <select
                  value={formData.householdIncome}
                  onChange={(e) => setFormData({ ...formData, householdIncome: e.target.value })}
                  className="w-full p-3 border-2 rounded-lg focus:border-purple-400 focus:outline-none"
                >
                  <option value="">Select income range</option>
                  <option value="less-than-2L">Less than ₹2,00,000 per year</option>
                  <option value="2L-5L">₹2,00,000 – ₹5,00,000 per year</option>
                  <option value="5L-10L">₹5,00,000 – ₹10,00,000 per year</option>
                  <option value="above-10L">Above ₹10,00,000 per year</option>
                  <option value="prefer-not-to-say">Prefer not to say</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Populations (select all that apply)
                </label>
                <div className="space-y-2">
                  {[
                    'Student',
                    'Trauma survivor',
                    'Military/Veteran',
                    'LGBTQ+',
                    'Person of color',
                    'Disabled/Chronic illness',
                    'Parent/Caregiver',
                    'Healthcare worker',
                    'First responder'
                  ].map(population => (
                    <label key={population} className="flex items-center p-3 border-2 rounded-lg cursor-pointer hover:border-purple-400 transition-colors">
                      <input
                        type="checkbox"
                        checked={formData.populations.includes(population)}
                        onChange={() => handleCheckboxChange('populations', population)}
                        className="mr-3"
                      />
                      <span>{population}</span>
                    </label>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* Step 3: Mental Health History */}
          {currentStep === 3 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Have you ever received treatment/support for a mental health problem?
                </label>
                <div className="space-y-2">
                  {['Yes', 'No', 'Currently in treatment'].map(option => (
                    <label key={option} className="flex items-center p-3 border-2 rounded-lg cursor-pointer hover:border-purple-400 transition-colors">
                      <input
                        type="radio"
                        name="previousTreatment"
                        value={option}
                        checked={formData.previousTreatment === option}
                        onChange={(e) => setFormData({ ...formData, previousTreatment: e.target.value })}
                        className="mr-3"
                      />
                      <span>{option}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Main factors contributing (select all that apply)
                </label>
                <div className="space-y-2">
                  {[
                    'School or work problems',
                    'Loneliness or isolation',
                    'Low self-esteem or self-image',
                    'Relationship problems',
                    'Family problems',
                    'Financial stress',
                    'Health concerns',
                    'Grief or loss',
                    'Trauma or abuse',
                    'Substance use',
                    'Other'
                  ].map(factor => (
                    <label key={factor} className="flex items-center p-3 border-2 rounded-lg cursor-pointer hover:border-purple-400 transition-colors">
                      <input
                        type="checkbox"
                        checked={formData.mainFactors.includes(factor)}
                        onChange={() => handleCheckboxChange('mainFactors', factor)}
                        className="mr-3"
                      />
                      <span>{factor}</span>
                    </label>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* Step 4: Health & Support */}
          {currentStep === 4 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Do you currently have health insurance?
                </label>
                <div className="space-y-2">
                  {['Yes', 'No', 'Not sure'].map(option => (
                    <label key={option} className="flex items-center p-3 border-2 rounded-lg cursor-pointer hover:border-purple-400 transition-colors">
                      <input
                        type="radio"
                        name="hasInsurance"
                        value={option}
                        checked={formData.hasInsurance === option}
                        onChange={(e) => setFormData({ ...formData, hasInsurance: e.target.value })}
                        className="mr-3"
                      />
                      <span>{option}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Physical health conditions (select all that apply)
                </label>
                <div className="space-y-2">
                  {[
                    'None',
                    'Chronic pain',
                    'Diabetes',
                    'Heart disease',
                    'Autoimmune disorder',
                    'Neurological condition',
                    'Cancer',
                    'Sleep disorder',
                    'Other'
                  ].map(condition => (
                    <label key={condition} className="flex items-center p-3 border-2 rounded-lg cursor-pointer hover:border-purple-400 transition-colors">
                      <input
                        type="checkbox"
                        checked={formData.physicalConditions.includes(condition)}
                        onChange={() => handleCheckboxChange('physicalConditions', condition)}
                        className="mr-3"
                      />
                      <span>{condition}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Do you have a pet that supports your mental health?
                </label>
                <div className="space-y-2">
                  {['Yes', 'No', 'Considering getting one'].map(option => (
                    <label key={option} className="flex items-center p-3 border-2 rounded-lg cursor-pointer hover:border-purple-400 transition-colors">
                      <input
                        type="radio"
                        name="hasPet"
                        value={option}
                        checked={formData.hasPet === option}
                        onChange={(e) => setFormData({ ...formData, hasPet: e.target.value })}
                        className="mr-3"
                      />
                      <span>{option}</span>
                    </label>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8 pt-6 border-t">
            <button
              type="button"
              onClick={() => setCurrentStep(prev => Math.max(1, prev - 1))}
              disabled={currentStep === 1}
              className={`px-6 py-3 rounded-lg font-semibold transition-colors ${currentStep === 1
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
            >
              ← Previous
            </button>

            {currentStep < totalSteps ? (
              <PrimaryButton
                onClick={() => setCurrentStep(prev => prev + 1)}
                disabled={!canProceed()}
              >
                Next →
              </PrimaryButton>
            ) : (
              <PrimaryButton
                onClick={handleSubmit}
                disabled={!canProceed()}
              >
                Complete Assessment ✓
              </PrimaryButton>
            )}
          </div>
        </form>
      </AnimatedCard>
    </div>
  )
}
