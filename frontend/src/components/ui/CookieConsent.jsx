import { useState, useEffect } from 'react'
import styles from './CookieConsent.module.css'

export default function CookieConsent() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const consent = localStorage.getItem('cookie_consent')
    if (!consent) setVisible(true)
  }, [])

  function accept() {
    localStorage.setItem('cookie_consent', 'accepted')
    setVisible(false)
  }

  function reject() {
    localStorage.setItem('cookie_consent', 'rejected')
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div className={styles.banner} role="dialog" aria-label="Consentimiento de cookies">
      <div className={styles.content}>
        <p className={styles.text}>
          Usamos cookies de <strong>Google AdSense</strong> y <strong>Google Analytics</strong> para
          mostrar publicidad relevante y analizar el tráfico del sitio.
          Podés aceptar o rechazar las cookies no esenciales.{' '}
          <a href="/privacy" className={styles.link}>Política de Privacidad</a>
        </p>
        <div className={styles.actions}>
          <button onClick={reject} className={styles.rejectBtn}>Rechazar</button>
          <button onClick={accept} className={styles.acceptBtn}>Aceptar</button>
        </div>
      </div>
    </div>
  )
}
