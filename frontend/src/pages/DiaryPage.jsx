import { useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Calendar, Clock, Trash2, BookOpen, Film } from 'lucide-react'
import { useFetch } from '../hooks/useFetch'
import { diaryAPI } from '../services/api'
import { useAuth } from '../hooks/useAuth'
import { getPosterUrl, getRatingColor } from '../utils/tmdb'
import styles from './DiaryPage.module.css'

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.06 } }
}
const itemVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.35, ease: 'easeOut' } }
}

export default function DiaryPage() {
  const { isAuthenticated, loading: authLoading } = useAuth()
  const [year,    setYear]    = useState(new Date().getFullYear())
  const [month,   setMonth]   = useState(null)
  const [refresh, setRefresh] = useState(0)

  const { data, loading }   = useFetch(() => diaryAPI.getAll({ year, ...(month ? { month } : {}) }), [year, month, refresh])
  const { data: statsData } = useFetch(() => diaryAPI.getStats(), [refresh])

  if (authLoading) return null
  if (!isAuthenticated) return <Navigate to="/login" replace />

  const entries = data?.entries || []
  const stats   = statsData

  const grouped = entries.reduce((acc, e) => {
    const key = e.watched_date?.slice(0, 7)
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
    <motion.div
      className={`container ${styles.page}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className={styles.header}>
        <div className={styles.headerTitle}>
          <BookOpen size={28} className={styles.headerIcon} />
          <h1 className="heading-lg">Mi Diario</h1>
        </div>
        <p className={styles.sub}>Todo lo que viste, con fecha y calificación</p>
      </div>

      {/* Stats rápidas */}
      {stats && (
        <motion.div className={styles.quickStats}
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
          <div className={styles.qs}>
            <Film size={18} className={styles.qsIcon} />
            <span className={styles.qsNum}>{stats.total}</span>
            <span className={styles.qsLabel}>Total visto</span>
          </div>
          {stats.byMonth?.slice(0, 3).map(m => (
            <div key={m.month} className={styles.qs}>
              <Calendar size={16} className={styles.qsIcon} />
              <span className={styles.qsNum}>{m.count}</span>
              <span className={styles.qsLabel}>{m.month}</span>
            </div>
          ))}
        </motion.div>
      )}

      {/* Filtros */}
      <motion.div className={styles.filtersRow} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
        <div className={styles.yearBtns}>
          {YEARS.map(y => (
            <motion.button key={y} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              className={year === y ? styles.yearActive : styles.yearBtn}
              onClick={() => { setYear(y); setMonth(null) }}>
              {y}
            </motion.button>
          ))}
        </div>
        <div className={styles.monthBtns}>
          <button className={!month ? styles.monthActive : styles.monthBtn} onClick={() => setMonth(null)}>Todos</button>
          {MONTHS.map((m, i) => (
            <button key={i} className={month === i+1 ? styles.monthActive : styles.monthBtn} onClick={() => setMonth(i+1)}>{m}</button>
          ))}
        </div>
      </motion.div>

      {/* Entradas */}
      {loading ? (
        <div className={styles.loading}><Clock size={18} /> Cargando diario...</div>
      ) : entries.length === 0 ? (
        <motion.div className={styles.empty} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <p>No hay entradas en este período.</p>
          <p className={styles.emptySub}>Calificá contenido en las fichas para registrar en tu diario.</p>
        </motion.div>
      ) : (
        <div className={styles.groups}>
          {Object.entries(grouped).sort((a, b) => b[0].localeCompare(a[0])).map(([monthKey, items]) => {
            const [y, m] = monthKey.split('-')
            const monthName = MONTHS[parseInt(m) - 1]
            return (
              <motion.div key={monthKey} className={styles.monthGroup}
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ duration: 0.4 }}>
                <h3 className={styles.monthTitle}>
                  <Calendar size={15} />
                  {monthName} {y} <span className={styles.monthCount}>· {items.length}</span>
                </h3>
                <motion.div className={styles.entriesGrid} variants={containerVariants} initial="hidden" animate="visible">
                  {items.map(entry => (
                    <motion.div key={entry.id} variants={itemVariants}>
                      <DiaryEntry entry={entry} onDelete={handleDelete} />
                    </motion.div>
                  ))}
                </motion.div>
              </motion.div>
            )
          })}
        </div>
      )}
    </motion.div>
  )
}

function DiaryEntry({ entry, onDelete }) {
  const rColor = entry.score ? getRatingColor(entry.score) : null
  const date   = entry.watched_date ? new Date(entry.watched_date + 'T00:00:00').toLocaleDateString('es-AR', { day: 'numeric', month: 'short' }) : ''

  return (
    <motion.div className={styles.entry} whileHover={{ y: -3 }} transition={{ duration: 0.2 }}>
      <Link to={`/${entry.content_type}/${entry.content_id}`} className={styles.entryLink}>
        <img src={getPosterUrl(entry.poster_path, 'sm')} alt={entry.title} className={styles.entryPoster} loading="lazy" />
        <div className={styles.entryInfo}>
          <span className={styles.entryTitle}>{entry.title || `ID: ${entry.content_id}`}</span>
          <span className={styles.entryDate}><Clock size={11} /> {date}</span>
          {entry.score && (
            <span className={styles.entryScore} style={{ color: rColor, borderColor: rColor }}>★ {Number(entry.score).toFixed(1)}</span>
          )}
        </div>
      </Link>
      <motion.button
        onClick={() => onDelete(entry.id)}
        className={styles.entryDelete}
        title="Eliminar entrada"
        whileHover={{ scale: 1.15, color: 'var(--color-accent-2)' }}
        whileTap={{ scale: 0.9 }}
      >
        <Trash2 size={14} />
      </motion.button>
    </motion.div>
  )
}
