import Database from 'better-sqlite3'
import { mkdirSync } from 'fs'
import { dirname } from 'path'

let db = null
export function getDb() {
  if (!db) throw new Error('Database not initialized.')
  return db
}

export async function initDatabase() {
  const dbPath = process.env.DB_PATH || './data/cycat.db'
  try { mkdirSync(dirname(dbPath), { recursive: true }) } catch {}
  db = new Database(dbPath)
  db.pragma('journal_mode = WAL')
  db.pragma('foreign_keys = ON')

  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL UNIQUE, email TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL DEFAULT '', google_id TEXT UNIQUE,
      avatar TEXT, bio TEXT DEFAULT '', created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS ratings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      content_id TEXT NOT NULL, content_type TEXT NOT NULL CHECK(content_type IN ('movie','tv')),
      score REAL NOT NULL CHECK(score >= 1 AND score <= 10),
      title TEXT, poster_path TEXT, watched_year INTEGER,
      watched_date DATE,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(user_id, content_id, content_type)
    );
    CREATE TABLE IF NOT EXISTS reviews (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      content_id TEXT NOT NULL, content_type TEXT NOT NULL CHECK(content_type IN ('movie','tv')),
      title TEXT, poster_path TEXT, body TEXT NOT NULL,
      contains_spoiler INTEGER DEFAULT 0, likes INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(user_id, content_id, content_type)
    );
    CREATE TABLE IF NOT EXISTS review_likes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      review_id INTEGER NOT NULL REFERENCES reviews(id) ON DELETE CASCADE,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(user_id, review_id)
    );
    CREATE TABLE IF NOT EXISTS favorites (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      content_id TEXT NOT NULL, content_type TEXT NOT NULL CHECK(content_type IN ('movie','tv')),
      title TEXT, poster_path TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(user_id, content_id, content_type)
    );
    CREATE TABLE IF NOT EXISTS watchlist (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      content_id TEXT NOT NULL, content_type TEXT NOT NULL CHECK(content_type IN ('movie','tv')),
      title TEXT, poster_path TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(user_id, content_id, content_type)
    );
    CREATE TABLE IF NOT EXISTS diary (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      content_id TEXT NOT NULL, content_type TEXT NOT NULL CHECK(content_type IN ('movie','tv')),
      title TEXT, poster_path TEXT, score REAL,
      watched_date DATE NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(user_id, content_id, watched_date)
    );
    CREATE TABLE IF NOT EXISTS user_lists (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      name TEXT NOT NULL, description TEXT DEFAULT '',
      is_public INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS list_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      list_id INTEGER NOT NULL REFERENCES user_lists(id) ON DELETE CASCADE,
      content_id TEXT NOT NULL, content_type TEXT NOT NULL CHECK(content_type IN ('movie','tv')),
      title TEXT, poster_path TEXT, sort_order INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(list_id, content_id, content_type)
    );
    CREATE INDEX IF NOT EXISTS idx_ratings_content  ON ratings(content_id, content_type);
    CREATE INDEX IF NOT EXISTS idx_ratings_user     ON ratings(user_id);
    CREATE INDEX IF NOT EXISTS idx_reviews_content  ON reviews(content_id, content_type);
    CREATE INDEX IF NOT EXISTS idx_favorites_user   ON favorites(user_id);
    CREATE INDEX IF NOT EXISTS idx_diary_user       ON diary(user_id);
    CREATE INDEX IF NOT EXISTS idx_lists_user       ON user_lists(user_id);
    CREATE INDEX IF NOT EXISTS idx_lists_public     ON user_lists(is_public);
    CREATE TABLE IF NOT EXISTS newsletter_subscribers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT NOT NULL UNIQUE,
      subscribed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      active INTEGER DEFAULT 1
    );
    CREATE INDEX IF NOT EXISTS idx_newsletter_email ON newsletter_subscribers(email);
  `)

  const migrations = [
    'ALTER TABLE users ADD COLUMN google_id TEXT UNIQUE',
    'ALTER TABLE users ADD COLUMN avatar TEXT',
    'ALTER TABLE users ADD COLUMN bio TEXT DEFAULT ""',
    'ALTER TABLE ratings ADD COLUMN title TEXT',
    'ALTER TABLE ratings ADD COLUMN poster_path TEXT',
    'ALTER TABLE ratings ADD COLUMN watched_year INTEGER',
    'ALTER TABLE ratings ADD COLUMN watched_date DATE',
  ]
  for (const m of migrations) { try { db.exec(m) } catch {} }

  console.log('✅ Base de datos inicializada')
  return db
}
