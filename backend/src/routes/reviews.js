import { Router } from 'express'
import { getDb } from '../utils/database.js'
import { authenticate, optionalAuth } from '../middleware/auth.js'

const router = Router()
const wrap = fn => (req, res, next) => fn(req, res, next).catch(next)

// Obtener reviews de un contenido
router.get('/:type/:id', optionalAuth, wrap(async (req, res) => {
  const { type, id } = req.params
  const db = getDb()

  const reviews = db.prepare(`
    SELECT
      r.id, r.body, r.contains_spoiler, r.likes, r.created_at,
      u.id as user_id, u.username, u.avatar,
      rat.score
    FROM reviews r
    JOIN users u ON u.id = r.user_id
    LEFT JOIN ratings rat ON rat.user_id = r.user_id
      AND rat.content_id = r.content_id
      AND rat.content_type = r.content_type
    WHERE r.content_id = ? AND r.content_type = ?
    ORDER BY r.likes DESC, r.created_at DESC
    LIMIT 50
  `).all(id, type)

  // Si hay usuario autenticado, marcar cuáles likeó
  let likedIds = new Set()
  if (req.user) {
    const liked = db.prepare(`
      SELECT review_id FROM review_likes WHERE user_id = ?
    `).all(req.user.id)
    likedIds = new Set(liked.map(l => l.review_id))
  }

  const result = reviews.map(r => ({
    ...r,
    userLiked: likedIds.has(r.id)
  }))

  res.json({ reviews: result })
}))

// Crear o actualizar review
router.post('/:type/:id', authenticate, wrap(async (req, res) => {
  const { type, id } = req.params
  const { body, contains_spoiler, title, poster_path } = req.body

  if (!body?.trim()) return res.status(400).json({ error: 'La review no puede estar vacía' })
  if (body.length > 2000) return res.status(400).json({ error: 'La review es demasiado larga (máx 2000 caracteres)' })

  const db = getDb()
  db.prepare(`
    INSERT INTO reviews (user_id, content_id, content_type, body, contains_spoiler, title, poster_path)
    VALUES (?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(user_id, content_id, content_type)
    DO UPDATE SET body = excluded.body, contains_spoiler = excluded.contains_spoiler
  `).run(req.user.id, id, type, body.trim(), contains_spoiler ? 1 : 0, title || '', poster_path || '')

  res.json({ message: 'Review guardada' })
}))

// Eliminar review propia
router.delete('/:type/:id', authenticate, wrap(async (req, res) => {
  const { type, id } = req.params
  const db = getDb()
  db.prepare(`
    DELETE FROM reviews WHERE user_id = ? AND content_id = ? AND content_type = ?
  `).run(req.user.id, id, type)
  res.json({ message: 'Review eliminada' })
}))

// Like a una review
router.post('/:reviewId/like', authenticate, wrap(async (req, res) => {
  const { reviewId } = req.params
  const db = getDb()

  const existing = db.prepare('SELECT id FROM review_likes WHERE user_id = ? AND review_id = ?')
                     .get(req.user.id, reviewId)

  if (existing) {
    db.prepare('DELETE FROM review_likes WHERE user_id = ? AND review_id = ?')
      .run(req.user.id, reviewId)
    db.prepare('UPDATE reviews SET likes = MAX(0, likes - 1) WHERE id = ?').run(reviewId)
    res.json({ liked: false })
  } else {
    db.prepare('INSERT INTO review_likes (user_id, review_id) VALUES (?, ?)').run(req.user.id, reviewId)
    db.prepare('UPDATE reviews SET likes = likes + 1 WHERE id = ?').run(reviewId)
    res.json({ liked: true })
  }
}))

// Reviews del usuario en su perfil
router.get('/user/mine', authenticate, wrap(async (req, res) => {
  const db = getDb()
  const reviews = db.prepare(`
    SELECT r.*, rat.score
    FROM reviews r
    LEFT JOIN ratings rat ON rat.user_id = r.user_id
      AND rat.content_id = r.content_id AND rat.content_type = r.content_type
    WHERE r.user_id = ?
    ORDER BY r.created_at DESC
    LIMIT 50
  `).all(req.user.id)
  res.json({ reviews })
}))

export default router
