import { Router } from 'express'
import * as tmdb from '../services/tmdb.js'
import { getLangFromHeader } from '../services/tmdb.js'

const router = Router()
const wrap = fn => (req, res, next) => fn(req, res, next).catch(next)

// Helper para obtener idioma del request
const lang = (req) => getLangFromHeader(req.headers['accept-language'])

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

export default router