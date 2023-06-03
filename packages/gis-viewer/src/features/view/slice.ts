import { type Coordinate, type Dimensions, type Limits } from "../../types";
import {
  DEFAULT_CENTER_COORDINATE,
  DEFAULT_DIMENSIONS,
  DEFAULT_IS_WRAPPED_X,
  DEFAULT_IS_WRAPPED_Y,
  DEFAULT_PROJECTION,
  DEFAULT_ZOOM_LIMITS,
} from "./constants";
import { type GisViewerState } from "../../slice";
import { type PayloadAction, createSlice } from "@reduxjs/toolkit";
import { type Projection } from "../projections";
import { type Vector2d, addVector2d, multiplyVector2d } from "utils";
import {
  calculateBaseResolution,
  calculateResolutionFromZoomLevel,
} from "./utils/resolution-utils";
import { calculateProjectedExtent } from "./hooks/use-view-extent";
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
  isInitialized: boolean;
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
  isInitialized: false,
};

export const viewSlice = createSlice({
  name: `view`,
  // name: "view",
  initialState,
  reducers: {
    setIsInitialized: (state) => {
      state.isInitialized = true;
    },
    updateSlice: (state, { payload }: PayloadAction<Partial<ViewState>>) => {
      const filteredPayload = Object.entries(payload).reduce<Partial<ViewState>>(
        (acc, [key, value]) => {
          if (value !== undefined) {
            (acc as any)[key] = value;
          }
          return acc;
        },
        {},
      );

      Object.assign(state, {
        ...state,
        ...filteredPayload,
      });
    },

    resetSlice: (state) => {
      Object.assign(state, initialState);
    },

    updateZoomLevelToClosestInteger: (state, { payload: deltaZoom }: PayloadAction<number>) => {
      const {
        currentResolution,
        zoomLevelLimits,
        projection: { projectedExtent },
        dimensions,
      } = state;

      const baseResolution = calculateBaseResolution(projectedExtent, dimensions);

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

    // This action handler updates the zoom level while preserving the position of a specified point on the map.
    // It begins by calculating the map coordinates corresponding to the specified point (pixelOriginForZoom) in the map's current resolution.
    // Then, it computes what the new zoom level and resolution would be based on the requested change in zoom level (deltaZoom).
    // If the updated zoom level falls within the allowed limits, it proceeds to calculate what map coordinates the specified point would correspond to in the new resolution.
    // Lastly, it calculates the shift in map coordinates that the specified point undergoes between the current resolution and the new resolution.
    // This shift is used to adjust the center coordinate of the map view, ensuring that the specified point retains its original position on the screen during the zoom operation.
    updateZoomLevelPreservingPointPosition: (
      state,
      {
        payload: { deltaZoom, pixelOriginForZoom },
      }: PayloadAction<{ deltaZoom: number; pixelOriginForZoom: Vector2d }>,
    ) => {
      const {
        centerCoordinate,
        currentResolution,
        zoomLevelLimits,
        projection: { projectedExtent },
        dimensions,
      } = state;

      const currentViewExtent = calculateProjectedExtent(
        centerCoordinate,
        currentResolution,
        dimensions,
      );

      const pointInCurrentResolution = [
        currentViewExtent[0] + pixelOriginForZoom[0] * currentResolution,
        currentViewExtent[1] + pixelOriginForZoom[1] * currentResolution,
      ];

      const baseResolution = calculateBaseResolution(projectedExtent, dimensions);

      const updatedZoomLevel = calculateUpdatedZoomLevel(
        baseResolution,
        currentResolution,
        deltaZoom,
      );

      if (isZoomLevelWithinLimits(updatedZoomLevel, zoomLevelLimits)) {
        const newResolution = calculateResolutionFromZoomLevel(baseResolution, updatedZoomLevel);

        const newViewExtent = calculateProjectedExtent(centerCoordinate, newResolution, dimensions);

        const pointInNewResolution = [
          newViewExtent[0] + pixelOriginForZoom[0] * newResolution,
          newViewExtent[1] + pixelOriginForZoom[1] * newResolution,
        ];

        const shiftInCoordinates: Vector2d = [
          pointInCurrentResolution[0] - pointInNewResolution[0],
          pointInCurrentResolution[1] - pointInNewResolution[1],
        ];

        state.currentResolution = newResolution;
        state.centerCoordinate = [
          state.centerCoordinate[0] + shiftInCoordinates[0],
          state.centerCoordinate[1] - shiftInCoordinates[1],
        ];
      }
    },

    updateZoomLevel: (state, { payload: deltaZoom }: PayloadAction<number>) => {
      const {
        currentResolution,
        zoomLevelLimits,
        projection: { projectedExtent },
        dimensions,
      } = state;

      const baseResolution = calculateBaseResolution(projectedExtent, dimensions);

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
    },

    updateCenterCoordinateByPixel: (state, { payload: deltaPan }: PayloadAction<Coordinate>) => {
      const { currentResolution } = state;

      const offset = multiplyVector2d(currentResolution, deltaPan);

      const newCenter = addVector2d(state.centerCoordinate, offset);

      const [minX, minY, maxX, maxY] = state.projection.projectedExtent;

      if (!state.wrapping.isWrappedX) {
        newCenter[0] = Math.max(minX, Math.min(maxX, newCenter[0]));
      } else {
        if (newCenter[0] > maxX) {
          newCenter[0] = minX + (newCenter[0] - maxX);
        } else if (newCenter[0] < minX) {
          newCenter[0] = maxX - (minX - newCenter[0]);
        }
      }

      if (!state.wrapping.isWrappedY) {
        newCenter[1] = Math.max(minY, Math.min(maxY, newCenter[1]));
      } else {
        if (newCenter[1] > maxY) {
          newCenter[1] = minY + (newCenter[1] - maxY);
        } else if (newCenter[1] < minY) {
          newCenter[1] = maxY - (minY - newCenter[1]);
        }
      }

      state.centerCoordinate = newCenter;
    },
  },
});

export const {
  updateSlice,
  resetSlice,
  updateZoomLevelToClosestInteger,
  updateCenterCoordinateByPixel,
  updateZoomLevel,
  setIsInitialized,
  updateZoomLevelPreservingPointPosition,
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

export const selectIsInitialized = (state: GisViewerState): boolean => {
  const { isInitialized } = state[viewSlice.name];

  return isInitialized;
};
