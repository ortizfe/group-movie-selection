import { useEffect, useState } from "react";
import { Button } from "@mui/material";
import { JellySpinner } from "./components/loader/TerminalLoader";
import { useNavigate } from "react-router";
import { RotateCcw } from "lucide-react";
import { useSelector } from "react-redux";
import type { RootState } from "../store/store";

import logo from "../assets/movie-matcher.png";
import TinderSwiping from "./components/TinderSwiping";

import testData from "../api/test.json";
import { type MovieData } from "./components/TinderSwiping";

const SwipingPage = () => {
  const navigate = useNavigate();

  const { tone, emotion, pacing } = useSelector(
    (state: RootState) => state.filters
  );

  const [movies, setMovies] = useState<MovieData[]>([]);
  const [loading, setLoading] = useState(true);

  // 2. Helper to convert slider values (-1 to 1) to API values (0 to 1)
  // const normalize = (val: number) => (val + 1) / 2;

  useEffect(() => {
    scrollTo(0, 0);

    const timer = setTimeout(() => {
      // 1. Shuffle and slice data
      const shuffled = [...testData].sort(() => 0.5 - Math.random());
      const selectedMovies = shuffled.slice(0, 20);

      // 2. Set state (now safe because it happens after the timeout)
      setMovies(selectedMovies);
      setLoading(false);
    }, 1500);

    return () => clearTimeout(timer);

    // const fetchMovies = async () => {
    //   setLoading(true);
    //   try {
    //     const response = await fetch("http://localhost:3000/movies", {
    //       method: "GET",
    //     });

    //     if (!response.ok) {
    //       throw new Error("Network response was not ok");
    //     }

    //     const data = await response.json();
    //     console.log(data);
    //     setMovies(data);
    //   } catch (error) {
    //     console.error("Failed to fetch movies:", error);
    //   } finally {
    //     setLoading(false);
    //   }
    // };

    // fetchMovies();
  }, [tone, emotion, pacing]);

  const handleRestart = (e: React.FormEvent) => {
    e.preventDefault();

    navigate("/");
  };

  return (
    <div className="flex flex-col items-center text-center h-screen w-full">
      <div className="flex flex-row items-center justify-between w-full pb-10">
        <Button
          onClick={() => navigate("/mood")}
          className="text-[#0c92d1] text-center font-bold text-md rounded-2xl hover:bg-[#0c92d1]/50 hover:text-white underline underline-offset-2"
        >
          Back
        </Button>
        <img src={logo} className="pl-20 h-12" />
        <Button
          variant="outlined"
          size="small"
          className="gap-2 bg-[#dd5a87] text-white font-bold text-[12px] hover:opacity-75"
          onClick={handleRestart}
        >
          <RotateCcw className="w-4 h-4" />
          Restart Game
        </Button>
      </div>
      {loading ? (
        <div>
          <JellySpinner />
          <p className="text-[#0c92d1] font-bold text-lg">Hold tight...</p>
        </div>
      ) : (
        <div className="flex flex-col w-full items-center text-center">
          <TinderSwiping movies={movies} />
        </div>
      )}
    </div>
  );
};

export default SwipingPage;
