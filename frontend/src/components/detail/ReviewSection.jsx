import { useState } from 'react'
import { useFetch } from '../../hooks/useFetch'
import { useAuth } from '../../hooks/useAuth'
import { reviewsAPI } from '../../services/api'
import styles from './ReviewSection.module.css'

export default function ReviewSection({ contentId, type, title, posterPath }) {
  const { isAuthenticated, user } = useAuth()
  const [refresh, setRefresh]     = useState(0)
  const [writing, setWriting]     = useState(false)
  const [body, setBody]           = useState('')
  const [spoiler, setSpoiler]     = useState(false)
  const [saving, setSaving]       = useState(false)
  const [showSpoilers, setShowSpoilers] = useState({})

  const { data, loading } = useFetch(
    () => reviewsAPI.getForContent(type, contentId),
    [contentId, refresh]
  )

  const reviews = data?.reviews || []

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!body.trim()) return
    setSaving(true)
    try {
      await reviewsAPI.create(type, contentId, body, spoiler, title, posterPath)
      setBody('')
      setSpoiler(false)
      setWriting(false)
      setRefresh(r => r + 1)
    } catch {}
    setSaving(false)
  }

  const handleLike = async (reviewId) => {
    if (!isAuthenticated) return
    try {
      await reviewsAPI.like(reviewId)
      setRefresh(r => r + 1)
    } catch {}
  }

  const handleDelete = async () => {
    try {
      await reviewsAPI.delete(type, contentId)
      setRefresh(r => r + 1)
    } catch {}
  }

  const toggleSpoiler = (id) => {
    setShowSpoilers(prev => ({ ...prev, [id]: !prev[id] }))
  }

  return (
    <section className={styles.section}>
      <div className={styles.header}>
        <h2 className={styles.title}>
          Reseñas
          {reviews.length > 0 && <span className={styles.count}>{reviews.length}</span>}
        </h2>
        {isAuthenticated && !writing && (
          <button className={styles.writeBtn} onClick={() => setWriting(true)}>
            ✏️ Escribir reseña
          </button>
        )}
      </div>

      {/* Formulario de review */}
      {writing && (
        <form onSubmit={handleSubmit} className={styles.form}>
          <textarea
            value={body}
            onChange={e => setBody(e.target.value)}
            placeholder="¿Qué te pareció? Contá tu opinión..."
            className={styles.textarea}
            rows={5}
            maxLength={2000}
            autoFocus
          />
          <div className={styles.formFooter}>
            <div className={styles.formLeft}>
              <label className={styles.spoilerCheck}>
                <input
                  type="checkbox"
                  checked={spoiler}
                  onChange={e => setSpoiler(e.target.checked)}
                />
                <span>Contiene spoilers</span>
              </label>
              <span className={styles.charCount}>{body.length}/2000</span>
            </div>
            <div className={styles.formBtns}>
              <button type="button" onClick={() => setWriting(false)} className={styles.cancelBtn}>
                Cancelar
              </button>
              <button type="submit" disabled={saving || !body.trim()} className={styles.submitBtn}>
                {saving ? 'Guardando...' : 'Publicar reseña'}
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Lista de reviews */}
      {loading ? (
        <div className={styles.loading}>Cargando reseñas...</div>
      ) : reviews.length === 0 ? (
        <div className={styles.empty}>
          <p>Todavía no hay reseñas. ¡Sé el primero!</p>
        </div>
      ) : (
        <div className={styles.list}>
          {reviews.map(review => (
            <div key={review.id} className={styles.reviewCard}>
              <div className={styles.reviewHeader}>
                <div className={styles.reviewUser}>
                  {review.avatar ? (
                    <img src={review.avatar} alt={review.username} className={styles.avatar} referrerPolicy="no-referrer" />
                  ) : (
                    <div className={styles.avatarFallback}>{review.username?.[0]?.toUpperCase()}</div>
                  )}
                  <div>
                    <span className={styles.username}>{review.username}</span>
                    {review.score && (
                      <span className={styles.score}>★ {Number(review.score).toFixed(1)}</span>
                    )}
                  </div>
                </div>
                <span className={styles.date}>
                  {new Date(review.created_at).toLocaleDateString('es-AR', { day: 'numeric', month: 'short', year: 'numeric' })}
                </span>
              </div>

              {/* Contenido con spoiler protection */}
              {review.contains_spoiler && !showSpoilers[review.id] ? (
                <div className={styles.spoilerWarn}>
                  <span>⚠️ Esta reseña contiene spoilers</span>
                  <button onClick={() => toggleSpoiler(review.id)} className={styles.revealBtn}>
                    Mostrar igual
                  </button>
                </div>
              ) : (
                <p className={styles.reviewBody}>{review.body}</p>
              )}

              {/* Acciones */}
              <div className={styles.reviewActions}>
                <button
                  onClick={() => handleLike(review.id)}
                  className={`${styles.likeBtn} ${review.userLiked ? styles.liked : ''}`}
                  disabled={!isAuthenticated}
                >
                  {review.userLiked ? '❤️' : '🤍'} {review.likes}
                </button>
                {String(user?.id) === String(review.user_id) && (
                  <button onClick={handleDelete} className={styles.deleteBtn}>
                    Eliminar
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}
