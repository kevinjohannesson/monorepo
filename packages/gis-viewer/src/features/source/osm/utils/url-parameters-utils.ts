import { OSM_TILES_URL } from "../constants";
import { type UrlParameters } from "../types";
import { calculateMaxTileNumberAtZoomLevel } from "./tile-number-utils";

export function isValidOsmUrlParameters(urlParameters: UrlParameters): boolean {
  const { x, y, z } = urlParameters;
  const maxTileIndex = calculateMaxTileNumberAtZoomLevel(z);
  if (z > 19 || x < 0 || x > maxTileIndex || y < 0 || y > maxTileIndex) {
    return false;
  }

  return true;
}

export function createOsmTileImageUrlParameters(x: number, y: number, z: number): UrlParameters {
  return {
    x: Math.floor(x),
    y: Math.floor(y),
    z: Math.floor(z),
  };
}

export function createOsmTileImageUrl({ x, y, z }: UrlParameters): string {
  return OSM_TILES_URL.replace("{z}", z.toString())
    .replace("{x}", x.toString())
    .replace("{y}", y.toString());
}
