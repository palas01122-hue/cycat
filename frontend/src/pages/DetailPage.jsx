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
import MediaGrid from '../components/catalog/MediaGrid'
import styles from './DetailPage.module.css'

export default function DetailPage({ type = 'movie' }) {
  const { id } = useParams()
  const { isAuthenticated } = useAuth()
  const [userRating, setUserRating] = useState(0)
  const [ratingSubmitted, setRatingSubmitted] = useState(false)
  const [showTrailer, setShowTrailer] = useState(false)
  const [diaryAdded, setDiaryAdded] = useState(false)

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
  const cast = (credits?.data?.cast || []).filter(p => p.profile_path).slice(0, 12)
  const trailer = item.videos?.results?.find(v => v.type === 'Trailer' && v.site === 'YouTube')

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
    <div className={`page-enter ${styles.page}`} data-testid="detail-page">
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
            "@type": "Person",
            "name": d.name
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
          <div className={styles.posterSection}>
            <img src={getPosterUrl(item.poster_path, 'lg')} alt={`Poster de ${title}`} className={styles.poster} />
          </div>

          <div className={styles.infoSection}>
            <div className={styles.meta}>
              <span className={styles.type}>{typeLabel}</span>
              {item.genres?.map(g => <span key={g.id} className={styles.genre}>{g.name}</span>)}
            </div>

            <h1 className={`heading-display ${styles.title}`}>{title}</h1>

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

            <WatchProviders type={type} id={id} />

            <div className={styles.actionRow}>
              <FavoriteButton contentId={id} type={type} title={title} posterPath={item.poster_path} />
              <WatchlistButton contentId={id} type={type} title={title} posterPath={item.poster_path} />
              {trailer && (
                <button onClick={() => setShowTrailer(true)} className={styles.trailerBtn}>
                  ▶ Ver trailer
                </button>
              )}
            </div>

            <div className={styles.userRatingBlock}>
              <h3 className={styles.userRatingTitle}>Tu calificación</h3>
              {isAuthenticated ? (
                <>
                  <StarRating value={userRating} onChange={handleRate} />
                  {ratingSubmitted && (
                    <span className={styles.ratingOk}>
                      ✓ Guardado{diaryAdded ? ' en tu diario' : ''}
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

        <ReviewSection contentId={id} type={type} title={title} posterPath={item.poster_path} />

        {similar?.data?.results?.length > 0 && (
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Contenido similar</h2>
            <MediaGrid items={similar.data.results.slice(0, 10)} type={type} loading={false} />
          </section>
        )}
      </div>

      {showTrailer && trailer && (
        <TrailerModal videoKey={trailer.key} title={`${title} — Trailer`} onClose={() => setShowTrailer(false)} />
      )}
    </div>
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
