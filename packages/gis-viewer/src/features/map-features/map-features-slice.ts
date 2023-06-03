/// MOET VANUIT RTK QUERY KOMEN!

import { type Vector2d } from "utils";
import { createSlice } from "@reduxjs/toolkit";

export interface IMapFeature {
  location: {
    coordinates: Vector2d;
  };
}

export interface MapFeaturesState {
  features: IMapFeature[];
}

const initialState: MapFeaturesState = { features: [] };

export const mapFeaturesSlice = createSlice({
  name: `mapFeatures`,
  initialState,
  reducers: {
    // setIsInitialized: (state) => {
    //   state.isInitialized = true;
    // },
    // updateSlice: (state, { payload }: PayloadAction<Partial<ViewState>>) => {
    //   const filteredPayload = Object.entries(payload).reduce<Partial<ViewState>>(
    //     (acc, [key, value]) => {
    //       if (value !== undefined) {
    //         (acc as any)[key] = value;
    //       }
    //       return acc;
    //     },
    //     {},
    //   );
    //   Object.assign(state, {
    //     ...state,
    //     ...filteredPayload,
    //   });
    // },
    // resetSlice: (state) => {
    //   Object.assign(state, initialState);
    // },
    // updateZoomLevelToClosestInteger: (state, { payload: deltaZoom }: PayloadAction<number>) => {
    //   const {
    //     currentResolution,
    //     zoomLevelLimits,
    //     projection: { projectedExtent },
    //     dimensions,
    //   } = state;
    //   const baseResolution = calculateBaseResolution(projectedExtent, dimensions);
    //   let updatedZoomLevel = calculateUpdatedZoomLevel(
    //     baseResolution,
    //     currentResolution,
    //     deltaZoom,
    //   );
    //   if (deltaZoom < 0) {
    //     updatedZoomLevel = Math.ceil(updatedZoomLevel);
    //   } else {
    //     updatedZoomLevel = Math.floor(updatedZoomLevel);
    //   }
    //   if (isZoomLevelWithinLimits(updatedZoomLevel, zoomLevelLimits)) {
    //     state.currentResolution = calculateResolutionFromZoomLevel(
    //       baseResolution,
    //       updatedZoomLevel,
    //     );
    //   }
    // },
    // updateZoomLevel: (state, { payload: deltaZoom }: PayloadAction<number>) => {
    //   const {
    //     currentResolution,
    //     zoomLevelLimits,
    //     projection: { projectedExtent },
    //     dimensions,
    //   } = state;
    //   const baseResolution = calculateBaseResolution(projectedExtent, dimensions);
    //   const updatedZoomLevel = calculateUpdatedZoomLevel(
    //     baseResolution,
    //     currentResolution,
    //     deltaZoom,
    //   );
    //   if (isZoomLevelWithinLimits(updatedZoomLevel, zoomLevelLimits)) {
    //     state.currentResolution = calculateResolutionFromZoomLevel(
    //       baseResolution,
    //       updatedZoomLevel,
    //     );
    //   }
    // },
    // updateCenterCoordinateByPixel: (state, { payload: deltaPan }: PayloadAction<Coordinate>) => {
    //   const { currentResolution } = state;
    //   const offset = multiplyVector2d(currentResolution, deltaPan);
    //   const newCenter = addVector2d(state.centerCoordinate, offset);
    //   const [minX, minY, maxX, maxY] = state.projection.projectedExtent;
    //   if (!state.wrapping.isWrappedX) {
    //     newCenter[0] = Math.max(minX, Math.min(maxX, newCenter[0]));
    //   } else {
    //     if (newCenter[0] > maxX) {
    //       newCenter[0] = minX + (newCenter[0] - maxX);
    //     } else if (newCenter[0] < minX) {
    //       newCenter[0] = maxX - (minX - newCenter[0]);
    //     }
    //   }
    //   if (!state.wrapping.isWrappedY) {
    //     newCenter[1] = Math.max(minY, Math.min(maxY, newCenter[1]));
    //   } else {
    //     if (newCenter[1] > maxY) {
    //       newCenter[1] = minY + (newCenter[1] - maxY);
    //     } else if (newCenter[1] < minY) {
    //       newCenter[1] = maxY - (minY - newCenter[1]);
    //     }
    //   }
    //   state.centerCoordinate = newCenter;
    // },
  },
});

// export const {
//   updateSlice,
//   resetSlice,
//   updateZoomLevelToClosestInteger,
//   updateCenterCoordinateByPixel,
//   updateZoomLevel,
//   setIsInitialized,
// } = viewSlice.actions;

// export const selectViewState =
//   <T extends keyof ViewState>(key: T) =>
//   (state: GisViewerState): ViewState[T] =>
//     state[viewSlice.name][key];

// export const selectBaseResolution = (state: GisViewerState): number => {
//   const {
//     projection: { projectedExtent },
//     dimensions,
//   } = state[viewSlice.name];

//   return calculateBaseResolution(projectedExtent, dimensions);
// };

// export const selectZoomLevel = (state: GisViewerState): number => {
//   const { currentResolution } = state[viewSlice.name];

//   const baseResolution = selectBaseResolution(state);

//   return calculateZoomLevelFromResolution(baseResolution, currentResolution);
// };

// export const selectIsInitialized = (state: GisViewerState): boolean => {
//   const { isInitialized } = state[viewSlice.name];

//   return isInitialized;
// };
