import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { getPosterUrl, formatYear, formatRating, getRatingColor } from '../../utils/tmdb'
import styles from './MediaCard.module.css'

export default function MediaCard({ item, type = 'movie', index }) {
  const title  = item.title || item.name
  const year   = formatYear(item.release_date || item.first_air_date)
  const rating = formatRating(item.vote_average)
  const rColor = getRatingColor(item.vote_average)
  const path   = `/${type === 'movie' ? 'movie' : 'tv'}/${item.id}`

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: (index % 20) * 0.04, ease: 'easeOut' }}
    >
      <Link to={path} className={styles.card} data-testid="media-card">
        <motion.div
          className={styles.posterWrap}
          whileHover={{ y: -6 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
        >
          <img
            src={getPosterUrl(item.poster_path, 'md')}
            alt={`Poster de ${title}`}
            className={styles.poster}
            loading="lazy"
          />
          <div className={styles.overlay}>
            <span className={styles.viewMore}>Ver más →</span>
          </div>
          {item.vote_average > 0 && (
            <div className={styles.rating} style={{ '--rc': rColor }} aria-label={`Rating: ${rating}`}>
              {rating}
            </div>
          )}
          {type === 'tv' && <div className={styles.badge}>Serie</div>}
        </motion.div>
        <div className={styles.info}>
          <h3 className={styles.title} title={title}>{title}</h3>
          <span className={styles.year}>{year}</span>
        </div>
      </Link>
    </motion.div>
  )
}
