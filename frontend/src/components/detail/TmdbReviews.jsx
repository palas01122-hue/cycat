import { useState } from 'react'
import { useFetch } from '../../hooks/useFetch'
import { detailAPI } from '../../services/api'
import styles from './TmdbReviews.module.css'

function Avatar({ name }) {
    return (
        <div className={styles.avatar}>
            {name?.[0]?.toUpperCase() || '?'}
        </div>
    )
}

function StarBar({ rating }) {
    if (!rating) return null
    const stars = Math.round(rating / 2)
    return (
        <div className={styles.stars}>
            {Array.from({ length: 10 }, (_, i) => (
                <span key={i} className={i < stars ? styles.starFilled : styles.starEmpty}>★</span>
            ))}
            <span className={styles.starNum}>{rating.toFixed(1)}/10</span>
        </div>
    )
}

function ReviewCard({ review }) {
    const [expanded, setExpanded] = useState(false)
    const content = review.content || ''
    const isLong = content.length > 300
    const displayed = expanded || !isLong ? content : content.slice(0, 300) + '...'

    const date = review.created_at
        ? new Date(review.created_at).toLocaleDateString('es-AR', { year: 'numeric', month: 'long' })
        : ''

    const rating = review.author_details?.rating

    return (
        <div className={styles.card}>
            <div className={styles.cardHeader}>
                <Avatar name={review.author} />
                <div className={styles.cardMeta}>
                    <span className={styles.author}>{review.author}</span>
                    <span className={styles.date}>{date}</span>
                </div>
                {rating && <StarBar rating={rating} />}
            </div>
            <p className={styles.content}>{displayed}</p>
            {isLong && (
                <button className={styles.toggle} onClick={() => setExpanded(e => !e)}>
                    {expanded ? 'Ver menos ↑' : 'Ver más ↓'}
                </button>
            )}
        </div>
    )
}

export default function TmdbReviews({ type, id }) {
    const { data, loading } = useFetch(() => detailAPI.getReviews(type, id), [id, type])

    if (loading) return null
    const reviews = data?.data?.results || []
    if (reviews.length === 0) return null

    return (
        <section className={styles.wrap}>
            <h2 className={styles.title}>
                Reseñas de la comunidad
                <span className={styles.badge}>{reviews.length}</span>
            </h2>
            <p className={styles.source}>Fuente: TMDB · En idioma original</p>
            <div className={styles.list}>
                {reviews.slice(0, 5).map(r => (
                    <ReviewCard key={r.id} review={r} />
                ))}
            </div>
        </section>
    )
}
