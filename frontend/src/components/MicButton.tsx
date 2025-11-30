import { motion, useReducedMotion } from 'framer-motion'

interface MicButtonProps {
  recording: boolean
  onClick: () => void
}

export default function MicButton({ recording, onClick }: MicButtonProps) {
  const shouldReduceMotion = useReducedMotion()

  return (
    <div className="relative flex items-center justify-center">
      {/* Pulsing rings when recording */}
      {recording && !shouldReduceMotion && (
        <>
          <motion.div
            className="absolute w-32 h-32 rounded-full border-2 border-[var(--color-primary)] opacity-50"
            animate={{ scale: [1, 1.5, 1.5], opacity: [0.5, 0, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeOut' }}
          />
          <motion.div
            className="absolute w-32 h-32 rounded-full border-2 border-[var(--color-primary)] opacity-50"
            animate={{ scale: [1, 1.5, 1.5], opacity: [0.5, 0, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeOut', delay: 1 }}
          />
        </>
      )}

      {/* Main button */}
      <motion.button
        onClick={onClick}
        className={`relative w-28 h-28 rounded-full flex items-center justify-center text-4xl z-10 transition-all ${
          recording 
            ? 'bg-gradient-to-br from-red-400 to-red-500 shadow-lg' 
            : 'bg-white shadow-md'
        }`}
        whileTap={shouldReduceMotion ? {} : { scale: 0.95 }}
        animate={!recording && !shouldReduceMotion ? { 
          scale: [1, 1.04, 1],
          boxShadow: [
            'var(--shadow-md)',
            '0 0 20px rgba(108, 99, 255, 0.2), var(--shadow-md)',
            'var(--shadow-md)'
          ]
        } : {}}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
      >
        🎤
      </motion.button>
    </div>
  )
}
