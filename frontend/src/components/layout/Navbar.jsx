import { useState, useEffect } from 'react'
import { NavLink, Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import CyCatLogo from '../ui/CyCatLogo'
import styles from './Navbar.module.css'

export default function Navbar() {
  const { isAuthenticated, user, logout } = useAuth()
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [search, setSearch]     = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const handleSearch = (e) => {
    e.preventDefault()
    if (search.trim()) { navigate(`/search?q=${encodeURIComponent(search.trim())}`); setSearch('') }
  }

  return (
    <header className={`${styles.header} ${scrolled ? styles.scrolled : ''}`}>
      <div className={`container ${styles.inner}`}>
        <Link to="/" className={styles.logo}>
          <CyCatLogo size="md" showText={true} />
        </Link>

        <nav className={`${styles.nav} ${menuOpen ? styles.navOpen : ''}`}>
          <NavLink to="/movies"        className={({ isActive }) => isActive ? styles.activeLink : styles.link}>Películas</NavLink>
          <NavLink to="/series"        className={({ isActive }) => isActive ? styles.activeLink : styles.link}>Series</NavLink>
          <NavLink to="/rankings"      className={({ isActive }) => isActive ? styles.activeLink : styles.link}>Rankings</NavLink>
          <NavLink to="/what-to-watch" className={({ isActive }) => isActive ? styles.activeLink : styles.link}>🎲 ¿Qué veo?</NavLink>
          <NavLink to="/lists"         className={({ isActive }) => isActive ? styles.activeLink : styles.link}>Listas</NavLink>
          <NavLink to="/streaming"     className={({ isActive }) => isActive ? styles.activeLink : styles.link}>📡 Streaming</NavLink>
          {isAuthenticated && (
            <NavLink to="/diary" className={({ isActive }) => isActive ? styles.activeLink : styles.link}>📅 Diario</NavLink>
          )}
        </nav>

        <form onSubmit={handleSearch} className={styles.searchForm}>
          <input type="search" value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar..." className={styles.searchInput} aria-label="Buscar" />
          <button type="submit" className={styles.searchBtn} aria-label="Buscar">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
          </button>
        </form>

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
              <Link to="/login"    className={styles.loginBtn}>Entrar</Link>
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
