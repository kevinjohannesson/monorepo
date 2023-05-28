import { type Limits } from "../../../types";

export function calculateZoomLevelFromResolution(
  baseResolution: number,
  resolution: number,
): number {
  return Math.log2(baseResolution / resolution);
}

export function calculateUpdatedZoomLevel(
  baseResolution: number,
  currentResolution: number,
  deltaZoom: number,
): number {
  const currentZoomLevel = calculateZoomLevelFromResolution(baseResolution, currentResolution);
  return currentZoomLevel + deltaZoom;
}

export function isZoomLevelWithinLimits(
  zoomLevel: number,
  [minZoomLevel, maxZoomLevel]: Limits,
): boolean {
  const zoomLevelInt = Math.round(zoomLevel * 100);
  const minZoomLevelInt = Math.round(minZoomLevel * 100);
  const maxZoomLevelInt = Math.round(maxZoomLevel * 100);
  return zoomLevelInt >= minZoomLevelInt && zoomLevelInt <= maxZoomLevelInt;
}
