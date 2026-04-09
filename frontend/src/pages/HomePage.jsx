import { Helmet } from 'react-helmet-async'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useFetch } from '../hooks/useFetch'
import { catalogAPI, rankingsAPI } from '../services/api'
import MediaGrid from '../components/catalog/MediaGrid'
import StreamingSection from '../components/catalog/StreamingSection'
import styles from './HomePage.module.css'

const POSTER_BASE = 'https://image.tmdb.org/t/p/w185'

const CLASSIC_POSTERS = [
  '/3bhkrj58Vtu7enYsLlegkKXFo4f.jpg',
  '/saHP97rTPS5eLmrLQEcANmKrsFl.jpg',
  '/f89U3ADr1oiB1s9GkdPOEpXUk5H.jpg',
  '/q6y0Go1tsGEsmtFryDOJo3dEmqu.jpg',
  '/rSPw7tgCH9c6NqICZef4kZjFOQ5.jpg',
  '/oU7Oq2kFAAlGqbU4VoAE36g4hoI.jpg',
  '/gNBCvtYyGPbjPCT1k3MvJuNuXR6.jpg',
  '/6oom5QYQ2yQTMJIbnvbkBL9cHo6.jpg',
  '/8kSerJrhrJWKLk1LViesGcnrUPE.jpg',
  '/lHu1wtNaczFPGFDTrjCSzeLPTKN.jpg',
  '/velWPhVMQeQKcxggNEU8YmIo52R.jpg',
  '/qJ2tW6WMUDux911r6m7haRef0WH.jpg',
  '/cezWGskPY5x7GaglTTRN4Fugfb8.jpg',
  '/yFihWxQcmqcaBR31QM6Y8gT6aYV.jpg',
  '/hek3koDUyRQk7FIhPXsa6mT2Zc3.jpg',
  '/rCzpDGLbOoPwLjy3OAm5NUPOTrC.jpg',
  '/d5NXSklpcvkp85kpsiPyGCOk2Cs.jpg',
  '/7lyBcpYB0Qt8gYhXYaEZUNlIGEh.jpg',
  '/39wmItIWsg5sZMyRUHLkWBcuVCM.jpg',
  '/pB8BM7pdSp6B6Ih7QpePilygR3h.jpg',
  '/vzmL6fP7aPKNKPRTFnZmiUfciyV.jpg',
  '/oYuLEt3zVCKq57qu2F8dT7NIa6f.jpg',
  '/5KCVkau1HEl7ZzimPgpAZAkMJSk.jpg',
  '/4m1Au3YkjqsxF8iwQy0fPYSxE0h.jpg',
]

const HERO_TABS = [
  { key: 'trending', label: '🔥 Tendencias' },
  { key: 'topMovies', label: '🏆 Top Películas' },
  { key: 'topSeries', label: '📺 Top Series' },
]

function HeroPanel() {
  const [tab, setTab] = useState('trending')

  const { data: trending } = useFetch(() => catalogAPI.getTrending('all', 'week'), [])
  const { data: topMovies } = useFetch(() => catalogAPI.getTopRated('movie'), [])
  const { data: topSeries } = useFetch(() => catalogAPI.getTopRated('tv'), [])

  const items = {
    trending: (trending?.results || []).slice(0, 10),
    topMovies: (topMovies?.results || []).slice(0, 10),
    topSeries: (topSeries?.results || []).slice(0, 10),
  }[tab] || []

  const getLink = (item) => {
    const type = item.media_type || (tab === 'topMovies' ? 'movie' : 'tv')
    return `/${type}/${item.id}`
  }

  return (
    <div className={styles.heroPanel}>
      <div className={styles.heroPanelTabs}>
        {HERO_TABS.map(t => (
          <button
            key={t.key}
            className={tab === t.key ? styles.heroPanelTabActive : styles.heroPanelTab}
            onClick={() => setTab(t.key)}
          >
            {t.label}
          </button>
        ))}
      </div>
      <div className={styles.heroPanelList}>
        {items.map((item, i) => (
          <Link key={item.id} to={getLink(item)} className={styles.heroPanelItem}>
            <span className={styles.heroPanelRank}>{i + 1}</span>
            <img
              src={`${POSTER_BASE}${item.poster_path}`}
              alt={item.title || item.name}
              className={styles.heroPanelPoster}
              loading="lazy"
            />
            <div className={styles.heroPanelInfo}>
              <span className={styles.heroPanelTitle}>{item.title || item.name}</span>
              <span className={styles.heroPanelMeta}>
                {(item.release_date || item.first_air_date || '').slice(0, 4)}
                {item.vote_average > 0 && ` · ⭐ ${item.vote_average.toFixed(1)}`}
              </span>
            </div>
          </Link>
        ))}
      </div>
      <Link to="/rankings" className={styles.heroPanelMore}>Ver ranking completo →</Link>
    </div>
  )
}

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

      {/* ── Hero ── */}
      <section className={styles.hero}>
        <div className={styles.heroPosterGrid} aria-hidden="true">
          {CLASSIC_POSTERS.map((path, i) => (
            <img key={i} src={`https://image.tmdb.org/t/p/w200${path}`} alt="" className={styles.heroPoster} loading="lazy" />
          ))}
        </div>
        <div className={styles.heroBg} />

        <div className={`container ${styles.heroInner}`}>
          {/* Lado izquierdo */}
          <div className={styles.heroLeft}>
            <div className={styles.armchairLeft} aria-hidden="true"><CinemaArmchair /></div>
            <span className={styles.heroEyebrow}>🍿 Descubrí cine y series</span>
            <h1 className={`heading-display ${styles.heroTitle}`}>
              Tu catálogo<br />
              <span className={styles.heroAccent}>personal</span>
            </h1>
            <p className={styles.heroSub}>
              Explorá, calificá y descubrí películas y series.<br />
              Tu referencia de cine, gratis.
            </p>
            <div className={styles.heroCTA}>
              <a href="/movies" className={styles.btnPrimary}>🎬 Explorar películas</a>
              <a href="/series" className={styles.btnSecondary}>📺 Ver series</a>
            </div>

            {/* Quick links */}
            <div className={styles.heroQuickLinks}>
              <Link to="/rankings" className={styles.quickLink}>🏆 Top 50 Películas</Link>
              <Link to="/rankings" className={styles.quickLink}>📺 Top 50 Series</Link>
              <Link to="/what-to-watch" className={styles.quickLink}>🎲 ¿Qué veo hoy?</Link>
              <Link to="/streaming" className={styles.quickLink}>📡 Plataformas</Link>
            </div>
          </div>

          {/* Lado derecho — panel de rankings */}
          <div className={styles.heroRight}>
            <HeroPanel />
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
