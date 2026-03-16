import { Router } from 'express'
import * as tmdb from '../services/tmdb.js'

const router = Router()

const wrap = fn => (req, res, next) => fn(req, res, next).catch(next)

router.get('/trending/:mediaType/:timeWindow', wrap(async (req, res) => {
  const { mediaType, timeWindow } = req.params
  const data = await tmdb.getTrending(mediaType, timeWindow)
  res.json(data)
}))

router.get('/movies/popular', wrap(async (req, res) => {
  const page = parseInt(req.query.page) || 1
  const data = await tmdb.getPopularMovies(page)
  res.json(data)
}))

router.get('/series/popular', wrap(async (req, res) => {
  const page = parseInt(req.query.page) || 1
  const data = await tmdb.getPopularSeries(page)
  res.json(data)
}))

router.get('/movie/top-rated', wrap(async (req, res) => {
  const page = parseInt(req.query.page) || 1
  const data = await tmdb.getTopRated('movie', page)
  res.json(data)
}))

router.get('/tv/top-rated', wrap(async (req, res) => {
  const page = parseInt(req.query.page) || 1
  const data = await tmdb.getTopRated('tv', page)
  res.json(data)
}))

router.get('/:type/genre/:genreId', wrap(async (req, res) => {
  const { type, genreId } = req.params
  const page = parseInt(req.query.page) || 1
  const data = await tmdb.getByGenre(type, genreId, page)
  res.json(data)
}))

router.get('/genres/:type', wrap(async (req, res) => {
  const data = await tmdb.getGenres(req.params.type)
  res.json(data)
}))

export default router
