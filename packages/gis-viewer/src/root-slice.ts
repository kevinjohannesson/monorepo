import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { combineReducers } from "@reduxjs/toolkit";
import { RootState } from "./store";
import { viewSlice, ViewSliceState } from "./instances/view/slice";
import { DEFAULT_SLICE_PREFIX } from "./constants";

interface InstanceState {
  [viewSlice.name]: ViewSliceState;
}

const combineInstanceReducers = combineReducers<InstanceState>({
  [viewSlice.name]: viewSlice.reducer,
  // ...
});

interface RootSliceState {
  instances: Record<string, InstanceState>;
}

const initialState: RootSliceState = {
  instances: {},
};

export const rootSlice = createSlice({
  name: "mappr",
  initialState,
  reducers: {
    addInstance: (state, action: PayloadAction<{ id: string }>) => {
      const { id } = action.payload;
      state.instances[id] = combineInstanceReducers(undefined, {
        type: undefined,
      });
    },
    removeInstance: (state, action: PayloadAction<{ id: string }>) => {
      const { id } = action.payload;
      delete state.instances[id];
    },
  },
  extraReducers: (builder) => {
    builder.addMatcher(
      (action) => action.type.startsWith(`${DEFAULT_SLICE_PREFIX}/`),
      (state, action) => {
        const id = action.meta.id;
        state.instances[id] = combineInstanceReducers(
          state.instances[id],
          action
        );
      }
    );
  },
});

export const { addInstance, removeInstance } = rootSlice.actions;

export const selectInstance = (id: string) => (state: RootState) =>
  state[rootSlice.name].instances[id];

export const selectIsInstanceAvailable = (id: string) => (state: RootState) =>
  !!state[rootSlice.name].instances[id];
