import { type Coordinate, type Dimensions, type Limits } from "../../types";
import {
  DEFAULT_CENTER_COORDINATE,
  DEFAULT_DIMENSIONS,
  DEFAULT_IS_WRAPPED_X,
  DEFAULT_IS_WRAPPED_Y,
  DEFAULT_PROJECTION,
  DEFAULT_ZOOM_LIMITS,
} from "./constants";
import { DEFAULT_SLICE_PREFIX } from "../../constants";
import { type GisViewerState } from "../../slice";
import { type PayloadAction, createSlice } from "@reduxjs/toolkit";
import { type Projection } from "../projections";
import { addVector2d, multiplyVector2d } from "utils";
import {
  calculateBaseResolution,
  calculateResolutionFromZoomLevel,
} from "./utils/resolution-utils";
import {
  calculateUpdatedZoomLevel,
  calculateZoomLevelFromResolution,
  isZoomLevelWithinLimits,
} from "./utils/zoom-level-utils";

export interface ViewWrapping {
  isWrappedX: boolean;
  isWrappedY: boolean;
}

export interface ViewState {
  currentResolution: number;
  centerCoordinate: Coordinate;
  dimensions: Dimensions;
  projection: Projection;
  zoomLevelLimits: Limits;
  wrapping: ViewWrapping;
}

const initialBaseResolution = calculateBaseResolution(
  DEFAULT_PROJECTION.projectedExtent,
  DEFAULT_DIMENSIONS,
);
const initialCurrentResolution = calculateResolutionFromZoomLevel(
  initialBaseResolution,
  DEFAULT_ZOOM_LIMITS[0],
);

const initialState: ViewState = {
  centerCoordinate: DEFAULT_CENTER_COORDINATE,
  currentResolution: initialCurrentResolution,
  dimensions: DEFAULT_DIMENSIONS,
  projection: DEFAULT_PROJECTION,
  zoomLevelLimits: DEFAULT_ZOOM_LIMITS,
  wrapping: {
    isWrappedX: DEFAULT_IS_WRAPPED_X,
    isWrappedY: DEFAULT_IS_WRAPPED_Y,
  },
};

export const viewSlice = createSlice({
  name: `${DEFAULT_SLICE_PREFIX}/view`,
  // name: "view",
  initialState,
  reducers: {
    updateSlice: (state, { payload }: PayloadAction<Partial<ViewState>>) => {
      const filteredPayload = Object.entries(payload).reduce<
        Partial<ViewState>
      >((acc, [key, value]) => {
        if (value !== undefined) {
          (acc as any)[key] = value;
        }
        return acc;
      }, {});

      Object.assign(state, {
        ...state,
        ...filteredPayload,
      });
    },

    resetSlice: (state) => {
      Object.assign(state, initialState);
    },

    updateZoomLevelToClosestInteger: (
      state,
      { payload: deltaZoom }: PayloadAction<number>,
    ) => {
      const {
        currentResolution,
        zoomLevelLimits,
        projection: { projectedExtent },
        dimensions,
      } = state;

      const baseResolution = calculateBaseResolution(
        projectedExtent,
        dimensions,
      );

      let updatedZoomLevel = calculateUpdatedZoomLevel(
        baseResolution,
        currentResolution,
        deltaZoom,
      );

      if (deltaZoom < 0) {
        updatedZoomLevel = Math.ceil(updatedZoomLevel);
      } else {
        updatedZoomLevel = Math.floor(updatedZoomLevel);
      }

      if (isZoomLevelWithinLimits(updatedZoomLevel, zoomLevelLimits)) {
        state.currentResolution = calculateResolutionFromZoomLevel(
          baseResolution,
          updatedZoomLevel,
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
        dimensions,
      );

      const updatedZoomLevel = calculateUpdatedZoomLevel(
        baseResolution,
        currentResolution,
        deltaZoom,
      );

      if (isZoomLevelWithinLimits(updatedZoomLevel, zoomLevelLimits)) {
        state.currentResolution = calculateResolutionFromZoomLevel(
          baseResolution,
          updatedZoomLevel,
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
      { payload: deltaPan }: PayloadAction<Coordinate>,
    ) => {
      const { currentResolution } = state;

      const offset = multiplyVector2d(currentResolution, deltaPan);

      state.centerCoordinate = addVector2d(state.centerCoordinate, offset);
    },
  },
});

export const {
  updateSlice,
  resetSlice,
  updateZoomLevelToClosestInteger,
  updateCenterCoordinateByPixel,
  updateZoomLevel,
} = viewSlice.actions;

export const selectViewState =
  <T extends keyof ViewState>(key: T) =>
  (state: GisViewerState): ViewState[T] =>
    state[viewSlice.name][key];

export const selectBaseResolution = (state: GisViewerState): number => {
  const {
    projection: { projectedExtent },
    dimensions,
  } = state[viewSlice.name];

  return calculateBaseResolution(projectedExtent, dimensions);
};

export const selectZoomLevel = (state: GisViewerState): number => {
  const { currentResolution } = state[viewSlice.name];

  const baseResolution = selectBaseResolution(state);

  return calculateZoomLevelFromResolution(baseResolution, currentResolution);
};
