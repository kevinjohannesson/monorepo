import * as SlippyMapUtils from "./slippy-map-utils";
import { type Vector2d, deg2rad, multiplyVector2d } from "utils";
import proj4 from "proj4";

export interface ICurrentState {
  position: Vector2d;
  zoomLevel: number;
}

export function toTileNumbers(tilePosition: Vector2d): Vector2d {
  return tilePosition.map(Math.floor) as Vector2d;
}

export function calculatePositionX(longitude: number, tilesPerAxis: number): number {
  return tilesPerAxis * ((longitude + 180) / 360);
}

export function calculatePositionY(latitude: number, tilesPerAxis: number): number {
  return (
    (tilesPerAxis *
      (1 - Math.log(Math.tan(deg2rad(latitude)) + 1 / Math.cos(deg2rad(latitude))) / Math.PI)) /
    2
  );
}

export function calculatePositionFromLonLat(
  longitude: number,
  latitude: number,
  targetZoomLevel: number,
): Vector2d {
  const tilesPerAxis = SlippyMapUtils.calculateTileCountPerAxis(targetZoomLevel);
  return [
    calculatePositionX(longitude, tilesPerAxis),
    calculatePositionY(latitude, tilesPerAxis),
  ] as Vector2d;
}

export function calculatePositionFromProjectedSource(
  sourceCoordinates: Vector2d,
  sourceProjectionCode: string,
  targetZoomLevel: number,
): Vector2d {
  const [longitude, latitude] = proj4(sourceProjectionCode, "EPSG:4326", sourceCoordinates);

  return calculatePositionFromLonLat(longitude, latitude, targetZoomLevel);
}

export function calculatePositionAtDifferentZoomLevel(
  { position, zoomLevel }: ICurrentState,
  targetZoomLevel: number,
): Vector2d {
  if (!Number.isInteger(targetZoomLevel)) {
    throw new Error("'targetZoomLevel' must be an integer");
  }
  return multiplyVector2d(position, 2 ** (Math.floor(targetZoomLevel) - Math.floor(zoomLevel)));
}

export function calculateTileNumbersAtDifferentZoomLevel(
  currentState: ICurrentState,
  targetZoomLevel: number,
): Vector2d {
  return toTileNumbers(calculatePositionAtDifferentZoomLevel(currentState, targetZoomLevel));
}

export function isValidUrlParameters(x: number, y: number, z: number, maxZoom = 18): boolean {
  if (!Number.isInteger(x) || !Number.isInteger(y) || !Number.isInteger(z)) {
    return false;
  }

  const lastTileNumber = SlippyMapUtils.calculateLastTileNumber(z);
  if (z > maxZoom || z < 0 || x < 0 || x > lastTileNumber || y < 0 || y > lastTileNumber) {
    return false;
  }

  return true;
}

export function createTileUrl(urlTemplate: string, x: number, y: number, z: number): string {
  return urlTemplate
    .replace("{z}", z.toString())
    .replace("{x}", x.toString())
    .replace("{y}", y.toString());
}
