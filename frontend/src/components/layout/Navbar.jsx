import { useState, useEffect, useRef } from 'react'
import { NavLink, Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import CyCatLogo from '../ui/CyCatLogo'
import styles from './Navbar.module.css'
import { searchAPI } from '../../services/api'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, X, Menu, LogOut, Shuffle, Tv, Star, BookOpen, Film, Layers, CalendarDays, Timer, BarChart2 } from 'lucide-react'

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

  useEffect(() => {
    const handler = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setShowDrop(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  useEffect(() => {
    if (debounce.current) clearTimeout(debounce.current)
    if (!search.trim() || search.length < 2) { setSuggestions([]); setShowDrop(false); return }
    debounce.current = setTimeout(async () => {
      setLoading(true)
      try {
        const res = await searchAPI.search(search, 1)
        const results = (res.data.results || []).slice(0, 8)
        setSuggestions(results)
        setShowDrop(true)
      } catch { setSuggestions([]) } finally { setLoading(false) }
    }, 300)
  }, [search])

  const handleSearch = (e) => {
    e?.preventDefault()
    if (search.trim()) {
      navigate(`/search?q=${encodeURIComponent(search.trim())}`)
      setSearch('')
      setShowDrop(false)
    }
  }

  const handleSelect = (item) => {
    setSearch(''); setShowDrop(false)
    if (item.media_type === 'person') navigate(`/person/${item.id}`)
    else if (item.media_type === 'movie') navigate(`/movie/${item.id}`)
    else if (item.media_type === 'tv') navigate(`/tv/${item.id}`)
  }

  const getItemImage = (item) => {
    if (item.media_type === 'person') return item.profile_path ? `${PROFILE_BASE}${item.profile_path}` : null
    return item.poster_path ? `${POSTER_BASE}${item.poster_path}` : null
  }
  const getItemTitle = (item) => item.title || item.name || ''
  const getItemYear = (item) => { const d = item.release_date || item.first_air_date; return d ? d.slice(0, 4) : '' }
  const getItemType = (item) => {
    if (item.media_type === 'person') return 'Persona'
    if (item.media_type === 'movie') return 'Película'
    if (item.media_type === 'tv') return 'Serie'
    return ''
  }

  const navLinks = [
    { to: '/movies',    label: 'Películas', icon: <Film size={14} /> },
    { to: '/series',    label: 'Series',    icon: <Tv size={14} /> },
    { to: '/rankings',  label: 'Rankings',  icon: <Star size={14} /> },
    { to: '/calendar',  label: 'Estrenos',  icon: <CalendarDays size={14} /> },
    { to: '/marathon',  label: 'Maratón',   icon: <Timer size={14} /> },
    { to: '/what-to-watch', label: '¿Qué veo?', icon: <Shuffle size={14} /> },
    { to: '/streaming', label: 'Streaming', icon: <Tv size={14} /> },
  ]
  if (isAuthenticated) {
    navLinks.push({ to: '/diary', label: 'Diario', icon: <BookOpen size={14} /> })
    navLinks.push({ to: '/stats', label: 'Stats',  icon: <BarChart2 size={14} /> })
  }

  return (
    <motion.header
      className={`${styles.header} ${scrolled ? styles.scrolled : ''}`}
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
    >
      <div className={`container ${styles.inner}`}>
        <Link to="/" className={styles.logo}>
          <CyCatLogo size="md" showText={true} />
        </Link>

        <nav className={styles.nav}>
          {navLinks.map(({ to, label, icon }) => (
            <NavLink key={to} to={to} className={({ isActive }) => isActive ? styles.activeLink : styles.link}>
              <motion.span className={styles.linkInner} whileHover={{ y: -1 }} transition={{ duration: 0.15 }}>
                {icon}{label}
              </motion.span>
            </NavLink>
          ))}
        </nav>

        <div className={styles.searchWrap} ref={wrapRef}>
          <form onSubmit={handleSearch} className={styles.searchForm}>
            <Search size={14} className={styles.searchIcon} />
            <input
              type="search" value={search} onChange={e => setSearch(e.target.value)}
              onFocus={() => suggestions.length > 0 && setShowDrop(true)}
              placeholder="Buscar..." className={styles.searchInput} aria-label="Buscar" autoComplete="off"
            />
            {search && (
              <button type="button" className={styles.searchClear} onClick={() => { setSearch(''); setShowDrop(false) }} aria-label="Limpiar">
                <X size={13} />
              </button>
            )}
          </form>
          <AnimatePresence>
            {showDrop && (
              <motion.div className={styles.dropdown}
                initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.15 }}>
                {loading && <div className={styles.dropLoading}>Buscando...</div>}
                {!loading && suggestions.length === 0 && <div className={styles.dropEmpty}>Sin resultados</div>}
                {suggestions.map(item => (
                  <button key={`${item.media_type}-${item.id}`} className={styles.dropItem} onClick={() => handleSelect(item)}>
                    <div className={styles.dropImg}>
                      {getItemImage(item) ? <img src={getItemImage(item)} alt={getItemTitle(item)} /> : <span className={styles.dropImgPlaceholder}>?</span>}
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
                  <button className={styles.dropSeeAll} onClick={handleSearch}>Ver todos los resultados para "{search}" →</button>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className={styles.authZone}>
          {isAuthenticated ? (
            <div className={styles.userMenu}>
              <Link to="/profile" className={styles.userBtn}>
                {user?.avatar
                  ? <img src={user.avatar} alt={user.username} className={styles.userAvatar} referrerPolicy="no-referrer" />
                  : <span className={styles.userInitial}>{user?.username?.[0]?.toUpperCase()}</span>}
                <span className={styles.userName}>{user?.username}</span>
              </Link>
              <motion.button onClick={logout} className={styles.logoutBtn} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} title="Cerrar sesión">
                <LogOut size={15} />
              </motion.button>
            </div>
          ) : (
            <>
              <Link to="/login" className={styles.loginBtn}>Entrar</Link>
              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                <Link to="/register" className={styles.registerBtn}>Registrarse</Link>
              </motion.div>
            </>
          )}
        </div>

        <motion.button className={styles.mobileToggle} onClick={() => setMenuOpen(o => !o)} aria-label="Menú" whileTap={{ scale: 0.9 }}>
          <AnimatePresence mode="wait">
            {menuOpen
              ? <motion.span key="x" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ opacity: 0 }}><X size={22} /></motion.span>
              : <motion.span key="m" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ opacity: 0 }}><Menu size={22} /></motion.span>}
          </AnimatePresence>
        </motion.button>
      </div>

      <AnimatePresence>
        {menuOpen && (
          <motion.div className={styles.mobileMenu}
            initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.25 }}>
            <nav className={styles.mobileNav}>
              {navLinks.map(({ to, label, icon }, i) => (
                <motion.div key={to} initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}>
                  <NavLink to={to} className={({ isActive }) => isActive ? styles.mobileActiveLinkItem : styles.mobileLinkItem} onClick={() => setMenuOpen(false)}>
                    {icon}{label}
                  </NavLink>
                </motion.div>
              ))}
            </nav>
            <div className={styles.mobileAuthZone}>
              {isAuthenticated ? (
                <div className={styles.mobileUserMenu}>
                  <Link to="/profile" className={styles.mobileUserBtn} onClick={() => setMenuOpen(false)}>
                    {user?.avatar
                      ? <img src={user.avatar} alt={user.username} className={styles.userAvatar} referrerPolicy="no-referrer" />
                      : <span className={styles.userInitial}>{user?.username?.[0]?.toUpperCase()}</span>}
                    <span className={styles.userName}>{user?.username}</span>
                  </Link>
                  <button onClick={() => { logout(); setMenuOpen(false) }} className={styles.logoutBtn}>
                    <LogOut size={15} /> Salir
                  </button>
                </div>
              ) : (
                <div className={styles.mobileAuthBtns}>
                  <Link to="/login" className={styles.loginBtn} onClick={() => setMenuOpen(false)}>Entrar</Link>
                  <Link to="/register" className={styles.registerBtn} onClick={() => setMenuOpen(false)}>Registrarse</Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  )
}
