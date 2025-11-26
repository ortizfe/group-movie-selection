import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export interface FiltersState {
  tone: number;
  emotion: number;
  pacing: number;
}

const initialState: FiltersState = {
  tone: 0,
  emotion: 0,
  pacing: 0,
};

export const filtersSlice = createSlice({
  name: "filters",
  initialState,
  reducers: {
    setTone: (state, action: PayloadAction<number>) => {
      state.tone = action.payload;
    },
    setEmotion: (state, action: PayloadAction<number>) => {
      state.emotion = action.payload;
    },
    setPacing: (state, action: PayloadAction<number>) => {
      state.pacing = action.payload;
    },
    resetFilters: (state) => {
      state.tone = 0;
      state.emotion = 0;
      state.pacing = 0;
    },
  },
});

export const { setTone, setEmotion, setPacing, resetFilters } =
  filtersSlice.actions;

export default filtersSlice.reducer;
