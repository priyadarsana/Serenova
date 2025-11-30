import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, useReducedMotion } from 'framer-motion'
import AnimatedCard from '../components/AnimatedCard'
import PrimaryButton from '../components/PrimaryButton'
import { useUser } from '../contexts/UserContext'

export default function Settings() {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [editing, setEditing] = useState(false)
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [age, setAge] = useState('')
  const [email, setEmail] = useState('')
  
  const { userData, updateProfile, refreshUserData } = useUser()
  const nav = useNavigate()
  const shouldReduceMotion = useReducedMotion()

  React.useEffect(() => {
    if (userData?.profile) {
      setFirstName(userData.profile.firstName || '')
      setLastName(userData.profile.lastName || '')
      setAge(userData.profile.age?.toString() || '')
      setEmail(userData.profile.email || '')
    }
  }, [userData])

  const handleSaveProfile = async () => {
    try {
      await updateProfile({
        firstName: firstName || undefined,
        lastName: lastName || undefined,
        age: age ? parseInt(age) : undefined,
        email: email || undefined
      })
      setEditing(false)
      alert('Profile updated successfully!')
    } catch (error) {
      alert('Failed to update profile')
    }
  }

  const handleDeleteData = () => {
    if (showDeleteConfirm) {
      // Clear all stored data
      sessionStorage.clear()
      localStorage.clear()
      alert('All your data has been deleted. You will be redirected to the home screen.')
      nav('/home')
      setShowDeleteConfirm(false)
    } else {
      setShowDeleteConfirm(true)
    }
  }

  const handleDownloadData = async () => {
    if (!userData) return
    
    const data = {
      profile: userData.profile,
      assessmentHistory: userData.assessmentHistory,
      conversationCount: userData.conversationIds.length,
      preferences: userData.preferences,
      exportDate: new Date().toISOString()
    }

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `serenova-data-${new Date().toISOString().split('T')[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  if (!userData) {
    return <div className="max-w-2xl mx-auto p-4">Loading...</div>
  }

  return (
    <div className="max-w-2xl mx-auto space-y-4 pb-24">
      <motion.h2
        initial={shouldReduceMotion ? {} : { opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-xl font-semibold"
      >
        Settings & Profile
      </motion.h2>

      {/* User Profile */}
      <AnimatedCard className="p-6 space-y-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-lg">Your Profile</h3>
          {!editing ? (
            <button 
              onClick={() => setEditing(true)}
              className="px-3 py-1 text-sm bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200"
            >
              Edit
            </button>
          ) : (
            <div className="flex gap-2">
              <button 
                onClick={handleSaveProfile}
                className="px-3 py-1 text-sm bg-green-100 text-green-700 rounded-lg hover:bg-green-200"
              >
                Save
              </button>
              <button 
                onClick={() => setEditing(false)}
                className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
              >
                Cancel
              </button>
            </div>
          )}
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">First Name</label>
            <input
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              disabled={!editing}
              className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 disabled:bg-gray-50"
              placeholder="Enter first name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Last Name</label>
            <input
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              disabled={!editing}
              className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 disabled:bg-gray-50"
              placeholder="Enter last name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Email (Optional)</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={!editing}
              className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 disabled:bg-gray-50"
              placeholder="your@email.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Age</label>
            <input
              type="number"
              value={age}
              onChange={(e) => setAge(e.target.value)}
              disabled={!editing}
              className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 disabled:bg-gray-50"
              placeholder="Enter age"
            />
          </div>
        </div>

        <div className="pt-4 border-t text-sm text-gray-600">
          <p><strong>User ID:</strong> {userData.profile.userId}</p>
          <p><strong>Member since:</strong> {new Date(userData.profile.createdAt).toLocaleDateString()}</p>
          <p><strong>Last active:</strong> {new Date(userData.profile.lastActive).toLocaleDateString()}</p>
        </div>
      </AnimatedCard>

      {/* Statistics */}
      <AnimatedCard className="p-6">
        <h3 className="font-semibold text-lg mb-4">Your Data</h3>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="p-4 bg-purple-50 rounded-lg">
            <div className="text-2xl font-bold text-purple-700">{userData.assessmentHistory.length}</div>
            <div className="text-sm text-gray-600">Assessments</div>
          </div>
          <div className="p-4 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-700">{userData.conversationIds.length}</div>
            <div className="text-sm text-gray-600">Conversations</div>
          </div>
          <div className="p-4 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-700">
              {Math.floor((Date.now() - new Date(userData.profile.createdAt).getTime()) / (1000 * 60 * 60 * 24))}
            </div>
            <div className="text-sm text-gray-600">Days active</div>
          </div>
        </div>
      </AnimatedCard>

      {/* Assessment History */}
      {userData.assessmentHistory.length > 0 && (
        <AnimatedCard className="p-6">
          <h3 className="font-semibold text-lg mb-4">Recent Assessments</h3>
          <div className="space-y-2">
            {userData.assessmentHistory.slice(-5).reverse().map((assessment, i) => (
              <div key={i} className="p-3 bg-gray-50 rounded-lg flex justify-between items-center">
                <div>
                  <div className="text-sm font-medium">
                    {new Date(assessment.date).toLocaleDateString()}
                  </div>
                  <div className="text-xs text-gray-600">
                    Overall: {assessment.overallScore} | Depression: {assessment.depressionScore} | 
                    Anxiety: {assessment.anxietyScore} | Stress: {assessment.stressScore}
                  </div>
                </div>
                <div className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  assessment.severity === 'high' ? 'bg-red-100 text-red-700' :
                  assessment.severity === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                  'bg-green-100 text-green-700'
                }`}>
                  {assessment.severity}
                </div>
              </div>
            ))}
          </div>
        </AnimatedCard>
      )}

      <AnimatedCard className="p-6 space-y-4">
        <h3 className="font-semibold mb-3">Preferences</h3>
        
        <div>
          <label className="block text-sm font-medium mb-2">Animation preferences</label>
          <select className="w-full p-2 border rounded-[var(--radius-md)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]">
            <option>Respect system settings</option>
            <option>Always animate</option>
            <option>Reduce motion</option>
          </select>
          <p className="text-xs text-slate-500 mt-1">
            Aurora Mind respects your system's "prefers-reduced-motion" setting
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Check-in reminders</label>
          <select className="w-full p-2 border rounded-[var(--radius-md)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]">
            <option>Off</option>
            <option>Daily (evening)</option>
            <option>3x per week</option>
            <option>Custom schedule</option>
          </select>
        </div>
      </AnimatedCard>

      <AnimatedCard delay={0.1} className="p-6 space-y-4">
        <h3 className="font-semibold mb-3">🔒 Privacy & Data</h3>
        
        {consentDate && (
          <div className="bg-slate-50 rounded p-3 text-sm">
            <p className="text-slate-600">
              Consent given: {new Date(consentDate).toLocaleDateString()}
            </p>
          </div>
        )}

        <div className="space-y-3">
          <button
            onClick={() => nav('/consent')}
            className="w-full p-3 text-left border rounded-lg hover:bg-slate-50 transition-colors"
          >
            <div className="font-medium text-sm">📋 Review terms & privacy</div>
            <div className="text-xs text-slate-500">See what data we collect and how we use it</div>
          </button>

          <button
            onClick={handleDownloadData}
            className="w-full p-3 text-left border rounded-lg hover:bg-slate-50 transition-colors"
          >
            <div className="font-medium text-sm">⬇️ Download my data</div>
            <div className="text-xs text-slate-500">Export all your Aurora Mind data as JSON</div>
          </button>

          <div className="border-t pt-3">
            <button
              onClick={() => setShowDeleteConfirm(!showDeleteConfirm)}
              className="w-full p-3 text-left border border-red-300 rounded-lg hover:bg-red-50 transition-colors"
            >
              <div className="font-medium text-sm text-red-700">🗑️ Delete all my data</div>
              <div className="text-xs text-red-600">Permanently remove all stored information</div>
            </button>

            {showDeleteConfirm && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="mt-3 p-4 bg-red-50 border border-red-300 rounded-lg"
              >
                <p className="text-sm text-red-800 font-medium mb-2">
                  ⚠️ Are you sure?
                </p>
                <p className="text-xs text-red-700 mb-3">
                  This will permanently delete all your conversations, check-ins, and preferences. This action cannot be undone.
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    className="flex-1 px-4 py-2 border border-slate-300 rounded text-sm hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDeleteData}
                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded text-sm hover:bg-red-700"
                  >
                    Yes, delete everything
                  </button>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </AnimatedCard>

      <AnimatedCard delay={0.2} className="p-6">
        <h3 className="font-semibold mb-3">AI Configuration</h3>
        <div className="space-y-3 text-sm">
          <div className="bg-slate-50 rounded p-3">
            <p className="font-medium mb-1">Emotion Analysis Model</p>
            <p className="text-xs text-slate-600">
              distilbert-base-uncased-emotion (HuggingFace)
              <br />
              Runs locally on your device · Free & open-source
            </p>
          </div>

          <div className="bg-slate-50 rounded p-3">
            <p className="font-medium mb-1">AI Chatbot Model</p>
            <p className="text-xs text-slate-600">
              Phi-3 Mini via Ollama
              <br />
              Runs locally on your device · No cloud APIs · Privacy-first
            </p>
          </div>
        </div>
      </AnimatedCard>

      <AnimatedCard delay={0.3} className="p-6">
        <h3 className="font-semibold mb-2">About Aurora Mind</h3>
        <div className="text-sm text-slate-700 space-y-2">
          <p>Version: 0.1.0 (Beta)</p>
          <p className="text-xs text-slate-500">
            Aurora Mind is an open-source mental wellness companion.
            <br />
            Built with privacy-first principles and local-first AI.
          </p>
          <div className="pt-3 border-t">
            <a href="/support" className="text-[var(--color-primary)] text-sm hover:underline">
              Crisis Resources →
            </a>
          </div>
        </div>
      </AnimatedCard>

      <p className="text-xs text-center text-slate-400 py-4">
        Your privacy matters. All processing happens locally when possible.
      </p>
    </div>
  )
}

