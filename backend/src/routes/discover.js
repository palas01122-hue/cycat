import { Router } from 'express'
import * as tmdb from '../services/tmdb.js'
import { getDb } from '../utils/database.js'
import { optionalAuth } from '../middleware/auth.js'

const router = Router()
const wrap = fn => (req, res, next) => fn(req, res, next).catch(next)

// ¿Qué veo hoy? — ruleta con filtros
router.get('/random', wrap(async (req, res) => {
  const { type = 'movie', genre, minRating = 6, maxRuntime, mood } = req.query

  const moodGenres = {
    accion:    [28, 12],
    comedia:   [35],
    romance:   [10749],
    terror:    [27, 53],
    drama:     [18],
    animacion: [16],
    documental:[99],
    ciencia:   [878],
    familiar:  [10751],
  }

  const genreIds = mood ? moodGenres[mood] : genre ? [genre] : null
  const page = Math.floor(Math.random() * 5) + 1

  const params = {
    sort_by: 'popularity.desc',
    'vote_average.gte': minRating,
    'vote_count.gte': 100,
    page,
  }
  if (genreIds) params.with_genres = genreIds.join(',')
  if (maxRuntime && type === 'movie') params['with_runtime.lte'] = maxRuntime

  const res2 = await tmdb.default.get(`/discover/${type}`, { params })
  const results = res2.data.results.filter(r => r.poster_path)

  if (!results.length) return res.json({ item: null })

  const item = results[Math.floor(Math.random() * results.length)]
  res.json({ item, type })
}))

// Recomendaciones personalizadas
router.get('/recommendations', optionalAuth, wrap(async (req, res) => {
  const type = req.query.type || 'movie'

  // Si hay usuario con calificaciones, usarlas para recomendar
  if (req.user) {
    const db = getDb()
    const topRated = db.prepare(`
      SELECT content_id FROM ratings
      WHERE user_id = ? AND content_type = ? AND score >= 7
      ORDER BY score DESC LIMIT 5
    `).all(req.user.id, type)

    if (topRated.length > 0) {
      // Tomar contenido similar al mejor calificado
      const pick = topRated[Math.floor(Math.random() * topRated.length)]
      const similar = await tmdb.getSimilar(type, pick.content_id)
      const ratedIds = new Set(topRated.map(r => r.content_id))
      const filtered = (similar.results || []).filter(r => !ratedIds.has(String(r.id)) && r.poster_path)
      if (filtered.length >= 4) {
        return res.json({ results: filtered.slice(0, 10), source: 'personalized' })
      }
    }
  }

  // Fallback: trending
  const data = await tmdb.getTrending(type, 'week')
  res.json({ results: data.results?.slice(0, 10) || [], source: 'trending' })
}))

// Dónde verlo (watch providers)
router.get('/providers/:type/:id', wrap(async (req, res) => {
  const { type, id } = req.params
  try {
    const res2 = await tmdb.default.get(`/${type}/${id}/watch/providers`)
    const providers = res2.data.results
    // Priorizar AR, luego US
    const region = providers['AR'] || providers['US'] || providers['ES'] || Object.values(providers)[0] || null
    res.json({ providers: region, all: providers })
  } catch {
    res.json({ providers: null })
  }
}))

export default router
