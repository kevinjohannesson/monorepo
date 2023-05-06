import { Limits } from "../../../types";

export function calculateZoomLevelFromResolution(
  baseResolution: number,
  resolution: number
): number {
  return Math.log2(baseResolution / resolution);
}

export function calculateUpdatedZoomLevel(
  baseResolution: number,
  currentResolution: number,
  deltaZoom: number
): number {
  const currentZoomLevel = calculateZoomLevelFromResolution(
    baseResolution,
    currentResolution
  );
  return currentZoomLevel + deltaZoom;
}

export function isZoomLevelWithinLimits(
  zoomLevel: number,
  [minZoomLevel, maxZoomLevel]: Limits
): boolean {
  return zoomLevel >= minZoomLevel && zoomLevel <= maxZoomLevel;
}
