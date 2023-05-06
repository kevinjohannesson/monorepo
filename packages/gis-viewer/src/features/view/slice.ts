import { createSlice } from "@reduxjs/toolkit";
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
  initialState,
  reducers: {},
});
