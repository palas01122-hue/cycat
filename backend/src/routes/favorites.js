import { Router } from 'express'
import { getDb } from '../utils/database.js'
import { authenticate } from '../middleware/auth.js'

const router = Router()
const wrap = fn => (req, res, next) => fn(req, res, next).catch(next)

// Obtener favoritos del usuario
router.get('/', authenticate, wrap(async (req, res) => {
  const db = getDb()
  const favorites = db.prepare(`
    SELECT content_id, content_type, title, poster_path, created_at
    FROM favorites WHERE user_id = ? ORDER BY created_at DESC
  `).all(req.user.id)
  res.json({ favorites })
}))

// Agregar a favoritos
router.post('/', authenticate, wrap(async (req, res) => {
  const { contentId, type, title, poster_path } = req.body
  if (!contentId || !type) return res.status(400).json({ error: 'contentId y type requeridos' })

  const db = getDb()
  try {
    db.prepare(`
      INSERT INTO favorites (user_id, content_id, content_type, title, poster_path)
      VALUES (?, ?, ?, ?, ?)
    `).run(req.user.id, String(contentId), type, title || '', poster_path || '')
    res.json({ message: 'Agregado a favoritos' })
  } catch {
    res.status(409).json({ error: 'Ya está en favoritos' })
  }
}))

// Quitar de favoritos
router.delete('/:type/:id', authenticate, wrap(async (req, res) => {
  const { type, id } = req.params
  const db = getDb()
  db.prepare(`
    DELETE FROM favorites WHERE user_id = ? AND content_id = ? AND content_type = ?
  `).run(req.user.id, id, type)
  res.json({ message: 'Quitado de favoritos' })
}))

// Verificar si está en favoritos
router.get('/check/:type/:id', authenticate, wrap(async (req, res) => {
  const { type, id } = req.params
  const db = getDb()
  const row = db.prepare(`
    SELECT id FROM favorites WHERE user_id = ? AND content_id = ? AND content_type = ?
  `).get(req.user.id, id, type)
  res.json({ isFavorite: !!row })
}))

// ── Watchlist ──────────────────────────────────

router.get('/watchlist', authenticate, wrap(async (req, res) => {
  const db = getDb()
  const watchlist = db.prepare(`
    SELECT content_id, content_type, title, poster_path, created_at
    FROM watchlist WHERE user_id = ? ORDER BY created_at DESC
  `).all(req.user.id)
  res.json({ watchlist })
}))

router.post('/watchlist', authenticate, wrap(async (req, res) => {
  const { contentId, type, title, poster_path } = req.body
  if (!contentId || !type) return res.status(400).json({ error: 'contentId y type requeridos' })

  const db = getDb()
  try {
    db.prepare(`
      INSERT INTO watchlist (user_id, content_id, content_type, title, poster_path)
      VALUES (?, ?, ?, ?, ?)
    `).run(req.user.id, String(contentId), type, title || '', poster_path || '')
    res.json({ message: 'Agregado a lista' })
  } catch {
    res.status(409).json({ error: 'Ya está en la lista' })
  }
}))

router.delete('/watchlist/:type/:id', authenticate, wrap(async (req, res) => {
  const { type, id } = req.params
  const db = getDb()
  db.prepare(`
    DELETE FROM watchlist WHERE user_id = ? AND content_id = ? AND content_type = ?
  `).run(req.user.id, id, type)
  res.json({ message: 'Quitado de la lista' })
}))

router.get('/watchlist/check/:type/:id', authenticate, wrap(async (req, res) => {
  const { type, id } = req.params
  const db = getDb()
  const row = db.prepare(`
    SELECT id FROM watchlist WHERE user_id = ? AND content_id = ? AND content_type = ?
  `).get(req.user.id, id, type)
  res.json({ isInWatchlist: !!row })
}))

export default router
