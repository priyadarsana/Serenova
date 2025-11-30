import React from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import Header from './components/Header'
import BottomNav from './components/BottomNav'
import Landing from './pages/Landing'
import Auth from './pages/Auth'
import Consent from './pages/Consent'
import MentalHealthAssessment from './pages/MentalHealthAssessment'
import Home from './pages/Home'
import Assessment from './pages/Assessment'
import AssessmentResults from './pages/AssessmentResults'
import CheckInText from './pages/CheckInText'
import CheckInHandover from './pages/CheckInHandover'
import Results from './pages/Results'
import Insights from './pages/Insights'
import Activities from './pages/Activities'
import Support from './pages/Support'
import SupportBot from './pages/SupportBot'
import ConversationHistory from './pages/ConversationHistory'
import Settings from './pages/Settings'
import Profile from './pages/Profile'
import VoiceStressAnalysis from './pages/VoiceStressAnalysis'
import { API_URL } from './config'


export default function App(){
  const location = useLocation()
  const isLandingPage = location.pathname === '/'
  const isAuthPage = location.pathname === '/auth'
  const isAuthenticated = !!localStorage.getItem('authToken')


  return (
    <div className="min-h-screen text-slate-800">
      {!isLandingPage && !isAuthPage && isAuthenticated && <Header />}
      <main className={isLandingPage ? '' : 'p-4 pb-24'}>
        <AnimatePresence mode="wait">
          <Routes>
            <Route path="/" element={<Landing/>} />
            <Route path="/auth" element={<Auth/>} />
            <Route path="/consent" element={<Consent/>} />
            <Route path="/mental-health-assessment" element={<MentalHealthAssessment/>} />
            <Route path="/home" element={<Home/>} />
            <Route path="/assessment" element={<Assessment/>} />
            <Route path="/assessment/results" element={<AssessmentResults/>} />
            <Route path="/check-in/text" element={<CheckInText/>} />
            <Route path="/check-in/handover" element={<CheckInHandover/>} />
            <Route path="/results/:sessionId" element={<Results/>} />
            <Route path="/insights" element={<Insights/>} />
            <Route path="/activities/*" element={<Activities/>} />
            <Route path="/support" element={<Support/>} />
            <Route path="/support/bot" element={<SupportBot/>} />
            <Route path="/conversations" element={<ConversationHistory/>} />
            <Route path="/voice-analysis" element={<VoiceStressAnalysis/>} />
            <Route path="/settings" element={<Settings/>} />
            <Route path="/profile" element={<Profile/>} />
          </Routes>
        </AnimatePresence>
      </main>
      {!isLandingPage && !isAuthPage && isAuthenticated && <BottomNav />}
    </div>
  )
}
