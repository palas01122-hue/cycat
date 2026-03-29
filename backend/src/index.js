import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'
import session from 'express-session'
import passport from './services/passport.js'
import { initDatabase } from './utils/database.js'

import catalogRoutes   from './routes/catalog.js'
import detailRoutes    from './routes/detail.js'
import searchRoutes    from './routes/search.js'
import authRoutes      from './routes/auth.js'
import rankingsRoutes  from './routes/rankings.js'
import favoritesRoutes from './routes/favorites.js'
import profileRoutes   from './routes/profile.js'
import reviewsRoutes   from './routes/reviews.js'
import statsRoutes     from './routes/stats.js'
import diaryRoutes     from './routes/diary.js'
import listsRoutes     from './routes/lists.js'
import discoverRoutes  from './routes/discover.js'
import streamingRoutes from './routes/streaming.js'

const app  = express()
const PORT = process.env.PORT || 3001

// Railway usa proxy — necesario para rate limiting y cookies
app.set('trust proxy', 1)

app.use(helmet())

const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  process.env.FRONTEND_URL,
  process.env.FRONTEND_URL_WWW,
  'https://cycat.lat',
  'https://www.cycat.lat',
  'https://cycat-frontend.vercel.app',
  'https://cycat-frontend-rm8cl2rjf-palas01122-hues-projects.vercel.app',
].filter(Boolean)

app.use(cors({
  origin: (origin, callback) => {
    // Permitir cualquier subdominio de vercel.app del proyecto cycat-frontend
    if (
      !origin ||
      allowedOrigins.includes(origin) ||
      /^https:\/\/cycat-frontend.*\.vercel\.app$/.test(origin)
    ) {
      callback(null, true)
    } else {
      callback(new Error('CORS no permitido: ' + origin))
    }
  },
  credentials: true
}))

app.use(express.json())
app.use(session({
  secret: process.env.JWT_SECRET || 'cycat_session_secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000
  }
}))
app.use(passport.initialize())
app.use(passport.session())

const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 400 })
app.use('/api/', limiter)

app.use('/api/catalog',   catalogRoutes)
app.use('/api/detail',    detailRoutes)
app.use('/api/search',    searchRoutes)
app.use('/api/auth',      authRoutes)
app.use('/api/rankings',  rankingsRoutes)
app.use('/api/favorites', favoritesRoutes)
app.use('/api/profile',   profileRoutes)
app.use('/api/reviews',   reviewsRoutes)
app.use('/api/stats',     statsRoutes)
app.use('/api/diary',     diaryRoutes)
app.use('/api/lists',     listsRoutes)
app.use('/api/discover',  discoverRoutes)
app.use('/api/streaming', streamingRoutes)

app.get('/api/health', (req, res) => res.json({ status: 'ok', service: 'CyCat API v3' }))
app.use((req, res) => res.status(404).json({ error: 'Ruta no encontrada' }))
app.use((err, req, res, next) => {
  console.error('[ERROR]', err.message)
  res.status(err.status || 500).json({ error: err.message || 'Error interno' })
})

async function start() {
  await initDatabase()
  app.listen(PORT, () => console.log(`🎬 CyCat API en http://localhost:${PORT}`))
}
start()
export default app