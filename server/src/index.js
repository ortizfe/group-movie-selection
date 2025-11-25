// server/src/index.js
import express from 'express';
import cors from 'cors';
import { migrate } from './lib/db.js';
import moviesRouter from './routes/movies.js';
import recommendationsRouter from './routes/recommendations.js';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

await migrate();

app.use('/api', moviesRouter);
app.use('/api', recommendationsRouter);

// ✅ Health check
app.get('/api/health', (_req, res) => res.json({ ok: true }));

app.listen(PORT, () => {
  console.log(`API listening on http://localhost:${PORT}`);
});
