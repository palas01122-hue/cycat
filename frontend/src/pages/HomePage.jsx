import { Helmet } from 'react-helmet-async'
import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useFetch } from '../hooks/useFetch'
import { catalogAPI } from '../services/api'
import MediaGrid from '../components/catalog/MediaGrid'
import StreamingSection from '../components/catalog/StreamingSection'
import { BANNERS, AUTOPLAY_INTERVAL } from '../data/banners'
import { ChevronLeft, ChevronRight, TrendingUp, Trophy, Tv, Film } from 'lucide-react'
import styles from './HomePage.module.css'

const POSTER_BASE = 'https://image.tmdb.org/t/p/w185'

const sectionVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } }
}

const HERO_TABS = [
  { key: 'trending',  label: 'Tendencias', icon: <TrendingUp size={13} /> },
  { key: 'topMovies', label: 'Top Películas', icon: <Film size={13} /> },
  { key: 'topSeries', label: 'Top Series', icon: <Tv size={13} /> },
]

function HeroPanel() {
  const [tab, setTab] = useState('trending')
  const { data: trending }  = useFetch(() => catalogAPI.getTrending('all', 'week'), [])
  const { data: topMovies } = useFetch(() => catalogAPI.getTopRated('movie'), [])
  const { data: topSeries } = useFetch(() => catalogAPI.getTopRated('tv'), [])

  const items = {
    trending:  (trending?.results  || []).slice(0, 10),
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
          <motion.button
            key={t.key}
            className={tab === t.key ? styles.heroPanelTabActive : styles.heroPanelTab}
            onClick={() => setTab(t.key)}
            whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
          >
            {t.icon}{t.label}
          </motion.button>
        ))}
      </div>
      <AnimatePresence mode="wait">
        <motion.div
          key={tab}
          className={styles.heroPanelList}
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -10 }}
          transition={{ duration: 0.2 }}
        >
          {items.map((item, i) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.04 }}
            >
              <Link to={getLink(item)} className={styles.heroPanelItem}>
                <span className={styles.heroPanelRank}>{i + 1}</span>
                <img src={`${POSTER_BASE}${item.poster_path}`} alt={item.title || item.name} className={styles.heroPanelPoster} loading="lazy" />
                <div className={styles.heroPanelInfo}>
                  <span className={styles.heroPanelTitle}>{item.title || item.name}</span>
                  <span className={styles.heroPanelMeta}>
                    {(item.release_date || item.first_air_date || '').slice(0, 4)}
                    {item.vote_average > 0 && ` · ⭐ ${item.vote_average.toFixed(1)}`}
                  </span>
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </AnimatePresence>
      <Link to="/rankings" className={styles.heroPanelMore}>
        <Trophy size={13} /> Ver ranking completo →
      </Link>
    </div>
  )
}

function HeroCarousel() {
  const [current, setCurrent] = useState(0)
  const [paused,  setPaused]  = useState(false)
  const next = useCallback(() => setCurrent(c => (c + 1) % BANNERS.length), [])
  const prev = useCallback(() => setCurrent(c => (c - 1 + BANNERS.length) % BANNERS.length), [])

  useEffect(() => {
    if (paused) return
    const t = setInterval(next, AUTOPLAY_INTERVAL)
    return () => clearInterval(t)
  }, [paused, next])

  const banner = BANNERS[current]

  return (
    <div className={styles.carousel} onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
      {BANNERS.map((b, i) => (
        <div
          key={i}
          className={`${styles.carouselSlide} ${i === current ? styles.carouselSlideActive : ''}`}
          style={{ backgroundImage: `url(${b.image})` }}
          aria-hidden={i !== current}
        />
      ))}
      <div className={styles.carouselOverlay} />
      <AnimatePresence mode="wait">
        <motion.div
          key={current}
          className={styles.carouselContent}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.4 }}
        >
          {banner.label && <span className={styles.carouselLabel}>{banner.label}</span>}
          <h2 className={styles.carouselTitle}>{banner.title}</h2>
          {banner.subtitle && <p className={styles.carouselSub}>{banner.subtitle}</p>}
          <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}>
            <Link to={banner.link} className={styles.carouselBtn}>{banner.linkText} →</Link>
          </motion.div>
        </motion.div>
      </AnimatePresence>

      <motion.button className={`${styles.carouselArrow} ${styles.carouselArrowLeft}`} onClick={prev} aria-label="Anterior" whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
        <ChevronLeft size={22} />
      </motion.button>
      <motion.button className={`${styles.carouselArrow} ${styles.carouselArrowRight}`} onClick={next} aria-label="Siguiente" whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
        <ChevronRight size={22} />
      </motion.button>

      <div className={styles.carouselDots}>
        {BANNERS.map((_, i) => (
          <button key={i} className={`${styles.carouselDot} ${i === current ? styles.carouselDotActive : ''}`} onClick={() => setCurrent(i)} aria-label={`Slide ${i + 1}`} />
        ))}
      </div>
    </div>
  )
}

export default function HomePage() {
  const { data: trending, loading: lt } = useFetch(() => catalogAPI.getTrending('all', 'week'), [])
  const { data: topMovies, loading: lm } = useFetch(() => catalogAPI.getTopRated('movie'), [])
  const { data: topSeries, loading: ls } = useFetch(() => catalogAPI.getTopRated('tv'), [])

  return (
    <div className={`${styles.page}`}>
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
      </Helmet>

      {/* Hero */}
      <section className={styles.hero}>
        <div className={`container ${styles.heroInner}`}>
          <motion.div className={styles.heroLeft} initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }}>
            <HeroCarousel />
          </motion.div>
          <motion.div className={styles.heroRight} initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, delay: 0.1 }}>
            <HeroPanel />
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <motion.div className={styles.statsBar} initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ duration: 0.5 }}>
        <div className={`container ${styles.statsInner}`}>
          {[
            { num: '500K+', label: 'Películas' },
            { num: '150K+', label: 'Series' },
            { num: '6',     label: 'Plataformas' },
            { num: 'Gratis', label: 'Siempre' },
          ].map(({ num, label }, i) => (
            <motion.div key={label} className={styles.stat}
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ delay: i * 0.08 }}>
              <span className={styles.statNum}>{num}</span>
              <span className={styles.statLabel}>{label}</span>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Tendencias */}
      <motion.section className={`container ${styles.section}`} variants={sectionVariants} initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-60px' }}>
        <div className={styles.sectionHeader}>
          <div className={styles.sectionTitleWrap}>
            <div className={styles.sectionDot} />
            <h2 className="heading-md">Tendencias de la semana</h2>
          </div>
          <a href="/catalog" className={styles.seeAll}>Ver todo →</a>
        </div>
        <MediaGrid items={trending?.results?.slice(0, 10)} loading={lt} skeletonCount={10} />
      </motion.section>

      <motion.div className="container" variants={sectionVariants} initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-60px' }}>
        <StreamingSection provider="netflix" />
      </motion.div>

      <motion.section className={`container ${styles.section}`} variants={sectionVariants} initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-60px' }}>
        <div className={styles.sectionHeader}>
          <div className={styles.sectionTitleWrap}>
            <div className={styles.sectionDot} style={{ background: 'var(--color-gold)', boxShadow: '0 0 8px var(--color-gold)' }} />
            <h2 className="heading-md">🏆 Mejor valoradas</h2>
          </div>
          <a href="/movies" className={styles.seeAll}>Ver más →</a>
        </div>
        <MediaGrid items={topMovies?.results?.slice(0, 10)} type="movie" loading={lm} skeletonCount={10} />
      </motion.section>

      <motion.div className="container" variants={sectionVariants} initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-60px' }}>
        <StreamingSection provider="disney" />
      </motion.div>

      <motion.section className={`container ${styles.section}`} variants={sectionVariants} initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-60px' }}>
        <div className={styles.sectionHeader}>
          <div className={styles.sectionTitleWrap}>
            <div className={styles.sectionDot} style={{ background: 'var(--color-purple)', boxShadow: '0 0 8px var(--color-purple)' }} />
            <h2 className="heading-md">📺 Series destacadas</h2>
          </div>
          <a href="/series" className={styles.seeAll}>Ver más →</a>
        </div>
        <MediaGrid items={topSeries?.results?.slice(0, 10)} type="tv" loading={ls} skeletonCount={10} />
      </motion.section>

      <motion.div className="container" variants={sectionVariants} initial="hidden" whileInView="visible" viewport={{ once: true }}>
        <a href="/streaming" className={styles.allPlatforms}>
          <span>Ver todas las plataformas — Netflix, Disney+, Max, Prime, Apple TV+, Paramount+</span>
          <span>→</span>
        </a>
      </motion.div>
    </div>
  )
}
