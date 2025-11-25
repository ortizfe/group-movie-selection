# The Fantastic Four: Group Movie Selection

## Cloning the repo:

1. `git clone https://github.com/ortizfe/group-movie-selection.git`

## Running the Frontend:

1. `cd client`
2. `npm install --legacy-peer-deps`
3. `npm run dev`

## Running the Backend:

**Server (SQLite API)**
Prereqs:
- Node.js: v20 LTS (tested with v20.19.x)
- npm: v10+
- macOS/Linux (Windows works via WSL)

Tip: if you use nvm, run nvm use (or nvm install 20 && nvm use 20).

1. Install Dependencies
- `npm --prefix server ci`
2. Get Data & Ingest
- Place your CSV at data/raw/movies.csv (or any path you prefer).
- `node server/scripts/ingest_kaggle.cjs data/raw/movies.csv server/data/processed/movies.sqlite`
3. Start the API
- `npm --prefix server run dev`
- You should see:
`[DB] Using <absolute-path-to>/server/data/processed/movies.sqlite
API listening on http://localhost:3001`

List Movies:
- `curl -sS "http://localhost:3001/api/movies?limit=5" | jq .`

Get Recomendations:
- `curl -sS -X POST "http://localhost:3001/api/recommendations" \
  -H "Content-Type: application/json" \
  --data-binary '{"tone":0.5,"pace":0.5,"feel":0.5,"limit":3}' | jq .`

## `GET /api/movies`

Query params:
- `q` (string, optional): text search
- `genre` (string, optional)
- `year` (number, optional)
- `limit` (number, default 20)

## `POST /api/recommendations`

Body (JSON):
- `{
  "tone": 0.0-1.0,
  "pace": 0.0-1.0,
  "feel": 0.0-1.0,
  "limit": 1-50
}`



