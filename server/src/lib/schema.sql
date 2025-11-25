PRAGMA journal_mode=WAL;

CREATE TABLE IF NOT EXISTS movies (
  id INTEGER PRIMARY KEY,
  title TEXT NOT NULL,
  overview TEXT,
  year INTEGER,
  runtime INTEGER,
  vote_average REAL,
  vote_count INTEGER,
  popularity REAL
);

CREATE TABLE IF NOT EXISTS movie_genres (
  movie_id INTEGER,
  genre TEXT,
  PRIMARY KEY (movie_id, genre)
);

CREATE TABLE IF NOT EXISTS movie_keywords (
  movie_id INTEGER,
  keyword TEXT,
  PRIMARY KEY (movie_id, keyword)
);

CREATE TABLE IF NOT EXISTS movie_availability (
  movie_id INTEGER,
  provider TEXT,
  PRIMARY KEY (movie_id, provider)
);

CREATE INDEX IF NOT EXISTS idx_movies_year ON movies(year);
CREATE INDEX IF NOT EXISTS idx_genres_genre ON movie_genres(genre);
CREATE INDEX IF NOT EXISTS idx_keywords_keyword ON movie_keywords(keyword);
