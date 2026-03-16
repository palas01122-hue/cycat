import { useState } from 'react'
import { Navigate, Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useFetch } from '../hooks/useFetch'
import { profileAPI, favoritesAPI } from '../services/api'
import { getPosterUrl, formatRating, getRatingColor } from '../utils/tmdb'
import StatsSection from '../components/detail/StatsSection'
import styles from './ProfilePage.module.css'

export default function ProfilePage() {
  const { user, isAuthenticated, loading: authLoading } = useAuth()
  const [activeTab, setActiveTab] = useState('ratings')
  const [editing, setEditing]     = useState(false)
  const [bio, setBio]             = useState('')
  const [saving, setSaving]       = useState(false)

  const { data: profileData, loading: profileLoading } = useFetch(() => profileAPI.get(), [user?.id])
  const { data: favData }     = useFetch(() => favoritesAPI.getAll(), [user?.id])
  const { data: watchData }   = useFetch(() => favoritesAPI.getWatchlist(), [user?.id])

  if (authLoading) return null
  if (!isAuthenticated) return <Navigate to="/login" replace />

  const profile   = profileData?.data?.user
  const stats     = profileData?.data?.stats
  const favorites = favData?.data?.favorites || []
  const watchlist = watchData?.data?.watchlist || []

  const handleSaveBio = async () => {
    setSaving(true)
    try {
      await profileAPI.update({ bio })
      setEditing(false)
    } catch {}
    setSaving(false)
  }

  return (
    <div className={`container page-enter ${styles.page}`}>
      {/* Header del perfil */}
      <div className={styles.profileHeader}>
        <div className={styles.avatarWrap}>
          {profile?.avatar ? (
            <img src={profile.avatar} alt={profile?.username} className={styles.avatarImg} referrerPolicy="no-referrer" />
          ) : (
            <div className={styles.avatarFallback}>
              {profile?.username?.[0]?.toUpperCase()}
            </div>
          )}
        </div>

        <div className={styles.profileInfo}>
          <h1 className={styles.username}>{profile?.username}</h1>
          <p className={styles.email}>{profile?.email}</p>
          {!editing ? (
            <div className={styles.bioRow}>
              <p className={styles.bio}>{profile?.bio || 'Sin descripción todavía.'}</p>
              <button className={styles.editBtn} onClick={() => { setEditing(true); setBio(profile?.bio || '') }}>
                ✏️ Editar
              </button>
            </div>
          ) : (
            <div className={styles.bioEdit}>
              <textarea
                value={bio}
                onChange={e => setBio(e.target.value)}
                placeholder="Contá algo sobre vos..."
                className={styles.bioInput}
                rows={3}
                maxLength={200}
              />
              <div className={styles.bioActions}>
                <button className={styles.saveBtn} onClick={handleSaveBio} disabled={saving}>
                  {saving ? 'Guardando...' : 'Guardar'}
                </button>
                <button className={styles.cancelBtn} onClick={() => setEditing(false)}>Cancelar</button>
              </div>
            </div>
          )}
        </div>

        {/* Stats */}
        <div className={styles.statsGrid}>
          <div className={styles.statBox}>
            <span className={styles.statNum}>{stats?.total_ratings || 0}</span>
            <span className={styles.statLabel}>Calificaciones</span>
          </div>
          <div className={styles.statBox}>
            <span className={styles.statNum}>
              {stats?.avg_score ? Number(stats.avg_score).toFixed(1) : '—'}
            </span>
            <span className={styles.statLabel}>Promedio</span>
          </div>
          <div className={styles.statBox}>
            <span className={styles.statNum}>{stats?.total_favorites || 0}</span>
            <span className={styles.statLabel}>Favoritos</span>
          </div>
          <div className={styles.statBox}>
            <span className={styles.statNum}>{stats?.total_watchlist || 0}</span>
            <span className={styles.statLabel}>Mi lista</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className={styles.tabs}>
        {[
          { key: 'ratings',   label: '⭐ Calificaciones' },
          { key: 'favorites', label: '❤️ Favoritos' },
          { key: 'watchlist', label: '🔖 Mi lista' },
        ].map(tab => (
          <button
            key={tab.key}
            className={activeTab === tab.key ? styles.activeTab : styles.tab}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Contenido del tab */}
      {activeTab === 'ratings' && <RatingsTab userId={user?.id} />}
      {activeTab === 'favorites' && <MediaList items={favorites} emptyMsg="No tenés favoritos todavía." />}
      {activeTab === 'watchlist' && <MediaList items={watchlist} emptyMsg="Tu lista está vacía." />}
      {activeTab === 'stats' && <StatsSection userId={user?.id} />}
    </div>
  )
}

function RatingsTab({ userId }) {
  const { data, loading } = useFetch(
    () => import('../services/api').then(m => m.rankingsAPI.getUserRatings()),
    [userId]
  )
  const ratings = data?.data?.ratings || []

  if (loading) return <div className="text-muted" style={{ padding: '32px 0' }}>Cargando...</div>
  if (!ratings.length) return <EmptyState msg="No calificaste nada todavía." />

  return (
    <div className={styles.ratingsList}>
      {ratings.map((r, i) => (
        <Link
          key={i}
          to={`/${r.content_type}/${r.content_id}`}
          className={styles.ratingRow}
        >
          <img
            src={getPosterUrl(r.poster_path, 'sm')}
            alt={r.title}
            className={styles.ratingPoster}
          />
          <div className={styles.ratingInfo}>
            <span className={styles.ratingTitle}>{r.title || `ID: ${r.content_id}`}</span>
            <span className={styles.ratingType}>{r.content_type === 'movie' ? 'Película' : 'Serie'}</span>
          </div>
          <div
            className={styles.ratingScore}
            style={{ color: getRatingColor(r.score), borderColor: getRatingColor(r.score) }}
          >
            ★ {Number(r.score).toFixed(1)}
          </div>
        </Link>
      ))}
    </div>
  )
}

function MediaList({ items, emptyMsg }) {
  if (!items.length) return <EmptyState msg={emptyMsg} />
  return (
    <div className={styles.mediaGrid}>
      {items.map((item, i) => (
        <Link
          key={i}
          to={`/${item.content_type}/${item.content_id}`}
          className={styles.mediaCard}
        >
          <img
            src={getPosterUrl(item.poster_path, 'md')}
            alt={item.title}
            className={styles.mediaPoster}
            loading="lazy"
          />
          <p className={styles.mediaTitle}>{item.title}</p>
        </Link>
      ))}
    </div>
  )
}

function EmptyState({ msg }) {
  return (
    <div className={styles.empty}>
      <p>{msg}</p>
      <Link to="/movies" className={styles.emptyLink}>Explorar películas →</Link>
    </div>
  )
}
