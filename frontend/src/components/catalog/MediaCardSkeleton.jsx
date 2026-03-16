import styles from './MediaCardSkeleton.module.css'

export default function MediaCardSkeleton() {
  return (
    <div className={styles.card} aria-hidden="true">
      <div className={`skeleton ${styles.poster}`} />
      <div className={styles.info}>
        <div className={`skeleton ${styles.titleLine}`} />
        <div className={`skeleton ${styles.yearLine}`} />
      </div>
    </div>
  )
}
