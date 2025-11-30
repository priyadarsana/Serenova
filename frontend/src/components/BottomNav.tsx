import React from 'react'
import { NavLink } from 'react-router-dom'
import { motion } from 'framer-motion'

const tabs = [
  { to: '/home', label: 'Home', icon: '🏠' },
  { to: '/insights', label: 'Insights', icon: '📊' },
  { to: '/activities', label: 'Activities', icon: '✨' },
  { to: '/support', label: 'Support', icon: '🤝' }
]

const Tab = ({to, label, icon}:{to:string, label:string, icon:string}) => (
  <NavLink to={to} className="relative flex-1 flex flex-col items-center py-2 text-sm">
    {({isActive}) => (
      <>
        <motion.div
          className="text-xl"
          animate={{ scale: isActive ? 1.1 : 1 }}
          transition={{ duration: 0.2 }}
        >
          {icon}
        </motion.div>
        <span className={`text-xs mt-1 transition-colors ${isActive ? 'text-[var(--color-primary)] font-medium' : 'text-slate-500'}`}>
          {label}
        </span>
        {isActive && (
          <motion.div
            layoutId="active-tab"
            className="absolute top-0 left-1/2 -translate-x-1/2 w-12 h-1 bg-[var(--color-primary)] rounded-full"
            transition={{ duration: 0.3, ease: [0.25, 0.8, 0.25, 1] }}
          />
        )}
      </>
    )}
  </NavLink>
)

export default function BottomNav(){
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white/85 backdrop-blur-md border-t border-slate-200/50 flex z-50 shadow-lg">
      {tabs.map(tab => <Tab key={tab.to} {...tab} />)}
    </nav>
  )
}
