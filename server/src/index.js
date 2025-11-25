// server/src/index.js
import express from 'express';
import cors from 'cors';

import { getDb, migrate } from './lib/db.js';
import moviesRouter from './routes/movies.js';
import recommendationsRouter from './routes/recommendations.js';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Open DB and ensure schema
const db = getDb();
migrate(db);

// Routes
app.use('/api', moviesRouter);           // GET /api/movies
app.use('/api', recommendationsRouter);  // POST /api/recommendations

// Health check
app.get('/api/health', (_req, res) => res.json({ ok: true }));

app.listen(PORT, () => {
  console.log(`API listening on http://localhost:${PORT}`);
});
