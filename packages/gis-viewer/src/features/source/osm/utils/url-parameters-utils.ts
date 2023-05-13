import { type UrlParameters } from "../types";
import { calculateMaxTileNumberAtZoomLevel } from "./tile-number-utils";

export function isValidUrlParameters(urlParameters: UrlParameters): boolean {
  const { x, y, z } = urlParameters;
  const maxTileIndex = calculateMaxTileNumberAtZoomLevel(z);
  if (z > 19 || x < 0 || x > maxTileIndex || y < 0 || y > maxTileIndex) {
    return false;
  }

  return true;
}
