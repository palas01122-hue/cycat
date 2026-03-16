import { Router } from 'express'
import { getDb } from '../utils/database.js'
import { authenticate, optionalAuth } from '../middleware/auth.js'
import * as tmdb from '../services/tmdb.js'

const router = Router()
const wrap = fn => (req, res, next) => fn(req, res, next).catch(next)

// Calificar contenido
router.post('/rate', authenticate, wrap(async (req, res) => {
  const { type, contentId, score, title, poster_path } = req.body
  if (!contentId || !type || score === undefined)
    return res.status(400).json({ error: 'contentId, type y score son requeridos' })
  if (!['movie', 'tv'].includes(type))
    return res.status(400).json({ error: 'type debe ser movie o tv' })
  if (score < 1 || score > 10)
    return res.status(400).json({ error: 'score debe estar entre 1 y 10' })

  const db = getDb()
  db.prepare(`
    INSERT INTO ratings (user_id, content_id, content_type, score, title, poster_path)
    VALUES (?, ?, ?, ?, ?, ?)
    ON CONFLICT(user_id, content_id, content_type)
    DO UPDATE SET score = excluded.score, title = excluded.title, poster_path = excluded.poster_path
  `).run(req.user.id, String(contentId), type, score, title || '', poster_path || '')

  res.json({ message: 'Calificación guardada', score })
}))

// Obtener rating de un contenido
router.get('/rating/:type/:id', optionalAuth, wrap(async (req, res) => {
  const { type, id } = req.params
  const db = getDb()

  const stats = db.prepare(`
    SELECT AVG(score) as average, COUNT(*) as total
    FROM ratings WHERE content_id = ? AND content_type = ?
  `).get(id, type)

  let userRating = null
  if (req.user) {
    const row = db.prepare(`
      SELECT score FROM ratings
      WHERE user_id = ? AND content_id = ? AND content_type = ?
    `).get(req.user.id, id, type)
    userRating = row?.score || null
  }

  res.json({
    contentId: id, type,
    average:   stats.average ? Math.round(stats.average * 10) / 10 : null,
    total:     stats.total,
    userRating,
  })
}))

// Rankings reales — combina ratings de usuarios con TMDB
router.get('/top/:type', wrap(async (req, res) => {
  const { type } = req.params
  const page = parseInt(req.query.page) || 1
  const db = getDb()

  // Contenido con más ratings en CyCat
  const topRated = db.prepare(`
    SELECT
      content_id,
      content_type,
      title,
      poster_path,
      AVG(score)  as cycat_avg,
      COUNT(*)    as cycat_votes
    FROM ratings
    WHERE content_type = ?
    GROUP BY content_id
    HAVING COUNT(*) >= 1
    ORDER BY cycat_avg DESC, cycat_votes DESC
    LIMIT 20
  `).all(type)

  // Si hay suficientes ratings propios, usarlos
  if (topRated.length >= 5) {
    return res.json({
      source: 'cycat',
      results: topRated.map(r => ({
        id:          r.content_id,
        title:       r.title,
        name:        r.title,
        poster_path: r.poster_path,
        vote_average: r.cycat_avg,
        vote_count:  r.cycat_votes,
        cycat_rating: true,
      }))
    })
  }

  // Fallback a TMDB top rated
  const data = await tmdb.getTopRated(type, page)
  res.json({ source: 'tmdb', ...data })
}))

// Calificaciones del usuario
router.get('/user/ratings', authenticate, wrap(async (req, res) => {
  const db = getDb()
  const ratings = db.prepare(`
    SELECT content_id, content_type, score, title, poster_path, created_at
    FROM ratings
    WHERE user_id = ?
    ORDER BY created_at DESC
    LIMIT 100
  `).all(req.user.id)
  res.json({ ratings })
}))

export default router
