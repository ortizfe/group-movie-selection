import { useLocation } from "react-router";
import { useEffect, useState } from "react";
import { type MovieData } from "./components/TinderSwiping";
import Header from "./components/Header";

import testData from "../api/test.json";

const TMDB_BASE_URL = "https://image.tmdb.org/t/p/w500";

const ResultsPage = () => {
  const location = useLocation();
  // Retrieve the passed state
  const likedMovies = (location.state?.likedMovies as MovieData[]) || [];
  const [winner, setWinner] = useState<MovieData | null>(null);

  useEffect(() => {
    const findWinner = () => {
      let pool = likedMovies;

      if (pool.length === 0) {
        pool = testData as unknown as MovieData[];
      }

      if (pool.length > 0) {
        const randomIndex = Math.floor(Math.random() * pool.length);
        setWinner(pool[randomIndex]);
      }
    };
    findWinner();
  });

  return (
    <div className="flex flex-col items-center min-h-screen w-full bg-[#f8ea4f] pb-10">
      <Header />

      <div className="flex flex-col w-full max-w-4xl px-4 items-center justify-center">
        <div className="flex justify-between items-center mb-6 mt-4">
          <h1 className="text-3xl font-bold text-[#0c92d1]">
            And the group winner is...
          </h1>
        </div>

        {winner && (
          <div className="bg-white rounded-xl shadow-2xl overflow-hidden flex flex-col w-full max-w-md mb-8 transform transition-all hover:scale-105 border-4 border-[#dd5a87]">
            <div className="h-64 overflow-hidden relative">
              {winner.backdrop_path || winner.poster_path ? (
                <img
                  src={`${TMDB_BASE_URL}${
                    winner.backdrop_path || winner.poster_path
                  }`}
                  alt={winner.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                  <span className="text-gray-400">No Image</span>
                </div>
              )}
            </div>

            <div className="p-6 flex-1 flex flex-col">
              <h2 className="font-bold text-2xl leading-tight mb-3 text-gray-800">
                {winner.title}
              </h2>
              <p className="text-base text-gray-600 line-clamp-4 mb-4 flex-1">
                {winner.overview}
              </p>

              <div className="flex justify-between items-center mt-auto">
                <span className="text-sm font-medium text-gray-500">
                  {new Date(winner.release_date).getFullYear()}
                </span>
                <a
                  href={`https://www.imdb.com/title/${winner.imdb_id}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-sm text-[#0c92d1] font-bold hover:underline"
                >
                  View on IMDB →
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResultsPage;
