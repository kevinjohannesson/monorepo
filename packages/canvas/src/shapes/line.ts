import { assertNotNull, deg2rad } from "utils";
import { configureShapeStyle } from "./configure-shape-style";
import { Coordinate, RenderShapeOptions } from "../types";

export function renderLine(
  canvas: HTMLCanvasElement,
  [startX, startY]: Coordinate,
  [endX, endY]: Coordinate,
  options?: RenderShapeOptions
) {
  const context = canvas.getContext("2d");
  assertNotNull(context);

  configureShapeStyle(context, options);

  context.beginPath();

  context.moveTo(startX, startY);
  context.lineTo(endX, endY);

  context.stroke();
}

export function renderLineAtAngle(
  canvas: HTMLCanvasElement,
  startCoordinate: Coordinate,
  length: number,
  angleInDegrees: number,
  options?: RenderShapeOptions
) {
  const context = canvas.getContext("2d");
  assertNotNull(context);

  const [startX, startY] = startCoordinate;

  const angleInRadians = deg2rad(angleInDegrees);

  const endX = startX + length * Math.cos(angleInRadians);
  const endY = startY - length * Math.sin(angleInRadians);

  renderLine(canvas, [startX, startY], [endX, endY], options);
}
