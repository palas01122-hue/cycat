import { useState } from 'react'
import { Link } from 'react-router-dom'
import { discoverAPI, catalogAPI } from '../services/api'
import { useFetch } from '../hooks/useFetch'
import { getPosterUrl, getBackdropUrl, formatYear, formatRating, getRatingColor } from '../utils/tmdb'
import styles from './WhatToWatchPage.module.css'

const MOODS = [
  { key: 'accion',    label: '💥 Acción',      desc: 'Adrenalina pura' },
  { key: 'comedia',   label: '😂 Comedia',     desc: 'Para reírse' },
  { key: 'romance',   label: '💕 Romance',     desc: 'Amor y sentimientos' },
  { key: 'terror',    label: '👻 Terror',      desc: 'Para asustarse' },
  { key: 'drama',     label: '🎭 Drama',       desc: 'Historias profundas' },
  { key: 'animacion', label: '🎨 Animación',   desc: 'Para todas las edades' },
  { key: 'documental',label: '🎥 Documental',  desc: 'Historias reales' },
  { key: 'ciencia',   label: '🚀 Sci-Fi',      desc: 'Futuros posibles' },
  { key: 'familiar',  label: '👨‍👩‍👧 Familiar',   desc: 'Para ver en familia' },
]

export default function WhatToWatchPage() {
  const [type, setType]       = useState('movie')
  const [mood, setMood]       = useState(null)
  const [maxRuntime, setMax]  = useState(null)
  const [minRating, setMin]   = useState(6)
  const [result, setResult]   = useState(null)
  const [loading, setLoading] = useState(false)
  const [spun, setSpun]       = useState(false)

  const spin = async () => {
    setLoading(true)
    setSpun(true)
    setResult(null)
    try {
      const params = { type, minRating }
      if (mood)       params.mood = mood
      if (maxRuntime) params.maxRuntime = maxRuntime
      const res = await discoverAPI.random(params)
      setResult(res.data)
    } catch {}
    setLoading(false)
  }

  return (
    <div className={`container page-enter ${styles.page}`}>
      <div className={styles.header}>
        <h1 className="heading-lg">🎲 ¿Qué veo hoy?</h1>
        <p className={styles.sub}>Configurá tus filtros y dejá que CyCat elija por vos</p>
      </div>

      <div className={styles.layout}>
        {/* Panel de filtros */}
        <div className={styles.filters}>
          {/* Tipo */}
          <div className={styles.filterGroup}>
            <label className={styles.filterLabel}>Tipo de contenido</label>
            <div className={styles.typeBtns}>
              <button className={type === 'movie' ? styles.typeActive : styles.typeBtn} onClick={() => setType('movie')}>🎬 Película</button>
              <button className={type === 'tv'    ? styles.typeActive : styles.typeBtn} onClick={() => setType('tv')}>📺 Serie</button>
            </div>
          </div>

          {/* Estado de ánimo */}
          <div className={styles.filterGroup}>
            <label className={styles.filterLabel}>¿Cómo estás hoy?</label>
            <div className={styles.moodGrid}>
              {MOODS.map(m => (
                <button
                  key={m.key}
                  className={mood === m.key ? styles.moodActive : styles.moodBtn}
                  onClick={() => setMood(mood === m.key ? null : m.key)}
                >
                  <span className={styles.moodLabel}>{m.label}</span>
                  <span className={styles.moodDesc}>{m.desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Duración (solo películas) */}
          {type === 'movie' && (
            <div className={styles.filterGroup}>
              <label className={styles.filterLabel}>Duración máxima</label>
              <div className={styles.durationBtns}>
                {[null, 90, 120, 150].map(d => (
                  <button
                    key={d}
                    className={maxRuntime === d ? styles.durationActive : styles.durationBtn}
                    onClick={() => setMax(d)}
                  >
                    {d ? `≤ ${d} min` : 'Cualquiera'}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Rating mínimo */}
          <div className={styles.filterGroup}>
            <label className={styles.filterLabel}>Rating mínimo: <strong>{minRating}/10</strong></label>
            <input
              type="range" min="5" max="9" step="0.5"
              value={minRating}
              onChange={e => setMin(parseFloat(e.target.value))}
              className={styles.slider}
            />
            <div className={styles.sliderLabels}><span>5.0</span><span>9.0</span></div>
          </div>

          {/* Botón ruleta */}
          <button
            className={`${styles.spinBtn} ${loading ? styles.spinning : ''}`}
            onClick={spin}
            disabled={loading}
          >
            {loading ? '🎰 Buscando...' : spun ? '🎲 Otra vez' : '🎲 ¡Sorprendeme!'}
          </button>
        </div>

        {/* Resultado */}
        <div className={styles.result}>
          {!spun && !result && (
            <div className={styles.placeholder}>
              <div className={styles.placeholderIcon}>🎬</div>
              <p>Configurá tus filtros y presioná el botón</p>
              <p className={styles.placeholderSub}>CyCat va a elegir algo perfecto para vos</p>
            </div>
          )}

          {loading && (
            <div className={styles.placeholder}>
              <div className={`${styles.placeholderIcon} ${styles.rolling}`}>🎲</div>
              <p>Eligiendo algo perfecto...</p>
            </div>
          )}

          {result?.item && !loading && (
            <ResultCard item={result.item} type={type} />
          )}

          {spun && !loading && !result?.item && (
            <div className={styles.placeholder}>
              <p>😅 No encontramos nada con esos filtros</p>
              <p className={styles.placeholderSub}>Probá con filtros más amplios</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function ResultCard({ item, type }) {
  const title  = item.title || item.name
  const year   = formatYear(item.release_date || item.first_air_date)
  const rating = formatRating(item.vote_average)
  const rColor = getRatingColor(item.vote_average)

  return (
    <div className={styles.card}>
      <div className={styles.cardBackdrop}>
        <img src={getBackdropUrl(item.backdrop_path, 'md')} alt="" className={styles.backdropImg} />
        <div className={styles.cardBackdropOverlay} />
      </div>
      <div className={styles.cardContent}>
        <img src={getPosterUrl(item.poster_path, 'md')} alt={title} className={styles.poster} />
        <div className={styles.info}>
          <div className={styles.ratingBadge} style={{ color: rColor, borderColor: rColor }}>
            ★ {rating}
          </div>
          <h2 className={styles.cardTitle}>{title}</h2>
          <p className={styles.cardYear}>{year} · {type === 'movie' ? 'Película' : 'Serie'}</p>
          <p className={styles.cardOverview}>{item.overview}</p>
          <div className={styles.cardActions}>
            <Link to={`/${type}/${item.id}`} className={styles.watchBtn}>
              Ver ficha completa →
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
