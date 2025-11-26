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

// Helper to calculate a movie's "score" based on its genres
const getMovieStats = (genresString: string) => {
  const genres = genresString.split(", ").map((g) => g.trim());

  let pacingScore = 0; // -1 (Slow) to 1 (Fast)
  let toneScore = 0; // -1 (Dark) to 1 (Light)
  let emotionScore = 0; // -1 (Sad/Serious) ... 1 (Happy/Uplifting)

  // Genre Weights
  // Action: Fast paced, usually neutral tone/emotion
  if (genres.includes("Action")) {
    pacingScore += 0.8;
    emotionScore += 0.2;
  }

  // Adventure: Fast, usually light and exciting
  if (genres.includes("Adventure")) {
    pacingScore += 0.6;
    toneScore += 0.3;
    emotionScore += 0.4;
  }

  // Animation: Usually light and happy
  if (genres.includes("Animation")) {
    pacingScore += 0.3;
    toneScore += 0.8;
    emotionScore += 0.6;
  }

  // Comedy: Very light, very happy
  if (genres.includes("Comedy")) {
    pacingScore += 0.2;
    toneScore += 0.9;
    emotionScore += 0.9;
  }

  // Crime: Dark, Serious
  if (genres.includes("Crime")) {
    pacingScore += 0.4;
    toneScore -= 0.8;
    emotionScore -= 0.6;
  }

  // Documentary: Slow, Serious
  if (genres.includes("Documentary")) {
    pacingScore -= 0.8;
    toneScore -= 0.2;
    emotionScore -= 0.2;
  }

  // Drama: Slow, Dark, Sad
  if (genres.includes("Drama")) {
    pacingScore -= 0.6;
    toneScore -= 0.3;
    emotionScore -= 0.8;
  }

  // Family: Light, Happy
  if (genres.includes("Family")) {
    toneScore += 0.8;
    emotionScore += 0.7;
  }

  // Fantasy: Variable, usually leans positive
  if (genres.includes("Fantasy")) {
    pacingScore += 0.3;
    toneScore += 0.3;
    emotionScore += 0.3;
  }

  // History: Slow, Serious
  if (genres.includes("History")) {
    pacingScore -= 0.5;
    toneScore -= 0.4;
    emotionScore -= 0.5;
  }

  // Horror: Dark, Scary (Negative Emotion)
  if (genres.includes("Horror")) {
    pacingScore += 0.2;
    toneScore -= 1.0;
    emotionScore -= 0.9;
  }

  // Music: Happy
  if (genres.includes("Music")) {
    toneScore += 0.5;
    emotionScore += 0.5;
  }

  // Mystery: Slow/Medium, Dark
  if (genres.includes("Mystery")) {
    pacingScore -= 0.2;
    toneScore -= 0.6;
    emotionScore -= 0.4;
  }

  // Romance: Slow, Happy/Heartfelt
  if (genres.includes("Romance")) {
    pacingScore -= 0.4;
    toneScore += 0.4;
    emotionScore += 0.8;
  }

  // Sci-Fi: Fast, variable emotion
  if (genres.includes("Science Fiction")) {
    pacingScore += 0.6;
    toneScore -= 0.1;
  }

  // Thriller: Fast, Dark, Intense
  if (genres.includes("Thriller")) {
    pacingScore += 0.9;
    toneScore -= 0.6;
    emotionScore -= 0.7;
  }

  // War: Fast/Medium, Very Serious/Sad
  if (genres.includes("War")) {
    pacingScore += 0.5;
    toneScore -= 0.9;
    emotionScore -= 1.0;
  }

  // Western: Medium
  if (genres.includes("Western")) {
    pacingScore -= 0.1;
    toneScore -= 0.2;
  }

  return {
    pacing: Math.max(-1, Math.min(1, pacingScore)),
    tone: Math.max(-1, Math.min(1, toneScore)),
    emotion: Math.max(-1, Math.min(1, emotionScore)),
  };
};

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
      const scoredMovies = testData.map((movie) => {
        const stats = getMovieStats(movie.genres || "");

        const pacingDiff = Math.abs(pacing - stats.pacing);
        const toneDiff = Math.abs(tone - stats.tone);
        const emotionDiff = Math.abs(emotion - stats.emotion);

        const totalDiff = pacingDiff + toneDiff + emotionDiff;

        return { ...movie, matchScore: totalDiff };
      });

      scoredMovies.sort((a, b) => a.matchScore - b.matchScore);

      const topMatches = scoredMovies.slice(0, 10);
      const shuffledTopMatches = topMatches.sort(() => 0.5 - Math.random());

      setMovies(shuffledTopMatches);
      setLoading(false);
    }, 1500); // Simulated delay

    // const timer = setTimeout(() => {
    //   // 1. Shuffle and slice data
    //   const shuffled = [...testData].sort(() => 0.5 - Math.random());
    //   const selectedMovies = shuffled.slice(0, 20);

    //   // 2. Set state (now safe because it happens after the timeout)
    //   setMovies(selectedMovies);
    //   setLoading(false);
    // }, 1500);

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

  const handleFinish = (likedMovies: MovieData[]) => {
    console.log("Submitting liked movies:", likedMovies);
    // Navigate to results page with the liked movies in state
    navigate("/results", { state: { likedMovies } });
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
          <TinderSwiping movies={movies} onFinish={handleFinish} />
        </div>
      )}
    </div>
  );
};

export default SwipingPage;
