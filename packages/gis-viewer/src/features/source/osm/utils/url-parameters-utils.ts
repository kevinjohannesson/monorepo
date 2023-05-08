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
// Ik denk dat hier geen "is wrapped" check meer nodig is, als de functie wordt aangeroepen
// met parameters die al (optioneel) wrapped zijn. In dat geval checken we gewoon enkel de normale check
export function isValidUrlParameters(
  urlParameters: UrlParameters,
  isWrapped: boolean,
): boolean {
  return (
    (isWrapped && isValidWrappedUrlParameters(urlParameters)) ||
    isValidUnwrappedUrlParameters(urlParameters)
  );
}
