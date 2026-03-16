import passport from 'passport'
import { Strategy as GoogleStrategy } from 'passport-google-oauth20'
import { getDb } from '../utils/database.js'
import jwt from 'jsonwebtoken'

passport.use(new GoogleStrategy({
  clientID:     process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL:  process.env.GOOGLE_CALLBACK_URL || 'http://localhost:3001/api/auth/google/callback',
}, async (accessToken, refreshToken, profile, done) => {
  try {
    const db = getDb()

    const email    = profile.emails?.[0]?.value
    const username = profile.displayName?.replace(/\s+/g, '_').toLowerCase() || `user_${profile.id}`
    const avatar   = profile.photos?.[0]?.value

    if (!email) return done(new Error('No se pudo obtener el email de Google'))

    // Buscar usuario existente por google_id o email
    let user = db.prepare('SELECT * FROM users WHERE google_id = ? OR email = ?')
                 .get(profile.id, email)

    if (user) {
      // Actualizar google_id si se registró antes con email
      if (!user.google_id) {
        db.prepare('UPDATE users SET google_id = ?, avatar = ? WHERE id = ?')
          .run(profile.id, avatar, user.id)
      }
    } else {
      // Crear usuario nuevo
      const result = db.prepare(`
        INSERT INTO users (username, email, google_id, avatar, password)
        VALUES (?, ?, ?, ?, '')
      `).run(username, email, profile.id, avatar)

      user = db.prepare('SELECT * FROM users WHERE id = ?').get(result.lastInsertRowid)
    }

    return done(null, user)
  } catch (err) {
    return done(err)
  }
}))

passport.serializeUser((user, done) => done(null, user.id))
passport.deserializeUser((id, done) => {
  try {
    const db   = getDb()
    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(id)
    done(null, user)
  } catch (err) {
    done(err)
  }
})

export default passport
