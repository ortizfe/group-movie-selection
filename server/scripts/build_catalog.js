// scripts/build_catalog.js
// Ingest the "TMDB Movies Dataset 2023 (930k)" style CSV into SQLite for the prototype.

import fs from 'fs';
import path from 'path';
import { parse } from 'csv-parse/sync';

// ---------- CONFIG ----------
const RAW_DIR = path.resolve(process.cwd(), 'data/raw');
const OUT_DIR = path.resolve(process.cwd(), 'data/processed');

// Rename this to match your actual CSV filename from the dataset:
const MOVIES_FILE = 'movies.csv';     // e.g. downloaded file name
const KEYWORDS_FILE = 'keywords.csv'; // optional; skip if not present

// Keep catalog manageable for the prototype:
const LIMIT_BY_POPULARITY = 2000;

// Basic filters to shrink memory usage and improve result quality:
const MIN_RUNTIME = 60;      // minutes
const MAX_RUNTIME = 240;     // guard against bad data
const MIN_VOTE_COUNT = 50;   // avoid extremely obscure titles
const LANG_WHITELIST = new Set(['en']); // tweak if you want more languages
// ----------------------------

fs.mkdirSync(OUT_DIR, { recursive: true });

function readCSV(filename) {
  const p = path.join(RAW_DIR, filename);
  if (!fs.existsSync(p)) {
    throw new Error(`Missing file: ${p}`);
  }
  const text = fs.readFileSync(p, 'utf-8');
  return parse(text, { columns: true, skip_empty_lines: true });
}

function parseJSONCell(s) {
  if (!s) return [];
  const trimmed = String(s).trim();
  // Try JSON array of objects (TMDB-style)
  if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
    try {
      const arr = JSON.parse(trimmed);
      // expect [{id:..., name:...}, ...]
      return arr.map(x => (x && (x.name || x.genre || x.label)) || '').filter(Boolean);
    } catch {
      // fall through to split
    }
  }
  // Try JSON array of strings
  if ((trimmed.startsWith('["') && trimmed.endsWith('"]')) ||
      (trimmed.startsWith("['") && trimmed.endsWith("']"))) {
    try {
      const arr = JSON.parse(trimmed.replace(/'/g, '"'));
      return arr.map(x => String(x)).filter(Boolean);
    } catch {
      // fall through to split
    }
  }
  // Fallback: split by pipe or comma
  if (trimmed.includes('|')) return trimmed.split('|').map(x => x.trim()).filter(Boolean);
  if (trimmed.includes(',')) return trimmed.split(',').map(x => x.trim()).filter(Boolean);
  return trimmed ? [trimmed] : [];
}

const toYear = (s) => {
  if (!s) return null;
  const y = parseInt(String(s).slice(0, 4), 10);
  return Number.isFinite(y) ? y : null;
};
const toNum = (s) => {
  const n = parseFloat(s);
  return Number.isFinite(n) ? n : null;
};

// ---- Read CSVs ----
const moviesRaw = readCSV(MOVIES_FILE);
const hasKeywords = fs.existsSync(path.join(RAW_DIR, KEYWORDS_FILE));
const keywordsRaw = hasKeywords ? readCSV(KEYWORDS_FILE) : [];
const kwMap = new Map();
if (hasKeywords) {
  for (const r of keywordsRaw) {
    // Try common id column names
    const id = String(r.id ?? r.movie_id ?? '').trim();
    if (!id) continue;
    const list = parseJSONCell(r.keywords ?? r.keyword_names ?? '');
    kwMap.set(id, list);
  }
}

// ---- Normalize & Filter ----
function normGenres(cell) {
  const genres = parseJSONCell(cell);
  // Normalize capitalization
  return genres.map(g =>
    g
      .toString()
      .trim()
      .replace(/\s+/g, ' ')
      .replace(/\b\w/g, m => m.toUpperCase())
  );
}

function coerceId(x) {
  // Kaggle TMDB IDs can be large; keep as Number if possible, otherwise string -> Number fallback:
  const n = Number(x);
  return Number.isFinite(n) ? n : null;
}

const cleaned = [];
for (const r of moviesRaw) {
  const idRaw =
    r.id ?? r.tmdb_id ?? r.movie_id ?? r.imdb_id; // prefer TMDB id if present
  const id = coerceId(idRaw);
  if (!id) continue;

  const title = r.title ?? r.original_title ?? '';
  if (!title) continue;

  const overview = r.overview ?? '';
  const year = toYear(r.release_date ?? r.year ?? r.first_air_date);
  const runtime = toNum(r.runtime);
  const vote_average = toNum(r.vote_average);
  const vote_count = toNum(r.vote_count);
  const popularity = toNum(r.popularity);
  const language = (r.original_language ?? r.language ?? '').toLowerCase();

  const genres = normGenres(r.genres ?? r.genre_names ?? r.genre_ids ?? '');
  const keywords = kwMap.get(String(idRaw)) || [];

  // Basic quality filters
  if (runtime != null && (runtime < MIN_RUNTIME || runtime > MAX_RUNTIME)) continue;
  if ((vote_count ?? 0) < MIN_VOTE_COUNT) continue;
  if (language && LANG_WHITELIST.size && !LANG_WHITELIST.has(language)) continue;

  cleaned.push({
    id,
    title,
    overview,
    year,
    runtime,
    vote_average,
    vote_count,
    popularity,
    genres,
    keywords
  });
}

// Downsample by popularity to keep the catalog nimble
const top = cleaned
  .sort((a, b) => (b.popularity ?? 0) - (a.popularity ?? 0))
  .slice(0, LIMIT_BY_POPULARITY);

// ---- Synthetic availability (demo) ----
const providers = ['Netflix', 'Prime', 'Hulu', 'Max', 'Disney+'];
function availability() {
  const n = 1 + Math.floor(Math.random() * 2);
  const set = new Set();
  while (set.size < n) set.add(providers[Math.floor(Math.random() * providers.length)]);
  return [...set];
}

// ---- Load into SQLite ----
import '../server/src/lib/db.js';
import { db, migrate } from '../server/src/lib/db.js';
migrate();

const tx = db.transaction(() => {
  const insM = db.prepare(`
    INSERT OR REPLACE INTO movies
      (id, title, overview, year, runtime, vote_average, vote_count, popularity)
    VALUES (?,?,?,?,?,?,?,?)
  `);
  const insG = db.prepare(`INSERT OR REPLACE INTO movie_genres (movie_id, genre) VALUES (?,?)`);
  const insK = db.prepare(`INSERT OR REPLACE INTO movie_keywords (movie_id, keyword) VALUES (?,?)`);
  const insA = db.prepare(`INSERT OR REPLACE INTO movie_availability (movie_id, provider) VALUES (?,?)`);

  for (const m of top) {
    insM.run(m.id, m.title, m.overview, m.year, m.runtime, m.vote_average, m.vote_count, m.popularity);
    for (const g of m.genres) insG.run(m.id, g);
    for (const k of m.keywords) insK.run(m.id, k);
    for (const p of availability()) insA.run(m.id, p);
  }
});
tx();

console.log(
  `Loaded ${top.length} movies from ${MOVIES_FILE} into ${path.relative(process.cwd(), path.join(OUT_DIR, 'movies.sqlite'))}`
);
