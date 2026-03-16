import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import styles from './AuthPage.module.css'

function GoogleButton({ onClick }) {
  return (
    <button type="button" onClick={onClick} className={styles.googleBtn}>
      <svg width="18" height="18" viewBox="0 0 24 24">
        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
      </svg>
      Continuar con Google
    </button>
  )
}

function Divider() {
  return (
    <div className={styles.divider}>
      <span className={styles.dividerLine} />
      <span className={styles.dividerText}>o</span>
      <span className={styles.dividerLine} />
    </div>
  )
}

export function LoginPage() {
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [error, setError]       = useState(null)
  const [loading, setLoading]   = useState(false)
  const [searchParams]          = useSearchParams()
  const { login, loginWithGoogle } = useAuth()
  const navigate = useNavigate()

  const googleError = searchParams.get('error')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      await login(email, password)
      navigate('/')
    } catch (err) {
      setError(err.response?.data?.error || 'Error al iniciar sesión')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={`container page-enter ${styles.page}`}>
      <div className={styles.card}>
        <div className={styles.header}>
          <div className={styles.logo}><span className={styles.cy}>CY</span>CAT</div>
          <h1 className={styles.title}>Bienvenido de vuelta</h1>
          <p className={styles.sub}>Iniciá sesión en tu cuenta</p>
        </div>

        {googleError && (
          <div className={styles.error}>Error al iniciar sesión con Google. Intentá de nuevo.</div>
        )}

        <GoogleButton onClick={loginWithGoogle} />
        <Divider />

        <form onSubmit={handleSubmit} className={styles.form} data-testid="login-form">
          {error && <div className={styles.error}>{error}</div>}
          <div className={styles.field}>
            <label htmlFor="email">Email</label>
            <input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="tu@email.com" required autoComplete="email" />
          </div>
          <div className={styles.field}>
            <label htmlFor="password">Contraseña</label>
            <input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required autoComplete="current-password" />
          </div>
          <button type="submit" className={styles.submit} disabled={loading} data-testid="login-submit">
            {loading ? 'Ingresando...' : 'Iniciar sesión'}
          </button>
        </form>

        <p className={styles.switch}>
          ¿No tenés cuenta? <Link to="/register">Registrate</Link>
        </p>
      </div>
    </div>
  )
}

export function RegisterPage() {
  const [username, setUsername] = useState('')
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [error, setError]       = useState(null)
  const [loading, setLoading]   = useState(false)
  const { register, loginWithGoogle } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      await register(username, email, password)
      navigate('/')
    } catch (err) {
      setError(err.response?.data?.error || 'Error al registrarse')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={`container page-enter ${styles.page}`}>
      <div className={styles.card}>
        <div className={styles.header}>
          <div className={styles.logo}><span className={styles.cy}>CY</span>CAT</div>
          <h1 className={styles.title}>Creá tu cuenta</h1>
          <p className={styles.sub}>Empezá a explorar cine y series</p>
        </div>

        <GoogleButton onClick={loginWithGoogle} />
        <Divider />

        <form onSubmit={handleSubmit} className={styles.form} data-testid="register-form">
          {error && <div className={styles.error}>{error}</div>}
          <div className={styles.field}>
            <label htmlFor="username">Usuario</label>
            <input id="username" type="text" value={username} onChange={e => setUsername(e.target.value)} placeholder="nombredeusuario" required minLength={3} />
          </div>
          <div className={styles.field}>
            <label htmlFor="email">Email</label>
            <input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="tu@email.com" required />
          </div>
          <div className={styles.field}>
            <label htmlFor="password">Contraseña</label>
            <input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Mínimo 8 caracteres" required minLength={8} />
          </div>
          <button type="submit" className={styles.submit} disabled={loading} data-testid="register-submit">
            {loading ? 'Creando cuenta...' : 'Crear cuenta'}
          </button>
        </form>

        <p className={styles.switch}>
          ¿Ya tenés cuenta? <Link to="/login">Iniciá sesión</Link>
        </p>
      </div>
    </div>
  )
}

export default LoginPage
