import { useState } from 'react'
import { motion } from 'framer-motion'
import { Helmet } from 'react-helmet-async'
import PaywallModal from '../components/ui/PaywallModal'
import styles from './ProPage.module.css'

const FREE_FEATURES = [
  { label: 'Catálogo completo',              included: true  },
  { label: 'Valorar películas',              included: true  },
  { label: 'Hasta 3 listas personalizadas', included: true  },
  { label: 'Diario de visionados',          included: true  },
  { label: 'Estadísticas avanzadas',        included: false },
  { label: 'Exportar a CSV',                included: false },
  { label: 'Sin publicidad',                included: false },
  { label: 'Listas ilimitadas',             included: false },
  { label: 'Badge de miembro Pro',          included: false },
]

const PRO_FEATURES = [
  { label: 'Todo lo del plan gratis',                  included: true },
  { label: 'Estadísticas avanzadas',                   included: true },
  { label: 'Exportar diario a CSV',                    included: true },
  { label: 'Sin publicidad (cuando se implementen)',   included: true },
  { label: 'Listas ilimitadas',                        included: true },
  { label: 'Badge de miembro Pro en el perfil',        included: true },
]

const cardVariants = {
  hidden:  { opacity: 0, y: 28 },
  visible: (i) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.45, ease: 'easeOut', delay: i * 0.12 },
  }),
}

function FeatureItem({ label, included }) {
  return (
    <li className={`${styles.featureItem} ${!included ? styles.excluded : ''}`}>
      <span className={styles.featureIcon}>{included ? '✅' : '❌'}</span>
      {label}
    </li>
  )
}

export default function ProPage() {
  const [modalOpen, setModalOpen] = useState(false)

  return (
    <>
      <Helmet>
        <title>CyCat Pro — Para los que se toman el cine en serio</title>
      </Helmet>

      <div className={`container ${styles.page}`}>
        {/* Hero */}
        <motion.div
          className={styles.hero}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className={styles.badge}>
            ★ Plan de membresía
          </div>
          <h1 className={styles.title}>
            CyCat <span className={styles.titleAccent}>Pro</span>
          </h1>
          <p className={styles.subtitle}>
            Para los que se toman el cine en serio
          </p>
        </motion.div>

        {/* Plans */}
        <div className={styles.plansGrid}>
          {/* Free plan */}
          <motion.div
            className={styles.planCard}
            custom={0}
            variants={cardVariants}
            initial="hidden"
            animate="visible"
          >
            <div className={styles.planHeader}>
              <div className={styles.planTopRow}>
                <span className={styles.planName}>Gratis</span>
              </div>
              <div className={`${styles.planPrice} ${styles.planPriceFree}`}>
                $0
              </div>
              <div className={styles.planInterval}>Siempre gratis</div>
            </div>

            <ul className={styles.featureList}>
              {FREE_FEATURES.map((f) => (
                <FeatureItem key={f.label} {...f} />
              ))}
            </ul>

            <div className={styles.ctaBtnFree}>Plan actual</div>
          </motion.div>

          {/* Pro plan */}
          <motion.div
            className={`${styles.planCard} ${styles.planCardPro}`}
            custom={1}
            variants={cardVariants}
            initial="hidden"
            animate="visible"
          >
            <div className={styles.proGlow} />

            <div className={styles.planHeader}>
              <div className={styles.planTopRow}>
                <span className={styles.planName}>Pro</span>
                <span className={styles.proBadge}>Recomendado</span>
              </div>
              <div className={styles.planPrice}>$4.99</div>
              <div className={styles.planInterval}>/mes · 7 días gratis</div>
            </div>

            <ul className={styles.featureList}>
              {PRO_FEATURES.map((f) => (
                <FeatureItem key={f.label} {...f} />
              ))}
            </ul>

            <motion.button
              className={styles.ctaBtn}
              onClick={() => setModalOpen(true)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
            >
              Empezar prueba gratis de 7 días
            </motion.button>
          </motion.div>
        </div>

        {/* Trial note */}
        <motion.p
          className={styles.trialNote}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <strong>7 días gratis</strong>, luego $4.99/mes. Cancelá cuando quieras.
        </motion.p>

        {/* FAQ strip */}
        <motion.div
          className={styles.faqRow}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          {[
            { icon: '🔒', label: 'Pago seguro', sub: 'Demo mode habilitado' },
            { icon: '↩️', label: 'Cancelá cuando quieras', sub: 'Sin permanencia' },
            { icon: '🎬', label: 'Acceso inmediato', sub: 'Al suscribirte' },
            { icon: '🌟', label: 'Badge exclusivo', sub: 'En tu perfil público' },
          ].map(({ icon, label, sub }) => (
            <div key={label} className={styles.faqItem}>
              <span className={styles.faqIcon}>{icon}</span>
              <span className={styles.faqLabel}>{label}</span>
              <span className={styles.faqSub}>{sub}</span>
            </div>
          ))}
        </motion.div>
      </div>

      {modalOpen && <PaywallModal onClose={() => setModalOpen(false)} />}
    </>
  )
}
