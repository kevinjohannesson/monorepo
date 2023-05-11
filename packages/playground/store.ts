import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import { combineReducers } from "redux";
import { slice } from "gis-viewer/src/slice";

const rootReducer = combineReducers({
  gisViewer: slice.reducer,
});

export const store = configureStore({
  reducer: rootReducer,
});
