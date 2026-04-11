import { useState } from 'react'
import { Navigate, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Star, Heart, Bookmark, Film, Clock, Pencil, Check, X, User } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { useFetch } from '../hooks/useFetch'
import { profileAPI, favoritesAPI } from '../services/api'
import { getPosterUrl, formatRating, getRatingColor } from '../utils/tmdb'
import StatsSection from '../components/detail/StatsSection'
import { Card, CardContent } from '../components/ui/shadcn/card'
import styles from './ProfilePage.module.css'

const sectionVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } }
}

const TABS = [
  { key: 'ratings',   label: 'Calificaciones', icon: <Star size={14} /> },
  { key: 'favorites', label: 'Favoritos',       icon: <Heart size={14} /> },
  { key: 'watchlist', label: 'Mi lista',        icon: <Bookmark size={14} /> },
]

export default function ProfilePage() {
  const { user, isAuthenticated, loading: authLoading } = useAuth()
  const [activeTab, setActiveTab] = useState('ratings')
  const [editing,   setEditing]   = useState(false)
  const [bio,       setBio]       = useState('')
  const [saving,    setSaving]    = useState(false)

  const { data: profileData } = useFetch(() => profileAPI.get(), [user?.id])
  const { data: favData }     = useFetch(() => favoritesAPI.getAll(), [user?.id])
  const { data: watchData }   = useFetch(() => favoritesAPI.getWatchlist(), [user?.id])

  if (authLoading) return null
  if (!isAuthenticated) return <Navigate to="/login" replace />

  const profile   = profileData?.data?.user
  const stats     = profileData?.data?.stats
  const favorites = favData?.data?.favorites  || []
  const watchlist = watchData?.data?.watchlist || []

  const handleSaveBio = async () => {
    setSaving(true)
    try { await profileAPI.update({ bio }); setEditing(false) } catch {}
    setSaving(false)
  }

  const STAT_BOXES = [
    { num: stats?.total_ratings  || 0,                         label: 'Calificaciones', icon: <Star size={16} />     },
    { num: stats?.avg_score ? Number(stats.avg_score).toFixed(1) : '—', label: 'Promedio',       icon: <Film size={16} />     },
    { num: stats?.total_favorites || 0,                        label: 'Favoritos',      icon: <Heart size={16} />    },
    { num: stats?.total_watchlist || 0,                        label: 'Mi lista',       icon: <Bookmark size={16} /> },
  ]

  return (
    <motion.div
      className={`container ${styles.page}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      {/* Header */}
      <motion.div className={styles.profileHeader} variants={sectionVariants} initial="hidden" animate="visible">
        <div className={styles.avatarWrap}>
          {profile?.avatar ? (
            <motion.img
              src={profile.avatar} alt={profile?.username}
              className={styles.avatarImg} referrerPolicy="no-referrer"
              initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.1 }}
            />
          ) : (
            <motion.div className={styles.avatarFallback}
              initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.1 }}>
              <User size={36} />
            </motion.div>
          )}
        </div>

        <div className={styles.profileInfo}>
          <h1 className={styles.username}>{profile?.username}</h1>
          <p className={styles.email}>{profile?.email}</p>
          {!editing ? (
            <div className={styles.bioRow}>
              <p className={styles.bio}>{profile?.bio || 'Sin descripción todavía.'}</p>
              <motion.button
                className={styles.editBtn}
                onClick={() => { setEditing(true); setBio(profile?.bio || '') }}
                whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Pencil size={12} /> Editar
              </motion.button>
            </div>
          ) : (
            <motion.div className={styles.bioEdit}
              initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
              <textarea
                value={bio} onChange={e => setBio(e.target.value)}
                placeholder="Contá algo sobre vos..."
                className={styles.bioInput} rows={3} maxLength={200}
              />
              <div className={styles.bioActions}>
                <motion.button className={styles.saveBtn} onClick={handleSaveBio} disabled={saving}
                  whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                  <Check size={14} /> {saving ? 'Guardando...' : 'Guardar'}
                </motion.button>
                <motion.button className={styles.cancelBtn} onClick={() => setEditing(false)}
                  whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                  <X size={14} /> Cancelar
                </motion.button>
              </div>
            </motion.div>
          )}
        </div>

        {/* Stats */}
        <div className={styles.statsGrid}>
          {STAT_BOXES.map(({ num, label, icon }, i) => (
            <motion.div
              key={label} className={styles.statBox}
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.15 + i * 0.07 }}
              whileHover={{ scale: 1.04, borderColor: 'var(--color-accent)' }}
            >
              <span className={styles.statIcon}>{icon}</span>
              <span className={styles.statNum}>{num}</span>
              <span className={styles.statLabel}>{label}</span>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Tabs */}
      <motion.div className={styles.tabs}
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
        {TABS.map(tab => (
          <motion.button
            key={tab.key}
            className={activeTab === tab.key ? styles.activeTab : styles.tab}
            onClick={() => setActiveTab(tab.key)}
            whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
          >
            {tab.icon}{tab.label}
          </motion.button>
        ))}
      </motion.div>

      {/* Tab content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.25 }}
        >
          {activeTab === 'ratings'   && <RatingsTab userId={user?.id} />}
          {activeTab === 'favorites' && <MediaList items={favorites} emptyMsg="No tenés favoritos todavía." />}
          {activeTab === 'watchlist' && <MediaList items={watchlist} emptyMsg="Tu lista está vacía." />}
          {activeTab === 'stats'     && <StatsSection userId={user?.id} />}
        </motion.div>
      </AnimatePresence>
    </motion.div>
  )
}

function RatingsTab({ userId }) {
  const { data, loading } = useFetch(
    () => import('../services/api').then(m => m.rankingsAPI.getUserRatings()),
    [userId]
  )
  const ratings = data?.data?.ratings || []

  if (loading) return <div className="text-muted" style={{ padding: '32px 0', display: 'flex', alignItems: 'center', gap: 8 }}><Clock size={15} /> Cargando...</div>
  if (!ratings.length) return <EmptyState msg="No calificaste nada todavía." />

  return (
    <motion.div className={styles.ratingsList}
      initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      {ratings.map((r, i) => (
        <motion.div key={i}
          initial={{ opacity: 0, x: -16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.04 }}
          whileHover={{ x: 4 }}>
          <Link to={`/${r.content_type}/${r.content_id}`} className={styles.ratingRow}>
            <img src={getPosterUrl(r.poster_path, 'sm')} alt={r.title} className={styles.ratingPoster} />
            <div className={styles.ratingInfo}>
              <span className={styles.ratingTitle}>{r.title || `ID: ${r.content_id}`}</span>
              <span className={styles.ratingType}>{r.content_type === 'movie' ? 'Película' : 'Serie'}</span>
            </div>
            <div className={styles.ratingScore}
              style={{ color: getRatingColor(r.score), borderColor: getRatingColor(r.score) }}>
              <Star size={11} fill="currentColor" /> {Number(r.score).toFixed(1)}
            </div>
          </Link>
        </motion.div>
      ))}
    </motion.div>
  )
}

function MediaList({ items, emptyMsg }) {
  if (!items.length) return <EmptyState msg={emptyMsg} />
  return (
    <motion.div className={styles.mediaGrid}
      initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      {items.map((item, i) => (
        <motion.div key={i}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.04 }}
          whileHover={{ y: -5, transition: { duration: 0.2 } }}>
          <Link to={`/${item.content_type}/${item.content_id}`} className={styles.mediaCard}>
            <img src={getPosterUrl(item.poster_path, 'md')} alt={item.title} className={styles.mediaPoster} loading="lazy" />
            <p className={styles.mediaTitle}>{item.title}</p>
          </Link>
        </motion.div>
      ))}
    </motion.div>
  )
}

function EmptyState({ msg }) {
  return (
    <motion.div className={styles.empty} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <p>{msg}</p>
      <Link to="/movies" className={styles.emptyLink}>Explorar películas →</Link>
    </motion.div>
  )
}
