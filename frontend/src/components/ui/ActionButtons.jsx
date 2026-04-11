import { useState, useEffect } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { favoritesAPI } from '../../services/api'
import { motion } from 'framer-motion'
import { Heart, Bookmark } from 'lucide-react'
import { Button } from './shadcn/button'
import styles from './ActionButtons.module.css'

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
    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
      <Button
        onClick={toggle}
        disabled={loading}
        variant={isFav ? 'danger' : 'outline'}
        title={isFav ? 'Quitar de favoritos' : 'Agregar a favoritos'}
      >
        <motion.span animate={{ scale: isFav ? [1, 1.35, 1] : 1 }} transition={{ duration: 0.3 }}>
          <Heart size={16} fill={isFav ? 'currentColor' : 'none'} />
        </motion.span>
        {isFav ? 'En favoritos' : 'Favorito'}
      </Button>
    </motion.div>
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
    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
      <Button
        onClick={toggle}
        disabled={loading}
        variant={inList ? 'gold' : 'outline'}
        title={inList ? 'Quitar de mi lista' : 'Agregar a mi lista'}
      >
        <motion.span animate={{ scale: inList ? [1, 1.35, 1] : 1 }} transition={{ duration: 0.3 }}>
          <Bookmark size={16} fill={inList ? 'currentColor' : 'none'} />
        </motion.span>
        {inList ? 'En mi lista' : 'Mi lista'}
      </Button>
    </motion.div>
  )
}
