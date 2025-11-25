# The Fantastic Four: Group Movie Selection

## Cloning the repo:

1. `git clone https://github.com/ortizfe/group-movie-selection.git`

## Running the Frontend:

1. `cd client`
2. `npm install --legacy-peer-deps`
3. `npm run dev`

## Running the Backend:

1. `cd server`
2. `npm install`
3. `npm --prefix server install`
4. Seed database (first time only):

- Place Kaggle CSV(s) under data/ (ignored by git) and run ETL:
  `node server/scripts/ingest_kaggle.js data/tmdb_2023_movies.csv data/movies.sqlite`

5. `npm --prefix server run dev`
