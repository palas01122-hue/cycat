import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Play } from 'lucide-react'
import styles from './TrailerModal.module.css'

export default function TrailerModal({ videoKey, title, onClose }) {
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    document.body.style.overflow = 'hidden'
    return () => { window.removeEventListener('keydown', handler); document.body.style.overflow = '' }
  }, [onClose])

  return createPortal(
    <AnimatePresence>
      <motion.div
        className={styles.backdrop}
        onClick={onClose}
        role="dialog"
        aria-modal="true"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
      >
        <motion.div
          className={styles.modal}
          onClick={e => e.stopPropagation()}
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
        >
          <div className={styles.header}>
            <h3 className={styles.title}>
              <Play size={15} className={styles.playIcon} />
              {title}
            </h3>
            <motion.button
              className={styles.closeBtn}
              onClick={onClose}
              aria-label="Cerrar"
              whileHover={{ scale: 1.1, rotate: 90 }}
              whileTap={{ scale: 0.9 }}
              transition={{ duration: 0.15 }}
            >
              <X size={18} />
            </motion.button>
          </div>
          <div className={styles.videoWrap}>
            <iframe
              src={`https://www.youtube.com/embed/${videoKey}?autoplay=1&rel=0`}
              title={title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className={styles.iframe}
            />
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>,
    document.body
  )
}
