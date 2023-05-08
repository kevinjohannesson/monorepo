import { type Coordinate, type Dimensions, type Limits } from "../../types";
import { EPSG_3857 } from "../projections/epsg3857";
import { type Projection } from "../projections";

export const DEFAULT_ZOOM_LIMITS: Limits = [0, 19];
export const DEFAULT_CENTER_COORDINATE: Coordinate = [0, 0];
export const DEFAULT_DIMENSIONS: Dimensions = [600, 300];
export const DEFAULT_PROJECTION: Projection = EPSG_3857;
export const DEFAULT_IS_WRAPPED_X = true;
export const DEFAULT_IS_WRAPPED_Y = false;
