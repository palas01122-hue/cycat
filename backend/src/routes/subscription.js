// REGISTRAR EN backend/src/index.js:
// import subscriptionRoutes from './routes/subscription.js'
// app.use('/api/subscription', subscriptionRoutes)

import { Router } from 'express'

const router = Router()

const PLANS = [
  {
    id: 'free',
    name: 'Gratis',
    price: 0,
    currency: 'USD',
    features: [
      { label: 'Catálogo completo',          included: true  },
      { label: 'Valorar películas',           included: true  },
      { label: 'Hasta 3 listas personalizadas', included: true },
      { label: 'Diario de visionados',        included: true  },
      { label: 'Estadísticas avanzadas',      included: false },
      { label: 'Exportar a CSV',              included: false },
      { label: 'Sin publicidad',              included: false },
      { label: 'Listas ilimitadas',           included: false },
      { label: 'Badge de miembro Pro',        included: false },
    ],
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 4.99,
    currency: 'USD',
    interval: 'month',
    features: [
      { label: 'Todo lo del plan gratis',          included: true },
      { label: 'Estadísticas avanzadas',           included: true },
      { label: 'Exportar diario a CSV',            included: true },
      { label: 'Sin publicidad (cuando se implementen)', included: true },
      { label: 'Listas ilimitadas',                included: true },
      { label: 'Badge de miembro Pro en el perfil', included: true },
    ],
  },
]

router.get('/plans', (_req, res) => {
  res.json({ success: true, plans: PLANS })
})

router.post('/mock-subscribe', (req, res) => {
  const { userId, plan = 'pro' } = req.body

  const expiresAt = new Date()
  expiresAt.setDate(expiresAt.getDate() + 30)

  res.json({
    success: true,
    message: 'Suscripción demo activada',
    plan,
    userId: userId || null,
    expiresAt: expiresAt.toISOString(),
  })
})

export default router
