import Header from "./components/Header";
import React, { useState } from "react";
import CustomSlider from "./components/CustomSlider";

const MAPPING = {
  light: ["Comedy", "Animation", "Family", "Adventure"],
  heavy: ["Drama", "Crime", "War", "History", "Biography"],
  calm: ["Drama", "Romance", "Documentary"],
  intense: ["Action", "Thriller", "Horror", "Mystery"],
  comforting: ["Family", "Comedy", "Romance"],
  challenging: ["History", "War", "Mystery", "Science Fiction", "Sci-Fi"],
};

const toneMarks = [
  { value: -1, label: "Light" },
  { value: 0, label: "Neutral" },
  { value: 1, label: "Heavy" },
];

const emotionMarks = [
  { value: -1, label: "Comforting" },
  { value: 0, label: "Neutral" },
  { value: 1, label: "Challenging" },
];

const pacingMarks = [
  { value: -1, label: "Calm" },
  { value: 0, label: "Neutral" },
  { value: 1, label: "Intense" },
];

const FiltersPage = () => {
  const [tone, setTone] = useState(0);
  const [pacing, setPacing] = useState(0);
  const [emotion, setEmotion] = useState(0);

  const handleTone = (t: number) => {
    setTone(t);
  };

  const handlePacing = (p: number) => {
    setPacing(p);
  };

  const handleEmotion = (e: number) => {
    setEmotion(e);
  };

  const MOODS = [
    {
      mood: "Overall tone",
      value: tone,
      setValue: handleTone,
      marks: toneMarks,
      mapping: {
        left: MAPPING.light,
        right: MAPPING.heavy,
      },
    },
    {
      mood: "Pacing",
      value: pacing,
      setValue: handlePacing,
      marks: pacingMarks,
      mapping: {
        left: MAPPING.calm,
        right: MAPPING.intense,
      },
    },
    {
      mood: "Emotional feel",
      value: emotion,
      setValue: handleEmotion,
      marks: emotionMarks,
      mapping: {
        left: MAPPING.comforting,
        right: MAPPING.challenging,
      },
    },
  ];

  return (
    <div className="min-h-screen w-full">
      <Header />
      <div className="">
        {MOODS.map((mood, i) => {
          return (
            <React.Fragment key={i}>
              <CustomSlider
                mood={mood.mood}
                value={mood.value}
                setValue={mood.setValue}
                marks={mood.marks}
                leftMapping={mood.mapping.left}
                rightMapping={mood.mapping.right}
              />
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};

export default FiltersPage;
