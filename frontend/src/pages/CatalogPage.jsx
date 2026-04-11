import { useState, useCallback } from 'react'
import { usePaginatedFetch, useFetch } from '../hooks/useFetch'
import { catalogAPI } from '../services/api'
import MediaGrid from '../components/catalog/MediaGrid'
import styles from './CatalogPage.module.css'
import { motion, AnimatePresence } from 'framer-motion'
import { Film, Tv, SlidersHorizontal } from 'lucide-react'

export default function CatalogPage({ type = 'movie' }) {
  const [activeGenre, setActiveGenre] = useState(null)
  const [sortBy, setSortBy]           = useState('popular')

  const { data: genreData } = useFetch(
    () => catalogAPI.getGenres(type),
    [type]
  )

  const fetchFn = useCallback((page) => {
    if (activeGenre) return catalogAPI.getByGenre(type, activeGenre, page)
    if (sortBy === 'top')   return catalogAPI.getTopRated(type, page)
    return type === 'movie'
      ? catalogAPI.getPopularMovies(page)
      : catalogAPI.getPopularSeries(page)
  }, [type, activeGenre, sortBy])

  const { items, loading, loadMore, hasMore } = usePaginatedFetch(fetchFn, [type, activeGenre, sortBy])

  const typeLabel = type === 'movie' ? 'Películas' : 'Series'

  return (
    <motion.div className={`container ${styles.page}`} initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
      <header className={styles.header}>
        <h1 className="heading-lg">{typeLabel}</h1>

        <div className={styles.controls}>
          {/* Sort */}
          <div className={styles.sortBtns}>
            <button
              className={sortBy === 'popular' ? styles.activeSort : styles.sortBtn}
              onClick={() => { setSortBy('popular'); setActiveGenre(null) }}
            >
              Populares
            </button>
            <button
              className={sortBy === 'top' ? styles.activeSort : styles.sortBtn}
              onClick={() => { setSortBy('top'); setActiveGenre(null) }}
            >
              Mejor valoradas
            </button>
          </div>
        </div>

        {/* Genre filter */}
        {genreData?.genres && (
          <div className={styles.genres}>
            <button
              className={!activeGenre ? styles.activeGenre : styles.genreBtn}
              onClick={() => setActiveGenre(null)}
            >
              Todos
            </button>
            {type === 'tv' && (
              <>
                <button
                  className={activeGenre === 'miniseries' ? styles.activeGenre : styles.genreBtn}
                  onClick={() => setActiveGenre('miniseries')}
                  title="Historias cerradas en una sola temporada"
                >
                  ⏱️ Miniseries
                </button>
                <button
                  className={activeGenre === 'marathon' ? styles.activeGenre : styles.genreBtn}
                  onClick={() => setActiveGenre('marathon')}
                  title="Perfectas para un fin de semana"
                >
                  🍿 Para Maratonear
                </button>
              </>
            )}
            {genreData.genres.slice(0, 10).map(g => (
              <button
                key={g.id}
                className={activeGenre === g.id ? styles.activeGenre : styles.genreBtn}
                onClick={() => setActiveGenre(g.id)}
              >
                {g.name}
              </button>
            ))}
          </div>
        )}
      </header>

      <MediaGrid items={items} type={type} loading={loading} />

      {hasMore && (
        <div className={styles.loadMoreWrap}>
          <button
            className={styles.loadMore}
            onClick={loadMore}
            disabled={loading}
            data-testid="load-more-btn"
          >
            {loading ? 'Cargando...' : 'Cargar más'}
          </button>
        </div>
      )}
    </motion.div>
  )
}
