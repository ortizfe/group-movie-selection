import { useLocation } from "react-router";
import { useEffect, useState } from "react";
import { type MovieData } from "./components/TinderSwiping";
import Header from "./components/Header";

import testData from "../api/test.json";

const TMDB_BASE_URL = "https://image.tmdb.org/t/p/w1280";
const TMDB_THUMB_URL = "https://image.tmdb.org/t/p/w200";

const ResultsPage = () => {
  const location = useLocation();

  // Memoize the initial pool to prevent effect dependency issues
  const likedMovies = (location.state?.likedMovies as MovieData[]) || [];

  const [winner, setWinner] = useState<MovieData | null>(null);
  const [runnersUp, setRunnersUp] = useState<MovieData[]>([]);

  const formatDate = (dateString: string) => {
    if (!dateString) return "Unknown Date";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  useEffect(() => {
    const calculateResults = () => {
      let pool = [...likedMovies];

      // Fallback to test data if empty (for development/testing)
      if (pool.length === 0) {
        pool = testData as unknown as MovieData[];
      }

      if (pool.length > 0) {
        // 1. Pick Winner
        const randomIndex = Math.floor(Math.random() * pool.length);
        const selectedWinner = pool[randomIndex];
        setWinner(selectedWinner);

        // 2. Calculate Runners Up
        // Remove winner from the list
        const remaining = pool.filter(
          (movie) => movie.id !== selectedWinner.id
        );

        if (remaining.length === 0) {
          setRunnersUp([]);
        } else {
          // Shuffle remaining (optional, prevents fixed order)
          const shuffled = remaining.sort(() => 0.5 - Math.random());
          // Pick half (rounding up so at least 1 shows if 1 remains)
          const countToPick = Math.ceil(shuffled.length / 2);
          setRunnersUp(shuffled.slice(0, countToPick));
        }
      }
    };

    calculateResults();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty dependency array ensures this runs once on mount

  const getDescriptionStyle = (text: string | undefined) => {
    if (text === undefined) return;
    if (text.length > 450) return "text-sm";
    if (text.length > 250) return "text-base";
    return "text-lg";
  };

  return (
    <div className="flex flex-col items-center min-h-screen w-full bg-[#f8ea4f] pb-10">
      <Header />

      <div className="flex flex-col w-full max-w-7xl px-4 items-center justify-center">
        <div className="flex justify-between items-center mb-6 mt-4">
          <h1 className="text-3xl font-bold text-[#0c92d1] pb-5">
            And the group winner is...
          </h1>
        </div>

        {/* Main Content Container: Stacks on mobile, Side-by-side on Desktop */}
        <div className="flex flex-col lg:flex-row gap-8 w-full items-start justify-center">
          {/* LEFT: Winner Card */}
          {winner && (
            <div className="bg-white rounded-xl shadow-2xl overflow-hidden flex flex-col w-full lg:flex-1 transform transition-all hover:scale-[1.01] border-4 border-[#dd5a87]">
              <div className="h-80 overflow-hidden relative">
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

              <div className="p-8 flex-1 flex flex-col">
                <h2 className="font-bold text-2xl leading-tight text-gray-800 mb-4">
                  {winner.title}
                </h2>

                <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar mb-4 max-h-60">
                  <p
                    className={`${getDescriptionStyle(
                      winner.overview
                    )} text-gray-600 text-start leading-relaxed`}
                  >
                    {winner.overview}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-start line-clamp-2 font-bold text-[#0c92d1]">
                    {winner.genres}
                  </p>
                </div>

                <div className="flex justify-between items-center mt-auto border-t pt-4">
                  <span className="text-sm font-medium text-gray-500">
                    {formatDate(winner.release_date)}
                  </span>

                  <a
                    href={`https://www.imdb.com/title/${winner.imdb_id}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-base text-[#0c92d1] font-bold hover:underline flex items-center gap-1"
                  >
                    View on IMDB <span>→</span>
                  </a>
                </div>
              </div>
            </div>
          )}

          {/* RIGHT: Runners Up Leaderboard */}
          <div className="w-full lg:w-1/3 flex flex-col">
            <div className="bg-white rounded-xl shadow-xl border-4 font-bold border-[#0c92d1] overflow-hidden">
              <div className="bg-[#0c92d1] p-4">
                <h3 className="text-white text-xl font-bold text-center">
                  Runners Up
                </h3>
                <p className="text-blue-100 text-xs text-center mt-1">
                  Honorable mentions from the groups picks
                </p>
              </div>

              <div className="p-4 max-h-[600px] overflow-y-auto custom-scrollbar">
                {runnersUp.length > 0 ? (
                  <div className="space-y-4">
                    {runnersUp.map((movie, index) => (
                      <div
                        key={movie.id}
                        className="flex gap-3 items-center p-2 rounded-lg hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-0"
                      >
                        {/* Rank Number */}
                        <span className="text-2xl font-bold text-gray-500 w-6 text-center">
                          {index + 2}
                        </span>

                        {/* Thumbnail */}
                        <div className="h-16 w-12 shrink-0 bg-gray-200 rounded overflow-hidden">
                          {movie.poster_path ? (
                            <img
                              src={`${TMDB_THUMB_URL}${movie.poster_path}`}
                              alt={movie.title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-xs text-gray-400">
                              ?
                            </div>
                          )}
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0 text-start">
                          <h4 className="font-bold text-gray-800 text-sm truncate">
                            {movie.title}
                          </h4>
                          <p className="text-xs text-gray-500 truncate">
                            {formatDate(movie.release_date).split(" ")[2]}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-10 text-center text-gray-500">
                    <p className="text-lg font-medium">No runners up!</p>
                    <p className="text-sm mt-2">
                      The group was unanimous (or picky).
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResultsPage;

// import { useLocation } from "react-router";
// import { useEffect, useState } from "react";
// import { type MovieData } from "./components/TinderSwiping";
// import Header from "./components/Header";

// import testData from "../api/test.json";

// const TMDB_BASE_URL = "https://image.tmdb.org/t/p/w1280";

// const ResultsPage = () => {
//   const location = useLocation();

//   const likedMovies = (location.state?.likedMovies as MovieData[]) || [];
//   const [winner, setWinner] = useState<MovieData | null>(null);

//   const formatDate = (dateString: string) => {
//     if (!dateString) return "Unknown Date";
//     const date = new Date(dateString);
//     return date.toLocaleDateString("en-US", {
//       day: "numeric",
//       month: "long",
//       year: "numeric",
//     });
//   };

//   useEffect(() => {
//     const findWinner = () => {
//       let pool = likedMovies;

//       if (pool.length === 0) {
//         pool = testData as unknown as MovieData[];
//       }

//       if (pool.length > 0) {
//         const randomIndex = Math.floor(Math.random() * pool.length);
//         setWinner(pool[randomIndex]);
//       }
//     };
//     findWinner();
//   });

//   const getDescriptionStyle = (text: string | undefined) => {
//     if (text === undefined) return;

//     if (text.length > 450) return "text-sm"; // Small font for very long text
//     if (text.length > 250) return "text-base"; // Normal font for medium text
//     return "text-lg"; // Large font for short text
//   };

//   return (
//     <div className="flex flex-col items-center min-h-screen w-full bg-[#f8ea4f] pb-10">
//       <Header />

//       <div className="flex flex-col w-full max-w-6xl px-4 items-center justify-center">
//         <div className="flex justify-between items-center mb-6 mt-4">
//           <h1 className="text-3xl font-bold text-[#0c92d1] pb-5">
//             And the group winner is...
//           </h1>
//         </div>

//         {winner && (
//           <div className="bg-white rounded-xl shadow-2xl overflow-hidden flex flex-col w-full max-w-2xl mb-8 transform transition-all hover:scale-[1.02] border-4 border-[#dd5a87]">
//             <div className="h-80 overflow-hidden relative">
//               {winner.backdrop_path || winner.poster_path ? (
//                 <img
//                   src={`${TMDB_BASE_URL}${
//                     winner.backdrop_path || winner.poster_path
//                   }`}
//                   alt={winner.title}
//                   className="w-full h-full object-cover"
//                 />
//               ) : (
//                 <div className="w-full h-full bg-gray-200 flex items-center justify-center">
//                   <span className="text-gray-400">No Image</span>
//                 </div>
//               )}
//             </div>

//             <div className="p-8 flex-1 flex flex-col">
//               <h2 className="font-bold text-2xl leading-tight text-gray-800 mb-4">
//                 {winner.title}
//               </h2>

//               <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar mb-4">
//                 <p
//                   className={`${getDescriptionStyle(
//                     winner.overview
//                   )} text-gray-600 text-start leading-relaxed`}
//                 >
//                   {winner.overview}
//                 </p>
//               </div>

//               <div>
//                 <p className="text-sm text-start line-clamp-6 font-bold text-[#0c92d1]">
//                   {winner.genres}
//                 </p>
//               </div>

//               <div className="flex justify-between items-center mt-auto border-t pt-4">
//                 <span className="text-sm font-medium text-gray-500">
//                   {formatDate(winner.release_date)}
//                 </span>

//                 <a
//                   href={`https://www.imdb.com/title/${winner.imdb_id}`}
//                   target="_blank"
//                   rel="noreferrer"
//                   className="text-base text-[#0c92d1] font-bold hover:underline flex items-center gap-1"
//                 >
//                   View on IMDB <span>→</span>
//                 </a>
//               </div>
//             </div>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default ResultsPage;
