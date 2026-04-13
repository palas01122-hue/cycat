import { useFetch } from '../../hooks/useFetch'
import { rankingsAPI } from '../../services/api'
import styles from './VoteHistogram.module.css'

export default function VoteHistogram({ type, id }) {
  const { data, loading } = useFetch(() => rankingsAPI.getHistogram(type, id), [type, id])

  if (loading || !data || data.total === 0) return null

  const { distribution, total, average } = data
  const maxCount = Math.max(...distribution.map(d => d.count), 1)

  return (
    <div className={styles.wrap}>
      <div className={styles.header}>
        <h3 className={styles.title}>Votos CyCat</h3>
        <div className={styles.summary}>
          <span className={styles.avg}>{average}</span>
          <span className={styles.totalLabel}>{total} {total === 1 ? 'voto' : 'votos'}</span>
        </div>
      </div>
      <div className={styles.chart}>
        {distribution.map(({ score, count }) => {
          const pct = maxCount > 0 ? (count / maxCount) * 100 : 0
          const userPct = total > 0 ? ((count / total) * 100).toFixed(1) : '0'
          return (
            <div key={score} className={styles.row}>
              <span className={styles.score}>{score}</span>
              <div className={styles.barWrap}>
                <div
                  className={styles.bar}
                  style={{ width: `${pct}%` }}
                  data-count={count}
                />
              </div>
              <span className={styles.pct}>{count > 0 ? `${userPct}%` : '—'}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
