import { configureStore } from "@reduxjs/toolkit";
import filtersReducer from "./filtersSlice";

const store = configureStore({
  reducer: {
    filters: filtersReducer,
    // movies: moviesReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
