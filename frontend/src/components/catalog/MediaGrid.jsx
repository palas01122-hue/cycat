import MediaCard from './MediaCard'
import MediaCardSkeleton from './MediaCardSkeleton'
import styles from './MediaGrid.module.css'

export default function MediaGrid({ items, type, loading, skeletonCount = 20 }) {
  if (loading && (!items || items.length === 0)) {
    return (
      <div className={styles.grid} data-testid="media-grid">
        {Array.from({ length: skeletonCount }).map((_, i) => (
          <MediaCardSkeleton key={i} />
        ))}
      </div>
    )
  }

  if (!loading && (!items || items.length === 0)) {
    return (
      <div className={styles.empty}>
        <p>No se encontraron resultados.</p>
      </div>
    )
  }

  return (
    <div className={styles.grid} data-testid="media-grid">
      {items.map((item, i) => (
        <MediaCard
          key={`${item.id}-${i}`}
          item={item}
          type={type || (item.media_type === 'tv' ? 'tv' : 'movie')}
          index={i}
        />
      ))}
    </div>
  )
}
