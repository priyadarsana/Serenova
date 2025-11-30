import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'

interface AssessmentScore {
  date: string
  depressionScore: number
  anxietyScore: number
  stressScore: number
  overallScore: number
  severity: string
}

interface UserProfile {
  userId: string
  email?: string
  firstName?: string
  lastName?: string
  age?: number
  createdAt: string
  lastActive: string
  consentGiven: boolean
}

interface UserData {
  profile: UserProfile
  assessmentHistory: AssessmentScore[]
  conversationIds: string[]
  preferences: {
    theme?: string
    notifications?: boolean
    reminderTime?: string
    language?: string
  }
  emergencyContacts: any[]
  therapistInfo?: any
}

interface UserContextType {
  userId: string | null
  userData: UserData | null
  loading: boolean
  createUser: (data: {
    email?: string
    firstName?: string
    lastName?: string
    age?: number
    consentGiven?: boolean
  }) => Promise<void>
  updateProfile: (data: {
    firstName?: string
    lastName?: string
    age?: number
    email?: string
  }) => Promise<void>
  addAssessment: (assessment: {
    depressionScore: number
    anxietyScore: number
    stressScore: number
    overallScore: number
    severity: string
  }) => Promise<void>
  linkConversation: (sessionId: string) => Promise<void>
  updatePreferences: (prefs: {
    theme?: string
    notifications?: boolean
    reminderTime?: string
    language?: string
  }) => Promise<void>
  refreshUserData: () => Promise<void>
}

const UserContext = createContext<UserContextType | undefined>(undefined)

export function UserProvider({ children }: { children: ReactNode }) {
  const [userId, setUserId] = useState<string | null>(null)
  const [userData, setUserData] = useState<UserData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check for existing user ID in localStorage
    const storedUserId = localStorage.getItem('serenova_user_id')
    if (storedUserId) {
      setUserId(storedUserId)
      loadUserData(storedUserId)
    } else {
      // Create anonymous user
      createAnonymousUser()
    }
  }, [])

  const createAnonymousUser = async () => {
    try {
      const res = await fetch('http://localhost:8001/api/users/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ consentGiven: false })
      })
      const data = await res.json()
      setUserId(data.userId)
      localStorage.setItem('serenova_user_id', data.userId)
      await loadUserData(data.userId)
    } catch (error) {
      console.error('Failed to create user:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadUserData = async (uid: string) => {
    try {
      const res = await fetch(`http://localhost:8001/api/users/profile/${uid}`)
      const data = await res.json()
      setUserData(data)
    } catch (error) {
      console.error('Failed to load user data:', error)
    } finally {
      setLoading(false)
    }
  }

  const createUser = async (data: {
    email?: string
    firstName?: string
    lastName?: string
    age?: number
    consentGiven?: boolean
  }) => {
    try {
      const res = await fetch('http://localhost:8001/api/users/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })
      const result = await res.json()
      setUserId(result.userId)
      localStorage.setItem('serenova_user_id', result.userId)
      await loadUserData(result.userId)
    } catch (error) {
      console.error('Failed to create user:', error)
      throw error
    }
  }

  const updateProfile = async (data: {
    firstName?: string
    lastName?: string
    age?: number
    email?: string
  }) => {
    if (!userId) return
    try {
      await fetch(`http://localhost:8001/api/users/profile/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })
      await loadUserData(userId)
    } catch (error) {
      console.error('Failed to update profile:', error)
      throw error
    }
  }

  const addAssessment = async (assessment: {
    depressionScore: number
    anxietyScore: number
    stressScore: number
    overallScore: number
    severity: string
  }) => {
    if (!userId) return
    try {
      await fetch(`http://localhost:8001/api/users/assessment/${userId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(assessment)
      })
      await loadUserData(userId)
    } catch (error) {
      console.error('Failed to add assessment:', error)
      throw error
    }
  }

  const linkConversation = async (sessionId: string) => {
    if (!userId) return
    try {
      await fetch(`http://localhost:8001/api/users/conversation/${userId}?session_id=${sessionId}`, {
        method: 'POST'
      })
      await loadUserData(userId)
    } catch (error) {
      console.error('Failed to link conversation:', error)
    }
  }

  const updatePreferences = async (prefs: {
    theme?: string
    notifications?: boolean
    reminderTime?: string
    language?: string
  }) => {
    if (!userId) return
    try {
      await fetch(`http://localhost:8001/api/users/preferences/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(prefs)
      })
      await loadUserData(userId)
    } catch (error) {
      console.error('Failed to update preferences:', error)
      throw error
    }
  }

  const refreshUserData = async () => {
    if (userId) {
      await loadUserData(userId)
    }
  }

  return (
    <UserContext.Provider
      value={{
        userId,
        userData,
        loading,
        createUser,
        updateProfile,
        addAssessment,
        linkConversation,
        updatePreferences,
        refreshUserData
      }}
    >
      {children}
    </UserContext.Provider>
  )
}

export function useUser() {
  const context = useContext(UserContext)
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider')
  }
  return context
}
