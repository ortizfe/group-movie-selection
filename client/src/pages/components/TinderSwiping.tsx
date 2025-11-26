import React, { useMemo, useRef, useState, useEffect } from "react";
import TinderCard from "./TinderCard";
// import TinderCard from "react-tinder-card";
import { Undo2, X, Heart, Info } from "lucide-react";

const TinderSwiping = ({ movies }) => {
  const [currentIndex, setCurrentIndex] = useState(movies.length - 1);
  const [lastDirection, setLastDirection] = useState("");
  const [gameKey, setGameKey] = useState(0); // Used to reset the game state

  // Used for outOfFrame closure
  const currentIndexRef = useRef(currentIndex);

  const childRefs = useMemo(
    () =>
      Array(movies.length)
        .fill(0)
        .map(() => React.createRef()),
    [movies.length, gameKey] // Re-create refs when game resets
  );

  const updateCurrentIndex = (val) => {
    setCurrentIndex(val);
    currentIndexRef.current = val;
  };

  const canGoBack = currentIndex < movies.length - 1;
  const canSwipe = currentIndex >= 0;

  // set last direction and decrease current index
  const swiped = (direction, nameToDelete, index) => {
    setLastDirection(direction);
    updateCurrentIndex(index - 1);
  };

  const outOfFrame = (name, idx) => {
    // console.log(`${name} left the screen!`);
  };

  const swipe = async (dir) => {
    if (canSwipe && currentIndex < movies.length) {
      await childRefs[currentIndex].current.swipe(dir); // Swipe the card!
    }
  };

  // increase current index and show card
  const goBack = async () => {
    if (!canGoBack) return;
    const newIndex = currentIndex + 1;
    updateCurrentIndex(newIndex);
    await childRefs[newIndex].current.restoreCard();
  };

  const restartGame = () => {
    setCurrentIndex(movies.length - 1);
    setLastDirection("");
    setGameKey((prev) => prev + 1); // Forces re-render of cards
  };

  // Add Keyboard Support
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (currentIndex < 0) return; // Don't swipe if game over
      if (e.key === "ArrowLeft") swipe("left");
      if (e.key === "ArrowRight") swipe("right");
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentIndex, gameKey]); // Dependencies ensure updated closures

  return (
    <div className="flex flex-col items-center w-full max-w-md px-4">
      {/* Header */}
      <div className="mb-8 text-center select-none">
        <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-2 justify-center">
          MovieMatcher <span className="text-red-500 text-4xl">🍿</span>
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          Swipe right to add to watchlist
        </p>
      </div>

      {/* Card Container */}
      <div className="relative w-full h-[500px] flex justify-center perspective-1000">
        {/* We use gameKey to force a full re-mount of cards on restart */}
        <React.Fragment key={gameKey}>
          {movies.map((movie, index) => (
            <TinderCard
              ref={childRefs[index]}
              className="absolute top-0"
              key={movie.id}
              onSwipe={(dir) => swiped(dir, movie.title, index)}
              onCardLeftScreen={() => outOfFrame(movie.title, index)}
            >
              <div
                className="relative w-[320px] h-[500px] bg-white rounded-2xl shadow-xl overflow-hidden ring-1 ring-black/5"
                style={{
                  backgroundImage: `url(${movie.poster_path})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
              >
                {/* Gradient Overlay for Text Readability */}
                <div className="absolute bottom-0 left-0 w-full h-3/4 bg-gradient-to-t from-black/90 via-black/40 to-transparent pointer-events-none" />

                {/* Content */}
                <div className="absolute bottom-0 left-0 w-full p-6 text-white z-10 flex flex-col gap-2">
                  <h3 className="text-2xl font-bold leading-tight drop-shadow-md">
                    {movie.title}
                  </h3>

                  <p className="text-sm text-gray-200 line-clamp-3 opacity-90 drop-shadow-sm">
                    {movie.overview}
                  </p>

                  <div className="mt-2 flex items-center justify-between">
                    <a
                      href={`https://www.imdb.com/title/${movie.imdb_id}`}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-1 text-xs font-bold bg-[#f5c518] text-black px-3 py-1.5 rounded-full hover:bg-[#e2b616] transition-colors pointer-events-auto"
                      onPointerDown={(e) => e.stopPropagation()} // Prevent drag when clicking link
                    >
                      IMDb <Info size={14} />
                    </a>
                  </div>
                </div>
              </div>
            </TinderCard>
          ))}
        </React.Fragment>

        {/* Empty State (Behind cards) */}
        {currentIndex < 0 && (
          <div className="absolute inset-0 flex items-center justify-center text-slate-400 select-none z-0">
            <div className="text-center animate-in fade-in zoom-in duration-300">
              <div className="text-4xl mb-2">🎬</div>
              <p className="text-lg font-medium">No more movies!</p>
              <button
                onClick={restartGame}
                className="mt-4 flex items-center gap-2 mx-auto px-4 py-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors shadow-md"
              >
                <RotateCcw size={16} />
                Start Over
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="flex items-center gap-6 mt-10 z-20">
        <button
          className={`p-4 rounded-full bg-white shadow-lg text-red-500 transition-all transform hover:scale-110 active:scale-95 border border-red-100 ${
            !canSwipe
              ? "opacity-50 cursor-not-allowed grayscale"
              : "hover:shadow-red-200"
          }`}
          onClick={() => swipe("left")}
          disabled={!canSwipe}
          aria-label="Dislike"
        >
          <X size={28} strokeWidth={3} />
        </button>

        <button
          className={`p-3 rounded-full bg-slate-100 text-slate-600 shadow-md transition-all transform hover:scale-110 active:scale-95 ${
            !canGoBack ? "opacity-50 cursor-not-allowed" : "hover:bg-slate-200"
          }`}
          onClick={() => goBack()}
          disabled={!canGoBack}
          aria-label="Undo"
        >
          <Undo2 size={20} />
        </button>

        <button
          className={`p-4 rounded-full bg-white shadow-lg text-green-500 transition-all transform hover:scale-110 active:scale-95 border border-green-100 ${
            !canSwipe
              ? "opacity-50 cursor-not-allowed grayscale"
              : "hover:shadow-green-200"
          }`}
          onClick={() => swipe("right")}
          disabled={!canSwipe}
          aria-label="Like"
        >
          <Heart
            size={28}
            strokeWidth={3}
            fill="currentColor"
            className="text-green-500"
          />
        </button>
      </div>

      {/* Info Text */}
      <div className="h-8 mt-6 select-none">
        {lastDirection ? (
          <p className="text-slate-500 font-medium animate-pulse">
            You swiped{" "}
            <span className="font-bold uppercase text-slate-800">
              {lastDirection}
            </span>
          </p>
        ) : (
          <p className="text-slate-400 text-sm">
            Swipe cards, use buttons, or arrow keys
          </p>
        )}
      </div>
    </div>
  );
};

// import poster from "../../assets/poster.jpg";

// type Direction = "left" | "right" | "up" | "down";
// export interface MovieData {
//   id: number;
//   title: string;
//   vote_average?: number;
//   vote_count?: number;
//   status?: string;
//   release_date?: Date;
//   revenue?: number;
//   runtime: number;
//   adult: boolean;
//   backdrop_path: string;
//   budget: number;
//   homepage: string;
//   imdb_id: string;
//   original_language: string;
//   original_title: string;
//   overview: string;
//   popularity: number;
//   poster_path: string;
//   genres: string;
//   production_companies: string;
//   production_countries: string;
//   spoken_languages: string;
//   keywords: string;
// }

// // Update props to accept the movie list
// interface TinderSwipingProps {
//   movies: MovieData[];
// }
// interface TinderCardRef {
//   swipe: (dir: Direction) => Promise<void>;
//   restoreCard: () => Promise<void>;
// }

// const TinderSwiping = ({ movies }: TinderSwipingProps) => {
//   const [currentIndex, setCurrentIndex] = useState(movies.length - 1);
//   const [lastDirection, setLastDirection] = useState("");

//   const currentIndexRef = useRef(currentIndex);

//   const childRefs = useMemo(
//     () =>
//       Array(movies.length)
//         .fill(0)
//         .map(() => React.createRef<TinderCardRef>()),
//     [movies.length]
//   );

//   const updateCurrentIndex = (val: number) => {
//     setCurrentIndex(val);
//     currentIndexRef.current = val;
//   };

//   const canGoBack = currentIndex < movies.length - 1;

//   const canSwipe = currentIndex >= 0;

//   const swiped = (direction: string, nameToDelete: string, index: number) => {
//     setLastDirection(direction);
//     updateCurrentIndex(index - 1);
//   };

//   const outOfFrame = (name: string, idx: number) => {
//     console.log(`${name} left the screen!`);
//     if (currentIndexRef.current >= idx && childRefs[idx].current) {
//       childRefs[idx].current!.restoreCard();
//     }
//   };

//   const swipe = async (dir: Direction) => {
//     if (canSwipe && currentIndex < movies.length) {
//       if (childRefs[currentIndex] && childRefs[currentIndex].current) {
//         await childRefs[currentIndex].current!.swipe(dir);
//       }
//     }
//   };

//   const goBack = async () => {
//     if (!canGoBack) return;

//     const newIndex = currentIndex + 1;
//     updateCurrentIndex(newIndex);
//     if (childRefs[newIndex].current && childRefs[newIndex].current) {
//       await childRefs[newIndex].current!.restoreCard();
//     }
//   };

//   // const onSwipe = (direction: string) => {
//   //   console.log("You swiped: " + direction);
//   // };

//   // const onCardLeftScreen = (myIdentifier: string) => {
//   //   console.log(myIdentifier + " left the screen");
//   // };

//   return (
//     <React.Fragment>
//       <style>{`
//         .app-container {
//           display: flex;
//           flex-direction: column;
//           align-items: center;
//           justify-content: center;
//           min-height: 100vh;
//           overflow: hidden;
//           background: #f0f2f5;
//         }
//         .card-container {
//           width: 300px;
//           height: 450px; /* Increased height slightly */
//           position: relative;
//         }
//         .swipe {
//           position: absolute;
//           top: 0;
//           left: 0;
//           width: 100%;
//           height: 100%;
//         }

//         .card-content {
//           width: 100%;
//           height: 100%;
//           background-size: cover;
//           background-position: center;
//           border-radius: 10px;
//           box-shadow: 0px 10px 20px rgba(0,0,0,0.15);
//           display: flex;
//           flex-direction: column; /* Stacks title and link vertically */
//           justify-content: flex-end; /* Pushes them to the bottom */
//           align-items: flex-start; /* Aligns them to the left */
//           position: relative;
//         }

//         .card-content h3 {
//           position: relative;
//           z-index: 2;
//           color: white;
//           margin: 0 20px 10px 20px; /* Top Right Bottom Left */
//           font-family: sans-serif;
//           text-shadow: 0 2px 4px rgba(0,0,0,0.8); /* Added shadow for readability */
//         }

//         .imdb-link {
//           position: relative;
//           z-index: 2;
//           color: #f5c518; /* IMDB Yellow color */
//           text-decoration: none;
//           font-weight: bold;
//           font-family: sans-serif;
//           margin: 0 0 20px 20px; /* Top Right Bottom Left */
//           padding: 5px 10px;
//           background: rgba(0,0,0,0.6); /* Dark background to make it pop */
//           border-radius: 5px;
//           transition: background 0.2s;
//         }

//         .imdb-link:hover {
//           background: rgba(255,255,255,0.2);
//           color: #fff;
//         }
//         .buttons {
//             display: flex;
//             gap: 15px;
//             margin-top: 20px;
//             z-index: 100;
//         }
//         .buttons button {
//             padding: 12px 24px;
//             border-radius: 50px;
//             border: none;
//             cursor: pointer;
//             background: white;
//             font-weight: bold;
//             box-shadow: 0 4px 10px rgba(0,0,0,0.1);
//             transition: transform 0.2s;
//         }
//         .buttons button:active {
//             transform: scale(0.95);
//         }
//         .buttons button:disabled {
//             opacity: 0.5;
//             cursor: not-allowed;
//         }
//         .infoText {
//             margin-top: 20px;
//             font-family: sans-serif;
//             color: #333;
//         }
//       `}</style>
//       <div className="card-container">
//         {movies.map((movie, index) => (
//           <TinderCard
//             ref={childRefs[index]}
//             className="swipe"
//             key={movie.id}
//             onSwipe={(dir) => swiped(dir, movie.title, index)}
//             onCardLeftScreen={() => outOfFrame(movie.title, index)}
//             preventSwipe={["up", "down"]}
//           >
//             <div
//               className="card-content"
//               style={{
//                 backgroundImage: !movie.backdrop_path
//                   ? `url(${movie.backdrop_path})`
//                   : `url(${poster})`,
//               }}
//             >
//               <h3>{movie.title}</h3>

//               <a
//                 href={`https://www.imdb.com/title/${movie.imdb_id}`}
//                 target="_blank"
//                 rel="noreferrer"
//                 className="imdb-link"
//                 onPointerDown={(e) => e.stopPropagation()}
//               >
//                 View on IMDB
//               </a>
//             </div>
//           </TinderCard>
//         ))}
//         <div className="buttons pt-120">
//           <button
//             className={`p-4 rounded-full bg-white shadow-lg text-red-500 transition-all transform hover:scale-110 active:scale-95 border border-red-100 ${
//               !canSwipe
//                 ? "opacity-50 cursor-not-allowed grayscale"
//                 : "hover:shadow-red-200"
//             }`}
//             onClick={() => swipe("left")}
//             disabled={!canSwipe}
//             aria-label="Dislike"
//           >
//             <X size={28} strokeWidth={3} />
//           </button>

//           <button
//             className={`p-3 rounded-full bg-slate-100 text-slate-600 shadow-md transition-all transform hover:scale-110 active:scale-95 ${
//               !canGoBack
//                 ? "opacity-50 cursor-not-allowed"
//                 : "hover:bg-slate-200"
//             }`}
//             onClick={() => goBack()}
//             disabled={!canGoBack}
//             aria-label="Undo"
//           >
//             <Undo2 size={20} />
//           </button>

//           <button
//             className={`p-4 rounded-full bg-white shadow-lg text-green-500 transition-all transform hover:scale-110 active:scale-95 border border-green-100 ${
//               !canSwipe
//                 ? "opacity-50 cursor-not-allowed grayscale"
//                 : "hover:shadow-green-200"
//             }`}
//             onClick={() => swipe("right")}
//             disabled={!canSwipe}
//             aria-label="Like"
//           >
//             <Heart
//               size={28}
//               strokeWidth={3}
//               fill="currentColor"
//               className="text-green-500"
//             />
//           </button>
//         </div>
//         {lastDirection ? (
//           <h2 key={lastDirection} className="infoText">
//             You swiped {lastDirection}
//           </h2>
//         ) : (
//           <h2 className="infoText">
//             Swipe a card or press a button to get Restore Card button visible!
//           </h2>
//         )}
//       </div>
//     </React.Fragment>
//   );
// };

export default TinderSwiping;
