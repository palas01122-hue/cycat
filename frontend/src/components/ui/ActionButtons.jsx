import { useState, useEffect } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { favoritesAPI } from '../../services/api'
import styles from './ActionButtons.module.css'
import { motion } from 'framer-motion'
import { Heart, Bookmark } from 'lucide-react'

const btnVariants = {
  rest: { scale: 1 },
  hover: { scale: 1.05 },
  tap: { scale: 0.95 },
}

export function FavoriteButton({ contentId, type, title, posterPath }) {
  const { isAuthenticated } = useAuth()
  const [isFav, setIsFav] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!isAuthenticated) return
    favoritesAPI.check(type, contentId).then(res => setIsFav(res.data.isFavorite)).catch(() => {})
  }, [contentId, type, isAuthenticated])

  const toggle = async () => {
    if (!isAuthenticated) return window.location.href = '/login'
    setLoading(true)
    try {
      if (isFav) { await favoritesAPI.remove(type, contentId); setIsFav(false) }
      else { await favoritesAPI.add(contentId, type, title, posterPath); setIsFav(true) }
    } catch {} finally { setLoading(false) }
  }

  return (
    <motion.button
      onClick={toggle} disabled={loading}
      className={`${styles.btn} ${isFav ? styles.favActive : ''}`}
      title={isFav ? 'Quitar de favoritos' : 'Agregar a favoritos'}
      variants={btnVariants} initial="rest" whileHover="hover" whileTap="tap"
    >
      <motion.span animate={{ scale: isFav ? [1, 1.35, 1] : 1 }} transition={{ duration: 0.3 }}>
        <Heart size={16} fill={isFav ? 'currentColor' : 'none'} />
      </motion.span>
      <span>{isFav ? 'En favoritos' : 'Favorito'}</span>
    </motion.button>
  )
}

export function WatchlistButton({ contentId, type, title, posterPath }) {
  const { isAuthenticated } = useAuth()
  const [inList, setInList] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!isAuthenticated) return
    favoritesAPI.checkWatchlist(type, contentId).then(res => setInList(res.data.isInWatchlist)).catch(() => {})
  }, [contentId, type, isAuthenticated])

  const toggle = async () => {
    if (!isAuthenticated) return window.location.href = '/login'
    setLoading(true)
    try {
      if (inList) { await favoritesAPI.removeWatchlist(type, contentId); setInList(false) }
      else { await favoritesAPI.addWatchlist(contentId, type, title, posterPath); setInList(true) }
    } catch {} finally { setLoading(false) }
  }

  return (
    <motion.button
      onClick={toggle} disabled={loading}
      className={`${styles.btn} ${inList ? styles.watchActive : ''}`}
      title={inList ? 'Quitar de mi lista' : 'Agregar a mi lista'}
      variants={btnVariants} initial="rest" whileHover="hover" whileTap="tap"
    >
      <motion.span animate={{ scale: inList ? [1, 1.35, 1] : 1 }} transition={{ duration: 0.3 }}>
        <Bookmark size={16} fill={inList ? 'currentColor' : 'none'} />
      </motion.span>
      <span>{inList ? 'En mi lista' : 'Mi lista'}</span>
    </motion.button>
  )
}
