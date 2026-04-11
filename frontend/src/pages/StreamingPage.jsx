import { Helmet } from 'react-helmet-async'
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
      <Helmet>
        <title>Plataformas de Streaming — Netflix, Disney+, Max, Prime — CyCat</title>
        <meta name="description" content="Las mejores películas y series de Netflix, Disney+, Max, Prime Video, Apple TV+ y Paramount+. Descubrí qué ver en cada plataforma de streaming." />
        <link rel="canonical" href="https://cycat.lat/streaming" />
        <meta property="og:title" content="Plataformas de Streaming — CyCat" />
        <meta property="og:url" content="https://cycat.lat/streaming" />
      </Helmet>
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
