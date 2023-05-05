import { combineReducers, configureStore } from "@reduxjs/toolkit";
import { rootSlice } from "./root-slice";

export const getDefaultReducers = () => ({
  [rootSlice.name]: rootSlice.reducer,
});

const rootReducer = combineReducers(getDefaultReducers());

export const store = configureStore({
  reducer: rootReducer,
});

export type RootState = ReturnType<typeof store.getState>;

export type RootDispatch = typeof store.dispatch;

export type InstanceState =
  RootState[typeof rootSlice.name]["instances"][string];
