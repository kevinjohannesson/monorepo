import { Coordinate, Dimensions } from "../../types";
import { assertNotNull } from "../../utils/assert";
import { RenderShapeOptions, RenderType } from "../types";
import { configureShapeStyle } from "./configure-shape-style";

export function renderRectangle(
  canvas: HTMLCanvasElement,
  [x, y]: Coordinate,
  [width, height]: Dimensions,
  renderType = RenderType.FILL,
  options?: RenderShapeOptions
) {
  const context = canvas.getContext("2d");
  assertNotNull(context);

  context.beginPath();

  configureShapeStyle(context, options);

  context.rect(x, y, width, height);

  if (renderType === RenderType.FILL) {
    context.fill();
  } else if (renderType === RenderType.STROKE) {
    context.stroke();
  } else if (renderType === RenderType.FILL_AND_STROKE) {
    context.fill();
    context.stroke();
  }
}
