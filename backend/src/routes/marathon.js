import { Router } from 'express'
import { tmdbWithLang, getLangFromHeader } from '../services/tmdb.js'

const router = Router()
const wrap = fn => (req, res, next) => fn(req, res, next).catch(next)

// Buscar colecciones por nombre
router.get('/search', wrap(async (req, res) => {
  const { q } = req.query
  if (!q?.trim()) return res.json({ results: [] })
  const lang = getLangFromHeader(req.headers['accept-language'])
  const client = tmdbWithLang(lang)
  const result = await client.get('/search/collection', { params: { query: q } })
  res.json(result.data)
}))

// Detalle de colección con runtime de cada película
router.get('/collection/:id', wrap(async (req, res) => {
  const lang = getLangFromHeader(req.headers['accept-language'])
  const client = tmdbWithLang(lang)

  const collectionRes = await client.get(`/collection/${req.params.id}`)
  const collection = collectionRes.data

  // Obtener runtime de cada película en paralelo
  const parts = await Promise.all(
    (collection.parts || []).map(async (movie) => {
      try {
        const detail = await client.get(`/movie/${movie.id}`)
        return {
          ...movie,
          runtime: detail.data.runtime || 0,
          vote_average: detail.data.vote_average || movie.vote_average,
          genres: detail.data.genres || [],
        }
      } catch {
        return { ...movie, runtime: 0 }
      }
    })
  )

  // Ordenar por fecha de estreno
  parts.sort((a, b) => (a.release_date || '').localeCompare(b.release_date || ''))

  const totalRuntime = parts.reduce((sum, p) => sum + (p.runtime || 0), 0)

  res.json({ ...collection, parts, totalRuntime })
}))

export default router
