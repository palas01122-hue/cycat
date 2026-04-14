import { Helmet } from 'react-helmet-async'
import { Link } from 'react-router-dom'
import { useFetch } from '../hooks/useFetch'
import { statsAPI } from '../services/api'
import { useAuth } from '../hooks/useAuth'
import { getPosterUrl } from '../utils/tmdb'
import styles from './StatsPage.module.css'

function formatMinutes(min) {
  if (!min) return '0h'
  const h = Math.floor(min / 60)
  const d = Math.floor(h / 24)
  if (d > 0) return `${d}d ${h % 24}h`
  return `${h}h`
}

function BarChart({ data, labelKey, valueKey, color = 'var(--color-accent)' }) {
  if (!data?.length) return <p className={styles.noData}>Sin datos aún</p>
  const max = Math.max(...data.map(d => d[valueKey]), 1)
  return (
    <div className={styles.barChart}>
      {data.map((item, i) => (
        <div key={i} className={styles.barRow}>
          <span className={styles.barLabel}>{item[labelKey]}</span>
          <div className={styles.barTrack}>
            <div
              className={styles.barFill}
              style={{ width: `${(item[valueKey] / max) * 100}%`, background: color }}
            />
          </div>
          <span className={styles.barValue}>{item[valueKey]}</span>
        </div>
      ))}
    </div>
  )
}

function ScoreBar({ score, count, total }) {
  const pct = total > 0 ? (count / total) * 100 : 0
  const userPct = total > 0 ? ((count / total) * 100).toFixed(1) : '0'
  const color = score >= 8 ? 'var(--color-accent-3)' : score >= 6 ? 'var(--color-gold)' : 'var(--color-accent-2)'
  return (
    <div className={styles.scoreRow}>
      <span className={styles.scoreNum}>{score}</span>
      <div className={styles.scoreTrack}>
        <div className={styles.scoreFill} style={{ width: `${pct}%`, background: color }} />
      </div>
      <span className={styles.scorePct}>{count > 0 ? `${count} (${userPct}%)` : '—'}</span>
    </div>
  )
}

function MonthChart({ data }) {
  if (!data?.length) return <p className={styles.noData}>Sin actividad reciente</p>
  const max = Math.max(...data.map(d => d.count), 1)
  return (
    <div className={styles.monthChart}>
      {data.map(item => {
        const [year, month] = item.month.split('-')
        const label = new Date(year, parseInt(month) - 1).toLocaleDateString('es-AR', { month: 'short' })
        const pct = (item.count / max) * 100
        return (
          <div key={item.month} className={styles.monthCol}>
            <span className={styles.monthCount}>{item.count}</span>
            <div className={styles.monthBarWrap}>
              <div className={styles.monthBar} style={{ height: `${Math.max(pct, 4)}%` }} />
            </div>
            <span className={styles.monthLabel}>{label}</span>
          </div>
        )
      })}
    </div>
  )
}

export default function StatsPage() {
  const { isAuthenticated } = useAuth()
  const { data, loading } = useFetch(() => statsAPI.getMyStats(), [])

  if (!isAuthenticated) {
    return (
      <div className={`container ${styles.page}`}>
        <div className={styles.loginPrompt}>
          <span className={styles.loginIcon}>📊</span>
          <h2>Tus estadísticas personales</h2>
          <p>Iniciá sesión para ver tus estadísticas de cine y series.</p>
          <Link to="/login" className={styles.loginBtn}>Iniciar sesión</Link>
        </div>
      </div>
    )
  }

  if (loading) return (
    <div className={`container ${styles.page}`}>
      <div className={styles.skGrid}>
        {Array.from({ length: 6 }).map((_, i) => <div key={i} className={`skeleton ${styles.skCard}`} />)}
      </div>
    </div>
  )

  if (!data) return null

  const { totals, distribution, byYear, byMonth, recent, reviewStats, totalMinutes, streak, favorites, watchlist } = data

  // Fill distribution 1-10
  const fullDist = Array.from({ length: 10 }, (_, i) => {
    const score = i + 1
    const found = (distribution || []).find(d => d.score_bucket === score)
    return { score, count: found?.count || 0 }
  })

  return (
    <div className={`container page-enter ${styles.page}`}>
      <Helmet>
        <title>Mis Estadísticas — CyCat</title>
        <meta name="description" content="Tus estadísticas personales de películas y series en CyCat." />
      </Helmet>

      <header className={styles.header}>
        <h1 className="heading-md">Mis Estadísticas</h1>
      </header>

      {/* Totales */}
      <div className={styles.totalsGrid}>
        <div className={styles.statCard}>
          <span className={styles.statValue}>{totals?.total_rated || 0}</span>
          <span className={styles.statLabel}>Calificadas</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statValue}>{totals?.movies_rated || 0}</span>
          <span className={styles.statLabel}>Películas</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statValue}>{totals?.series_rated || 0}</span>
          <span className={styles.statLabel}>Series</span>
        </div>
        <div className={`${styles.statCard} ${styles.statCardGold}`}>
          <span className={styles.statValue}>{totals?.avg_score || '—'}</span>
          <span className={styles.statLabel}>Promedio</span>
        </div>
        <div className={`${styles.statCard} ${styles.statCardAccent}`}>
          <span className={styles.statValue}>{formatMinutes(totalMinutes)}</span>
          <span className={styles.statLabel}>Tiempo total</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statValue}>{streak || 0}</span>
          <span className={styles.statLabel}>Racha actual 🔥</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statValue}>{favorites || 0}</span>
          <span className={styles.statLabel}>Favoritos</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statValue}>{watchlist || 0}</span>
          <span className={styles.statLabel}>Watchlist</span>
        </div>
      </div>

      <div className={styles.chartsGrid}>
        {/* Distribución de calificaciones */}
        <div className={styles.chartCard}>
          <h2 className={styles.chartTitle}>Mis calificaciones</h2>
          <div className={styles.distChart}>
            {fullDist.map(({ score, count }) => (
              <ScoreBar key={score} score={score} count={count} total={totals?.total_rated || 1} />
            ))}
          </div>
        </div>

        {/* Actividad mensual */}
        <div className={styles.chartCard}>
          <h2 className={styles.chartTitle}>Actividad — últimos 12 meses</h2>
          <MonthChart data={byMonth} />
        </div>

        {/* Actividad por año */}
        <div className={styles.chartCard}>
          <h2 className={styles.chartTitle}>Calificaciones por año</h2>
          <BarChart
            data={byYear}
            labelKey="year"
            valueKey="count"
            color="var(--color-accent)"
          />
        </div>

        {/* Reviews */}
        <div className={styles.chartCard}>
          <h2 className={styles.chartTitle}>Reseñas</h2>
          <div className={styles.reviewStats}>
            <div className={styles.reviewStat}>
              <span className={styles.reviewNum}>{reviewStats?.total_reviews || 0}</span>
              <span className={styles.reviewLabel}>Reseñas escritas</span>
            </div>
            <div className={styles.reviewStat}>
              <span className={styles.reviewNum}>{reviewStats?.total_likes || 0}</span>
              <span className={styles.reviewLabel}>Likes recibidos</span>
            </div>
          </div>
        </div>
      </div>

      {/* Últimas calificadas */}
      {recent?.length > 0 && (
        <section className={styles.recentSection}>
          <h2 className={styles.sectionTitle}>Últimas calificadas</h2>
          <div className={styles.recentGrid}>
            {recent.map(item => (
              <Link key={`${item.content_id}-${item.content_type}`} to={`/${item.content_type}/${item.content_id}`} className={styles.recentCard}>
                <img src={getPosterUrl(item.poster_path, 'sm')} alt={item.title} className={styles.recentPoster} />
                <div className={styles.recentInfo}>
                  <span className={styles.recentTitle}>{item.title}</span>
                  <span className={styles.recentScore}>★ {item.score}</span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
