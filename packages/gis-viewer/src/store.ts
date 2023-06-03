import { combineReducers } from "redux";
import { configureStore } from "@reduxjs/toolkit";
import { slice } from "./slice";

const rootReducer = combineReducers({
  gisViewer: slice.reducer,
});

export const store = configureStore({
  reducer: rootReducer,
});
