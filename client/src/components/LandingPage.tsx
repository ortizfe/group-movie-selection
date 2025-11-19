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
      <p className="text-[#0c92d1] font-bold text-md py-5">
        Stop arguing over what to watch! Let us help you and your friend(s) on
        movie night
      </p>
      <form
        onSubmit={handleSubmit}
        className="flex flex-col items-center space-y-4 max-w-md mx-auto px-4 py-4"
      >
        <input
          type="text"
          placeholder="Enter your name"
          value={userName}
          maxLength={20}
          onChange={(e) => setUserName(e.target.value)}
          className="h-10 inline-block border-[#0c92d1] border-2 rounded-md text-center bg-white placeholder:text-gray-600 placeholder:opacity-80 text-[#0c92d1] shadow-2xl"
        />
        <button
          type="submit"
          disabled={disableButton}
          className="flex items-center text-white disabled:text-[rgba(0,0,0,1)] bg-[#dd5a87] border-[#ae487c] rounded-md disabled:opacity-50 border-2 disabled:border-[#ead02e] h-[34px] w-auto cursor-pointer text-[18px] disabled:cursor-not-allowed p-4 font-bold"
        >
          Join
        </button>
      </form>
    </div>
  );
};

export default LandingPage;
