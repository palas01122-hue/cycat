import { useSearchParams, useNavigate } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, SlidersHorizontal, ChevronLeft, Film, Tv } from 'lucide-react'
import { searchAPI, searchAdvancedAPI, catalogAPI } from '../services/api'
import { useFetch } from '../hooks/useFetch'
import MediaGrid from '../components/catalog/MediaGrid'
import styles from './SearchPage.module.css'

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.05 } }
}

export default function SearchPage() {
  const [searchParams] = useSearchParams()
  const query = searchParams.get('q') || ''
  const [results,      setResults]      = useState([])
  const [loading,      setLoading]      = useState(false)
  const [error,        setError]        = useState(null)
  const [filter,       setFilter]       = useState('all')
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [type,         setType]         = useState('movie')
  const [year,         setYear]         = useState('')
  const [genre,        setGenre]        = useState('')
  const [minRating,    setMinRating]    = useState('')
  const [maxRuntime,   setMaxRuntime]   = useState('')
  const [language,     setLanguage]     = useState('')

  const { data: genreData } = useFetch(() => catalogAPI.getGenres(type), [type])

  const LANGUAGES = [
    { code: '', label: 'Todos' }, { code: 'es', label: 'Español' },
    { code: 'en', label: 'Inglés' }, { code: 'fr', label: 'Francés' },
    { code: 'ja', label: 'Japonés' }, { code: 'ko', label: 'Coreano' },
    { code: 'pt', label: 'Portugués' }, { code: 'it', label: 'Italiano' },
  ]
  const YEARS = ['', ...Array.from({ length: 30 }, (_, i) => String(new Date().getFullYear() - i))]

  useEffect(() => {
    if (showAdvanced) { runAdvanced() }
    else if (query.trim()) { runSimple() }
  }, [query, filter])

  const runSimple = () => {
    setLoading(true); setError(null)
    searchAPI.search(query)
      .then(res => setResults(res.data.results || []))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }

  const runAdvanced = () => {
    setLoading(true); setError(null)
    searchAdvancedAPI.search({ q: query || undefined, type, year: year || undefined, genre: genre || undefined, minRating: minRating || undefined, maxRuntime: maxRuntime || undefined, language: language || undefined })
      .then(res => setResults(res.data.results || []))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }

  const filtered = showAdvanced ? results : results.filter(r => {
    if (filter === 'all') return r.media_type !== 'person'
    return r.media_type === filter
  })

  return (
    <motion.div
      className={`container ${styles.page}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <Helmet>
        <title>{query ? `Resultados para "${query}" — CyCat` : 'Búsqueda — CyCat'}</title>
        <meta name="description" content={query ? `Resultados de búsqueda para "${query}" en CyCat. Películas, series y más.` : 'Buscá películas y series en CyCat con filtros avanzados.'} />
        <meta name="robots" content="noindex, follow" />
      </Helmet>
      <motion.header className={styles.header} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}>
        <div className={styles.headerTop}>
          <Search size={20} className={styles.headerIcon} />
          <h1 className="heading-md">
            {query ? <>Resultados para <span className={styles.query}>"{query}"</span></> : 'Búsqueda avanzada'}
          </h1>
        </div>
        {!loading && filtered.length > 0 && (
          <motion.p className={styles.count} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            {filtered.length} resultados
          </motion.p>
        )}
      </motion.header>

      {/* Controles */}
      <motion.div className={styles.modeRow} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
        {!showAdvanced ? (
          <>
            <div className={styles.filters}>
              {[
                { key: 'all',   label: 'Todo',      icon: null },
                { key: 'movie', label: 'Películas',  icon: <Film size={13} /> },
                { key: 'tv',    label: 'Series',     icon: <Tv size={13} /> },
              ].map(({ key, label, icon }) => (
                <motion.button
                  key={key}
                  className={filter === key ? styles.activeFilter : styles.filterBtn}
                  onClick={() => setFilter(key)}
                  whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                >
                  {icon}{label}
                </motion.button>
              ))}
            </div>
            <motion.button className={styles.advancedToggle} onClick={() => setShowAdvanced(true)} whileHover={{ scale: 1.03 }}>
              <SlidersHorizontal size={14} /> Filtros avanzados
            </motion.button>
          </>
        ) : (
          <motion.button className={styles.advancedToggle} onClick={() => { setShowAdvanced(false); runSimple() }} whileHover={{ scale: 1.03 }}>
            <ChevronLeft size={14} /> Búsqueda simple
          </motion.button>
        )}
      </motion.div>

      {/* Panel avanzado */}
      <AnimatePresence>
        {showAdvanced && (
          <motion.div
            className={styles.advancedPanel}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
          >
            <div className={styles.advRow}>
              <div className={styles.advField}>
                <label>Tipo</label>
                <div className={styles.typeBtns}>
                  <button className={type === 'movie' ? styles.typeActive : styles.typeBtn} onClick={() => setType('movie')}><Film size={13} /> Película</button>
                  <button className={type === 'tv'    ? styles.typeActive : styles.typeBtn} onClick={() => setType('tv')}><Tv size={13} /> Serie</button>
                </div>
              </div>
              <div className={styles.advField}>
                <label>Año</label>
                <select value={year} onChange={e => setYear(e.target.value)} className={styles.select}>
                  {YEARS.map(y => <option key={y} value={y}>{y || 'Cualquier año'}</option>)}
                </select>
              </div>
              <div className={styles.advField}>
                <label>Género</label>
                <select value={genre} onChange={e => setGenre(e.target.value)} className={styles.select}>
                  <option value="">Todos</option>
                  {(genreData?.genres || []).map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                </select>
              </div>
              <div className={styles.advField}>
                <label>Idioma</label>
                <select value={language} onChange={e => setLanguage(e.target.value)} className={styles.select}>
                  {LANGUAGES.map(l => <option key={l.code} value={l.code}>{l.label}</option>)}
                </select>
              </div>
              {type === 'movie' && (
                <div className={styles.advField}>
                  <label>Duración máx (min)</label>
                  <select value={maxRuntime} onChange={e => setMaxRuntime(e.target.value)} className={styles.select}>
                    <option value="">Cualquiera</option>
                    {[90, 120, 150, 180].map(r => <option key={r} value={r}>{r} min</option>)}
                  </select>
                </div>
              )}
              <div className={styles.advField}>
                <label>Rating mínimo</label>
                <select value={minRating} onChange={e => setMinRating(e.target.value)} className={styles.select}>
                  <option value="">Cualquiera</option>
                  {[5, 6, 7, 7.5, 8, 8.5].map(r => <option key={r} value={r}>≥ {r}</option>)}
                </select>
              </div>
            </div>
            <motion.button className={styles.searchBtn} onClick={runAdvanced} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
              <Search size={15} /> Buscar
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {error && <motion.p className={styles.error} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>{error}</motion.p>}

      <AnimatePresence mode="wait">
        <motion.div key={filter + query} variants={containerVariants} initial="hidden" animate="visible">
          <MediaGrid items={filtered} loading={loading} skeletonCount={12} />
        </motion.div>
      </AnimatePresence>

      {!loading && !error && filtered.length === 0 && (
        <motion.div className={styles.empty} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <p>No se encontraron resultados</p>
        </motion.div>
      )}
    </motion.div>
  )
}
