import { useState, useEffect, useRef } from 'react'
import { NavLink, Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import CyCatLogo from '../ui/CyCatLogo'
import styles from './Navbar.module.css'
import { searchAPI } from '../../services/api'

const POSTER_BASE = 'https://image.tmdb.org/t/p/w92'
const PROFILE_BASE = 'https://image.tmdb.org/t/p/w45'

export default function Navbar() {
  const { isAuthenticated, user, logout } = useAuth()
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [suggestions, setSuggestions] = useState([])
  const [showDrop, setShowDrop] = useState(false)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const debounce = useRef(null)
  const wrapRef = useRef(null)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Cerrar dropdown al hacer click fuera
  useEffect(() => {
    const handler = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) {
        setShowDrop(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  // Autocompletado con debounce
  useEffect(() => {
    if (debounce.current) clearTimeout(debounce.current)
    if (!search.trim() || search.length < 2) {
      setSuggestions([])
      setShowDrop(false)
      return
    }
    debounce.current = setTimeout(async () => {
      setLoading(true)
      try {
        const res = await searchAPI.search(search, 1)
        const results = (res.data.results || []).slice(0, 8)
        setSuggestions(results)
        setShowDrop(true)
      } catch {
        setSuggestions([])
      } finally {
        setLoading(false)
      }
    }, 300)
  }, [search])

  const handleSearch = (e) => {
    e.preventDefault()
    if (search.trim()) {
      navigate(`/search?q=${encodeURIComponent(search.trim())}`)
      setSearch('')
      setShowDrop(false)
    }
  }

  const handleSelect = (item) => {
    setSearch('')
    setShowDrop(false)
    if (item.media_type === 'person') {
      navigate(`/person/${item.id}`)
    } else if (item.media_type === 'movie') {
      navigate(`/movie/${item.id}`)
    } else if (item.media_type === 'tv') {
      navigate(`/tv/${item.id}`)
    }
  }

  const getItemImage = (item) => {
    if (item.media_type === 'person') {
      return item.profile_path ? `${PROFILE_BASE}${item.profile_path}` : null
    }
    return item.poster_path ? `${POSTER_BASE}${item.poster_path}` : null
  }

  const getItemTitle = (item) => item.title || item.name || ''
  const getItemYear = (item) => {
    const date = item.release_date || item.first_air_date
    return date ? date.slice(0, 4) : ''
  }
  const getItemType = (item) => {
    if (item.media_type === 'person') return '👤 Persona'
    if (item.media_type === 'movie') return '🎬 Película'
    if (item.media_type === 'tv') return '📺 Serie'
    return ''
  }

  return (
    <header className={`${styles.header} ${scrolled ? styles.scrolled : ''}`}>
      <div className={`container ${styles.inner}`}>
        <Link to="/" className={styles.logo}>
          <CyCatLogo size="md" showText={true} />
        </Link>

        <nav className={`${styles.nav} ${menuOpen ? styles.navOpen : ''}`}>
          <NavLink to="/movies" className={({ isActive }) => isActive ? styles.activeLink : styles.link}>Películas</NavLink>
          <NavLink to="/series" className={({ isActive }) => isActive ? styles.activeLink : styles.link}>Series</NavLink>
          <NavLink to="/rankings" className={({ isActive }) => isActive ? styles.activeLink : styles.link}>Rankings</NavLink>
          <NavLink to="/what-to-watch" className={({ isActive }) => isActive ? styles.activeLink : styles.link}>🎲 ¿Qué veo?</NavLink>
          <NavLink to="/lists" className={({ isActive }) => isActive ? styles.activeLink : styles.link}>Listas</NavLink>
          <NavLink to="/streaming" className={({ isActive }) => isActive ? styles.activeLink : styles.link}>📡 Streaming</NavLink>
          {isAuthenticated && (
            <NavLink to="/diary" className={({ isActive }) => isActive ? styles.activeLink : styles.link}>📅 Diario</NavLink>
          )}
        </nav>

        <div className={styles.searchWrap} ref={wrapRef}>
          <form onSubmit={handleSearch} className={styles.searchForm}>
            <input
              type="search"
              value={search}
              onChange={e => setSearch(e.target.value)}
              onFocus={() => suggestions.length > 0 && setShowDrop(true)}
              placeholder="Buscar..."
              className={styles.searchInput}
              aria-label="Buscar"
              autoComplete="off"
            />
            <button type="submit" className={styles.searchBtn} aria-label="Buscar">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
              </svg>
            </button>
          </form>

          {showDrop && (
            <div className={styles.dropdown}>
              {loading && <div className={styles.dropLoading}>Buscando...</div>}
              {!loading && suggestions.length === 0 && (
                <div className={styles.dropEmpty}>Sin resultados</div>
              )}
              {suggestions.map(item => (
                <button key={`${item.media_type}-${item.id}`} className={styles.dropItem} onClick={() => handleSelect(item)}>
                  <div className={styles.dropImg}>
                    {getItemImage(item)
                      ? <img src={getItemImage(item)} alt={getItemTitle(item)} />
                      : <span className={styles.dropImgPlaceholder}>?</span>
                    }
                  </div>
                  <div className={styles.dropInfo}>
                    <span className={styles.dropTitle}>{getItemTitle(item)}</span>
                    <span className={styles.dropMeta}>
                      <span className={styles.dropType}>{getItemType(item)}</span>
                      {getItemYear(item) && <span>{getItemYear(item)}</span>}
                    </span>
                  </div>
                </button>
              ))}
              {suggestions.length > 0 && (
                <button className={styles.dropSeeAll} onClick={handleSearch}>
                  Ver todos los resultados para "{search}" →
                </button>
              )}
            </div>
          )}
        </div>

        <div className={styles.authZone}>
          {isAuthenticated ? (
            <div className={styles.userMenu}>
              <Link to="/profile" className={styles.userBtn}>
                {user?.avatar ? (
                  <img src={user.avatar} alt={user.username} className={styles.userAvatar} referrerPolicy="no-referrer" />
                ) : (
                  <span className={styles.userInitial}>{user?.username?.[0]?.toUpperCase()}</span>
                )}
                <span className={styles.userName}>{user?.username}</span>
              </Link>
              <button onClick={logout} className={styles.logoutBtn}>Salir</button>
            </div>
          ) : (
            <>
              <Link to="/login" className={styles.loginBtn}>Entrar</Link>
              <Link to="/register" className={styles.registerBtn}>Registrarse</Link>
            </>
          )}
        </div>

        <button className={styles.mobileToggle} onClick={() => setMenuOpen(o => !o)} aria-label="Menú">
          <span /><span /><span />
        </button>
      </div>
    </header>
  )
}
