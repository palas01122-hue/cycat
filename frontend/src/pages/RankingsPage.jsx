import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Trophy, Film, Tv, Star, Calendar, Clapperboard, TrendingUp } from 'lucide-react'
import { useFetch } from '../hooks/useFetch'
import { rankingsAPI, catalogAPI, statsAPI } from '../services/api'
import { getPosterUrl, formatRating, formatYear, getRatingColor } from '../utils/tmdb'
import { Helmet } from 'react-helmet-async'
import styles from './RankingsPage.module.css'

const CURRENT_YEAR = new Date().getFullYear()
const YEARS = Array.from({ length: 10 }, (_, i) => CURRENT_YEAR - i)

const medalColors = ['#f4c430', '#c0c0c0', '#cd7f32']
const medalLabels = ['🥇', '🥈', '🥉']

export default function RankingsPage() {
  const [mode,          setMode]     = useState('top')
  const [mediaType, setMediaType]    = useState('movie')
  const [selectedYear,  setYear]     = useState(CURRENT_YEAR)
  const [selectedGenre, setGenre]    = useState(null)

  const { data: genreData } = useFetch(() => catalogAPI.getGenres(mediaType), [mediaType])

  const fetchFn = () => {
    if (mode === 'year')                   return statsAPI.getRankingByYear(selectedYear, mediaType)
    if (mode === 'genre' && selectedGenre) return statsAPI.getRankingByGenre(selectedGenre, mediaType)
    return rankingsAPI.getTopRanked(mediaType)
  }

  const { data, loading } = useFetch(fetchFn, [mode, mediaType, selectedYear, selectedGenre])
  const results = data?.data?.results || data?.results || []

  return (
    <motion.div
      className={`container ${styles.page}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <Helmet>
        <title>Rankings de Películas y Series — CyCat</title>
        <meta name="description" content="Los mejores rankings de películas y series. Top por género, año y calificación. Descubrí qué ver con el ranking de CyCat." />
        <link rel="canonical" href="https://cycat.lat/rankings" />
        <meta property="og:title" content="Rankings de Películas y Series — CyCat" />
        <meta property="og:url" content="https://cycat.lat/rankings" />
        <script type="application/ld+json">{JSON.stringify({ "@context": "https://schema.org", "@type": "CollectionPage", "name": "Rankings de Películas y Series", "description": "Los mejores rankings de cine y series en español.", "url": "https://cycat.lat/rankings" })}</script>
      </Helmet>
      <div className={styles.pageHeader}>
        <div className={styles.headerTitle}>
          <Trophy size={30} className={styles.headerIcon} />
          <h1 className="heading-lg">Rankings CyCat</h1>
        </div>
        <p className={styles.sub}>El mejor cine y series, filtrado como quieras</p>
      </div>

      {/* Controles */}
      <motion.div className={styles.controls} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }}>
        <div className={styles.controlGroup}>
          <label className={styles.controlLabel}>Tipo</label>
          <div className={styles.toggleBtns}>
            {[
              { key: 'movie', label: 'Películas', icon: <Film size={13} /> },
              { key: 'tv',    label: 'Series',    icon: <Tv size={13} /> },
            ].map(({ key, label, icon }) => (
              <motion.button key={key} whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
                className={mediaType === key ? styles.toggleActive : styles.toggleBtn}
                onClick={() => { setMediaType(key); setGenre(null) }}>
                {icon}{label}
              </motion.button>
            ))}
          </div>
        </div>

        <div className={styles.controlGroup}>
          <label className={styles.controlLabel}>Ver por</label>
          <div className={styles.toggleBtns}>
            {[
              { key: 'top',   label: 'Top general', icon: <TrendingUp size={13} /> },
              { key: 'year',  label: 'Año',          icon: <Calendar size={13} /> },
              { key: 'genre', label: 'Género',        icon: <Clapperboard size={13} /> },
            ].map(({ key, label, icon }) => (
              <motion.button key={key} whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
                className={mode === key ? styles.toggleActive : styles.toggleBtn}
                onClick={() => setMode(key)}>
                {icon}{label}
              </motion.button>
            ))}
          </div>
        </div>

        <AnimatePresence>
          {mode === 'year' && (
            <motion.div className={styles.controlGroup} initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
              <label className={styles.controlLabel}>Año</label>
              <div className={styles.yearBtns}>
                {YEARS.map(y => (
                  <motion.button key={y} whileHover={{ scale: 1.06 }} whileTap={{ scale: 0.94 }}
                    className={selectedYear === y ? styles.yearActive : styles.yearBtn}
                    onClick={() => setYear(y)}>
                    {y}
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}
          {mode === 'genre' && genreData?.genres && (
            <motion.div className={styles.controlGroup} initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
              <label className={styles.controlLabel}>Género</label>
              <div className={styles.genreBtns}>
                {genreData.genres.slice(0, 14).map(g => (
                  <motion.button key={g.id} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                    className={selectedGenre === g.id ? styles.genreActive : styles.genreBtn}
                    onClick={() => setGenre(g.id)}>
                    {g.name}
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Lista */}
      <div className={styles.rankContainer}>
        {loading ? (
          <RankSkeleton />
        ) : results.length === 0 ? (
          <motion.div className={styles.empty} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            {mode === 'genre' && !selectedGenre ? 'Seleccioná un género para ver el ranking' : 'No se encontraron resultados'}
          </motion.div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.ol
              key={`${mode}-${mediaType}-${selectedYear}-${selectedGenre}`}
              className={styles.rankList}
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
            >
              {results.slice(0, 25).map((item, i) => (
                <motion.li
                  key={item.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04, duration: 0.35 }}
                  layout
                >
                  <RankItem item={item} rank={i + 1} type={mediaType} />
                </motion.li>
              ))}
            </motion.ol>
          </AnimatePresence>
        )}
      </div>
    </motion.div>
  )
}

function RankItem({ item, rank, type }) {
  const title  = item.title || item.name
  const year   = formatYear(item.release_date || item.first_air_date)
  const rating = formatRating(item.vote_average)
  const rColor = getRatingColor(item.vote_average)
  const isTop3 = rank <= 3

  return (
    <div className={`${styles.rankItem} ${isTop3 ? styles.top3 : ''}`}>
      <span className={`${styles.rankNum} ${isTop3 ? styles[`rank${rank}`] : ''}`}
        style={isTop3 ? { color: medalColors[rank - 1] } : {}}>
        {isTop3 ? medalLabels[rank - 1] : rank}
      </span>
      <Link to={`/${type}/${item.id}`} className={styles.rankCard}>
        <img src={getPosterUrl(item.poster_path, 'sm')} alt={title} className={styles.rankPoster} loading="lazy" />
        <div className={styles.rankInfo}>
          <span className={styles.rankTitle}>{title}</span>
          <span className={styles.rankYear}>{year}</span>
        </div>
        <motion.div className={styles.rankRating} style={{ color: rColor, borderColor: rColor }}
          whileHover={{ scale: 1.08 }}>
          <Star size={12} fill="currentColor" /> {rating}
        </motion.div>
      </Link>
    </div>
  )
}

function RankSkeleton() {
  return (
    <div className={styles.skeletonList}>
      {Array.from({ length: 10 }).map((_, i) => (
        <div key={i} className={styles.skeletonItem}>
          <div className={`skeleton ${styles.skNum}`} />
          <div className={`skeleton ${styles.skPoster}`} />
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div className="skeleton" style={{ height: 14, width: '70%' }} />
            <div className="skeleton" style={{ height: 11, width: '30%' }} />
          </div>
          <div className="skeleton" style={{ width: 52, height: 26 }} />
        </div>
      ))}
    </div>
  )
}
