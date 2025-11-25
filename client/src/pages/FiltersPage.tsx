import Header from "./components/Header";
import React, { useState } from "react";
import CustomSlider from "./components/CustomSlider";
import {
  Checkbox,
  Divider,
  FormControl,
  FormLabel,
  FormControlLabel,
  Stack,
} from "@mui/material";
import { useNavigate } from "react-router";

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
  { value: -0.75, label: "|||" },
  { value: -0.5, label: "||" },
  { value: -0.25, label: "|" },
  { value: 0, label: "Neutral" },
  { value: 0.25, label: "|" },
  { value: 0.5, label: "||" },
  { value: 0.75, label: "|||" },
  { value: 1, label: "Heavy" },
];

const emotionMarks = [
  { value: -1, label: "Comforting" },
  { value: -0.75, label: "|||" },
  { value: -0.5, label: "||" },
  { value: -0.25, label: "|" },
  { value: 0, label: "Neutral" },
  { value: 0.25, label: "|" },
  { value: 0.5, label: "||" },
  { value: 0.75, label: "|||" },
  { value: 1, label: "Challenging" },
];

const pacingMarks = [
  { value: -1, label: "Calm" },
  { value: -0.75, label: "|||" },
  { value: -0.5, label: "||" },
  { value: -0.25, label: "|" },
  { value: 0, label: "Neutral" },
  { value: 0.25, label: "|" },
  { value: 0.5, label: "||" },
  { value: 0.75, label: "|||" },
  { value: 1, label: "Intense" },
];

const FiltersPage = () => {
  const [tone, setTone] = useState(0);
  const [pacing, setPacing] = useState(0);
  const [emotion, setEmotion] = useState(0);
  const [filterPlatforms, setFilterPlatforms] = useState({
    disney: false,
    hulu: false,
    hbo: false,
    netflix: false,
    peacock: false,
    paramount: false,
    apple: false,
    prime: false,
  });

  const navigate = useNavigate();

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

  const toneSentence =
    tone < -0.5
      ? "light"
      : tone < 0
      ? "somewhat light"
      : tone === 0
      ? "neutral"
      : tone <= 0.5
      ? "somewhat heavy"
      : "heavy";

  const pacingSentence =
    pacing < -0.5
      ? "calm"
      : pacing < 0
      ? "slightly calm"
      : pacing === 0
      ? "medium-paced"
      : pacing <= 0.5
      ? "slightly fast"
      : "fast";

  const emotionalSentence =
    emotion < -0.5
      ? "comforting"
      : emotion < 0
      ? "a little comforting"
      : emotion === 0
      ? "neutral"
      : emotion <= 0.5
      ? "a little challenging"
      : "challenging";

  const onPlatformChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFilterPlatforms({
      ...filterPlatforms,
      [event.target.name]: event.target.checked,
    });
  };

  const { disney, hulu, hbo, netflix, peacock, paramount, apple, prime } =
    filterPlatforms;

  const handleSetFilters = () => {
    navigate("/swiping");
  };

  return (
    <div className="flex flex-col items-center text-center h-screen w-full">
      <Header />
      <div className="w-full">
        <div className="flex flex-col items-center gap-2 pt-2 pb-5">
          <p className="text-center text-lg font-bold text-[#0c92d1] underline underline-offset-2">
            Set the {<span className="text-[#dd5a87]">mood</span>} for tonight's
            movie
          </p>
          <div className="flex flex-col gap-2 w-[80%] text-center px-5 py-2 bg-blue-50 rounded-xl">
            <p className="font-bold text-[#0c92d1]">Tonight's story:</p>
            <p className="font-bold text-sm text-[#0c92d1]">
              "I want something{" "}
              <span className="font-bold text-[#dd5a87]">{toneSentence}</span>,{" "}
              <span className="font-bold text-[#dd5a87]">{pacingSentence}</span>
              , and{" "}
              <span className="font-bold text-[#dd5a87]">
                {emotionalSentence}
              </span>
              ."
            </p>
          </div>
        </div>
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
              <Divider variant="middle" />
            </React.Fragment>
          );
        })}
        <FormControl>
          <FormLabel className="pt-3 pb-2 font-bold text-[#0c92d1]">
            Filter by Streaming Platforms (Optional)
          </FormLabel>
          <Stack direction="row" spacing={4} className="pb-4">
            <FormControlLabel
              control={
                <Checkbox
                  checked={apple}
                  onChange={onPlatformChange}
                  name="apple"
                />
              }
              label="Apple"
              labelPlacement="bottom"
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={disney}
                  onChange={onPlatformChange}
                  name="disney"
                />
              }
              label="Disney+"
              labelPlacement="bottom"
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={hbo}
                  onChange={onPlatformChange}
                  name="hbo"
                />
              }
              label="HBO Max"
              labelPlacement="bottom"
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={hulu}
                  onChange={onPlatformChange}
                  name="hulu"
                />
              }
              label="Hulu"
              labelPlacement="bottom"
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={netflix}
                  onChange={onPlatformChange}
                  name="netflix"
                />
              }
              label="Netflix"
              labelPlacement="bottom"
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={paramount}
                  onChange={onPlatformChange}
                  name="paramount"
                />
              }
              label="Paramount+"
              labelPlacement="bottom"
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={peacock}
                  onChange={onPlatformChange}
                  name="peacock"
                />
              }
              label="Peacock"
              labelPlacement="bottom"
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={prime}
                  onChange={onPlatformChange}
                  name="prime"
                />
              }
              label="Prime Video"
              labelPlacement="bottom"
            />
          </Stack>
        </FormControl>
        <div className="flex flex-col items-center py-5">
          <button
            type="submit"
            // disabled={disabledButton}
            className="flex items-center text-white disabled:text-[rgba(0,0,0,1)] bg-[#dd5a87] border-[#ae487c] rounded-md disabled:opacity-50 border-2 disabled:border-[#ead02e] hover:opacity-70 h-[34px] w-auto cursor-pointer text-[18px] disabled:cursor-not-allowed p-4 font-bold"
            onClick={handleSetFilters}
          >
            Set
          </button>
        </div>
      </div>
    </div>
  );
};

export default FiltersPage;
