import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Clapperboard, Home } from 'lucide-react'
import styles from './NotFoundPage.module.css'

export default function NotFoundPage() {
  return (
    <div className={`container ${styles.page}`}>
      <motion.div
        className={styles.iconWrap}
        initial={{ opacity: 0, scale: 0.5, rotate: -15 }}
        animate={{ opacity: 1, scale: 1, rotate: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      >
        <motion.div
          animate={{ y: [0, -12, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        >
          <Clapperboard size={90} className={styles.icon} strokeWidth={1.2} />
        </motion.div>
      </motion.div>

      <motion.h1
        className={styles.code}
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        404
      </motion.h1>

      <motion.p
        className={styles.msg}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.35 }}
      >
        Esta escena no existe en nuestro catálogo
      </motion.p>

      <motion.p
        className={styles.sub}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.5 }}
      >
        Parece que la película que buscás se perdió en la sala de edición.
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.65 }}
      >
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Link to="/" className={styles.back}>
            <Home size={16} />
            Volver al inicio
          </Link>
        </motion.div>
      </motion.div>
    </div>
  )
}
