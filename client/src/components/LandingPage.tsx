import logo from "../assets/movie-matcher.png";
import gif from "../assets/monsters_fight.gif";
import { useState } from "react";
import { useNavigate } from "react-router";

const LandingPage = () => {
  const [userName, setUserName] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (userName.trim()) {
      alert(
        `Welcome ${userName}! You have joined the The Fantastic Four group`
      );
    }

    navigate("/moodsIn");
  };

  const disableButton = !userName.trim();

  return (
    <div className="absolute w-[90%] h-full max-w-[380px] min-h-[450px] box-border p-4">
      <img src={logo} />
      <img src={gif} />
      <p className="text-[#0c92d1] font-bold text-md">
        Stop arguing over what to watch! Let us help you and your friend(s) pick
        the movie for tonight
      </p>
      <form
        onSubmit={handleSubmit}
        className="flex flex-col items-center space-y-4 max-w-md mx-auto px-4 py-5"
      >
        <input
          type="text"
          placeholder="Enter your name"
          value={userName}
          maxLength={20}
          onChange={(e) => setUserName(e.target.value)}
          className="h-10 inline-block border-[#0c92d1] border-2 rounded-md text-center bg-white placeholder:text-gray-600 placeholder:opacity-60 text-[#0c92d1] shadow-2xl"
        />
        <button
          type="submit"
          disabled={disableButton}
          className="flex items-center rounded-md disabled:opacity-40 border-2 disabled:border-[#ead02e] h-[34px] w-auto active:cursor-default text-[18px] disabled:hover:border-[#ead02e] "
        >
          Join
        </button>
      </form>
    </div>
  );
};

export default LandingPage;
