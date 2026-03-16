import { useState, useEffect } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { favoritesAPI } from '../../services/api'
import styles from './ActionButtons.module.css'

export function FavoriteButton({ contentId, type, title, posterPath }) {
  const { isAuthenticated } = useAuth()
  const [isFav, setIsFav]     = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!isAuthenticated) return
    favoritesAPI.check(type, contentId)
      .then(res => setIsFav(res.data.isFavorite))
      .catch(() => {})
  }, [contentId, type, isAuthenticated])

  const toggle = async () => {
    if (!isAuthenticated) return window.location.href = '/login'
    setLoading(true)
    try {
      if (isFav) {
        await favoritesAPI.remove(type, contentId)
        setIsFav(false)
      } else {
        await favoritesAPI.add(contentId, type, title, posterPath)
        setIsFav(true)
      }
    } catch {}
    setLoading(false)
  }

  return (
    <button
      onClick={toggle}
      disabled={loading}
      className={`${styles.btn} ${isFav ? styles.favActive : ''}`}
      title={isFav ? 'Quitar de favoritos' : 'Agregar a favoritos'}
    >
      <HeartIcon filled={isFav} />
      <span>{isFav ? 'En favoritos' : 'Favorito'}</span>
    </button>
  )
}

export function WatchlistButton({ contentId, type, title, posterPath }) {
  const { isAuthenticated } = useAuth()
  const [inList, setInList]   = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!isAuthenticated) return
    favoritesAPI.checkWatchlist(type, contentId)
      .then(res => setInList(res.data.isInWatchlist))
      .catch(() => {})
  }, [contentId, type, isAuthenticated])

  const toggle = async () => {
    if (!isAuthenticated) return window.location.href = '/login'
    setLoading(true)
    try {
      if (inList) {
        await favoritesAPI.removeWatchlist(type, contentId)
        setInList(false)
      } else {
        await favoritesAPI.addWatchlist(contentId, type, title, posterPath)
        setInList(true)
      }
    } catch {}
    setLoading(false)
  }

  return (
    <button
      onClick={toggle}
      disabled={loading}
      className={`${styles.btn} ${inList ? styles.watchActive : ''}`}
      title={inList ? 'Quitar de mi lista' : 'Agregar a mi lista'}
    >
      <BookmarkIcon filled={inList} />
      <span>{inList ? 'En mi lista' : 'Mi lista'}</span>
    </button>
  )
}

function HeartIcon({ filled }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  )
}

function BookmarkIcon({ filled }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
      <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
    </svg>
  )
}
