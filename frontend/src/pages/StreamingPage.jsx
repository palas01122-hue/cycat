import StreamingSection from '../components/catalog/StreamingSection'
import styles from './StreamingPage.module.css'

const PLATFORMS = [
  { key: 'netflix',   name: 'Netflix',     color: '#e50914' },
  { key: 'disney',    name: 'Disney+',     color: '#0063e5' },
  { key: 'hbo',       name: 'Max',         color: '#9b6bff' },
  { key: 'prime',     name: 'Prime Video', color: '#00a8e1' },
  { key: 'apple',     name: 'Apple TV+',   color: '#a2aaad' },
  { key: 'paramount', name: 'Paramount+',  color: '#0064ff' },
]

export default function StreamingPage() {
  return (
    <div className={`container page-enter ${styles.page}`}>
      <div className={styles.header}>
        <h1 className="heading-lg">📡 Plataformas</h1>
        <p className={styles.sub}>Lo mejor y las novedades de cada servicio de streaming</p>
      </div>

      {PLATFORMS.map(p => (
        <StreamingSection key={p.key} provider={p.key} />
      ))}
    </div>
  )
}
