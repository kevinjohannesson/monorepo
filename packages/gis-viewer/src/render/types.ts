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
