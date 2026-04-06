import { Router } from 'express'
import axios from 'axios'
import * as tmdb from '../services/tmdb.js'
import { getLangFromHeader } from '../services/tmdb.js'

const router = Router()
const wrap = fn => (req, res, next) => fn(req, res, next).catch(next)

const lang = (req) => getLangFromHeader(req.headers['accept-language'])

// OMDb client
const omdb = axios.create({
  baseURL: 'https://www.omdbapi.com',
  params: { apikey: process.env.OMDB_API_KEY },
  timeout: 6000,
})

router.get('/movie/:id', wrap(async (req, res) => {
  const data = await tmdb.getMovieDetail(req.params.id, lang(req))
  res.json({ data })
}))

router.get('/tv/:id', wrap(async (req, res) => {
  const data = await tmdb.getSeriesDetail(req.params.id, lang(req))
  res.json({ data })
}))

router.get('/person/:id', wrap(async (req, res) => {
  const data = await tmdb.getPersonDetail(req.params.id, lang(req))
  res.json({ data })
}))

router.get('/:type/:id/credits', wrap(async (req, res) => {
  const { type, id } = req.params
  const data = await tmdb.getCredits(type, id, lang(req))
  res.json({ data })
}))

router.get('/:type/:id/videos', wrap(async (req, res) => {
  const { type, id } = req.params
  const data = await tmdb.getVideos(type, id, lang(req))
  res.json({ data })
}))

router.get('/:type/:id/similar', wrap(async (req, res) => {
  const { type, id } = req.params
  const data = await tmdb.getSimilar(type, id, lang(req))
  res.json({ data })
}))

// ── Reseñas de TMDB ──────────────────────────
router.get('/:type/:id/reviews', wrap(async (req, res) => {
  const { type, id } = req.params
  const { page = 1 } = req.query
  const tmdbClient = axios.create({
    baseURL: process.env.TMDB_BASE_URL || 'https://api.themoviedb.org/3',
    params: { api_key: process.env.TMDB_API_KEY },
    timeout: 8000,
  })
  const result = await tmdbClient.get(`/${type}/${id}/reviews`, { params: { page } })
  res.json({ data: result.data })
}))

// ── Scores externos (OMDb: RT, Metacritic, IMDb) ──
router.get('/movie/:id/scores', wrap(async (req, res) => {
  // Primero obtenemos el imdb_id desde TMDB
  const tmdbClient = axios.create({
    baseURL: process.env.TMDB_BASE_URL || 'https://api.themoviedb.org/3',
    params: { api_key: process.env.TMDB_API_KEY },
    timeout: 8000,
  })

  try {
    const externalIds = await tmdbClient.get(`/movie/${req.params.id}/external_ids`)
    const imdbId = externalIds.data.imdb_id

    if (!imdbId || !process.env.OMDB_API_KEY) {
      return res.json({ data: null })
    }

    const omdbRes = await omdb.get('/', { params: { i: imdbId, tomatoes: true } })
    const d = omdbRes.data

    if (d.Response === 'False') return res.json({ data: null })

    // Extraer scores de las fuentes
    const ratings = d.Ratings || []
    const rt      = ratings.find(r => r.Source === 'Rotten Tomatoes')
    const meta    = ratings.find(r => r.Source === 'Metacritic')
    const imdb    = d.imdbRating !== 'N/A' ? d.imdbRating : null

    res.json({
      data: {
        imdb:       imdb ? { score: imdb, votes: d.imdbVotes } : null,
        rottenTomatoes: rt   ? { score: rt.Value }   : null,
        metacritic: meta  ? { score: meta.Value }  : null,
        awards:     d.Awards !== 'N/A' ? d.Awards : null,
        boxOffice:  d.BoxOffice !== 'N/A' ? d.BoxOffice : null,
      }
    })
  } catch {
    res.json({ data: null })
  }
}))

export default router