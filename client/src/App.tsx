// import { useState, useEffect } from 'react';
import { Typography } from "@mui/material";
import "./App.css";

import logo from "./assets/movie-matcher.png";
import gif from "./assets/monsters_fight.gif";

function App() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <img src={logo} className="logo" />
      <img src={gif} className="gif" />
      <Typography>
        Stop arguing over what to watch! Let us help you and your friend(s) pick
        the movie for tonight
      </Typography>
    </div>
  );
}

export default App;
