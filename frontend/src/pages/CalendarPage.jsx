import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { calendarAPI } from '../services/api'
import { getPosterUrl } from '../utils/tmdb'
import styles from './CalendarPage.module.css'

const PROVIDERS = [
  { id: '',     label: 'Todas' },
  { id: '8',    label: 'Netflix',     color: '#E50914' },
  { id: '337',  label: 'Disney+',     color: '#113CCF' },
  { id: '119',  label: 'Prime',       color: '#00A8E0' },
  { id: '350',  label: 'Apple TV+',   color: '#555' },
  { id: '1899', label: 'Max',         color: '#002BE7' },
  { id: '531',  label: 'Paramount+',  color: '#0064FF' },
]

function groupByWeek(items) {
  const groups = {}
  items.forEach(item => {
    const d = new Date(item.release_date + 'T00:00:00')
    if (isNaN(d)) return
    // Lunes de esa semana
    const day = d.getDay() || 7
    const monday = new Date(d); monday.setDate(d.getDate() - day + 1)
    const key = monday.toISOString().split('T')[0]
    if (!groups[key]) groups[key] = []
    groups[key].push(item)
  })
  return Object.entries(groups).sort(([a], [b]) => a.localeCompare(b))
}

function formatWeekLabel(dateStr) {
  const d = new Date(dateStr + 'T00:00:00')
  const end = new Date(d); end.setDate(d.getDate() + 6)
  const opts = { day: 'numeric', month: 'long' }
  return `${d.toLocaleDateString('es-AR', opts)} — ${end.toLocaleDateString('es-AR', opts)}`
}

function formatDay(dateStr) {
  const d = new Date(dateStr + 'T00:00:00')
  return d.toLocaleDateString('es-AR', { weekday: 'short', day: 'numeric', month: 'short' })
}

export default function CalendarPage() {
  const [type, setType] = useState('movie')
  const [provider, setProvider] = useState('')
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)

  useEffect(() => {
    setItems([])
    setPage(1)
    setHasMore(true)
    fetchData(1, true)
  }, [type, provider])

  const fetchData = (p = 1, reset = false) => {
    setLoading(true)
    calendarAPI.getUpcoming({ type, provider: provider || undefined, page: p })
      .then(res => {
        const results = res.data.results || []
        setItems(prev => reset ? results : [...prev, ...results])
        setHasMore(p < (res.data.total_pages || 1) && results.length > 0)
        setPage(p)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }

  const weeks = groupByWeek(items)

  return (
    <div className={`container page-enter ${styles.page}`}>
      <Helmet>
        <title>Calendario de Estrenos — CyCat</title>
        <meta name="description" content="Próximos estrenos de películas y series. Filtrá por plataforma de streaming." />
      </Helmet>

      <header className={styles.header}>
        <h1 className={`heading-md ${styles.title}`}>Calendario de Estrenos</h1>
        <p className={styles.subtitle}>Próximos 60 días · Región Argentina</p>
      </header>

      <div className={styles.controls}>
        <div className={styles.typeTabs}>
          <button className={type === 'movie' ? styles.tabActive : styles.tab} onClick={() => setType('movie')}>🎬 Películas</button>
          <button className={type === 'tv'    ? styles.tabActive : styles.tab} onClick={() => setType('tv')}>📺 Series</button>
        </div>
        <div className={styles.providers}>
          {PROVIDERS.map(p => (
            <button
              key={p.id}
              className={provider === p.id ? styles.providerActive : styles.providerBtn}
              style={provider === p.id && p.color ? { borderColor: p.color, color: p.color } : {}}
              onClick={() => setProvider(p.id)}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {loading && items.length === 0 && (
        <div className={styles.loadingGrid}>
          {Array.from({ length: 8 }).map((_, i) => <div key={i} className={`skeleton ${styles.skCard}`} />)}
        </div>
      )}

      {weeks.map(([weekStart, releases]) => (
        <section key={weekStart} className={styles.weekSection}>
          <h2 className={styles.weekTitle}>{formatWeekLabel(weekStart)}</h2>
          <div className={styles.releaseGrid}>
            {releases.map(item => (
              <Link
                key={item.id}
                to={`/${item.media_type}/${item.id}`}
                className={styles.card}
              >
                <div className={styles.posterWrap}>
                  <img
                    src={getPosterUrl(item.poster_path, 'sm')}
                    alt={item.title || item.name}
                    className={styles.poster}
                    loading="lazy"
                  />
                  <div className={styles.dateTag}>{formatDay(item.release_date)}</div>
                  {item.vote_average > 0 && (
                    <div className={styles.ratingTag}>{item.vote_average.toFixed(1)}</div>
                  )}
                </div>
                <div className={styles.info}>
                  <span className={styles.itemTitle}>{item.title || item.name}</span>
                  {item.original_title && item.original_title !== (item.title || item.name) && (
                    <span className={styles.originalTitle}>{item.original_title}</span>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </section>
      ))}

      {!loading && items.length === 0 && (
        <div className={styles.empty}>
          <p>No se encontraron estrenos para los filtros seleccionados.</p>
        </div>
      )}

      {hasMore && !loading && (
        <button className={styles.loadMore} onClick={() => fetchData(page + 1)}>
          Cargar más estrenos
        </button>
      )}
      {loading && items.length > 0 && <div className={styles.loadingMore}>Cargando...</div>}
    </div>
  )
}
