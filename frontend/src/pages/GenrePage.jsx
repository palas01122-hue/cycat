import { useParams } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { motion } from 'framer-motion'
import { usePaginatedFetch } from '../hooks/useFetch'
import { catalogAPI } from '../services/api'
import MediaGrid from '../components/catalog/MediaGrid'
import styles from './CatalogPage.module.css'

// Mapa slug → ID de género TMDB
const GENRE_MAP = {
  movie: {
    'accion': { id: 28, name: 'Acción' },
    'aventura': { id: 12, name: 'Aventura' },
    'animacion': { id: 16, name: 'Animación' },
    'comedia': { id: 35, name: 'Comedia' },
    'crimen': { id: 80, name: 'Crimen' },
    'documental': { id: 99, name: 'Documental' },
    'drama': { id: 18, name: 'Drama' },
    'fantasia': { id: 14, name: 'Fantasía' },
    'ciencia-ficcion': { id: 878, name: 'Ciencia Ficción' },
    'terror': { id: 27, name: 'Terror' },
    'romance': { id: 10749, name: 'Romance' },
    'thriller': { id: 53, name: 'Thriller' },
    'historia': { id: 36, name: 'Historia' },
    'musica': { id: 10402, name: 'Música' },
    'western': { id: 37, name: 'Western' },
  },
  tv: {
    'accion': { id: 10759, name: 'Acción y Aventura' },
    'animacion': { id: 16, name: 'Animación' },
    'comedia': { id: 35, name: 'Comedia' },
    'crimen': { id: 80, name: 'Crimen' },
    'documental': { id: 99, name: 'Documental' },
    'drama': { id: 18, name: 'Drama' },
    'fantasia': { id: 10765, name: 'Ciencia Ficción y Fantasía' },
    'ciencia-ficcion': { id: 10765, name: 'Ciencia Ficción' },
    'terror': { id: 9648, name: 'Misterio' },
    'romance': { id: 10749, name: 'Romance' },
    'thriller': { id: 53, name: 'Thriller' },
    'aventura': { id: 10759, name: 'Aventura' },
  }
}

const DESCRIPTIONS = {
  'accion': 'Las mejores películas y series de acción. Explosiones, persecuciones y adrenalina pura.',
  'comedia': 'Las comedias más divertidas. Reíte con las mejores películas y series de humor.',
  'drama': 'Dramas que te van a emocionar. Historias profundas y personajes inolvidables.',
  'terror': 'Las películas de terror más aterradoras. ¿Te animás a verlas?',
  'ciencia-ficcion': 'Ciencia ficción del buena. Viajes espaciales, futuros distópicos y tecnología extrema.',
  'animacion': 'Las mejores animaciones para toda la familia y adultos.',
  'thriller': 'Thrillers que te van a tener en vilo hasta el final.',
  'romance': 'Las historias de amor más emotivas del cine y la televisión.',
  'fantasia': 'Mundos mágicos, criaturas míticas y aventuras épicas.',
  'crimen': 'Crímenes, detectives y misterios que no podés dejar de ver.',
  'documental': 'Documentales que te van a cambiar la forma de ver el mundo.',
  'aventura': 'Aventuras épicas en los rincones más remotos del mundo.',
  'historia': 'Películas históricas basadas en hechos reales.',
  'musica': 'Películas y series sobre música y músicos.',
  'western': 'El mejor western. Cowboys, pistoleros y el Viejo Oeste.',
}

export default function GenrePage() {
  const { type = 'movie', slug } = useParams()
  const genreInfo = GENRE_MAP[type]?.[slug]

  const { data, loading } = usePaginatedFetch(
    (page) => genreInfo
      ? catalogAPI.getByGenre(type, genreInfo.id, page)
      : Promise.resolve({ data: { results: [] } }),
    [type, slug]
  )

  const items = data?.results || []
  const typeLabel = type === 'movie' ? 'Películas' : 'Series'
  const title = genreInfo ? `${typeLabel} de ${genreInfo.name}` : 'Género no encontrado'
  const description = DESCRIPTIONS[slug] || `Las mejores ${typeLabel.toLowerCase()} de ${genreInfo?.name || slug}.`
  const canonicalUrl = `https://cycat.lat/genre/${type}/${slug}`

  return (
    <motion.div
      className={`container ${styles.page}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <Helmet>
        <title>{`${title} — CyCat`}</title>
        <meta name="description" content={description} />
        <link rel="canonical" href={canonicalUrl} />
        <meta property="og:title" content={`${title} — CyCat`} />
        <meta property="og:description" content={description} />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:type" content="website" />
        <meta name="robots" content="index, follow" />
        <script type="application/ld+json">{JSON.stringify({
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          "name": title,
          "description": description,
          "url": canonicalUrl,
          "inLanguage": "es",
          "about": {
            "@type": "Thing",
            "name": genreInfo?.name || slug
          }
        })}</script>
      </Helmet>

      <div className={styles.pageHeader}>
        <h1 className="heading-lg">{title}</h1>
        <p className={styles.sub}>{description}</p>
      </div>

      <MediaGrid items={items} type={type} loading={loading} skeletonCount={20} />
    </motion.div>
  )
}
