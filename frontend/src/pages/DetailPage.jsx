import { useParams, Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { useFetch } from '../hooks/useFetch'
import { detailAPI, rankingsAPI, diaryAPI } from '../services/api'
import { useAuth } from '../hooks/useAuth'
import { useState } from 'react'
import {
  getBackdropUrl, getPosterUrl, getProfileUrl,
  formatYear, formatRating, formatRuntime, getRatingColor
} from '../utils/tmdb'
import StarRating from '../components/ui/StarRating'
import { FavoriteButton, WatchlistButton } from '../components/ui/ActionButtons'
import TrailerModal from '../components/ui/TrailerModal'
import ReviewSection from '../components/detail/ReviewSection'
import WatchProviders from '../components/detail/WatchProviders'
import ExternalScores from '../components/detail/ExternalScores'
import TmdbReviews from '../components/detail/TmdbReviews'
import VoteHistogram from '../components/detail/VoteHistogram'
import MediaGrid from '../components/catalog/MediaGrid'
import styles from './DetailPage.module.css'
import { motion, AnimatePresence } from 'framer-motion'
import { Badge } from '../components/ui/shadcn/badge'
import { Play, Check } from 'lucide-react'

export default function DetailPage({ type = 'movie' }) {
  const { id } = useParams()
  const { isAuthenticated } = useAuth()
  const [userRating, setUserRating] = useState(0)
  const [ratingSubmitted, setRatingSubmitted] = useState(false)
  const [showTrailer, setShowTrailer] = useState(null)
  const [diaryAdded, setDiaryAdded] = useState(false)
  const [seasonSearch, setSeasonSearch] = useState('')

  const fetchFn = type === 'movie' ? () => detailAPI.getMovie(id) : () => detailAPI.getSeries(id)
  const { data, loading, error } = useFetch(fetchFn, [id, type])
  const { data: credits } = useFetch(() => detailAPI.getCredits(type, id), [id])
  const { data: similar } = useFetch(() => detailAPI.getSimilar(type, id), [id])

  if (loading) return <DetailSkeleton />
  if (error) return <div className={`container ${styles.error}`}>Error al cargar el contenido.</div>
  if (!data?.data) return null

  const item = data.data
  const title = item.title || item.name
  const year = formatYear(item.release_date || item.first_air_date)
  const rating = formatRating(item.vote_average)
  const rColor = getRatingColor(item.vote_average)
  const runtime = formatRuntime(item.runtime || item.episode_run_time?.[0])
  const directors = credits?.data?.crew?.filter(p => p.job === 'Director') || []
  const writers = (credits?.data?.crew || [])
    .filter(p => ['Screenplay', 'Writer', 'Story', 'Novel'].includes(p.job))
    .filter((p, i, arr) => arr.findIndex(x => x.id === p.id) === i)
    .slice(0, 3)
  const cast = (credits?.data?.cast || []).filter(p => p.profile_path).slice(0, 12)
  const allTrailers = (item.videos?.results || [])
    .filter(v => v.site === 'YouTube' && ['Trailer', 'Teaser'].includes(v.type))
    .slice(0, 3)
  const originalTitle = (item.original_title || item.original_name)
  const showOriginal = originalTitle && originalTitle !== title
  const countries = item.production_countries || []
  const companies = item.production_companies || []
  const collection = item.belongs_to_collection || null
  const gallery = (item.images?.backdrops || []).slice(0, 10)

  const typeLabel = type === 'movie' ? 'Película' : 'Serie'
  const description = item.overview
    ? `${item.overview.slice(0, 150)}...`
    : `${typeLabel} ${year} — Calificá y descubrí más en CyCat.`
  const posterUrl = item.poster_path
    ? `https://image.tmdb.org/t/p/w500${item.poster_path}`
    : 'https://cycat.lat/og-default.jpg'
  const pageUrl = `https://cycat.lat/${type === 'movie' ? 'movie' : 'tv'}/${id}`

  const handleRate = async (score) => {
    if (!isAuthenticated) return
    setUserRating(score)
    try {
      await rankingsAPI.rate(type, id, score, title, item.poster_path)
      const today = new Date().toISOString().split('T')[0]
      await diaryAPI.add({
        contentId: id, type, title,
        poster_path: item.poster_path,
        score, watched_date: today
      })
      setDiaryAdded(true)
      setRatingSubmitted(true)
    } catch { }
  }

  return (
    <motion.div className={styles.page} data-testid="detail-page" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.45 }}>
      <Helmet>
        <title>{`${title} (${year}) — CyCat`}</title>
        <meta name="description" content={description} />
        <link rel="canonical" href={pageUrl} />
        <meta property="og:type" content={type === 'movie' ? 'video.movie' : 'video.tv_show'} />
        <meta property="og:title" content={`${title} (${year}) — CyCat`} />
        <meta property="og:description" content={description} />
        <meta property="og:image" content={posterUrl} />
        <meta property="og:url" content={pageUrl} />
        <meta property="og:site_name" content="CyCat" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={`${title} (${year}) — CyCat`} />
        <meta name="twitter:description" content={description} />
        <meta name="twitter:image" content={posterUrl} />
        <script type="application/ld+json">{JSON.stringify({
          "@context": "https://schema.org",
          "@type": type === 'movie' ? "Movie" : "TVSeries",
          "name": title,
          "datePublished": item.release_date || item.first_air_date,
          "description": item.overview,
          "image": posterUrl,
          "aggregateRating": item.vote_average ? {
            "@type": "AggregateRating",
            "ratingValue": item.vote_average.toFixed(1),
            "ratingCount": item.vote_count,
            "bestRating": "10",
            "worstRating": "1"
          } : undefined,
          "director": directors.length > 0 ? directors.map(d => ({
            "@type": "Person", "name": d.name
          })) : undefined,
          "url": pageUrl
        })}</script>
      </Helmet>

      <div className={styles.backdropWrap}>
        <img src={getBackdropUrl(item.backdrop_path, 'lg')} alt="" className={styles.backdrop} aria-hidden="true" />
        <div className={styles.backdropOverlay} />
      </div>

      <div className={`container ${styles.content}`}>
        <div className={styles.main}>
          <motion.div className={styles.posterSection} initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}>
            <img src={getPosterUrl(item.poster_path, 'lg')} alt={`Poster de ${title}`} className={styles.poster} />
          </motion.div>

          <div className={styles.infoSection}>
            <motion.div className={styles.meta} initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
              <span className={styles.type}>{typeLabel}</span>
              {item.genres?.map(g => <Badge key={g.id} variant="muted">{g.name}</Badge>)}
            </motion.div>

            <h1 className={`heading-display ${styles.title}`}>{title}</h1>
            {showOriginal && (
              <p className={styles.originalTitle}>{originalTitle}</p>
            )}

            <div className={styles.subMeta}>
              <span>{year}</span>
              {runtime !== '—' && <><span className={styles.dot}>·</span><span>{runtime}</span></>}
              {item.original_language && (
                <><span className={styles.dot}>·</span>
                  <span className={styles.lang}>{item.original_language.toUpperCase()}</span></>
              )}
            </div>

            <div className={styles.ratingBlock}>
              <div className={styles.tmdbRating}>
                <span className={styles.ratingScore} style={{ color: rColor }}>{rating}</span>
                <span className={styles.ratingLabel}>TMDB</span>
              </div>
              <div className={styles.voteCount}>{item.vote_count?.toLocaleString()} votos</div>
            </div>

            <p className={styles.overview}>{item.overview}</p>

            {directors.length > 0 && (
              <div className={styles.crew}>
                <span className={styles.crewLabel}>Dirección</span>
                <span className={styles.crewNames}>
                  {directors.map((d, i) => (
                    <span key={d.id}>
                      <Link to={`/person/${d.id}`} className={styles.crewLink}>{d.name}</Link>
                      {i < directors.length - 1 ? ', ' : ''}
                    </span>
                  ))}
                </span>
              </div>
            )}
            {writers.length > 0 && (
              <div className={styles.crew}>
                <span className={styles.crewLabel}>Guión</span>
                <span className={styles.crewNames}>
                  {writers.map((w, i) => (
                    <span key={`${w.id}-${w.job}`}>
                      <Link to={`/person/${w.id}`} className={styles.crewLink}>{w.name}</Link>
                      {i < writers.length - 1 ? ', ' : ''}
                    </span>
                  ))}
                </span>
              </div>
            )}
            {countries.length > 0 && (
              <div className={styles.crew}>
                <span className={styles.crewLabel}>País</span>
                <span className={styles.crewNames}>{countries.slice(0, 2).map(c => c.name).join(', ')}</span>
              </div>
            )}
            {companies.length > 0 && (
              <div className={styles.crew}>
                <span className={styles.crewLabel}>Producción</span>
                <span className={styles.crewNames}>{companies.slice(0, 3).map(c => c.name).join(' · ')}</span>
              </div>
            )}

            <VoteHistogram type={type} id={id} />
            <WatchProviders type={type} id={id} />

            {type === 'movie' && <ExternalScores movieId={id} />}

            {/* Acciones + Calificación en la misma fila */}
            <div className={styles.actionsAndRating}>
              <div className={styles.actionRow}>
                <FavoriteButton contentId={id} type={type} title={title} posterPath={item.poster_path} />
                <WatchlistButton contentId={id} type={type} title={title} posterPath={item.poster_path} />
                {allTrailers.map((t, i) => (
                  <button key={t.key} onClick={() => setShowTrailer(t.key)} className={styles.trailerBtn}>
                    <Play size={14} /> {i === 0 ? 'Ver trailer' : t.type === 'Teaser' ? 'Ver teaser' : `Trailer ${i + 1}`}
                  </button>
                ))}
              </div>

              <div className={styles.userRatingBlock}>
                <h3 className={styles.userRatingTitle}>Tu calificación</h3>
                {isAuthenticated ? (
                  <>
                    <StarRating value={userRating} onChange={handleRate} />
                    {ratingSubmitted && (
                      <span className={styles.ratingOk}>
                        <Check size={13} /> Guardado{diaryAdded ? ' en tu diario' : ''}
                      </span>
                    )}
                  </>
                ) : (
                  <p className={styles.ratingPrompt}>
                    <a href="/login">Iniciá sesión</a> para calificar
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {cast.length > 0 && (
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Reparto</h2>
            <div className={styles.castGrid}>
              {cast.map(person => (
                <Link key={person.id} to={`/person/${person.id}`} className={styles.castCard}>
                  <img src={getProfileUrl(person.profile_path, 'md')} alt={person.name} className={styles.castPhoto} loading="lazy" />
                  <div className={styles.castInfo}>
                    <span className={styles.castName}>{person.name}</span>
                    <span className={styles.castRole}>{person.character}</span>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {type === 'tv' && item.seasons && item.seasons.length > 0 && (
          <section className={styles.section}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '16px' }}>
              <h2 className={styles.sectionTitle} style={{ marginBottom: 0 }}>Temporadas y Capítulos</h2>
              <input 
                type="text" 
                placeholder="Buscar temporada o capítulo..." 
                value={seasonSearch}
                onChange={(e) => setSeasonSearch(e.target.value)}
                style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid var(--color-border)', background: 'var(--color-bg-elevated)', color: 'var(--color-text-primary)' }}
              />
            </div>
            <div style={{ display: 'flex', gap: '12px', overflowX: 'auto', paddingBottom: '8px' }}>
              {item.seasons.filter(s => s.name?.toLowerCase().includes(seasonSearch.toLowerCase())).map(s => (
                <div key={s.id} style={{ minWidth: '140px', background: 'var(--color-bg-card)', padding: '12px', borderRadius: '12px', border: '1px solid rgba(212, 175, 55, 0.3)' }}>
                  <div style={{ fontWeight: 'bold', color: 'var(--color-text-primary)', marginBottom: '4px' }}>{s.name}</div>
                  <div style={{ fontSize: '13px', color: 'var(--color-text-secondary)' }}>{s.episode_count} capítulos</div>
                  {s.air_date && <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', marginTop: '4px' }}>{s.air_date.slice(0, 4)}</div>}
                </div>
              ))}
              {item.seasons.filter(s => s.name?.toLowerCase().includes(seasonSearch.toLowerCase())).length === 0 && (
                <div style={{ color: 'var(--color-text-muted)', fontSize: '13px' }}>No se encontraron temporadas con ese nombre.</div>
              )}
            </div>
          </section>
        )}

        {collection && (
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Parte de la saga</h2>
            <div className={styles.collectionCard}>
              {collection.backdrop_path && (
                <img
                  src={`https://image.tmdb.org/t/p/w780${collection.backdrop_path}`}
                  alt={collection.name}
                  className={styles.collectionBg}
                />
              )}
              <div className={styles.collectionOverlay}>
                <span className={styles.collectionLabel}>COLECCIÓN</span>
                <h3 className={styles.collectionName}>{collection.name}</h3>
              </div>
            </div>
          </section>
        )}

        {gallery.length > 2 && (
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Galería</h2>
            <div className={styles.gallery}>
              {gallery.map((img, i) => (
                <img
                  key={img.file_path || i}
                  src={`https://image.tmdb.org/t/p/w500${img.file_path}`}
                  alt={`Imagen ${i + 1}`}
                  className={styles.galleryImg}
                  loading="lazy"
                />
              ))}
            </div>
          </section>
        )}

        <ReviewSection contentId={id} type={type} title={title} posterPath={item.poster_path} />

        <TmdbReviews type={type} id={id} />

        {similar?.data?.results?.length > 0 && (
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Contenido similar</h2>
            <MediaGrid items={similar.data.results.slice(0, 10)} type={type} loading={false} />
          </section>
        )}
      </div>

      {showTrailer && (
        <TrailerModal videoKey={showTrailer} title={`${title} — Trailer`} onClose={() => setShowTrailer(null)} />
      )}
    </motion.div>
  )
}

function DetailSkeleton() {
  return (
    <div className={`container`} style={{ paddingTop: 40 }}>
      <div className={`skeleton`} style={{ height: 300, marginBottom: 32 }} />
      <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: 40 }}>
        <div className={`skeleton`} style={{ aspectRatio: '2/3' }} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className={`skeleton`} style={{ height: 48, width: '65%' }} />
          <div className={`skeleton`} style={{ height: 16 }} />
          <div className={`skeleton`} style={{ height: 16, width: '70%' }} />
          <div className={`skeleton`} style={{ height: 100, marginTop: 16 }} />
        </div>
      </div>
    </div>
  )
}
