import { motion, useReducedMotion } from 'framer-motion'
import { ReactNode } from 'react'

interface AnimatedCardProps {
  children: ReactNode
  className?: string
  delay?: number
  hover?: boolean
}

export default function AnimatedCard({ children, className = '', delay = 0, hover = false }: AnimatedCardProps) {
  const shouldReduceMotion = useReducedMotion()

  return (
    <motion.div
      initial={shouldReduceMotion ? {} : { opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay, ease: [0.25, 0.8, 0.25, 1] }}
      whileHover={hover && !shouldReduceMotion ? { y: -4, boxShadow: 'var(--shadow-lg)' } : {}}
      className={`glass-card rounded-[var(--radius-xl)] ${className}`}
    >
      {children}
    </motion.div>
  )
}
