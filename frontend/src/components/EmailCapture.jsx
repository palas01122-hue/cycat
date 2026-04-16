import { useState } from 'react'
import styles from './EmailCapture.module.css'

export default function EmailCapture() {
  if (localStorage.getItem('cycat_newsletter_subscribed') === 'true') return null

  const [email, setEmail] = useState('')
  const [status, setStatus] = useState('idle')

  async function handleSubmit(e) {
    e.preventDefault()
    if (!email.includes('@')) return

    setStatus('loading')
    try {
      const res = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      if (res.status === 409) {
        setStatus('already')
        localStorage.setItem('cycat_newsletter_subscribed', 'true')
        return
      }
      if (!res.ok) throw new Error('error')
      setStatus('success')
      localStorage.setItem('cycat_newsletter_subscribed', 'true')
    } catch {
      setStatus('error')
    }
  }

  return (
    <div className={styles.banner}>
      <div className={styles.inner}>
        <div className={styles.copy}>
          <p className={styles.headline}>🎬 Las mejores películas de la semana, directo a tu bandeja</p>
          <p className={styles.sub}>Cada viernes, nuestras picks del equipo CyCat. Sin spam.</p>
        </div>

        {status === 'success' || status === 'already' ? (
          <p className={styles.successMsg}>
            {status === 'success' ? '✅ ¡Listo! Te avisamos cada viernes.' : 'Ya estás suscrito 😊'}
          </p>
        ) : (
          <form className={styles.form} onSubmit={handleSubmit}>
            <input
              className={styles.input}
              type="email"
              placeholder="tu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <button className={styles.btn} type="submit" disabled={status === 'loading'}>
              {status === 'loading' ? 'Enviando…' : 'Suscribirme gratis'}
            </button>
            {status === 'error' && <p className={styles.errorMsg}>Algo falló, intentá de nuevo</p>}
          </form>
        )}
      </div>
    </div>
  )
}
