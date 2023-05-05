import { Coordinate } from "../../types";
import { assertNotNull } from "../../utils/assert";
import { RenderShapeOptions, RenderType } from "../types";
import { configureShapeStyle } from "./configure-shape-style";

export function renderPolygon(
  canvas: HTMLCanvasElement,
  points: Coordinate[],
  renderType = RenderType.FILL,
  options?: RenderShapeOptions
) {
  const context = canvas.getContext("2d");
  assertNotNull(context);

  context.beginPath();

  configureShapeStyle(context, options);

  context.moveTo(points[0][0], points[0][1]);

  for (let i = 1; i < points.length; i++) {
    context.lineTo(points[i][0], points[i][1]);
  }

  context.closePath();

  if (renderType === RenderType.FILL) {
    context.fill();
  } else if (renderType === RenderType.STROKE) {
    context.stroke();
  } else if (renderType === RenderType.FILL_AND_STROKE) {
    context.fill();
    context.stroke();
  }
}
