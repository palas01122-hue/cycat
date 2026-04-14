import { Router } from 'express'
import { tmdbWithLang, getLangFromHeader } from '../services/tmdb.js'

const router = Router()
const wrap = fn => (req, res, next) => fn(req, res, next).catch(next)

router.get('/', wrap(async (req, res) => {
  const { type = 'movie', provider, page = 1 } = req.query
  const lang = getLangFromHeader(req.headers['accept-language'])
  const client = tmdbWithLang(lang)

  const today = new Date()
  const from = today.toISOString().split('T')[0]
  const future = new Date(today); future.setDate(today.getDate() + 60)
  const to = future.toISOString().split('T')[0]

  const isMovie = type === 'movie'
  const params = {
    [isMovie ? 'primary_release_date.gte' : 'first_air_date.gte']: from,
    [isMovie ? 'primary_release_date.lte' : 'first_air_date.lte']: to,
    sort_by: isMovie ? 'primary_release_date.asc' : 'first_air_date.asc',
    'vote_count.gte': 0,
    page,
  }

  if (provider) { params.with_watch_providers = provider; params.watch_region = 'AR' }

  const result = await client.get(`/discover/${type}`, { params })
  const results = (result.data.results || []).map(item => ({
    ...item,
    release_date: item.release_date || item.first_air_date || '',
    media_type: type,
  }))

  res.json({ ...result.data, results })
}))

export default router
