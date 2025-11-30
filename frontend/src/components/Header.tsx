import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'

export default function Header() {
  const [isGuest, setIsGuest] = useState(false)
  const [userName, setUserName] = useState('')
  const [userEmail, setUserEmail] = useState('')
  const [showDropdown, setShowDropdown] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const nav = useNavigate()

  const loadUserData = () => {
    const name = localStorage.getItem('userName')
    const email = localStorage.getItem('userEmail') || localStorage.getItem('userId')
    const authToken = localStorage.getItem('authToken')

    console.log('Header loading user data:', { name, email, authToken: !!authToken })

    setIsGuest(!authToken)
    setUserName(name || '')
    setUserEmail(email || '')
  }

  useEffect(() => {
    loadUserData()

    // Listen for storage changes (when user logs in from another tab or component updates)
    const handleStorageChange = () => {
      console.log('Storage changed, reloading user data')
      loadUserData()
    }

    // Custom event for same-tab updates (when login happens in same tab)
    const handleUserUpdate = () => {
      console.log('User update event, reloading data')
      loadUserData()
    }

    window.addEventListener('storage', handleStorageChange)
    window.addEventListener('userDataUpdated', handleUserUpdate)

    return () => {
      window.removeEventListener('storage', handleStorageChange)
      window.removeEventListener('userDataUpdated', handleUserUpdate)
    }
  }, [])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSignIn = () => {
    nav('/auth')
  }

  const handleLogout = () => {
    // Clear all user data
    localStorage.removeItem('authToken')
    localStorage.removeItem('userId')
    localStorage.removeItem('userName')
    localStorage.removeItem('userEmail')
    localStorage.removeItem('provider')
    localStorage.removeItem('joinedDate')

    // Clear ALL chat history (old global + all user-specific)
    Object.keys(localStorage).forEach(key => {
      if (key === 'chatHistory' || key.startsWith('chatHistory_')) {
        localStorage.removeItem(key)
      }
    })

    setShowDropdown(false)
    nav('/')
  }

  return (
    <header className="px-4 py-3 flex items-center justify-between backdrop-blur-sm bg-white/40 sticky top-0 z-50 border-b border-white/20">
      <div className="flex items-center gap-3">
        <motion.div
          className="w-10 h-10 rounded-full bg-gradient-to-tr from-purple-400 to-indigo-400 flex items-center justify-center text-white font-bold shadow-md"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          S
        </motion.div>
        <div>
          <div className="text-lg font-semibold bg-gradient-to-r from-[var(--color-primary)] to-purple-500 bg-clip-text text-transparent">
            Serenova
          </div>
          <div className="text-xs text-slate-500">Your Mental Wellness Companion</div>
        </div>
      </div>

      {isGuest ? (
        <motion.button
          onClick={handleSignIn}
          className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-sm font-medium rounded-full shadow-md hover:shadow-lg transition-shadow"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Sign In
        </motion.button>
      ) : (
        <div className="relative" ref={dropdownRef}>
          <motion.div
            onClick={() => setShowDropdown(!showDropdown)}
            className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 cursor-pointer flex items-center justify-center text-white font-semibold text-sm shadow-md"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            title={userName || 'User'}
          >
            {userName ? userName.charAt(0).toUpperCase() : 'U'}
          </motion.div>

          <AnimatePresence>
            {showDropdown && (
              <motion.div
                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden z-50"
              >
                <div className="p-4 bg-gradient-to-br from-blue-50 to-purple-50 border-b border-slate-200">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg shadow-md">
                      {userName ? userName.charAt(0).toUpperCase() : 'U'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-slate-800 truncate">
                        {userName || 'User'}
                      </div>
                      <div className="text-xs text-slate-500 truncate">
                        {userEmail || 'No email'}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-2">
                  <button
                    onClick={() => {
                      setShowDropdown(false)
                      nav('/profile')
                    }}
                    className="w-full px-4 py-2.5 text-left text-sm text-slate-700 hover:bg-slate-50 rounded-lg transition-colors flex items-center gap-3"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    View Profile
                  </button>

                  <button
                    onClick={() => {
                      setShowDropdown(false)
                      nav('/settings')
                    }}
                    className="w-full px-4 py-2.5 text-left text-sm text-slate-700 hover:bg-slate-50 rounded-lg transition-colors flex items-center gap-3"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    Settings
                  </button>

                  <div className="my-2 border-t border-slate-200"></div>

                  <button
                    onClick={handleLogout}
                    className="w-full px-4 py-2.5 text-left text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors flex items-center gap-3"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    Sign Out
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </header>
  )
}
