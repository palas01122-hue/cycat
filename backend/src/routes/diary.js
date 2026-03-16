import { Router } from 'express'
import { getDb } from '../utils/database.js'
import { authenticate } from '../middleware/auth.js'

const router = Router()
const wrap = fn => (req, res, next) => fn(req, res, next).catch(next)

router.get('/', authenticate, wrap(async (req, res) => {
  const db = getDb()
  const { year, month } = req.query
  let query = `SELECT * FROM diary WHERE user_id = ?`
  const params = [req.user.id]
  if (year)  { query += ` AND strftime('%Y', watched_date) = ?`; params.push(year) }
  if (month) { query += ` AND strftime('%m', watched_date) = ?`; params.push(month.padStart(2,'0')) }
  query += ` ORDER BY watched_date DESC LIMIT 200`
  const entries = db.prepare(query).all(...params)
  res.json({ entries })
}))

router.post('/', authenticate, wrap(async (req, res) => {
  const { contentId, type, title, poster_path, score, watched_date } = req.body
  if (!contentId || !type || !watched_date)
    return res.status(400).json({ error: 'contentId, type y watched_date son requeridos' })
  const db = getDb()
  try {
    db.prepare(`
      INSERT INTO diary (user_id, content_id, content_type, title, poster_path, score, watched_date)
      VALUES (?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(user_id, content_id, watched_date)
      DO UPDATE SET score = excluded.score, title = excluded.title
    `).run(req.user.id, String(contentId), type, title||'', poster_path||'', score||null, watched_date)
    res.json({ message: 'Entrada guardada en el diario' })
  } catch(e) {
    res.status(500).json({ error: e.message })
  }
}))

router.delete('/:id', authenticate, wrap(async (req, res) => {
  const db = getDb()
  db.prepare('DELETE FROM diary WHERE id = ? AND user_id = ?').run(req.params.id, req.user.id)
  res.json({ message: 'Entrada eliminada' })
}))

router.get('/stats', authenticate, wrap(async (req, res) => {
  const db = getDb()
  const byMonth = db.prepare(`
    SELECT strftime('%Y-%m', watched_date) as month, COUNT(*) as count
    FROM diary WHERE user_id = ?
    GROUP BY month ORDER BY month DESC LIMIT 24
  `).all(req.user.id)
  const total = db.prepare('SELECT COUNT(*) as c FROM diary WHERE user_id = ?').get(req.user.id)
  res.json({ byMonth, total: total.c })
}))

export default router
