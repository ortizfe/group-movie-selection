import { RotateCcw } from "lucide-react";
import logo from "../../assets/movie-matcher.png";
import { Button } from "@mui/material";
import { useNavigate } from "react-router";

const Header = () => {
  const navigate = useNavigate();

  const handleRestart = (e: React.FormEvent) => {
    e.preventDefault();

    navigate("/");
  };

  return (
    <div className="pb-5">
      <header>
        <div className="mx-auto px-4 py-1 space-x-20 flex items-center justify-center gap-8">
          <img src={logo} className="h-12" />
          <Button
            variant="outlined"
            size="small"
            className="gap-2 bg-[#dd5a87] text-white font-bold text-[14px] hover:opacity-75"
            onClick={handleRestart}
          >
            <RotateCcw className="w-4 h-4" />
            Restart Game
          </Button>
        </div>
      </header>
    </div>
  );
};

export default Header;
