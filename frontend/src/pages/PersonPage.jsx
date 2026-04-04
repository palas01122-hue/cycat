import { useParams, Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { useFetch } from '../hooks/useFetch'
import { detailAPI } from '../services/api'
import { getPosterUrl, getProfileUrl, formatYear } from '../utils/tmdb'
import styles from './PersonPage.module.css'

export default function PersonPage() {
    const { id } = useParams()
    const { data, loading, error } = useFetch(() => detailAPI.getPerson(id), [id])

    if (loading) return <PersonSkeleton />
    if (error) return <div className="container" style={{ paddingTop: 40 }}>Error al cargar.</div>
    if (!data?.data) return null

    const person = data.data
    const movies = (person.movie_credits?.cast || [])
        .filter(m => m.poster_path && m.vote_count > 10)
        .sort((a, b) => b.popularity - a.popularity)
        .slice(0, 24)

    const directed = (person.movie_credits?.crew || [])
        .filter(m => m.job === 'Director' && m.poster_path)
        .sort((a, b) => b.popularity - a.popularity)
        .slice(0, 24)

    const tvShows = (person.tv_credits?.cast || [])
        .filter(t => t.poster_path && t.vote_count > 5)
        .sort((a, b) => b.popularity - a.popularity)
        .slice(0, 12)

    const isDirector = directed.length > 0
    const profileUrl = person.profile_path
        ? `https://image.tmdb.org/t/p/w300${person.profile_path}`
        : null

    return (
        <div className={`page-enter ${styles.page}`}>
            <Helmet>
                <title>{person.name} — CyCat</title>
                <meta name="description" content={`Filmografía completa de ${person.name}. Películas, series y más en CyCat.`} />
            </Helmet>

            <div className={`container ${styles.header}`}>
                <div className={styles.profileSection}>
                    {profileUrl ? (
                        <img src={profileUrl} alt={person.name} className={styles.photo} />
                    ) : (
                        <div className={styles.photoPlaceholder}>👤</div>
                    )}
                </div>

                <div className={styles.info}>
                    <div className={styles.role}>
                        {isDirector ? '🎬 Director' : '🎭 Actor/Actriz'}
                    </div>
                    <h1 className={`heading-display ${styles.name}`}>{person.name}</h1>

                    {person.birthday && (
                        <div className={styles.meta}>
                            <span>🗓 {new Date(person.birthday).toLocaleDateString('es-AR', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                            {person.place_of_birth && <span>📍 {person.place_of_birth}</span>}
                        </div>
                    )}

                    {person.biography && (
                        <p className={styles.bio}>
                            {person.biography.length > 500
                                ? person.biography.slice(0, 500) + '...'
                                : person.biography}
                        </p>
                    )}
                </div>
            </div>

            {directed.length > 0 && (
                <section className={`container ${styles.section}`}>
                    <h2 className={styles.sectionTitle}>🎬 Dirección</h2>
                    <div className={styles.grid}>
                        {directed.map(movie => (
                            <Link key={movie.id} to={`/movie/${movie.id}`} className={styles.card}>
                                <img
                                    src={getPosterUrl(movie.poster_path, 'sm')}
                                    alt={movie.title}
                                    className={styles.poster}
                                    loading="lazy"
                                />
                                <div className={styles.cardInfo}>
                                    <span className={styles.cardTitle}>{movie.title}</span>
                                    <span className={styles.cardYear}>{formatYear(movie.release_date)}</span>
                                </div>
                            </Link>
                        ))}
                    </div>
                </section>
            )}

            {movies.length > 0 && (
                <section className={`container ${styles.section}`}>
                    <h2 className={styles.sectionTitle}>🎭 Películas</h2>
                    <div className={styles.grid}>
                        {movies.map(movie => (
                            <Link key={movie.id} to={`/movie/${movie.id}`} className={styles.card}>
                                <img
                                    src={getPosterUrl(movie.poster_path, 'sm')}
                                    alt={movie.title}
                                    className={styles.poster}
                                    loading="lazy"
                                />
                                <div className={styles.cardInfo}>
                                    <span className={styles.cardTitle}>{movie.title}</span>
                                    <span className={styles.cardYear}>{formatYear(movie.release_date)}</span>
                                    {movie.character && (
                                        <span className={styles.cardRole}>{movie.character}</span>
                                    )}
                                </div>
                            </Link>
                        ))}
                    </div>
                </section>
            )}

            {tvShows.length > 0 && (
                <section className={`container ${styles.section}`}>
                    <h2 className={styles.sectionTitle}>📺 Series</h2>
                    <div className={styles.grid}>
                        {tvShows.map(show => (
                            <Link key={show.id} to={`/tv/${show.id}`} className={styles.card}>
                                <img
                                    src={getPosterUrl(show.poster_path, 'sm')}
                                    alt={show.name}
                                    className={styles.poster}
                                    loading="lazy"
                                />
                                <div className={styles.cardInfo}>
                                    <span className={styles.cardTitle}>{show.name}</span>
                                    <span className={styles.cardYear}>{formatYear(show.first_air_date)}</span>
                                </div>
                            </Link>
                        ))}
                    </div>
                </section>
            )}
        </div>
    )
}

function PersonSkeleton() {
    return (
        <div className="container" style={{ paddingTop: 40, display: 'flex', gap: 40 }}>
            <div className="skeleton" style={{ width: 200, height: 300, borderRadius: 12, flexShrink: 0 }} />
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div className="skeleton" style={{ height: 48, width: '50%' }} />
                <div className="skeleton" style={{ height: 16, width: '30%' }} />
                <div className="skeleton" style={{ height: 100 }} />
            </div>
        </div>
    )
}
