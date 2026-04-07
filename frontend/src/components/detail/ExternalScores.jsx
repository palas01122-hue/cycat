import { useFetch } from '../../hooks/useFetch'
import { detailAPI } from '../../services/api'
import styles from './ExternalScores.module.css'

// Íconos SVG inline para RT, Metacritic e IMDb
function RTIcon({ score }) {
  const num = parseInt(score)
  const isFresh = num >= 60
  return (
    <div className={`${styles.scoreCard} ${isFresh ? styles.fresh : styles.rotten}`}>
      <div className={styles.scoreIcon}>
        {isFresh ? '🍅' : '🤢'}
      </div>
      <div className={styles.scoreInfo}>
        <span className={styles.scoreValue}>{score}</span>
        <span className={styles.scoreLabel}>Rotten Tomatoes</span>
      </div>
    </div>
  )
}

function MetaIcon({ score }) {
  const num = parseInt(score)
  const color = num >= 61 ? styles.metaGreen : num >= 40 ? styles.metaYellow : styles.metaRed
  return (
    <div className={`${styles.scoreCard} ${styles.metacritic}`}>
      <div className={`${styles.metaBox} ${color}`}>
        <span>{num}</span>
      </div>
      <div className={styles.scoreInfo}>
        <span className={styles.scoreValue}>{score}</span>
        <span className={styles.scoreLabel}>Metacritic</span>
      </div>
    </div>
  )
}

function ImdbIcon({ score, votes }) {
  return (
    <div className={`${styles.scoreCard} ${styles.imdb}`}>
      <div className={styles.imdbBox}>IMDb</div>
      <div className={styles.scoreInfo}>
        <span className={styles.scoreValue}>⭐ {score}<span className={styles.imdbMax}>/10</span></span>
        {votes && <span className={styles.scoreLabel}>{votes} votos</span>}
      </div>
    </div>
  )
}

export default function ExternalScores({ movieId }) {
  const { data, loading } = useFetch(() => detailAPI.getScores(movieId), [movieId])

  if (loading) return null
  const scores = data?.data
  if (!scores) return null

  const hasAny = scores.rottenTomatoes || scores.metacritic || scores.imdb
  if (!hasAny) return null

  return (
    <div className={styles.wrap}>
      <h3 className={styles.title}>Crítica internacional</h3>
      <div className={styles.scores}>
        {scores.rottenTomatoes && <RTIcon score={scores.rottenTomatoes.score} />}
        {scores.metacritic     && <MetaIcon score={scores.metacritic.score} />}
        {scores.imdb           && <ImdbIcon score={scores.imdb.score} votes={scores.imdb.votes} />}
      </div>
      {scores.awards && (
        <p className={styles.awards}>🏆 {scores.awards}</p>
      )}
      {scores.boxOffice && (
        <p className={styles.boxOffice}>💰 Taquilla: {scores.boxOffice}</p>
      )}
    </div>
  )
}