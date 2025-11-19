import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { migrate } from './lib/db.js';
import movies from './routes/movies.js';
import recs from './routes/recommendations.js';

const app = express();
app.use(cors());
app.use(express.json());

migrate(); // ensure schema exists

app.get('/api/health', (_req, res) => res.json({ ok: true }));
app.use('/api', movies);
app.use('/api', recs);

const port = process.env.PORT || 3001;
app.listen(port, () => console.log(`API listening on http://localhost:${port}`));
