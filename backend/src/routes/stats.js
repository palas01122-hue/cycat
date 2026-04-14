import { Router } from 'express'
import { getDb } from '../utils/database.js'
import { authenticate } from '../middleware/auth.js'
import * as tmdb from '../services/tmdb.js'

const router = Router()
const wrap = fn => (req, res, next) => fn(req, res, next).catch(next)

// Stats completas del usuario
router.get('/me', authenticate, wrap(async (req, res) => {
  const db = getDb()
  const uid = req.user.id

  const totals = db.prepare(`
    SELECT
      COUNT(*)                                              as total_rated,
      COUNT(CASE WHEN content_type='movie' THEN 1 END)     as movies_rated,
      COUNT(CASE WHEN content_type='tv' THEN 1 END)        as series_rated,
      ROUND(AVG(score), 1)                                 as avg_score,
      MAX(score)                                           as highest_score,
      MIN(score)                                           as lowest_score
    FROM ratings WHERE user_id = ?
  `).get(uid)

  // Distribución de scores (1-10)
  const distribution = db.prepare(`
    SELECT CAST(ROUND(score) AS INTEGER) as score_bucket, COUNT(*) as count
    FROM ratings WHERE user_id = ?
    GROUP BY score_bucket ORDER BY score_bucket
  `).all(uid)

  // Actividad por año
  const byYear = db.prepare(`
    SELECT strftime('%Y', created_at) as year, COUNT(*) as count
    FROM ratings WHERE user_id = ?
    GROUP BY year ORDER BY year DESC
    LIMIT 5
  `).all(uid)

  // Últimas calificaciones
  const recent = db.prepare(`
    SELECT content_id, content_type, title, poster_path, score, created_at
    FROM ratings WHERE user_id = ?
    ORDER BY created_at DESC LIMIT 8
  `).all(uid)

  // Stats de reviews
  const reviewStats = db.prepare(`
    SELECT COUNT(*) as total_reviews, SUM(likes) as total_likes
    FROM reviews WHERE user_id = ?
  `).get(uid)

  // Actividad por mes (últimos 12 meses)
  const byMonth = db.prepare(`
    SELECT strftime('%Y-%m', watched_date) as month, COUNT(*) as count
    FROM diary WHERE user_id = ?
    AND watched_date >= date('now', '-12 months')
    GROUP BY month ORDER BY month ASC
  `).all(uid)

  // Total de horas estimadas (película ~105min, episodio ~45min)
  const movieCount = db.prepare(`SELECT COUNT(*) as c FROM diary WHERE user_id = ? AND content_type = 'movie'`).get(uid).c
  const tvCount    = db.prepare(`SELECT COUNT(*) as c FROM diary WHERE user_id = ? AND content_type = 'tv'`).get(uid).c
  const totalMinutes = (movieCount * 105) + (tvCount * 45)

  // Racha actual (días consecutivos con actividad en diary)
  const diaryDates = db.prepare(`
    SELECT DISTINCT date(watched_date) as d
    FROM diary WHERE user_id = ?
    ORDER BY d DESC LIMIT 365
  `).all(uid).map(r => r.d)

  let streak = 0
  const todayStr = new Date().toISOString().split('T')[0]
  let cursor = todayStr
  for (const d of diaryDates) {
    if (d === cursor) { streak++; const prev = new Date(cursor); prev.setDate(prev.getDate() - 1); cursor = prev.toISOString().split('T')[0] }
    else break
  }

  res.json({
    totals,
    distribution,
    byYear,
    byMonth,
    recent,
    reviewStats,
    totalMinutes,
    streak,
    favorites:  db.prepare('SELECT COUNT(*) as c FROM favorites WHERE user_id = ?').get(uid).c,
    watchlist:  db.prepare('SELECT COUNT(*) as c FROM watchlist WHERE user_id = ?').get(uid).c,
  })
}))

// Rankings por año
router.get('/rankings/year/:year', wrap(async (req, res) => {
  const { year } = req.params
  const type = req.query.type || 'movie'
  const page = parseInt(req.query.page) || 1

  const data = await tmdb.getTopRated(type, page)

  // Filtrar por año
  const filtered = data.results.filter(item => {
    const date = item.release_date || item.first_air_date || ''
    return date.startsWith(year)
  })

  // Si hay pocos resultados del año en top_rated, usar discover
  if (filtered.length < 5) {
    const discover = await tmdb.getByGenre(type, null, page, year)
    return res.json({ ...discover, year, type })
  }

  res.json({ results: filtered, year, type, total_results: filtered.length })
}))

// Rankings por género
router.get('/rankings/genre/:genreId', wrap(async (req, res) => {
  const { genreId } = req.params
  const type = req.query.type || 'movie'
  const page = parseInt(req.query.page) || 1
  const data = await tmdb.getByGenre(type, genreId, page)
  res.json({ ...data, genreId, type })
}))

export default router
