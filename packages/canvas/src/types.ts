import { Vector2d } from "utils";

export type Coordinate = Vector2d;
export type Dimensions = Vector2d;

export enum RenderType {
  FILL,
  STROKE,
  FILL_AND_STROKE,
}

export interface RenderShapeOptions {
  fillStyle?: string;
  lineWidth?: number;
  strokeStyle?: string;
  lineCap?: CanvasLineCap;
  lineDash?: number[];
  lineDashOffset?: number;
  lineJoin?: CanvasLineJoin;
  miterLimit?: number;
}
