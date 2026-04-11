import { motion, AnimatePresence } from 'framer-motion'
import MediaCard from './MediaCard'
import MediaCardSkeleton from './MediaCardSkeleton'
import styles from './MediaGrid.module.css'

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.05 } }
}

export default function MediaGrid({ items, type, loading, skeletonCount = 20 }) {
  if (loading && (!items || items.length === 0)) {
    return (
      <div className={styles.grid} data-testid="media-grid">
        {Array.from({ length: skeletonCount }).map((_, i) => <MediaCardSkeleton key={i} />)}
      </div>
    )
  }

  if (!loading && (!items || items.length === 0)) {
    return (
      <motion.div className={styles.empty} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <p>No se encontraron resultados.</p>
      </motion.div>
    )
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        className={styles.grid}
        data-testid="media-grid"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {items.map((item, i) => (
          <MediaCard
            key={`${item.id}-${i}`}
            item={item}
            type={type || (item.media_type === 'tv' ? 'tv' : 'movie')}
            index={i}
          />
        ))}
      </motion.div>
    </AnimatePresence>
  )
}
