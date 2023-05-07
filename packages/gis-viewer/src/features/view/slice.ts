import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { DEFAULT_SLICE_PREFIX } from "../../constants";
import { Coordinate, Dimensions, Limits } from "../../types";
import {
  DEFAULT_CENTER_COORDINATE,
  DEFAULT_DIMENSIONS,
  DEFAULT_ZOOM_LIMITS,
  DEFAULT_PROJECTION,
} from "./constants";
import {
  calculateBaseResolution,
  calculateResolutionFromZoomLevel,
} from "./utils/resolution-utils";
import { Projection } from "../projections";
import { GisViewerState } from "../../slice";
import {
  calculateUpdatedZoomLevel,
  calculateZoomLevelFromResolution,
  isZoomLevelWithinLimits,
} from "./utils/zoom-level-utils";

export interface ViewState {
  currentResolution: number;
  centerCoordinate: Coordinate;
  dimensions: Dimensions;
  projection: Projection;
  zoomLevelLimits: Limits;
}

const initialBaseResolution = calculateBaseResolution(
  DEFAULT_PROJECTION.projectedExtent,
  DEFAULT_DIMENSIONS
);
const initialCurrentResolution = calculateResolutionFromZoomLevel(
  initialBaseResolution,
  DEFAULT_ZOOM_LIMITS[0]
);

const initialState: ViewState = {
  centerCoordinate: DEFAULT_CENTER_COORDINATE,
  currentResolution: initialCurrentResolution,
  dimensions: DEFAULT_DIMENSIONS,
  projection: DEFAULT_PROJECTION,
  zoomLevelLimits: DEFAULT_ZOOM_LIMITS,
};

export const viewSlice = createSlice({
  name: `${DEFAULT_SLICE_PREFIX}/view`,
  // name: "view",
  initialState,
  reducers: {
    updateSlice: (state, { payload }: PayloadAction<Partial<ViewState>>) => {
      Object.assign(state, {
        ...state,
        ...payload,
      });
    },

    resetSlice: (state) => {
      Object.assign(state, initialState);
    },

    updateZoomLevelToClosestInteger: (
      state,
      { payload: deltaZoom }: PayloadAction<number>
    ) => {
      const {
        currentResolution,
        zoomLevelLimits,
        projection: { projectedExtent },
        dimensions,
      } = state;

      const baseResolution = calculateBaseResolution(
        projectedExtent,
        dimensions
      );

      let updatedZoomLevel = calculateUpdatedZoomLevel(
        baseResolution,
        currentResolution,
        deltaZoom
      );

      if (deltaZoom < 0) {
        updatedZoomLevel = Math.ceil(updatedZoomLevel);
      } else {
        updatedZoomLevel = Math.floor(updatedZoomLevel);
      }

      if (isZoomLevelWithinLimits(updatedZoomLevel, zoomLevelLimits)) {
        state.currentResolution = calculateResolutionFromZoomLevel(
          baseResolution,
          updatedZoomLevel
        );
      }
    },
  },
});

export const { updateSlice, resetSlice, updateZoomLevelToClosestInteger } =
  viewSlice.actions;

export const selectViewState =
  <T extends keyof ViewState>(key: T) =>
  (state: GisViewerState) =>
    state[viewSlice.name][key];

export const selectBaseResolution = (state: GisViewerState) => {
  const {
    projection: { projectedExtent },
    dimensions,
  } = state[viewSlice.name];

  return calculateBaseResolution(projectedExtent, dimensions);
};

export const selectZoomLevel = (state: GisViewerState) => {
  const { currentResolution } = state[viewSlice.name];

  const baseResolution = selectBaseResolution(state);

  return calculateZoomLevelFromResolution(baseResolution, currentResolution);
};
