import { Router } from 'express'
import * as tmdb from '../services/tmdb.js'

const router = Router()
const wrap = fn => (req, res, next) => fn(req, res, next).catch(next)

router.get('/', wrap(async (req, res) => {
  const { q, page = 1 } = req.query
  if (!q?.trim()) return res.json({ results: [], total_pages: 0 })
  const data = await tmdb.searchMulti(q, parseInt(page))
  res.json(data)
}))

// Búsqueda avanzada con filtros
router.get('/advanced', wrap(async (req, res) => {
  const { q, type = 'movie', year, genre, minRating, maxRuntime, language, country, provider, page = 1 } = req.query

  if (q?.trim()) {
    const data = await tmdb.searchByType(q, type, parseInt(page))
    let results = data.results || []
    if (year)      results = results.filter(r => (r.release_date||r.first_air_date||'').startsWith(year))
    if (minRating) results = results.filter(r => r.vote_average >= parseFloat(minRating))
    return res.json({ ...data, results })
  }

  // Discover sin query
  const params = { page, sort_by: 'popularity.desc' }
  if (year)       { type === 'movie' ? params.primary_release_year = year : params.first_air_date_year = year }
  if (genre)      params.with_genres = genre
  if (minRating)  params['vote_average.gte'] = minRating
  if (maxRuntime && type === 'movie') params['with_runtime.lte'] = maxRuntime
  if (language)   params.with_original_language = language
  if (country)    params.with_origin_country = country
  if (provider)   { params.with_watch_providers = provider; params.watch_region = 'AR' }

  const res2 = await tmdb.default.get(`/discover/${type}`, { params })
  res.json(res2.data)
}))

router.get('/:type', wrap(async (req, res) => {
  const { q, page = 1 } = req.query
  if (!q?.trim()) return res.json({ results: [] })
  const data = await tmdb.searchByType(q, req.params.type, parseInt(page))
  res.json(data)
}))

export default router
