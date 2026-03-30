import { Helmet } from 'react-helmet-async'
import { useFetch } from '../hooks/useFetch'
import { catalogAPI } from '../services/api'
import MediaGrid from '../components/catalog/MediaGrid'
import StreamingSection from '../components/catalog/StreamingSection'
import styles from './HomePage.module.css'

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

      {/* Hero */}
      <section className={styles.hero}>
        <div className={styles.heroBg} />
        <div className={styles.armchairLeft}><CinemaArmchair /></div>
        <div className={styles.popcornRight}><Popcorn /></div>
        <div className={`container ${styles.heroContent}`}>
          <span className={styles.heroEyebrow}>🍿 Descubrí cine y series</span>
          <h1 className={`heading-display ${styles.heroTitle}`}>
            Tu catálogo<br />
            <span className={styles.heroAccent}>personal</span>
          </h1>
          <p className={styles.heroSub}>
            Explorá películas y series, calificá lo que viste<br />
            y descubrí qué ver a continuación.
          </p>
          <div className={styles.heroCTA}>
            <a href="/movies" className={styles.btnPrimary}>🎬 Explorar películas</a>
            <a href="/series" className={styles.btnSecondary}>📺 Ver series</a>
          </div>
        </div>
        <div className={styles.filmStrip}><FilmStrip /></div>
      </section>

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

      {/* Netflix destacado */}
      <div className="container">
        <StreamingSection provider="netflix" />
      </div>

      {/* Mejor valoradas */}
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

      {/* Disney+ destacado */}
      <div className="container">
        <StreamingSection provider="disney" />
      </div>

      {/* Series destacadas */}
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

      {/* Link a todas las plataformas */}
      <div className="container">
        <a href="/streaming" className={styles.allPlatforms}>
          <span>Ver todas las plataformas — Netflix, Disney+, Max, Prime, Apple TV+, Paramount+</span>
          <span>→</span>
        </a>
      </div>
    </div>
  )
}

function CinemaArmchair() {
  return (
    <svg viewBox="0 0 130 160" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <rect x="22" y="118" width="10" height="32" rx="5" fill="#4a2f1a" />
      <rect x="98" y="118" width="10" height="32" rx="5" fill="#4a2f1a" />
      <rect x="8" y="65" width="114" height="58" rx="16" fill="#b85c5c" />
      <rect x="14" y="10" width="102" height="62" rx="14" fill="#cc6e6e" />
      <rect x="24" y="17" width="40" height="9" rx="5" fill="#e08888" opacity="0.3" />
      <rect x="0" y="42" width="22" height="60" rx="11" fill="#b85c5c" />
      <rect x="108" y="42" width="22" height="60" rx="11" fill="#b85c5c" />
      <rect x="106" y="22" width="26" height="30" rx="6" fill="#e8c97a" />
      <ellipse cx="119" cy="22" rx="13" ry="8" fill="#f5ede0" />
      <circle cx="110" cy="16" r="8" fill="#f5ede0" />
      <circle cx="119" cy="11" r="9" fill="#f5ede0" />
      <circle cx="129" cy="14" r="8" fill="#f5ede0" />
      <circle cx="112" cy="6" r="7" fill="#ede3ce" />
      <circle cx="123" cy="4" r="8" fill="#ede3ce" />
      <circle cx="118" cy="-2" r="6" fill="#f5ede0" />
    </svg>
  )
}

function Popcorn() {
  return (
    <svg viewBox="0 0 100 160" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <polygon points="15,55 85,55 73,148 27,148" fill="#b84444" />
      <rect x="15" y="44" width="70" height="18" rx="6" fill="#cc5555" />
      <line x1="38" y1="55" x2="35" y2="148" stroke="#f5ede0" strokeWidth="2" opacity="0.1" />
      <line x1="62" y1="55" x2="65" y2="148" stroke="#f5ede0" strokeWidth="2" opacity="0.1" />
      <text x="50" y="105" fontFamily="Georgia, serif" fontSize="12" fill="#f5ede0" textAnchor="middle" opacity="0.55">CyCat</text>
      <circle cx="30" cy="42" r="13" fill="#f5ede0" />
      <circle cx="50" cy="30" r="16" fill="#f5ede0" />
      <circle cx="70" cy="40" r="13" fill="#ede3ce" />
      <circle cx="38" cy="20" r="12" fill="#ede3ce" />
      <circle cx="60" cy="16" r="14" fill="#f5ede0" />
      <circle cx="22" cy="26" r="11" fill="#ede3ce" />
      <circle cx="78" cy="24" r="12" fill="#f5ede0" />
      <circle cx="46" cy="8" r="11" fill="#f5ede0" />
      <circle cx="65" cy="4" r="12" fill="#ede3ce" />
      <circle cx="28" cy="10" r="10" fill="#f5ede0" />
      <circle cx="78" cy="10" r="10" fill="#ede3ce" />
    </svg>
  )
}

function FilmStrip() {
  const holes = Array.from({ length: 22 }, (_, i) => i)
  return (
    <svg viewBox="0 0 1280 32" preserveAspectRatio="none" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <rect width="1280" height="32" fill="#2e2016" />
      {holes.map(i => (
        <rect key={i} x={i * 58 + 4} y="4" width="20" height="24" rx="3" fill="#e8956d" opacity="0.35" />
      ))}
    </svg>
  )
}