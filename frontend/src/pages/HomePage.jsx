import { Helmet } from 'react-helmet-async'
import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { useFetch } from '../hooks/useFetch'
import { catalogAPI } from '../services/api'
import MediaGrid from '../components/catalog/MediaGrid'
import StreamingSection from '../components/catalog/StreamingSection'
import { BANNERS, AUTOPLAY_INTERVAL } from '../data/banners'
import styles from './HomePage.module.css'

// ── Carrusel ──────────────────────────────────
function HeroCarousel() {
  const [current, setCurrent] = useState(0)
  const [paused, setPaused] = useState(false)

  const next = useCallback(() => setCurrent(c => (c + 1) % BANNERS.length), [])
  const prev = useCallback(() => setCurrent(c => (c - 1 + BANNERS.length) % BANNERS.length), [])

  useEffect(() => {
    if (paused) return
    const t = setInterval(next, AUTOPLAY_INTERVAL)
    return () => clearInterval(t)
  }, [paused, next])

  const banner = BANNERS[current]

  return (
    <div
      className={styles.carousel}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Imagen de fondo */}
      {BANNERS.map((b, i) => (
        <div
          key={i}
          className={`${styles.carouselSlide} ${i === current ? styles.carouselSlideActive : ''}`}
          style={{ backgroundImage: `url(${b.image})` }}
          aria-hidden={i !== current}
        />
      ))}

      {/* Overlay oscuro */}
      <div className={styles.carouselOverlay} />

      {/* Contenido */}
      <div className={`container ${styles.carouselContent}`}>
        {banner.label && <span className={styles.carouselLabel}>{banner.label}</span>}
        <h1 className={styles.carouselTitle}>{banner.title}</h1>
        {banner.subtitle && <p className={styles.carouselSub}>{banner.subtitle}</p>}
        <Link to={banner.link} className={styles.carouselBtn}>{banner.linkText} →</Link>
      </div>

      {/* Controles */}
      <button className={`${styles.carouselArrow} ${styles.carouselArrowLeft}`} onClick={prev} aria-label="Anterior">‹</button>
      <button className={`${styles.carouselArrow} ${styles.carouselArrowRight}`} onClick={next} aria-label="Siguiente">›</button>

      {/* Dots */}
      <div className={styles.carouselDots}>
        {BANNERS.map((_, i) => (
          <button
            key={i}
            className={`${styles.carouselDot} ${i === current ? styles.carouselDotActive : ''}`}
            onClick={() => setCurrent(i)}
            aria-label={`Slide ${i + 1}`}
          />
        ))}
      </div>
    </div>
  )
}

// ── Página principal ──────────────────────────
export default function HomePage() {
  const { data: trending, loading: lt } = useFetch(() => catalogAPI.getTrending('all', 'week'), [])
  const { data: topMovies, loading: lm } = useFetch(() => catalogAPI.getTopRated('movie'), [])
  const { data: topSeries, loading: ls } = useFetch(() => catalogAPI.getTopRated('tv'), [])

  return (
    <div className={`page-enter ${styles.page}`}>
      <Helmet>
        <title>CyCat — Tu catálogo de películas y series</title>
        <meta name="description" content="Explorá, calificá y descubrí películas y series. Rankings, reseñas y recomendaciones personalizadas. Tu catálogo personal de cine gratis." />
        <link rel="canonical" href="https://cycat.lat" />
        <meta property="og:type" content="website" />
        <meta property="og:title" content="CyCat — Tu catálogo de películas y series" />
        <meta property="og:description" content="Explorá, calificá y descubrí películas y series. Rankings, reseñas y recomendaciones personalizadas." />
        <meta property="og:image" content="https://cycat.lat/og-default.jpg" />
        <meta property="og:url" content="https://cycat.lat" />
        <meta property="og:site_name" content="CyCat" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="CyCat — Tu catálogo de películas y series" />
        <meta name="twitter:description" content="Explorá, calificá y descubrí películas y series gratis." />
        <meta name="twitter:image" content="https://cycat.lat/og-default.jpg" />
      </Helmet>

      {/* ── Carrusel hero ── */}
      <HeroCarousel />

      {/* Stats */}
      <div className={styles.statsBar}>
        <div className={`container ${styles.statsInner}`}>
          <div className={styles.stat}><span className={styles.statNum}>500K+</span><span className={styles.statLabel}>Películas</span></div>
          <div className={styles.stat}><span className={styles.statNum}>150K+</span><span className={styles.statLabel}>Series</span></div>
          <div className={styles.stat}><span className={styles.statNum}>6</span><span className={styles.statLabel}>Plataformas</span></div>
          <div className={styles.stat}><span className={styles.statNum}>Gratis</span><span className={styles.statLabel}>Siempre</span></div>
        </div>
      </div>

      {/* Tendencias */}
      <section className={`container ${styles.section}`}>
        <div className={styles.sectionHeader}>
          <div className={styles.sectionTitleWrap}>
            <div className={styles.sectionDot} />
            <h2 className="heading-md">Tendencias de la semana</h2>
          </div>
          <a href="/catalog" className={styles.seeAll}>Ver todo →</a>
        </div>
        <MediaGrid items={trending?.results?.slice(0, 10)} loading={lt} skeletonCount={10} />
      </section>

      <div className="container">
        <StreamingSection provider="netflix" />
      </div>

      <section className={`container ${styles.section}`}>
        <div className={styles.sectionHeader}>
          <div className={styles.sectionTitleWrap}>
            <div className={styles.sectionDot} style={{ background: 'var(--color-gold)', boxShadow: '0 0 8px var(--color-gold)' }} />
            <h2 className="heading-md">🏆 Mejor valoradas</h2>
          </div>
          <a href="/movies" className={styles.seeAll}>Ver más →</a>
        </div>
        <MediaGrid items={topMovies?.results?.slice(0, 10)} type="movie" loading={lm} skeletonCount={10} />
      </section>

      <div className="container">
        <StreamingSection provider="disney" />
      </div>

      <section className={`container ${styles.section}`}>
        <div className={styles.sectionHeader}>
          <div className={styles.sectionTitleWrap}>
            <div className={styles.sectionDot} style={{ background: 'var(--color-purple)', boxShadow: '0 0 8px var(--color-purple)' }} />
            <h2 className="heading-md">📺 Series destacadas</h2>
          </div>
          <a href="/series" className={styles.seeAll}>Ver más →</a>
        </div>
        <MediaGrid items={topSeries?.results?.slice(0, 10)} type="tv" loading={ls} skeletonCount={10} />
      </section>

      <div className="container">
        <a href="/streaming" className={styles.allPlatforms}>
          <span>Ver todas las plataformas — Netflix, Disney+, Max, Prime, Apple TV+, Paramount+</span>
          <span>→</span>
        </a>
      </div>
    </div>
  )
}
