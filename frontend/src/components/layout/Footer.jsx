import { Link } from 'react-router-dom'
import CyCatLogo from '../ui/CyCatLogo'
import styles from './Footer.module.css'
import { ExternalLink, Share2, Link2, Heart } from 'lucide-react'

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={`container ${styles.inner}`}>
        <div className={styles.brand}>
          <CyCatLogo size="md" showText={true} />
          <p className={styles.tagline}>Tu catálogo de cine y series</p>
          <p className={styles.tmdb}>
            <img src="https://www.themoviedb.org/assets/2/v4/logos/v2/blue_short-8e7b30f73a4020692ccca9c88bafe5dcb6f8a62a4c6bc55cd9ba82bb2cd95f6c.svg" alt="TMDB" className={styles.tmdbLogo} />
            Datos provistos por TMDB
          </p>
        </div>

        <nav className={styles.links}>
          <div className={styles.col}>
            <h4>Explorar</h4>
            <Link to="/movies">Películas</Link>
            <Link to="/series">Series</Link>
            <Link to="/rankings">Rankings</Link>
            <Link to="/streaming">Plataformas</Link>
            <Link to="/what-to-watch">¿Qué veo hoy?</Link>
          </div>
          <div className={styles.col}>
            <h4>Mi cuenta</h4>
            <Link to="/login">Iniciar sesión</Link>
            <Link to="/register">Registrarse</Link>
            <Link to="/profile">Perfil</Link>
            <Link to="/diary">Mi diario</Link>
            <Link to="/lists">Mis listas</Link>
          </div>
          <div className={styles.col}>
            <h4>Legal</h4>
            <Link to="/terms">Términos de uso</Link>
            <Link to="/privacy">Privacidad</Link>
          </div>
        </nav>
      </div>

      <div className={styles.bottom}>
        <p>© {new Date().getFullYear()} CyCat — Hecho con 🍿 y amor al cine</p>
        <p>Este producto usa la API de TMDB pero no está respaldado por TMDB. Imágenes © sus respectivos propietarios.</p>
      </div>
    </footer>
  )
}
