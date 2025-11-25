// server/src/lib/db.js
import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';
import url from 'url';

function resolveDbPath() {
  const __dirname = path.dirname(url.fileURLToPath(import.meta.url));
  // from server/src/lib -> server/data/processed/movies.sqlite
  return path.resolve(__dirname, '..', '..', 'data', 'processed', 'movies.sqlite');
}

let _db;
export function getDb() {
  if (_db) return _db;
  const dbPath = resolveDbPath();
  const dir = path.dirname(dbPath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  _db = new Database(dbPath);
  console.log('[DB] Using', dbPath);
  return _db;
}

export function migrate() {
  const db = getDb();
  db.exec(`
    CREATE TABLE IF NOT EXISTS movies (
      id INTEGER PRIMARY KEY,
      title TEXT,
      overview TEXT,
      year INTEGER,
      runtime INTEGER,
      vote_average REAL,
      popularity REAL
    );
    CREATE TABLE IF NOT EXISTS movie_genres (
      movie_id INTEGER,
      genre TEXT
    );
    CREATE INDEX IF NOT EXISTS idx_genre_movie ON movie_genres(movie_id);
    CREATE INDEX IF NOT EXISTS idx_genre_name  ON movie_genres(genre);

    CREATE TABLE IF NOT EXISTS movie_availability (
      movie_id INTEGER,
      provider TEXT
    );
    CREATE INDEX IF NOT EXISTS idx_avail_movie    ON movie_availability(movie_id);
    CREATE INDEX IF NOT EXISTS idx_avail_provider ON movie_availability(provider);
  `);
}
