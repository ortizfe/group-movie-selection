import { useEffect } from "react";
import { Button } from "@mui/material";
import { useNavigate } from "react-router";
import { RotateCcw } from "lucide-react";

import logo from "../assets/movie-matcher.png";
import TinderSwiping from "./components/TinderSwiping";

const SwipingPage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    scrollTo(0, 0);
  });

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
      <div className="flex flex-col w-full items-center text-center">
        <TinderSwiping />
      </div>
    </div>
  );
};

export default SwipingPage;
