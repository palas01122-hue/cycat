import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Lock, CreditCard } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import styles from './PaywallModal.module.css'

const BASE_URL = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || 'http://localhost:3001/api'

export default function PaywallModal({ onClose }) {
  const { user, isAuthenticated } = useAuth()
  const [card,       setCard]       = useState('')
  const [expiry,     setExpiry]     = useState('')
  const [cvv,        setCvv]        = useState('')
  const [loading,    setLoading]    = useState(false)
  const [success,    setSuccess]    = useState(false)
  const [error,      setError]      = useState('')

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [onClose])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await fetch(`${BASE_URL}/subscription/mock-subscribe`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user?.id, plan: 'pro' }),
      })
      const data = await res.json()
      if (data.success) {
        setSuccess(true)
      } else {
        setError('Algo salió mal. Intentá de nuevo.')
      }
    } catch {
      setError('Error de conexión. Intentá de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  const formatCard = (val) => {
    const digits = val.replace(/\D/g, '').slice(0, 16)
    return digits.replace(/(.{4})/g, '$1 ').trim()
  }

  const formatExpiry = (val) => {
    const digits = val.replace(/\D/g, '').slice(0, 4)
    if (digits.length >= 3) return `${digits.slice(0, 2)}/${digits.slice(2)}`
    return digits
  }

  return createPortal(
    <AnimatePresence>
      <motion.div
        className={styles.backdrop}
        onClick={onClose}
        role="dialog"
        aria-modal="true"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
      >
        <motion.div
          className={styles.modal}
          onClick={(e) => e.stopPropagation()}
          initial={{ opacity: 0, scale: 0.92, y: 24 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 24 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
        >
          <div className={styles.header}>
            <span className={styles.headerTitle}>
              <span className={styles.goldStar}>★</span> CyCat Pro
            </span>
            <motion.button
              className={styles.closeBtn}
              onClick={onClose}
              aria-label="Cerrar"
              whileHover={{ scale: 1.1, rotate: 90 }}
              whileTap={{ scale: 0.9 }}
              transition={{ duration: 0.15 }}
            >
              <X size={16} />
            </motion.button>
          </div>

          <div className={styles.body}>
            {!isAuthenticated && (
              <div className={styles.unauthWrap}>
                <div className={styles.lockIcon}>
                  <Lock size={40} />
                </div>
                <h3 className={styles.unauthTitle}>Necesitás una cuenta</h3>
                <p className={styles.unauthSub}>
                  Para suscribirte a CyCat Pro primero necesitás registrarte o iniciar sesión.
                </p>
                <Link to="/register" className={styles.registerLink} onClick={onClose}>
                  Crear cuenta gratis
                </Link>
              </div>
            )}

            {isAuthenticated && !success && (
              <form onSubmit={handleSubmit}>
                <div className={styles.planSummary}>
                  <div>
                    <div className={styles.planName}>CyCat Pro</div>
                    <div className={styles.planTrial}>7 días gratis, luego mensual</div>
                  </div>
                  <div className={styles.planPrice}>$4.99</div>
                </div>

                <div className={styles.fieldset}>
                  <div>
                    <label className={styles.fieldLabel}>Número de tarjeta</label>
                    <input
                      className={styles.input}
                      placeholder="•••• •••• •••• ••••"
                      value={card}
                      onChange={(e) => setCard(formatCard(e.target.value))}
                      maxLength={19}
                      autoComplete="cc-number"
                      required
                    />
                  </div>
                  <div className={styles.fieldRow}>
                    <div>
                      <label className={styles.fieldLabel}>Vencimiento</label>
                      <input
                        className={styles.input}
                        placeholder="MM/AA"
                        value={expiry}
                        onChange={(e) => setExpiry(formatExpiry(e.target.value))}
                        maxLength={5}
                        autoComplete="cc-exp"
                        required
                      />
                    </div>
                    <div>
                      <label className={styles.fieldLabel}>CVV</label>
                      <input
                        className={styles.input}
                        placeholder="•••"
                        value={cvv}
                        onChange={(e) => setCvv(e.target.value.replace(/\D/g, '').slice(0, 4))}
                        maxLength={4}
                        autoComplete="cc-csc"
                        required
                      />
                    </div>
                  </div>
                </div>

                {error && <p className={styles.errorMsg}>{error}</p>}

                <motion.button
                  type="submit"
                  className={styles.submitBtn}
                  disabled={loading}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <CreditCard size={16} />
                  {loading ? 'Procesando...' : 'Suscribirme — $4.99/mes'}
                </motion.button>

                <p className={styles.securityNote}>
                  🔒 Pago seguro · Cancelá cuando quieras · Demo mode
                </p>
              </form>
            )}

            {isAuthenticated && success && (
              <div className={styles.successWrap}>
                <span className={styles.successIcon}>🎬</span>
                <h3 className={styles.successTitle}>¡Bienvenido a CyCat Pro!</h3>
                <p className={styles.successMsg}>
                  Modo demo — sin cargo real. Tu suscripción quedó activada en el sistema.
                </p>
                <button className={styles.successClose} onClick={onClose}>
                  Cerrar
                </button>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>,
    document.body
  )
}
