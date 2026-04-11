import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Star } from 'lucide-react'
import styles from './StarRating.module.css'

export default function StarRating({ value = 0, onChange, readonly = false, max = 10 }) {
  const [hover, setHover] = useState(0)
  const stars = 5
  const toDisplay = (v) => v / 2
  const filled = (i) => {
    const active = hover || toDisplay(value)
    if (active >= i) return 'full'
    if (active >= i - 0.5) return 'half'
    return 'empty'
  }
  const handleClick = (score) => { if (!readonly && onChange) onChange(score * 2) }
  const handleMouse = (i, e) => {
    if (readonly) return
    const rect = e.currentTarget.getBoundingClientRect()
    const half = e.clientX < rect.left + rect.width / 2
    setHover(half ? i - 0.5 : i)
  }

  return (
    <div
      className={`${styles.stars} ${readonly ? styles.readonly : ''}`}
      onMouseLeave={() => setHover(0)}
      role={readonly ? 'img' : 'radiogroup'}
      aria-label={`Rating: ${value} de ${max}`}
    >
      {Array.from({ length: stars }, (_, i) => i + 1).map(i => {
        const state = filled(i)
        return (
          <motion.button
            key={i} type="button"
            className={`${styles.star} ${styles[state]}`}
            onMouseMove={e => handleMouse(i, e)}
            onClick={e => {
              const rect = e.currentTarget.getBoundingClientRect()
              const half = e.clientX < rect.left + rect.width / 2
              handleClick(half ? i - 0.5 : i)
            }}
            disabled={readonly}
            aria-label={`${i} estrellas`}
            whileHover={readonly ? {} : { scale: 1.2 }}
            whileTap={readonly ? {} : { scale: 0.9 }}
            animate={{ scale: state === 'full' ? 1.05 : 1 }}
            transition={{ duration: 0.15 }}
          >
            <Star
              size={20}
              fill={state === 'full' ? 'currentColor' : state === 'half' ? 'currentColor' : 'none'}
              style={state === 'half' ? { clipPath: 'inset(0 50% 0 0)' } : {}}
            />
          </motion.button>
        )
      })}
      <AnimatePresence>
        {value > 0 && (
          <motion.span
            className={styles.score}
            initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}
          >
            {value.toFixed(1)}
          </motion.span>
        )}
      </AnimatePresence>
    </div>
  )
}
