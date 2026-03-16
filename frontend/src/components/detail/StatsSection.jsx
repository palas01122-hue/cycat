import { useFetch } from '../../hooks/useFetch'
import { statsAPI } from '../../services/api'
import { getRatingColor } from '../../utils/tmdb'
import styles from './StatsSection.module.css'

export default function StatsSection({ userId }) {
  const { data, loading } = useFetch(() => statsAPI.getMyStats(), [userId])

  if (loading) return <div className={styles.loading}>Cargando estadísticas...</div>
  if (!data?.data) return null

  const { totals, distribution, byYear, recent, reviewStats, favorites, watchlist } = data.data

  const maxDist = Math.max(...(distribution?.map(d => d.count) || [1]))

  return (
    <div className={styles.wrap}>
      {/* Cards de stats */}
      <div className={styles.statsCards}>
        <StatCard icon="🎬" value={totals?.movies_rated || 0} label="Películas calificadas" color="var(--color-accent)" />
        <StatCard icon="📺" value={totals?.series_rated || 0} label="Series calificadas" color="var(--color-purple)" />
        <StatCard icon="⭐" value={totals?.avg_score ? Number(totals.avg_score).toFixed(1) : '—'} label="Promedio de notas" color="var(--color-gold)" />
        <StatCard icon="✍️" value={reviewStats?.total_reviews || 0} label="Reseñas escritas" color="var(--color-accent-3)" />
        <StatCard icon="❤️" value={favorites || 0} label="Favoritos" color="#ef476f" />
        <StatCard icon="🔖" value={watchlist || 0} label="En mi lista" color="var(--color-text-secondary)" />
      </div>

      {/* Distribución de notas */}
      {distribution?.length > 0 && (
        <div className={styles.block}>
          <h3 className={styles.blockTitle}>Distribución de notas</h3>
          <div className={styles.distChart}>
            {Array.from({ length: 10 }, (_, i) => i + 1).map(score => {
              const bucket = distribution.find(d => d.score_bucket === score)
              const count  = bucket?.count || 0
              const height = maxDist > 0 ? Math.max(4, (count / maxDist) * 100) : 4
              const color  = getRatingColor(score)
              return (
                <div key={score} className={styles.distBar}>
                  <div className={styles.barCount}>{count > 0 ? count : ''}</div>
                  <div
                    className={styles.bar}
                    style={{ height: `${height}%`, background: color, opacity: count > 0 ? 1 : 0.15 }}
                    title={`${count} películas con nota ${score}`}
                  />
                  <div className={styles.barLabel}>{score}</div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Actividad por año */}
      {byYear?.length > 0 && (
        <div className={styles.block}>
          <h3 className={styles.blockTitle}>Actividad por año</h3>
          <div className={styles.yearList}>
            {byYear.map(y => (
              <div key={y.year} className={styles.yearRow}>
                <span className={styles.yearLabel}>{y.year}</span>
                <div className={styles.yearBarWrap}>
                  <div
                    className={styles.yearBar}
                    style={{ width: `${Math.min(100, (y.count / (byYear[0]?.count || 1)) * 100)}%` }}
                  />
                </div>
                <span className={styles.yearCount}>{y.count}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function StatCard({ icon, value, label, color }) {
  return (
    <div className={styles.statCard}>
      <span className={styles.statIcon}>{icon}</span>
      <span className={styles.statValue} style={{ color }}>{value}</span>
      <span className={styles.statLabel}>{label}</span>
    </div>
  )
}
