import { useState, useEffect } from 'react'
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

function ReviewCard({ review, autoTranslate }) {
    const [expanded, setExpanded] = useState(false)
    const [translatedContent, setTranslatedContent] = useState(null)

    useEffect(() => {
        if (autoTranslate && !translatedContent && review.content) {
            // Utilizamos el truco de la API gratuita de Google Translate
            fetch(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=es&dt=t&q=${encodeURIComponent(review.content.slice(0, 4500))}`)
                .then(res => res.json())
                .then(data => {
                    const translated = data[0].map(item => item[0]).join('')
                    setTranslatedContent(translated)
                })
                .catch(err => console.error("Error translating", err))
        }
    }, [autoTranslate, review.content, translatedContent])

    const content = translatedContent || review.content || ''
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
    const [autoTranslate, setAutoTranslate] = useState(false)

    if (loading) return null
    const reviews = data?.data?.results || []
    if (reviews.length === 0) return null

    return (
        <section className={styles.wrap}>
            <div className={styles.headerRow}>
                <h2 className={styles.title}>
                    Reseñas de TMDB
                    <span className={styles.badge}>{reviews.length}</span>
                </h2>
                {!autoTranslate && (
                    <button className={styles.translateBtn} onClick={() => setAutoTranslate(true)}>
                        🌎 Traducir al Español
                    </button>
                )}
            </div>
            <p className={styles.source}>Fuente: TMDB · {autoTranslate ? 'Traducido automáticamente' : 'En idioma original'}</p>
            <div className={styles.list}>
                {reviews.slice(0, 5).map(r => (
                    <ReviewCard key={r.id} review={r} autoTranslate={autoTranslate} />
                ))}
            </div>
        </section>
    )
}
