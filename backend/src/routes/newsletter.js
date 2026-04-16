// REGISTRAR EN backend/src/index.js:
// import newsletterRoutes from './routes/newsletter.js'
// app.use('/api/newsletter', newsletterRoutes)

import { Router } from 'express'
import { getDb } from '../utils/database.js'

const router = Router()

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

router.post('/subscribe', (req, res) => {
  const { email } = req.body
  if (!email || !EMAIL_RE.test(email)) {
    return res.status(400).json({ error: 'invalid_email' })
  }

  const db = getDb()
  try {
    db.prepare(
      'INSERT INTO newsletter_subscribers (email) VALUES (?)'
    ).run(email.trim().toLowerCase())
    return res.json({ success: true })
  } catch (err) {
    if (err.message?.includes('UNIQUE')) {
      return res.status(409).json({ error: 'already_subscribed' })
    }
    console.error('newsletter subscribe error:', err)
    return res.status(500).json({ error: 'server_error' })
  }
})

router.get('/count', (req, res) => {
  const db = getDb()
  const row = db.prepare(
    'SELECT COUNT(*) as count FROM newsletter_subscribers WHERE active = 1'
  ).get()
  return res.json({ count: row.count })
})

export default router
