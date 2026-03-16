import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useFetch } from '../hooks/useFetch'
import { rankingsAPI, catalogAPI, statsAPI } from '../services/api'
import { getPosterUrl, formatRating, formatYear, getRatingColor } from '../utils/tmdb'
import styles from './RankingsPage.module.css'

const CURRENT_YEAR = new Date().getFullYear()
const YEARS = Array.from({ length: 10 }, (_, i) => CURRENT_YEAR - i)

export default function RankingsPage() {
  const [mode, setMode]         = useState('top')      // top | year | genre
  const [mediaType, setMediaType] = useState('movie')
  const [selectedYear, setYear] = useState(CURRENT_YEAR)
  const [selectedGenre, setGenre] = useState(null)

  const { data: genreData } = useFetch(() => catalogAPI.getGenres(mediaType), [mediaType])

  const fetchFn = () => {
    if (mode === 'year')  return statsAPI.getRankingByYear(selectedYear, mediaType)
    if (mode === 'genre' && selectedGenre) return statsAPI.getRankingByGenre(selectedGenre, mediaType)
    return rankingsAPI.getTopRanked(mediaType)
  }

  const { data, loading } = useFetch(fetchFn, [mode, mediaType, selectedYear, selectedGenre])
  const results = data?.data?.results || data?.results || []

  return (
    <div className={`container page-enter ${styles.page}`}>
      {/* Header */}
      <div className={styles.pageHeader}>
        <h1 className="heading-lg">🏆 Rankings CyCat</h1>
        <p className={styles.sub}>El mejor cine y series, filtrado como quieras</p>
      </div>

      {/* Controles */}
      <div className={styles.controls}>
        {/* Tipo */}
        <div className={styles.controlGroup}>
          <label className={styles.controlLabel}>Tipo</label>
          <div className={styles.toggleBtns}>
            <button className={mediaType === 'movie' ? styles.toggleActive : styles.toggleBtn} onClick={() => { setMediaType('movie'); setGenre(null) }}>🎬 Películas</button>
            <button className={mediaType === 'tv' ? styles.toggleActive : styles.toggleBtn} onClick={() => { setMediaType('tv'); setGenre(null) }}>📺 Series</button>
          </div>
        </div>

        {/* Modo */}
        <div className={styles.controlGroup}>
          <label className={styles.controlLabel}>Ver por</label>
          <div className={styles.toggleBtns}>
            <button className={mode === 'top' ? styles.toggleActive : styles.toggleBtn} onClick={() => setMode('top')}>⭐ Top general</button>
            <button className={mode === 'year' ? styles.toggleActive : styles.toggleBtn} onClick={() => setMode('year')}>📅 Año</button>
            <button className={mode === 'genre' ? styles.toggleActive : styles.toggleBtn} onClick={() => setMode('genre')}>🎭 Género</button>
          </div>
        </div>

        {/* Selector de año */}
        {mode === 'year' && (
          <div className={styles.controlGroup}>
            <label className={styles.controlLabel}>Año</label>
            <div className={styles.yearBtns}>
              {YEARS.map(y => (
                <button key={y} className={selectedYear === y ? styles.yearActive : styles.yearBtn} onClick={() => setYear(y)}>
                  {y}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Selector de género */}
        {mode === 'genre' && genreData?.genres && (
          <div className={styles.controlGroup}>
            <label className={styles.controlLabel}>Género</label>
            <div className={styles.genreBtns}>
              {genreData.genres.slice(0, 14).map(g => (
                <button key={g.id} className={selectedGenre === g.id ? styles.genreActive : styles.genreBtn} onClick={() => setGenre(g.id)}>
                  {g.name}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Lista */}
      <div className={styles.rankContainer}>
        {loading ? (
          <RankSkeleton />
        ) : results.length === 0 ? (
          <div className={styles.empty}>
            {mode === 'genre' && !selectedGenre
              ? 'Seleccioná un género para ver el ranking'
              : 'No se encontraron resultados'}
          </div>
        ) : (
          <ol className={styles.rankList}>
            {results.slice(0, 25).map((item, i) => (
              <RankItem key={item.id} item={item} rank={i + 1} type={mediaType} />
            ))}
          </ol>
        )}
      </div>
    </div>
  )
}

function RankItem({ item, rank, type }) {
  const title  = item.title || item.name
  const year   = formatYear(item.release_date || item.first_air_date)
  const rating = formatRating(item.vote_average)
  const rColor = getRatingColor(item.vote_average)
  const medals = ['🥇','🥈','🥉']
  const isTop3 = rank <= 3

  return (
    <li className={`${styles.rankItem} ${isTop3 ? styles.top3 : ''}`}>
      <span className={`${styles.rankNum} ${isTop3 ? styles[`rank${rank}`] : ''}`}>
        {isTop3 ? medals[rank - 1] : rank}
      </span>
      <Link to={`/${type}/${item.id}`} className={styles.rankCard}>
        <img src={getPosterUrl(item.poster_path, 'sm')} alt={title} className={styles.rankPoster} loading="lazy" />
        <div className={styles.rankInfo}>
          <span className={styles.rankTitle}>{title}</span>
          <span className={styles.rankYear}>{year}</span>
          {item.genre_ids?.slice(0, 2).map(g => (
            <span key={g} className={styles.rankGenre}>{g}</span>
          ))}
        </div>
        <div className={styles.rankRating} style={{ color: rColor, borderColor: rColor }}>
          ★ {rating}
        </div>
      </Link>
    </li>
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
            <div className={`skeleton`} style={{ height: 14, width: '70%' }} />
            <div className={`skeleton`} style={{ height: 11, width: '30%' }} />
          </div>
          <div className={`skeleton`} style={{ width: 52, height: 26 }} />
        </div>
      ))}
    </div>
  )
}
