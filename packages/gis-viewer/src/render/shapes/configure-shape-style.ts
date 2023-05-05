import { RenderShapeOptions } from "../types";

export function configureShapeStyle(
  context: CanvasRenderingContext2D,
  {
    fillStyle = "#737373",
    lineCap = "butt",
    lineDash = [],
    lineDashOffset = 0.0,
    lineJoin = "miter",
    lineWidth = 1,
    miterLimit = 10,
    strokeStyle = "#737373",
  }: RenderShapeOptions = {}
) {
  context.fillStyle = fillStyle;
  context.lineWidth = lineWidth;
  context.strokeStyle = strokeStyle;
  context.lineCap = lineCap;
  context.lineJoin = lineJoin;
  context.miterLimit = miterLimit;
  context.setLineDash(lineDash);
  context.lineDashOffset = lineDashOffset;
}
