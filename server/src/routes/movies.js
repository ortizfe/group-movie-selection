import { Router } from 'express';
import { db } from '../lib/db.js';

const r = Router();

r.get('/movies', (req, res) => {
  const { q, genre, year, limit = 50 } = req.query;
  let sql = `SELECT m.id, m.title, m.overview, m.year, m.runtime, m.vote_average, m.vote_count, m.popularity
             FROM movies m`;
  const where = [];
  const params = [];

  if (genre) { sql += ` JOIN movie_genres g ON g.movie_id = m.id`; where.push(`g.genre = ?`); params.push(genre); }
  if (q)     { where.push(`m.title LIKE ?`); params.push(`%${q}%`); }
  if (year)  { where.push(`m.year = ?`);    params.push(Number(year)); }

  if (where.length) sql += ` WHERE ` + where.join(' AND ');
  sql += ` ORDER BY m.popularity DESC LIMIT ?`;
  params.push(Number(limit));

  const rows = db.prepare(sql).all(...params);
  res.json(rows);
});

export default r;