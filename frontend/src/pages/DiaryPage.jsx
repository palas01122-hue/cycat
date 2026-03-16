import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useFetch } from '../hooks/useFetch'
import { diaryAPI } from '../services/api'
import { useAuth } from '../hooks/useAuth'
import { getPosterUrl, getRatingColor } from '../utils/tmdb'
import { Navigate } from 'react-router-dom'
import styles from './DiaryPage.module.css'

export default function DiaryPage() {
  const { isAuthenticated, loading: authLoading } = useAuth()
  const [year,  setYear]    = useState(new Date().getFullYear())
  const [month, setMonth]   = useState(null)
  const [refresh, setRefresh] = useState(0)

  const { data, loading } = useFetch(
    () => diaryAPI.getAll({ year, ...(month ? { month } : {}) }),
    [year, month, refresh]
  )

  const { data: statsData } = useFetch(() => diaryAPI.getStats(), [refresh])

  if (authLoading) return null
  if (!isAuthenticated) return <Navigate to="/login" replace />

  const entries = data?.entries || []
  const stats   = statsData

  const grouped = entries.reduce((acc, e) => {
    const key = e.watched_date?.slice(0,7) // YYYY-MM
    if (!acc[key]) acc[key] = []
    acc[key].push(e)
    return acc
  }, {})

  const MONTHS = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic']
  const YEARS  = Array.from({ length: 6 }, (_, i) => new Date().getFullYear() - i)

  const handleDelete = async (id) => {
    await diaryAPI.delete(id)
    setRefresh(r => r + 1)
  }

  return (
    <div className={`container page-enter ${styles.page}`}>
      <div className={styles.header}>
        <h1 className="heading-lg">📅 Mi Diario</h1>
        <p className={styles.sub}>Todo lo que viste, con fecha y calificación</p>
      </div>

      {/* Stats rápidas */}
      {stats && (
        <div className={styles.quickStats}>
          <div className={styles.qs}><span className={styles.qsNum}>{stats.total}</span><span className={styles.qsLabel}>Total visto</span></div>
          {stats.byMonth?.slice(0,3).map(m => (
            <div key={m.month} className={styles.qs}>
              <span className={styles.qsNum}>{m.count}</span>
              <span className={styles.qsLabel}>{m.month}</span>
            </div>
          ))}
        </div>
      )}

      {/* Filtros */}
      <div className={styles.filtersRow}>
        <div className={styles.yearBtns}>
          {YEARS.map(y => (
            <button key={y} className={year === y ? styles.yearActive : styles.yearBtn} onClick={() => { setYear(y); setMonth(null) }}>
              {y}
            </button>
          ))}
        </div>
        <div className={styles.monthBtns}>
          <button className={!month ? styles.monthActive : styles.monthBtn} onClick={() => setMonth(null)}>Todos</button>
          {MONTHS.map((m, i) => (
            <button
              key={i}
              className={month === i+1 ? styles.monthActive : styles.monthBtn}
              onClick={() => setMonth(i+1)}
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      {/* Entradas agrupadas por mes */}
      {loading ? (
        <div className={styles.loading}>Cargando diario...</div>
      ) : entries.length === 0 ? (
        <div className={styles.empty}>
          <p>No hay entradas en este período.</p>
          <p className={styles.emptySub}>Calificá contenido en las fichas para registrar en tu diario.</p>
        </div>
      ) : (
        <div className={styles.groups}>
          {Object.entries(grouped).sort((a,b) => b[0].localeCompare(a[0])).map(([monthKey, items]) => {
            const [y, m] = monthKey.split('-')
            const monthName = MONTHS[parseInt(m) - 1]
            return (
              <div key={monthKey} className={styles.monthGroup}>
                <h3 className={styles.monthTitle}>{monthName} {y} <span className={styles.monthCount}>· {items.length}</span></h3>
                <div className={styles.entriesGrid}>
                  {items.map(entry => (
                    <DiaryEntry key={entry.id} entry={entry} onDelete={handleDelete} />
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

function DiaryEntry({ entry, onDelete }) {
  const rColor = entry.score ? getRatingColor(entry.score) : null
  const date = entry.watched_date ? new Date(entry.watched_date + 'T00:00:00').toLocaleDateString('es-AR', { day:'numeric', month:'short' }) : ''

  return (
    <div className={styles.entry}>
      <Link to={`/${entry.content_type}/${entry.content_id}`} className={styles.entryLink}>
        <img src={getPosterUrl(entry.poster_path, 'sm')} alt={entry.title} className={styles.entryPoster} loading="lazy" />
        <div className={styles.entryInfo}>
          <span className={styles.entryTitle}>{entry.title || `ID: ${entry.content_id}`}</span>
          <span className={styles.entryDate}>{date}</span>
          {entry.score && (
            <span className={styles.entryScore} style={{ color: rColor, borderColor: rColor }}>★ {Number(entry.score).toFixed(1)}</span>
          )}
        </div>
      </Link>
      <button onClick={() => onDelete(entry.id)} className={styles.entryDelete} title="Eliminar entrada">✕</button>
    </div>
  )
}
