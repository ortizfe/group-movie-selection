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

const INPUT = process.argv[2];        // e.g., data/raw/movies.csv
const OUTDB = process.argv[3];        // e.g., server/data/processed/movies.sqlite

// Ensure output dir exists
fs.mkdirSync(path.dirname(OUTDB), { recursive: true });

const db = new Database(OUTDB);
db.pragma('journal_mode = WAL');

// ---- Schema: drop & create fresh to avoid stale columns ----
db.exec(`
  DROP TABLE IF EXISTS movie_genres;
  DROP TABLE IF EXISTS movies;

  CREATE TABLE IF NOT EXISTS movies (
    id            INTEGER PRIMARY KEY,
    title         TEXT,
    year          INTEGER,
    runtime       INTEGER,
    overview      TEXT,
    popularity    REAL,
    vote_average  REAL,
    vote_count    INTEGER,
    poster_path   TEXT
  );

  CREATE TABLE IF NOT EXISTS movie_genres (
    movie_id INTEGER,
    genre    TEXT,
    PRIMARY KEY (movie_id, genre),
    FOREIGN KEY (movie_id) REFERENCES movies(id) ON DELETE CASCADE
  );

  CREATE INDEX IF NOT EXISTS idx_movies_year         ON movies(year);
  CREATE INDEX IF NOT EXISTS idx_movies_popularity   ON movies(popularity DESC);
  CREATE INDEX IF NOT EXISTS idx_movie_genres_mid    ON movie_genres(movie_id);
  CREATE INDEX IF NOT EXISTS idx_movie_genres_genre  ON movie_genres(genre);
`);

const insertMovie = db.prepare(`
  INSERT OR REPLACE INTO movies
  (id, title, year, runtime, overview, popularity, vote_average, vote_count, poster_path)
  VALUES (@id, @title, @year, @runtime, @overview, @popularity, @vote_average, @vote_count, @poster_path)
`);

const insertGenre = db.prepare(`
  INSERT OR IGNORE INTO movie_genres (movie_id, genre) VALUES (?, ?)
`);

function parseYear(releaseDate) {
  if (!releaseDate) return null;
  const m = String(releaseDate).match(/^(\d{4})/);
  return m ? Number(m[1]) : null;
}

function parseGenres(genresField) {
  if (!genresField) return [];
  const raw = String(genresField).trim();

  // JSON array like: [{"id":18,"name":"Drama"}, ...]
  try {
    const arr = JSON.parse(raw);
    if (Array.isArray(arr)) {
      return arr
        .map(g => (typeof g === 'string' ? g : g?.name))
        .filter(Boolean)
        .map(s => s.trim());
    }
  } catch (_) { /* not JSON */ }

  // Pipe/comma separated fallbacks
  if (raw.includes('|')) return raw.split('|').map(s => s.trim()).filter(Boolean);
  if (raw.includes(',')) return raw.split(',').map(s => s.trim()).filter(Boolean);

  return [raw]; // single token
}

// Adjust these if your CSV headers differ.
// Common headers for the TMDB Kaggle dump: id,title,release_date,runtime,overview,popularity,vote_average,vote_count,poster_path,genres
const COLS = {
  id:           'id',
  title:        'title',
  release_date: 'release_date',
  runtime:      'runtime',
  overview:     'overview',
  popularity:   'popularity',
  vote_average: 'vote_average',
  vote_count:   'vote_count',
  poster_path:  'poster_path',
  genres:       'genres'
};

let count = 0;

// Batch transaction insert
const txn = db.transaction((rows) => {
  for (const r of rows) {
    const movie = {
      id:           Number(r[COLS.id]),
      title:        r[COLS.title] || null,
      year:         parseYear(r[COLS.release_date] ?? r['releaseYear'] ?? r['release_year']),
      runtime:      r[COLS.runtime] ? Number(r[COLS.runtime]) : null,
      overview:     r[COLS.overview] || null,
      popularity:   r[COLS.popularity] ? Number(r[COLS.popularity]) : null,
      vote_average: r[COLS.vote_average] ? Number(r[COLS.vote_average]) : null,
      vote_count:   r[COLS.vote_count] ? Number(r[COLS.vote_count]) : null,
      poster_path:  r[COLS.poster_path] || null
    };

    // Skip malformed rows without id or title
    if (!movie.id || !movie.title) continue;

    insertMovie.run(movie);

    const genres = parseGenres(r[COLS.genres]);
    for (const g of genres) {
      if (!g) continue;
      insertGenre.run(movie.id, g);
    }
    count++;
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
      console.log(`Ingest complete. Inserted/updated ~${count} movies into ${OUTDB}`);
      db.close();
    })
    .on('error', (err) => {
      console.error('CSV read error:', err);
      process.exit(1);
    });
})();
