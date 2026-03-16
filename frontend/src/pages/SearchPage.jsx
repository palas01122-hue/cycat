import { useSearchParams, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { searchAPI, searchAdvancedAPI, catalogAPI } from '../services/api'
import { useFetch } from '../hooks/useFetch'
import MediaGrid from '../components/catalog/MediaGrid'
import styles from './SearchPage.module.css'

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const query   = searchParams.get('q') || ''
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState(null)
  const [filter, setFilter]   = useState('all')
  const [showAdvanced, setShowAdvanced] = useState(false)

  // Filtros avanzados
  const [type,       setType]       = useState('movie')
  const [year,       setYear]       = useState('')
  const [genre,      setGenre]      = useState('')
  const [minRating,  setMinRating]  = useState('')
  const [maxRuntime, setMaxRuntime] = useState('')
  const [language,   setLanguage]   = useState('')

  const { data: genreData } = useFetch(() => catalogAPI.getGenres(type), [type])

  const LANGUAGES = [
    { code: '', label: 'Todos' }, { code: 'es', label: 'Español' },
    { code: 'en', label: 'Inglés' }, { code: 'fr', label: 'Francés' },
    { code: 'ja', label: 'Japonés' }, { code: 'ko', label: 'Coreano' },
    { code: 'pt', label: 'Portugués' }, { code: 'it', label: 'Italiano' },
  ]
  const YEARS = ['', ...Array.from({ length: 30 }, (_, i) => String(new Date().getFullYear() - i))]

  useEffect(() => {
    if (showAdvanced) {
      runAdvanced()
    } else if (query.trim()) {
      runSimple()
    }
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
    searchAdvancedAPI.search({ q: query || undefined, type, year: year||undefined, genre: genre||undefined, minRating: minRating||undefined, maxRuntime: maxRuntime||undefined, language: language||undefined })
      .then(res => setResults(res.data.results || []))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }

  const filtered = showAdvanced ? results : results.filter(r => {
    if (filter === 'all') return r.media_type !== 'person'
    return r.media_type === filter
  })

  return (
    <div className={`container page-enter ${styles.page}`}>
      <header className={styles.header}>
        <h1 className="heading-md">
          {query ? <>Resultados para <span className={styles.query}>"{query}"</span></> : 'Búsqueda avanzada'}
        </h1>
        {!loading && filtered.length > 0 && <p className={styles.count}>{filtered.length} resultados</p>}
      </header>

      {/* Toggle avanzado */}
      <div className={styles.modeRow}>
        {!showAdvanced ? (
          <>
            <div className={styles.filters}>
              {['all', 'movie', 'tv'].map(f => (
                <button key={f} className={filter === f ? styles.activeFilter : styles.filterBtn} onClick={() => setFilter(f)}>
                  {{ all: 'Todo', movie: 'Películas', tv: 'Series' }[f]}
                </button>
              ))}
            </div>
            <button className={styles.advancedToggle} onClick={() => setShowAdvanced(true)}>⚙️ Filtros avanzados</button>
          </>
        ) : (
          <button className={styles.advancedToggle} onClick={() => { setShowAdvanced(false); runSimple() }}>← Búsqueda simple</button>
        )}
      </div>

      {/* Panel de filtros avanzados */}
      {showAdvanced && (
        <div className={styles.advancedPanel}>
          <div className={styles.advRow}>
            <div className={styles.advField}>
              <label>Tipo</label>
              <div className={styles.typeBtns}>
                <button className={type === 'movie' ? styles.typeActive : styles.typeBtn} onClick={() => setType('movie')}>🎬 Película</button>
                <button className={type === 'tv'    ? styles.typeActive : styles.typeBtn} onClick={() => setType('tv')}>📺 Serie</button>
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
                  <option value="90">90 min</option>
                  <option value="120">120 min</option>
                  <option value="150">150 min</option>
                  <option value="180">180 min</option>
                </select>
              </div>
            )}
            <div className={styles.advField}>
              <label>Rating mínimo</label>
              <select value={minRating} onChange={e => setMinRating(e.target.value)} className={styles.select}>
                <option value="">Cualquiera</option>
                {[5,6,7,7.5,8,8.5].map(r => <option key={r} value={r}>≥ {r}</option>)}
              </select>
            </div>
          </div>
          <button className={styles.searchBtn} onClick={runAdvanced}>🔍 Buscar</button>
        </div>
      )}

      {error && <p className={styles.error}>{error}</p>}
      <MediaGrid items={filtered} loading={loading} skeletonCount={12} />
      {!loading && !error && filtered.length === 0 && (
        <div className={styles.empty}><p>No se encontraron resultados</p></div>
      )}
    </div>
  )
}
