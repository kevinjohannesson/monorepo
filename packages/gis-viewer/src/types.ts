import { Vector2d } from "utils";

/** Coordinate vector2d: [x, y] | [longitude, latitude] */
export type Coordinate = Vector2d;

/** Dimensions vector2d: [width, height] */
export type Dimensions = Vector2d;

/** Limits vector2d: [min, max] */
export type Limits = Vector2d;

/** Extent vector2d: [xMin, yMin, xMax, yMax] */
export type Extent = [number, number, number, number];
