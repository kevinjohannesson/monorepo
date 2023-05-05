import { Dimensions, Extent } from "../../../types";

export function calculateBaseResolution(
  [xMin, yMin, xMax, yMax]: Extent,
  [viewWidth]: Dimensions
): number {
  const extentWidth = Math.abs(xMin) + Math.abs(xMax);
  return extentWidth / viewWidth;
}

export function calculateResolutionFromZoomLevel(
  baseResolution: number,
  zoomLevel: number
): number {
  return baseResolution / Math.pow(2, zoomLevel);
}
