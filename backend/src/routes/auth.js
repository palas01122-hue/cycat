import { Router } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import passport from '../services/passport.js'
import { getDb } from '../utils/database.js'
import { authenticate } from '../middleware/auth.js'

const router = Router()
const wrap = fn => (req, res, next) => fn(req, res, next).catch(next)

function makeToken(user) {
  return jwt.sign(
    { id: user.id, username: user.username, email: user.email, avatar: user.avatar },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  )
}

// ── Registro con email ────────────────────────
router.post('/register', wrap(async (req, res) => {
  const { username, email, password } = req.body
  if (!username || !email || !password)
    return res.status(400).json({ error: 'Todos los campos son obligatorios' })
  if (password.length < 8)
    return res.status(400).json({ error: 'La contraseña debe tener al menos 8 caracteres' })

  const db = getDb()
  const existing = db.prepare('SELECT id FROM users WHERE email = ? OR username = ?').get(email, username)
  if (existing) return res.status(409).json({ error: 'El email o usuario ya está registrado' })

  const hashed = await bcrypt.hash(password, 12)
  const result = db.prepare('INSERT INTO users (username, email, password) VALUES (?, ?, ?)').run(username, email, hashed)
  const user = { id: result.lastInsertRowid, username, email, avatar: null }
  res.status(201).json({ user, token: makeToken(user) })
}))

// ── Login con email ───────────────────────────
router.post('/login', wrap(async (req, res) => {
  const { email, password } = req.body
  if (!email || !password)
    return res.status(400).json({ error: 'Email y contraseña requeridos' })

  const db   = getDb()
  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email)
  if (!user || !user.password)
    return res.status(401).json({ error: 'Credenciales inválidas' })

  const valid = await bcrypt.compare(password, user.password)
  if (!valid) return res.status(401).json({ error: 'Credenciales inválidas' })

  const safeUser = { id: user.id, username: user.username, email: user.email, avatar: user.avatar }
  res.json({ user: safeUser, token: makeToken(safeUser) })
}))

// ── Google OAuth ──────────────────────────────
router.get('/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
)

router.get('/google/callback',
  passport.authenticate('google', { failureRedirect: 'http://localhost:5173/login?error=google' }),
  (req, res) => {
    const token = makeToken(req.user)
    // Redirigir al frontend con el token en la URL
    res.redirect(`http://localhost:5173/auth/callback?token=${token}`)
  }
)

// ── Me ────────────────────────────────────────
router.get('/me', authenticate, (req, res) => {
  const db   = getDb()
  const user = db.prepare('SELECT id, username, email, avatar, created_at FROM users WHERE id = ?').get(req.user.id)
  if (!user) return res.status(404).json({ error: 'Usuario no encontrado' })
  res.json({ user })
})

// ── Logout ────────────────────────────────────
router.post('/logout', authenticate, (req, res) => {
  res.json({ message: 'Sesión cerrada' })
})

export default router
