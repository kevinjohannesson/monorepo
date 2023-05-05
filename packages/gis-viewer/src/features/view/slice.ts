import { createSlice } from "@reduxjs/toolkit";
import { DEFAULT_SLICE_PREFIX } from "../../constants";
import { Coordinate, Dimensions, Limits } from "../../types";
import { DEFAULT_CENTER_COORDINATE, DEFAULT_DIMENSIONS } from "./constants";

export interface ViewState {
  // currentResolution: number;
  centerCoordinate: Coordinate;
  // zoomLevelLimits: Limits;
  dimensions: Dimensions;
  // projection: Projection;
}

const initialState: ViewState = {
  // baseResolution: initialBaseResolution,
  centerCoordinate: DEFAULT_CENTER_COORDINATE,
  // currentResolution: initialCurrentResolution,
  dimensions: DEFAULT_DIMENSIONS,
  // projection: EPSG_3857,
  // zoomLevelLimits: [DEFAULT_MIN_ZOOM_LEVEL, DEFAULT_MAX_ZOOM_LEVEL],
};

export const viewSlice = createSlice({
  name: `${DEFAULT_SLICE_PREFIX}/view`,
  initialState,
  reducers: {},
});
