import { type UrlParameters } from "../types";
import { calculateMaxTileNumberAtZoomLevel } from "./tile-number-utils";

export function isValidUnwrappedUrlParameters(
  urlParameters: UrlParameters,
): boolean {
  const { x, y, z } = urlParameters;
  const maxTileIndex = calculateMaxTileNumberAtZoomLevel(z);

  if (x < 0 || x > maxTileIndex || y < 0 || y > maxTileIndex) {
    return false;
  }

  return true;
}

export function isValidWrappedUrlParameters(
  urlParameters: UrlParameters,
): boolean {
  const { y, z } = urlParameters;
  const maxTileIndex = calculateMaxTileNumberAtZoomLevel(z);

  if (y < 0 || y > maxTileIndex) {
    return false;
  }

  return true;
}

export function isValidUrlParameters(
  urlParameters: UrlParameters,
  isWrapped: boolean,
): boolean {
  return (
    (isWrapped && isValidWrappedUrlParameters(urlParameters)) ||
    isValidUnwrappedUrlParameters(urlParameters)
  );
}
