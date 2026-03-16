import { Router } from 'express'
import { getByProvider } from '../services/tmdb.js'

const router = Router()
const wrap = fn => (req, res, next) => fn(req, res, next).catch(next)

// IDs de proveedores en TMDB
const PROVIDERS = {
  netflix:    { id: 8,    name: 'Netflix' },
  disney:     { id: 337,  name: 'Disney+' },
  prime:      { id: 9,    name: 'Prime Video' },
  apple:      { id: 350,  name: 'Apple TV+' },
  hbo:        { id: 384,  name: 'Max' },
  paramount:  { id: 531,  name: 'Paramount+' },
}

// Lo mejor de una plataforma
router.get('/:provider/best', wrap(async (req, res) => {
  const provider = PROVIDERS[req.params.provider]
  if (!provider) return res.status(404).json({ error: 'Plataforma no encontrada' })
  const type = req.query.type || 'movie'
  const data = await getByProvider(type, provider.id, 'vote_average.desc')
  res.json({ ...data, provider: provider.name })
}))

// Novedades de una plataforma
router.get('/:provider/new', wrap(async (req, res) => {
  const provider = PROVIDERS[req.params.provider]
  if (!provider) return res.status(404).json({ error: 'Plataforma no encontrada' })
  const type = req.query.type || 'movie'
  const data = await getByProvider(type, provider.id, 'primary_release_date.desc')
  res.json({ ...data, provider: provider.name })
}))

export default router
