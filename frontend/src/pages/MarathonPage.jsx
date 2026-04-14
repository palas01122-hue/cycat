import { useState, useRef } from 'react'
import { Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { marathonAPI } from '../services/api'
import { getPosterUrl } from '../utils/tmdb'
import styles from './MarathonPage.module.css'

function formatRuntime(minutes) {
  if (!minutes) return '—'
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return h > 0 ? `${h}h ${m > 0 ? m + 'min' : ''}`.trim() : `${m}min`
}

function formatTotal(minutes) {
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  const d = Math.floor(h / 24)
  const rh = h % 24
  if (d > 0) return `${d}d ${rh}h ${m}min`
  return `${h}h ${m}min`
}

export default function MarathonPage() {
  const [query, setQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [searching, setSearching] = useState(false)
  const [collection, setCollection] = useState(null)
  const [loadingCollection, setLoadingCollection] = useState(false)
  const [excluded, setExcluded] = useState(new Set())
  const debounceRef = useRef(null)

  const handleSearch = (val) => {
    setQuery(val)
    clearTimeout(debounceRef.current)
    if (!val.trim()) { setSearchResults([]); return }
    debounceRef.current = setTimeout(() => {
      setSearching(true)
      marathonAPI.search(val)
        .then(res => setSearchResults(res.data.results?.slice(0, 8) || []))
        .catch(() => {})
        .finally(() => setSearching(false))
    }, 400)
  }

  const loadCollection = (col) => {
    setCollection(null)
    setExcluded(new Set())
    setSearchResults([])
    setQuery(col.name)
    setLoadingCollection(true)
    marathonAPI.collection(col.id)
      .then(res => setCollection(res.data))
      .catch(() => {})
      .finally(() => setLoadingCollection(false))
  }

  const toggleExclude = (id) => {
    setExcluded(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  const activeParts = collection?.parts?.filter(p => !excluded.has(p.id)) || []
  const totalMinutes = activeParts.reduce((sum, p) => sum + (p.runtime || 0), 0)

  return (
    <div className={`container page-enter ${styles.page}`}>
      <Helmet>
        <title>Modo Maratón — CyCat</title>
        <meta name="description" content="Planificá tu maratón de cine. Buscá una saga y CyCat calculá el tiempo total y el orden de visionado." />
      </Helmet>

      <header className={styles.header}>
        <h1 className={`heading-md ${styles.title}`}>Modo Maratón</h1>
        <p className={styles.subtitle}>Buscá una saga o franquicia y planificá tu maratón</p>
      </header>

      {/* Búsqueda */}
      <div className={styles.searchWrap}>
        <div className={styles.inputWrap}>
          <span className={styles.searchIcon}>🎬</span>
          <input
            type="text"
            value={query}
            onChange={e => handleSearch(e.target.value)}
            placeholder="Ej: Marvel, El Padrino, Star Wars, Harry Potter..."
            className={styles.searchInput}
          />
          {searching && <span className={styles.spinner}>⟳</span>}
        </div>

        {searchResults.length > 0 && (
          <div className={styles.dropdown}>
            {searchResults.map(col => (
              <button key={col.id} className={styles.dropdownItem} onClick={() => loadCollection(col)}>
                {col.poster_path && (
                  <img src={`https://image.tmdb.org/t/p/w92${col.poster_path}`} alt="" className={styles.dropThumb} />
                )}
                <div>
                  <div className={styles.dropName}>{col.name}</div>
                  <div className={styles.dropCount}>{col.parts?.length || 0} títulos</div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {loadingCollection && (
        <div className={styles.loadingWrap}>
          <div className={`skeleton ${styles.skHeader}`} />
          {Array.from({ length: 4 }).map((_, i) => <div key={i} className={`skeleton ${styles.skRow}`} />)}
        </div>
      )}

      {collection && !loadingCollection && (
        <>
          {/* Header de la colección */}
          <div className={styles.collectionHeader}>
            {collection.backdrop_path && (
              <img
                src={`https://image.tmdb.org/t/p/w780${collection.backdrop_path}`}
                alt={collection.name}
                className={styles.collectionBg}
              />
            )}
            <div className={styles.collectionOverlay}>
              <span className={styles.collectionLabel}>COLECCIÓN</span>
              <h2 className={styles.collectionName}>{collection.name}</h2>
              <p className={styles.collectionOverview}>{collection.overview?.slice(0, 200)}</p>
            </div>
          </div>

          {/* Total time */}
          <div className={styles.totalBar}>
            <div className={styles.totalInfo}>
              <span className={styles.totalTime}>{formatTotal(totalMinutes)}</span>
              <span className={styles.totalLabel}>de maratón · {activeParts.length} de {collection.parts?.length} títulos</span>
            </div>
            <div className={styles.totalTip}>Hacé click en un título para excluirlo</div>
          </div>

          {/* Lista de películas */}
          <div className={styles.list}>
            {collection.parts?.map((movie, i) => {
              const isExcluded = excluded.has(movie.id)
              return (
                <div key={movie.id} className={`${styles.item} ${isExcluded ? styles.itemExcluded : ''}`}>
                  <span className={styles.order}>{String(i + 1).padStart(2, '0')}</span>

                  <div className={styles.posterCell}>
                    <img
                      src={getPosterUrl(movie.poster_path, 'sm')}
                      alt={movie.title}
                      className={styles.poster}
                    />
                  </div>

                  <div className={styles.movieInfo}>
                    <Link to={`/movie/${movie.id}`} className={styles.movieTitle} onClick={e => e.stopPropagation()}>
                      {movie.title}
                    </Link>
                    <div className={styles.movieMeta}>
                      {movie.release_date?.slice(0, 4)}
                      {movie.runtime > 0 && <><span>·</span><span>{formatRuntime(movie.runtime)}</span></>}
                      {movie.vote_average > 0 && <><span>·</span><span className={styles.rating}>★ {movie.vote_average.toFixed(1)}</span></>}
                    </div>
                  </div>

                  <button
                    className={`${styles.toggleBtn} ${isExcluded ? styles.toggleExcluded : styles.toggleIncluded}`}
                    onClick={() => toggleExclude(movie.id)}
                    title={isExcluded ? 'Incluir' : 'Excluir'}
                  >
                    {isExcluded ? '+ Incluir' : '✓ Incluido'}
                  </button>
                </div>
              )
            })}
          </div>
        </>
      )}

      {!collection && !loadingCollection && !query && (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>🎬</div>
          <p>Buscá una saga para empezar a planificar tu maratón</p>
          <div className={styles.suggestions}>
            {['Marvel', 'Star Wars', 'Harry Potter', 'El Padrino', 'El Señor de los Anillos'].map(s => (
              <button key={s} className={styles.suggestion} onClick={() => handleSearch(s)}>{s}</button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
