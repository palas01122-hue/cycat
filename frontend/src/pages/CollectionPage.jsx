import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { motion } from 'framer-motion'
import { marathonAPI } from '../services/api'
import { getPosterUrl, formatRating, getRatingColor } from '../utils/tmdb'
import styles from './CollectionPage.module.css'

function formatRuntime(minutes) {
  if (!minutes) return null
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return h > 0 ? `${h}h${m > 0 ? ` ${m}min` : ''}` : `${m}min`
}

function formatTotal(minutes) {
  if (!minutes) return '—'
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  const d = Math.floor(h / 24)
  const rh = h % 24
  if (d > 0) return `${d}d ${rh}h ${m}min`
  return `${h}h ${m}min`
}

export default function CollectionPage() {
  const { id } = useParams()
  const [collection, setCollection] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    setLoading(true)
    setError(false)
    marathonAPI.collection(id)
      .then(res => setCollection(res.data))
      .catch(() => setError(true))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) {
    return (
      <div className={`container ${styles.page}`}>
        <div className={`skeleton ${styles.skHeader}`} />
        <div className={styles.grid}>
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className={`skeleton ${styles.skCard}`} />
          ))}
        </div>
      </div>
    )
  }

  if (error || !collection) {
    return (
      <div className={`container ${styles.page}`}>
        <div className={styles.errorState}>
          <p>No se pudo cargar la colección.</p>
          <Link to="/" className={styles.backLink}>Volver al inicio</Link>
        </div>
      </div>
    )
  }

  const parts = collection.parts || []
  const totalRuntime = collection.totalRuntime || 0

  return (
    <div className={`container page-enter ${styles.page}`}>
      <Helmet>
        <title>{`${collection.name} — CyCat`}</title>
        <meta name="description" content={collection.overview || `Todas las películas de la colección ${collection.name}.`} />
      </Helmet>

      {/* Hero de la colección */}
      <div className={styles.hero}>
        {collection.backdrop_path && (
          <img
            src={`https://image.tmdb.org/t/p/w1280${collection.backdrop_path}`}
            alt={collection.name}
            className={styles.heroBg}
          />
        )}
        <div className={styles.heroOverlay} />
        <div className={styles.heroContent}>
          <span className={styles.heroLabel}>COLECCIÓN</span>
          <h1 className={styles.heroTitle}>{collection.name}</h1>
          {collection.overview && (
            <p className={styles.heroOverview}>{collection.overview}</p>
          )}
          <div className={styles.heroMeta}>
            <span className={styles.heroStat}>
              <strong>{parts.length}</strong> {parts.length === 1 ? 'película' : 'películas'}
            </span>
            {totalRuntime > 0 && (
              <span className={styles.heroStat}>
                <strong>{formatTotal(totalRuntime)}</strong> de duración total
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Grid de películas */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Películas de la saga</h2>
        <div className={styles.grid}>
          {parts.map((movie, i) => {
            const rating = formatRating(movie.vote_average)
            const rColor = getRatingColor(movie.vote_average)
            const runtime = formatRuntime(movie.runtime)
            return (
              <motion.div
                key={movie.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: i * 0.05 }}
              >
                <Link to={`/movie/${movie.id}`} className={styles.card}>
                  <div className={styles.posterWrap}>
                    <img
                      src={getPosterUrl(movie.poster_path, 'md')}
                      alt={`Poster de ${movie.title}`}
                      className={styles.poster}
                      loading="lazy"
                    />
                    <div className={styles.posterOverlay}>
                      <span className={styles.viewMore}>Ver detalle →</span>
                    </div>
                    {movie.vote_average > 0 && (
                      <div className={styles.rating} style={{ '--rc': rColor }}>
                        {rating}
                      </div>
                    )}
                    <div className={styles.orderBadge}>
                      {String(i + 1).padStart(2, '0')}
                    </div>
                  </div>
                  <div className={styles.cardInfo}>
                    <h3 className={styles.cardTitle}>{movie.title}</h3>
                    <div className={styles.cardMeta}>
                      {movie.release_date?.slice(0, 4) && (
                        <span>{movie.release_date.slice(0, 4)}</span>
                      )}
                      {runtime && <span>{runtime}</span>}
                    </div>
                  </div>
                </Link>
              </motion.div>
            )
          })}
        </div>
      </section>

      {/* Link a modo maratón */}
      <div className={styles.marathonBanner}>
        <div className={styles.marathonText}>
          <strong>¿Querés hacer una maratón de esta saga?</strong>
          <span>Planificá el orden y calculá cuánto tiempo necesitás</span>
        </div>
        <Link to="/marathon" className={styles.marathonBtn}>
          Ir a Modo Maratón →
        </Link>
      </div>
    </div>
  )
}
