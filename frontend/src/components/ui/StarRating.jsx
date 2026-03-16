import { useState } from 'react'
import styles from './StarRating.module.css'

export default function StarRating({ value = 0, onChange, readonly = false, max = 10 }) {
  const [hover, setHover] = useState(0)
  const stars = 5 // display 5 stars, value 1-10

  const toDisplay = (v) => v / 2  // convert 1-10 to 0.5-5

  const filled = (i) => {
    const active = hover || toDisplay(value)
    if (active >= i) return 'full'
    if (active >= i - 0.5) return 'half'
    return 'empty'
  }

  const handleClick = (score) => {
    if (!readonly && onChange) onChange(score * 2)
  }

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
      {Array.from({ length: stars }, (_, i) => i + 1).map(i => (
        <button
          key={i}
          type="button"
          className={`${styles.star} ${styles[filled(i)]}`}
          onMouseMove={e => handleMouse(i, e)}
          onClick={e => {
            const rect = e.currentTarget.getBoundingClientRect()
            const half = e.clientX < rect.left + rect.width / 2
            handleClick(half ? i - 0.5 : i)
          }}
          disabled={readonly}
          aria-label={`${i} estrellas`}
        >
          <StarSVG state={filled(i)} />
        </button>
      ))}
      {value > 0 && (
        <span className={styles.score}>{value.toFixed(1)}</span>
      )}
    </div>
  )
}

function StarSVG({ state }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
      {state === 'full' ? (
        <polygon
          points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"
          fill="currentColor"
        />
      ) : state === 'half' ? (
        <>
          <polygon
            points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          />
          <clipPath id="half-clip">
            <rect x="0" y="0" width="12" height="24" />
          </clipPath>
          <polygon
            points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"
            fill="currentColor"
            clipPath="url(#half-clip)"
          />
        </>
      ) : (
        <polygon
          points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
        />
      )}
    </svg>
  )
}
