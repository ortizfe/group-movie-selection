// server/scripts/ingest_kaggle.cjs
// Usage: node server/scripts/ingest_kaggle.cjs <input_csv> <output_sqlite>

const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const Database = require('better-sqlite3');

if (process.argv.length < 4) {
  console.error('Usage: node server/scripts/ingest_kaggle.cjs <input_csv> <output_sqlite>');
  process.exit(1);
}

const INPUT = process.argv[2];                // e.g., data/raw/movies.csv
const OUTDB = process.argv[3];                // e.g., server/data/processed/movies.sqlite
fs.mkdirSync(path.dirname(OUTDB), { recursive: true });

const db = new Database(OUTDB);

// Schema MUST match server/src/lib/db.js (no poster_path, no vote_count)
db.exec(`
  PRAGMA journal_mode=WAL;

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
`);

// Prepared statements
const insertMovie = db.prepare(`
  INSERT OR REPLACE INTO movies
  (id, title, overview, year, runtime, vote_average, popularity)
  VALUES (@id, @title, @overview, @year, @runtime, @vote_average, @popularity)
`);

const insertGenre = db.prepare(`
  INSERT OR IGNORE INTO movie_genres (movie_id, genre) VALUES (?, ?)
`);

// Helpers
function parseYear(releaseDate) {
  if (!releaseDate) return null;
  const m = String(releaseDate).match(/^(\d{4})/);
  return m ? Number(m[1]) : null;
}

function parseGenres(genresField) {
  if (!genresField) return [];
  const raw = String(genresField).trim();

  // Try JSON array of objects or strings
  try {
    const arr = JSON.parse(raw);
    if (Array.isArray(arr)) {
      return arr
        .map(g => (typeof g === 'string' ? g : g?.name))
        .filter(Boolean)
        .map(s => s.trim());
    }
  } catch (_) { /* not JSON */ }

  // Pipe or comma separated fallback
  if (raw.includes('|')) return raw.split('|').map(s => s.trim()).filter(Boolean);
  if (raw.includes(',')) return raw.split(',').map(s => s.trim()).filter(Boolean);

  return [raw]; // single token
}

// Adjust column names here to match your CSV headers
const COLS = {
  id: 'id',
  title: 'title',
  release_date: 'release_date',
  runtime: 'runtime',
  overview: 'overview',
  popularity: 'popularity',
  vote_average: 'vote_average',
  genres: 'genres'
};

let inserted = 0;
const txn = db.transaction((rows) => {
  // optional: clear genres table if you intend to fully re-ingest
  // db.exec('DELETE FROM movie_genres');

  for (const r of rows) {
    const movie = {
      id: Number(r[COLS.id]),
      title: r[COLS.title] || null,
      overview: r[COLS.overview] || null,
      year: parseYear(r[COLS.release_date]),
      runtime: r[COLS.runtime] ? Number(r[COLS.runtime]) : null,
      vote_average: r[COLS.vote_average] ? Number(r[COLS.vote_average]) : null,
      popularity: r[COLS.popularity] ? Number(r[COLS.popularity]) : null
    };

    if (!movie.id || !movie.title) continue; // skip malformed rows

    insertMovie.run(movie);

    const genres = Array.from(new Set(parseGenres(r[COLS.genres])));
    for (const g of genres) {
      if (g) insertGenre.run(movie.id, g);
    }
    inserted++;
  }
});

(async () => {
  const batch = [];
  const BATCH_SIZE = 1000;

  console.log(`Reading ${INPUT} ...`);
  fs.createReadStream(INPUT)
    .pipe(csv())
    .on('data', (row) => {
      batch.push(row);
      if (batch.length >= BATCH_SIZE) {
        txn(batch.splice(0, batch.length));
      }
    })
    .on('end', () => {
      if (batch.length) txn(batch);
      console.log(`Ingest complete. Inserted/updated ~${inserted} rows into ${OUTDB}`);
      db.close();
    })
    .on('error', (err) => {
      console.error('CSV read error:', err);
      process.exit(1);
    });
})();
