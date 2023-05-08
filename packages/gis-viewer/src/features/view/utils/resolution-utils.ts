import { type Dimensions, type Extent } from "../../../types";

/**
 * Calculates the base resolution of the map based on the extent and view width.
 * @param extent The map extent as [xMin, yMin, xMax, yMax].
 * @param viewWidth The width of the view.
 * @returns The base resolution value.
 */
export function calculateBaseResolution(
  [xMin, yMin, xMax, yMax]: Extent,
  [viewWidth]: Dimensions,
): number {
  const extentWidth = Math.abs(xMin) + Math.abs(xMax);
  return extentWidth / viewWidth;
}

/**
 * Calculates the map resolution for a given zoom level using the base resolution.
 * @param baseResolution The base resolution of the map.
 * @param zoomLevel The current zoom level.
 * @returns The calculated resolution value for the given zoom level.
 */
export function calculateResolutionFromZoomLevel(
  baseResolution: number,
  zoomLevel: number,
): number {
  return baseResolution / Math.pow(2, zoomLevel);
}
