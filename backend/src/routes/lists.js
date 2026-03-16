import { Router } from 'express'
import { getDb } from '../utils/database.js'
import { authenticate, optionalAuth } from '../middleware/auth.js'

const router = Router()
const wrap = fn => (req, res, next) => fn(req, res, next).catch(next)

// Listas públicas (explorar)
router.get('/public', optionalAuth, wrap(async (req, res) => {
  const db = getDb()
  const lists = db.prepare(`
    SELECT l.*, u.username, u.avatar,
      (SELECT COUNT(*) FROM list_items WHERE list_id = l.id) as item_count,
      (SELECT poster_path FROM list_items WHERE list_id = l.id ORDER BY sort_order LIMIT 1) as cover
    FROM user_lists l JOIN users u ON u.id = l.user_id
    WHERE l.is_public = 1
    ORDER BY l.created_at DESC LIMIT 50
  `).all()
  res.json({ lists })
}))

// Mis listas
router.get('/mine', authenticate, wrap(async (req, res) => {
  const db = getDb()
  const lists = db.prepare(`
    SELECT l.*,
      (SELECT COUNT(*) FROM list_items WHERE list_id = l.id) as item_count,
      (SELECT poster_path FROM list_items WHERE list_id = l.id ORDER BY sort_order LIMIT 1) as cover
    FROM user_lists l WHERE l.user_id = ?
    ORDER BY l.created_at DESC
  `).all(req.user.id)
  res.json({ lists })
}))

// Ver lista por id
router.get('/:id', optionalAuth, wrap(async (req, res) => {
  const db = getDb()
  const list = db.prepare(`
    SELECT l.*, u.username, u.avatar
    FROM user_lists l JOIN users u ON u.id = l.user_id
    WHERE l.id = ? AND (l.is_public = 1 OR l.user_id = ?)
  `).get(req.params.id, req.user?.id || 0)
  if (!list) return res.status(404).json({ error: 'Lista no encontrada' })
  const items = db.prepare('SELECT * FROM list_items WHERE list_id = ? ORDER BY sort_order').all(req.params.id)
  res.json({ list, items })
}))

// Crear lista
router.post('/', authenticate, wrap(async (req, res) => {
  const { name, description, is_public } = req.body
  if (!name?.trim()) return res.status(400).json({ error: 'Nombre requerido' })
  const db = getDb()
  const result = db.prepare(`
    INSERT INTO user_lists (user_id, name, description, is_public)
    VALUES (?, ?, ?, ?)
  `).run(req.user.id, name.trim(), description||'', is_public !== false ? 1 : 0)
  res.status(201).json({ id: result.lastInsertRowid, message: 'Lista creada' })
}))

// Actualizar lista
router.patch('/:id', authenticate, wrap(async (req, res) => {
  const { name, description, is_public } = req.body
  const db = getDb()
  const list = db.prepare('SELECT id FROM user_lists WHERE id = ? AND user_id = ?').get(req.params.id, req.user.id)
  if (!list) return res.status(404).json({ error: 'Lista no encontrada' })
  if (name) db.prepare('UPDATE user_lists SET name = ? WHERE id = ?').run(name, req.params.id)
  if (description !== undefined) db.prepare('UPDATE user_lists SET description = ? WHERE id = ?').run(description, req.params.id)
  if (is_public !== undefined) db.prepare('UPDATE user_lists SET is_public = ? WHERE id = ?').run(is_public ? 1 : 0, req.params.id)
  res.json({ message: 'Lista actualizada' })
}))

// Eliminar lista
router.delete('/:id', authenticate, wrap(async (req, res) => {
  const db = getDb()
  db.prepare('DELETE FROM user_lists WHERE id = ? AND user_id = ?').run(req.params.id, req.user.id)
  res.json({ message: 'Lista eliminada' })
}))

// Agregar item a lista
router.post('/:id/items', authenticate, wrap(async (req, res) => {
  const { contentId, type, title, poster_path } = req.body
  const db = getDb()
  const list = db.prepare('SELECT id FROM user_lists WHERE id = ? AND user_id = ?').get(req.params.id, req.user.id)
  if (!list) return res.status(404).json({ error: 'Lista no encontrada' })
  const maxOrder = db.prepare('SELECT MAX(sort_order) as m FROM list_items WHERE list_id = ?').get(req.params.id)
  try {
    db.prepare(`INSERT INTO list_items (list_id, content_id, content_type, title, poster_path, sort_order) VALUES (?,?,?,?,?,?)`)
      .run(req.params.id, String(contentId), type, title||'', poster_path||'', (maxOrder.m||0)+1)
    res.json({ message: 'Agregado a la lista' })
  } catch { res.status(409).json({ error: 'Ya está en la lista' }) }
}))

// Quitar item de lista
router.delete('/:id/items/:contentId', authenticate, wrap(async (req, res) => {
  const db = getDb()
  db.prepare('DELETE FROM list_items WHERE list_id = ? AND content_id = ?').run(req.params.id, req.params.contentId)
  res.json({ message: 'Quitado de la lista' })
}))

export default router
