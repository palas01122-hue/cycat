import { Router } from 'express'
import { getDb } from '../utils/database.js'
import { authenticate } from '../middleware/auth.js'

const router = Router()
const wrap = fn => (req, res, next) => fn(req, res, next).catch(next)

// Perfil completo con stats
router.get('/', authenticate, wrap(async (req, res) => {
  const db = getDb()
  const user = db.prepare('SELECT id, username, email, avatar, bio, created_at FROM users WHERE id = ?').get(req.user.id)
  if (!user) return res.status(404).json({ error: 'Usuario no encontrado' })

  const stats = db.prepare(`
    SELECT
      (SELECT COUNT(*) FROM ratings   WHERE user_id = ?) as total_ratings,
      (SELECT AVG(score) FROM ratings WHERE user_id = ?) as avg_score,
      (SELECT COUNT(*) FROM favorites WHERE user_id = ?) as total_favorites,
      (SELECT COUNT(*) FROM watchlist WHERE user_id = ?) as total_watchlist
  `).get(req.user.id, req.user.id, req.user.id, req.user.id)

  res.json({ user, stats })
}))

// Actualizar bio
router.patch('/', authenticate, wrap(async (req, res) => {
  const { bio, username } = req.body
  const db = getDb()

  if (username) {
    const existing = db.prepare('SELECT id FROM users WHERE username = ? AND id != ?').get(username, req.user.id)
    if (existing) return res.status(409).json({ error: 'Ese nombre de usuario ya está en uso' })
    db.prepare('UPDATE users SET username = ? WHERE id = ?').run(username, req.user.id)
  }

  if (bio !== undefined) {
    db.prepare('UPDATE users SET bio = ? WHERE id = ?').run(bio, req.user.id)
  }

  const updated = db.prepare('SELECT id, username, email, avatar, bio, created_at FROM users WHERE id = ?').get(req.user.id)
  res.json({ user: updated })
}))

export default router
