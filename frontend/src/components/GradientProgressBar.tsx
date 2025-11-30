import { motion, useReducedMotion } from 'framer-motion'

interface GradientProgressBarProps {
  score: number // 0 to 1
  labels?: string[]
}

export default function GradientProgressBar({ score, labels = ['Calm', 'Mild', 'High', 'Severe'] }: GradientProgressBarProps) {
  const shouldReduceMotion = useReducedMotion()

  return (
    <div className="space-y-2">
      <div className="relative h-3 rounded-full bg-gradient-to-r from-emerald-200 via-amber-200 to-rose-300 overflow-hidden">
        <motion.div
          className="absolute top-0 left-0 h-full bg-gradient-to-r from-transparent to-white/40"
          initial={{ width: 0 }}
          animate={{ width: `${score * 100}%` }}
          transition={{ duration: shouldReduceMotion ? 0 : 0.8, ease: [0.25, 0.8, 0.25, 1] }}
        />
        <motion.div
          className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full shadow-md border-2 border-[var(--color-primary)]"
          initial={{ left: 0 }}
          animate={{ left: `calc(${score * 100}% - 8px)` }}
          transition={{ duration: shouldReduceMotion ? 0 : 0.8, ease: [0.25, 0.8, 0.25, 1] }}
        />
      </div>
      <div className="flex justify-between text-xs text-slate-500">
        {labels.map((label, i) => (
          <span key={i}>{label}</span>
        ))}
      </div>
    </div>
  )
}
