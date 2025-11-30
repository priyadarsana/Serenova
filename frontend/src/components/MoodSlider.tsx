import { motion, useReducedMotion } from 'framer-motion'
import { useState } from 'react'

const moods = ['😢', '😕', '😐', '🙂', '😄']

interface MoodSliderProps {
  onSelect?: (index: number) => void
}

export default function MoodSlider({ onSelect }: MoodSliderProps) {
  const [selected, setSelected] = useState<number | null>(null)
  const shouldReduceMotion = useReducedMotion()

  const handleSelect = (index: number) => {
    setSelected(index)
    onSelect?.(index)
  }

  return (
    <div className="flex gap-3 justify-center">
      {moods.map((emoji, i) => (
        <motion.button
          key={i}
          onClick={() => handleSelect(i)}
          className={`p-4 rounded-2xl text-2xl transition-colors ${
            selected === i ? 'bg-gradient-to-br from-purple-100 to-indigo-100' : 'bg-white/60'
          }`}
          whileTap={shouldReduceMotion ? {} : { scale: 0.9 }}
          animate={selected === i && !shouldReduceMotion ? { scale: [1, 1.15, 1] } : {}}
          transition={{ duration: 0.3, ease: 'easeOut' }}
        >
          {emoji}
        </motion.button>
      ))}
    </div>
  )
}
