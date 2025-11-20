import { Router } from 'express';
import { db } from '../lib/db.js';
import { scoreMovie } from '../lib/scoring.js';

const r = Router();

r.post('/recommendations', (req, res) => {
  const vibe = req.body || {};
  const providers = Array.isArray(vibe.providers) && vibe.providers.length ? vibe.providers : null;

  let sql = `
    SELECT m.id, m.title, m.overview, m.year, m.runtime, m.vote_average, m.vote_count, m.popularity,
           GROUP_CONCAT(DISTINCT g.genre) AS genres,
           GROUP_CONCAT(DISTINCT a.provider) AS availability
    FROM movies m
    LEFT JOIN movie_genres g ON g.movie_id = m.id
    LEFT JOIN movie_availability a ON a.movie_id = m.id
  `;
  const where = [];
  const params = [];

  if (providers) {
    where.push(`a.provider IN (${providers.map(()=>'?').join(',')})`);
    params.push(...providers);
  }
  if (where.length) sql += ` WHERE ` + where.join(' AND ');
  sql += ` GROUP BY m.id ORDER BY m.popularity DESC LIMIT 300`;

  const rows = db.prepare(sql).all(...params).map(r => ({
    ...r,
    genres: r.genres ? r.genres.split(',') : [],
    availability: r.availability ? r.availability.split(',') : []
  }));

  const scored = rows
    .map(r => ({ ...r, score: scoreMovie(r.genres, r.popularity, vibe) }))
    .sort((a,b) => b.score - a.score)
    .slice(0, 30);

  res.json(scored);
});

export default r;
