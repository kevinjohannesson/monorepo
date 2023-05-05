import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { DEFAULT_SLICE_PREFIX } from "../../constants";
import { InstanceState } from "../../store";
import { Coordinate, Dimensions, Limits } from "../../types";
import { EPSG_3857 } from "../projections/epsg3857";
import {
  DEFAULT_CENTER_COORDINATE,
  DEFAULT_DIMENSIONS,
  DEFAULT_MAX_ZOOM_LEVEL,
  DEFAULT_MIN_ZOOM_LEVEL,
} from "./constants";
import {
  calculateBaseResolution,
  calculateResolutionFromZoomLevel,
} from "./utils/resolution-utils";
import {
  calculateUpdatedZoomLevel,
  calculateZoomLevelFromResolution,
  isZoomLevelWithinLimits,
} from "./utils/zoom-level-utils";
import { Projection } from "../projections";
import { addCoordinates, multiplyCoordinates } from "../../utils/coordinate";

export interface ViewSliceState {
  // baseResolution: number;
  currentResolution: number;
  centerCoordinate: Coordinate;
  zoomLevelLimits: Limits;
  dimensions: Dimensions;
  projection: Projection;
}

const initialBaseResolution = calculateBaseResolution(
  EPSG_3857.projectedExtent,
  DEFAULT_DIMENSIONS
);
const initialCurrentResolution = calculateResolutionFromZoomLevel(
  initialBaseResolution,
  DEFAULT_MIN_ZOOM_LEVEL
);

const initialState: ViewSliceState = {
  // baseResolution: initialBaseResolution,
  centerCoordinate: DEFAULT_CENTER_COORDINATE,
  currentResolution: initialCurrentResolution,
  dimensions: DEFAULT_DIMENSIONS,
  projection: EPSG_3857,
  zoomLevelLimits: [DEFAULT_MIN_ZOOM_LEVEL, DEFAULT_MAX_ZOOM_LEVEL],
};

export const viewSlice = createSlice({
  name: `${DEFAULT_SLICE_PREFIX}/view`,
  initialState,
  reducers: {
    updateSlice: (
      state,
      { payload }: PayloadAction<Partial<ViewSliceState>>
    ) => {
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

    updateZoomLevel: (state, { payload: deltaZoom }: PayloadAction<number>) => {
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

      const updatedZoomLevel = calculateUpdatedZoomLevel(
        baseResolution,
        currentResolution,
        deltaZoom
      );

      if (isZoomLevelWithinLimits(updatedZoomLevel, zoomLevelLimits)) {
        state.currentResolution = calculateResolutionFromZoomLevel(
          baseResolution,
          updatedZoomLevel
        );
      }
      // else {
      //   console.warn(
      //     "A caller is trying to update the zoom level to a zoom level that is outside the bounds set by `minZoom` and `maxZoom`. This is not allowed."
      //   );
      // }
    },

    updateCenterCoordinateByPixel: (
      state,
      { payload: deltaPan }: PayloadAction<Coordinate>
    ) => {
      const { currentResolution } = state;

      const offset = multiplyCoordinates(currentResolution, deltaPan);

      state.centerCoordinate = addCoordinates(state.centerCoordinate, offset);
    },
  },
});

export const {
  updateSlice,
  resetSlice,
  updateZoomLevel,
  updateCenterCoordinateByPixel,
  updateZoomLevelToClosestInteger,
} = viewSlice.actions;

export const selectViewState =
  <T extends keyof ViewSliceState>(key: T) =>
  (state: InstanceState) =>
    state[viewSlice.name][key];

export const selectZoomLevel = (state: InstanceState) => {
  const {
    currentResolution,
    projection: { projectedExtent },
    dimensions,
  } = state[viewSlice.name];

  const baseResolution = calculateBaseResolution(projectedExtent, dimensions);

  return calculateZoomLevelFromResolution(baseResolution, currentResolution);
};
