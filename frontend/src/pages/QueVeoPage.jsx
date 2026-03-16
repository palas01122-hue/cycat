import { useState } from 'react'
import { Link } from 'react-router-dom'
import { catalogAPI } from '../services/api'
import { getPosterUrl, formatRating, formatYear, getRatingColor } from '../utils/tmdb'
import styles from './QueVeoPage.module.css'

const GENRES_MOVIE = [
  { id: 28,    name: '💥 Acción' },
  { id: 35,    name: '😂 Comedia' },
  { id: 18,    name: '🎭 Drama' },
  { id: 27,    name: '👻 Terror' },
  { id: 10749, name: '💕 Romance' },
  { id: 878,   name: '🚀 Ciencia ficción' },
  { id: 12,    name: '🗺️ Aventura' },
  { id: 53,    name: '😰 Thriller' },
  { id: 16,    name: '🎨 Animación' },
  { id: 99,    name: '🎥 Documental' },
]

const GENRES_TV = [
  { id: 10759, name: '💥 Acción' },
  { id: 35,    name: '😂 Comedia' },
  { id: 18,    name: '🎭 Drama' },
  { id: 9648,  name: '🔍 Misterio' },
  { id: 10765, name: '🚀 Sci-Fi/Fantasy' },
  { id: 80,    name: '🕵️ Crimen' },
  { id: 10751, name: '👨‍👩‍👧 Familia' },
  { id: 16,    name: '🎨 Animación' },
]

const MOODS = [
  { id: 'reir',    label: '😂 Quiero reírme',       genres: [35] },
  { id: 'llorar',  label: '😢 Quiero llorar',         genres: [18, 10749] },
  { id: 'asustar', label: '😱 Quiero asustarme',      genres: [27, 53] },
  { id: 'pensar',  label: '🤔 Quiero pensar',         genres: [18, 99, 878] },
  { id: 'accion',  label: '💪 Quiero adrenalina',     genres: [28, 12, 53] },
  { id: 'sorpresa',label: '🎲 Sorprendeme',           genres: [] },
]

export default function QueVeoPage() {
  const [step, setStep]         = useState('mood')   // mood | config | result
  const [type, setType]         = useState('movie')
  const [selectedMood, setMood] = useState(null)
  const [genreId, setGenreId]   = useState(null)
  const [result, setResult]     = useState(null)
  const [loading, setLoading]   = useState(false)
  const [spin, setSpin]         = useState(false)

  const genres = type === 'movie' ? GENRES_MOVIE : GENRES_TV

  const pickRandom = async () => {
    setLoading(true)
    setSpin(true)
    try {
      // Elegir géneros según el mood o selección manual
      let gId = genreId
      if (!gId && selectedMood) {
        const moodGenres = MOODS.find(m => m.id === selectedMood)?.genres || []
        gId = moodGenres.length > 0
          ? moodGenres[Math.floor(Math.random() * moodGenres.length)]
          : null
      }

      const page = Math.floor(Math.random() * 5) + 1
      const res  = gId
        ? await catalogAPI.getByGenre(type, gId, page)
        : await catalogAPI.getTopRated(type, page)

      const items = res.data?.results?.filter(i => i.poster_path && i.vote_average >= 6) || []
      if (items.length > 0) {
        setResult(items[Math.floor(Math.random() * items.length)])
        setStep('result')
      }
    } catch {}
    setLoading(false)
    setTimeout(() => setSpin(false), 600)
  }

  const reset = () => {
    setStep('mood')
    setResult(null)
    setMood(null)
    setGenreId(null)
  }

  return (
    <div className={`container page-enter ${styles.page}`}>
      {/* Header */}
      <div className={styles.header}>
        <h1 className={`heading-lg ${styles.title}`}>🎲 ¿Qué veo hoy?</h1>
        <p className={styles.sub}>Decinos cómo te sentís y te recomendamos algo perfecto</p>
      </div>

      {/* Tipo */}
      <div className={styles.typeToggle}>
        <button
          className={type === 'movie' ? styles.typeActive : styles.typeBtn}
          onClick={() => { setType('movie'); setGenreId(null) }}
        >🎬 Película</button>
        <button
          className={type === 'tv' ? styles.typeActive : styles.typeBtn}
          onClick={() => { setType('tv'); setGenreId(null) }}
        >📺 Serie</button>
      </div>

      {step === 'mood' && (
        <div className={styles.moodGrid}>
          {MOODS.map(m => (
            <button
              key={m.id}
              className={`${styles.moodCard} ${selectedMood === m.id ? styles.moodActive : ''}`}
              onClick={() => { setMood(m.id); setGenreId(null); setStep('config') }}
            >
              {m.label}
            </button>
          ))}
        </div>
      )}

      {step === 'config' && (
        <div className={styles.configSection}>
          <h3 className={styles.configTitle}>¿Tenés ganas de algún género en particular?</h3>
          <div className={styles.genreGrid}>
            <button
              className={!genreId ? styles.genreActive : styles.genreBtn}
              onClick={() => setGenreId(null)}
            >
              🎲 Cualquiera
            </button>
            {genres.map(g => (
              <button
                key={g.id}
                className={genreId === g.id ? styles.genreActive : styles.genreBtn}
                onClick={() => setGenreId(g.id)}
              >
                {g.name}
              </button>
            ))}
          </div>

          <div className={styles.spinWrap}>
            <button
              className={`${styles.spinBtn} ${spin ? styles.spinning : ''}`}
              onClick={pickRandom}
              disabled={loading}
            >
              {loading ? '🎲 Buscando...' : '🎲 ¡Dame una recomendación!'}
            </button>
            <button className={styles.backBtn} onClick={() => setStep('mood')}>← Cambiar humor</button>
          </div>
        </div>
      )}

      {step === 'result' && result && (
        <div className={styles.resultSection}>
          <p className={styles.resultLabel}>🎉 Esta noche te recomendamos...</p>

          <div className={styles.resultCard}>
            <img
              src={getPosterUrl(result.poster_path, 'lg')}
              alt={result.title || result.name}
              className={styles.resultPoster}
            />
            <div className={styles.resultInfo}>
              <h2 className={styles.resultTitle}>{result.title || result.name}</h2>
              <div className={styles.resultMeta}>
                <span>{formatYear(result.release_date || result.first_air_date)}</span>
                <span
                  className={styles.resultRating}
                  style={{ color: getRatingColor(result.vote_average) }}
                >
                  ★ {formatRating(result.vote_average)}
                </span>
              </div>
              <p className={styles.resultOverview}>{result.overview}</p>

              <div className={styles.resultActions}>
                <Link
                  to={`/${type}/${result.id}`}
                  className={styles.viewBtn}
                >
                  Ver ficha completa →
                </Link>
                <button className={styles.againBtn} onClick={pickRandom} disabled={loading}>
                  {loading ? 'Buscando...' : '🎲 Otra sugerencia'}
                </button>
                <button className={styles.resetBtn} onClick={reset}>
                  Empezar de nuevo
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
