import { Link } from 'react-router-dom'
import { getPosterUrl, formatYear, formatRating, getRatingColor } from '../../utils/tmdb'
import styles from './MediaCard.module.css'

export default function MediaCard({ item, type = 'movie', index }) {
  const title   = item.title || item.name
  const year    = formatYear(item.release_date || item.first_air_date)
  const rating  = formatRating(item.vote_average)
  const rColor  = getRatingColor(item.vote_average)
  const path    = `/${type === 'movie' ? 'movie' : 'tv'}/${item.id}`

  return (
    <Link
      to={path}
      className={styles.card}
      style={{ animationDelay: `${(index % 20) * 40}ms` }}
      data-testid="media-card"
    >
      <div className={styles.posterWrap}>
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
          <div
            className={styles.rating}
            style={{ '--rc': rColor }}
            aria-label={`Rating: ${rating}`}
          >
            {rating}
          </div>
        )}

        {type === 'tv' && (
          <div className={styles.badge}>Serie</div>
        )}
      </div>

      <div className={styles.info}>
        <h3 className={styles.title} title={title}>{title}</h3>
        <span className={styles.year}>{year}</span>
      </div>
    </Link>
  )
}
