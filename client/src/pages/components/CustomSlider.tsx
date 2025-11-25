import { Slider } from "@mui/material";

const CustomSlider = ({
  mood,
  value,
  setValue,
  marks,
  leftMapping,
  rightMapping,
}: {
  mood: string;
  value: number;
  setValue: (v: number) => void;
  marks: { value: number; label: string }[];
  leftMapping: string[];
  rightMapping: string[];
}) => {
  const handleChange = (event: Event, newValue: number) => {
    setValue(newValue);
  };

  return (
    <div className="px-12 mb-2 py-4">
      <div className="flex justify-between items-end mb-2">
        <label className="text-sm font-bold w-[50%] text-[#0c92d1]">
          {leftMapping.join(", ")}
        </label>
        <label className="text-lg font-bold w-full text-[#dd5a87]">
          {mood}
        </label>
        <label className="text-sm font-bold w-[50%] text-[#0c92d1]">
          {rightMapping.join(", ")}
        </label>
      </div>
      <Slider
        aria-label={mood}
        defaultValue={0}
        min={-1}
        max={1}
        step={0.25}
        value={value}
        onChange={handleChange}
        marks={marks}
      />
    </div>
  );
};

export default CustomSlider;
