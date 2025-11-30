import { motion, useReducedMotion } from 'framer-motion'
import { ReactNode } from 'react'

interface PrimaryButtonProps {
  children: ReactNode
  onClick?: () => void
  className?: string
  variant?: 'primary' | 'secondary' | 'danger'
  type?: 'button' | 'submit'
  disabled?: boolean
}

export default function PrimaryButton({ children, onClick, className = '', variant = 'primary', type = 'button', disabled = false }: PrimaryButtonProps) {
  const shouldReduceMotion = useReducedMotion()

  const baseStyles = 'px-6 py-3 rounded-[var(--radius-lg)] font-medium transition-all'
  const variants = {
    primary: 'bg-[var(--color-primary)] text-white primary-glow',
    secondary: 'bg-white text-slate-700 shadow-md border border-slate-200',
    danger: 'bg-[var(--color-warning)] text-white shadow-md'
  }

  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyles} ${variants[variant]} ${className} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      whileTap={shouldReduceMotion || disabled ? {} : { scale: 0.98 }}
      whileHover={shouldReduceMotion || disabled ? {} : { scale: 1.02 }}
      transition={{ duration: 0.2, ease: [0.25, 0.8, 0.25, 1] }}
    >
      {children}
    </motion.button>
  )
}
