import { type Coordinate, type Dimensions } from "../../../../types";
import { type Vector2d, deg2rad, multiplyVector2d } from "utils";
import proj4 from "proj4";

export const TILE_SIZE = 256;
/** @deprecated see "utils" package */
export function calculateNextPowerOf2(x: number): number {
  // https://stackoverflow.com/questions/466204/rounding-up-to-next-power-of-2
  return 1 << Math.ceil(Math.log2(x));
}

/** @deprecated see "utils" package  */
export function calculatePreviousPowerOf2(x: number): number {
  return 1 << Math.floor(Math.log2(x));
}

/** @deprecated see "utils" package */
export function calculateClosestPowerOf2(x: number): number {
  const nextPowerOf2 = calculateNextPowerOf2(x);
  const prevPowerOf2 = calculatePreviousPowerOf2(x);

  const distanceToNext = Math.abs(nextPowerOf2 - x);
  const distanceToPrev = Math.abs(prevPowerOf2 - x);

  return distanceToNext < distanceToPrev ? nextPowerOf2 : prevPowerOf2;
}

export function calculateOsmZoomBaseLevel([width, height]: Dimensions): number {
  const viewSize = Math.max(width, height);
  const totalTilesOnAxis = viewSize / TILE_SIZE;
  const totalTilesOnOsm = calculateNextPowerOf2(Math.ceil(totalTilesOnAxis));
  const osmZoomLevel = Math.log2(totalTilesOnOsm);
  return osmZoomLevel;
}

export function calculateOsmZoomBaseLevel2(viewWidth: number): number {
  // const viewSize = Math.max(width, height);
  const totalTilesOnAxis = viewWidth / TILE_SIZE;

  const nextTotalTilesOnOsm = calculateNextPowerOf2(Math.ceil(totalTilesOnAxis));
  const prevTotalTilesOnOsm = calculatePreviousPowerOf2(Math.ceil(totalTilesOnAxis));

  const nextScalingFactor = (nextTotalTilesOnOsm * TILE_SIZE) / viewWidth;
  const prevScalingFactor = (prevTotalTilesOnOsm * TILE_SIZE) / viewWidth;
  const closestScalingFactor =
    Math.abs(1 - nextScalingFactor) <= Math.abs(1 - prevScalingFactor)
      ? nextScalingFactor
      : prevScalingFactor;

  const totalTilesOnOsm =
    closestScalingFactor === nextScalingFactor ? nextTotalTilesOnOsm : prevTotalTilesOnOsm;

  const osmZoomLevel = Math.log2(totalTilesOnOsm);
  return osmZoomLevel;
}

export function calculateTotalTilesPerAxisAtZoomLevel(zoomLevel: number): number {
  return Math.pow(2, zoomLevel);
}

export function calculateMaxTileNumberAtZoomLevel(zoomLevel: number): number {
  return calculateTotalTilesPerAxisAtZoomLevel(zoomLevel) - 1;
}

function calculateFractionalTileNumberX(longitude: number, numberOfTilesPerAxis: number): number {
  return numberOfTilesPerAxis * ((longitude + 180) / 360);
}

function calculateFractionalTileNumberY(latitude: number, numberOfTilesPerAxis: number): number {
  return (
    (numberOfTilesPerAxis *
      (1 - Math.log(Math.tan(deg2rad(latitude)) + 1 / Math.cos(deg2rad(latitude))) / Math.PI)) /
    2
  );
}

function calculateFractionalTileNumbersFromLonLat(
  [longitude, latitude]: Coordinate,
  numberOfTilesPerAxis: number,
): Coordinate {
  const xFractionalTileNumber = calculateFractionalTileNumberX(longitude, numberOfTilesPerAxis);

  const yFractionalTileNumber = calculateFractionalTileNumberY(latitude, numberOfTilesPerAxis);

  return [xFractionalTileNumber, yFractionalTileNumber];
}

export function calculateFractionalTileNumbers(
  coordinate: Coordinate,
  sourceProjectionCode: string,
  zoomLevel: number,
): Coordinate {
  const lonLatCoordinate = proj4(sourceProjectionCode, "EPSG:4326", coordinate);

  const numberOfTilesPerAxisAtZoomLevel = calculateTotalTilesPerAxisAtZoomLevel(zoomLevel);

  return calculateFractionalTileNumbersFromLonLat(
    lonLatCoordinate,
    numberOfTilesPerAxisAtZoomLevel,
  );
}
// rename to calculateOsmTileNumbers?
export function calculateTileNumbers(
  coordinate: Coordinate,
  sourceProjectionCode: string,
  zoomLevel: number,
): Coordinate {
  const fractionalTileNumbers = calculateFractionalTileNumbers(
    coordinate,
    sourceProjectionCode,
    zoomLevel,
  );

  return fractionalTileNumbers.map(Math.floor) as Coordinate;
}

export function calculateWrappedTileNumberX(urlParameterX: number, zoomLevel: number): number {
  const totalTilesPerAxis = calculateTotalTilesPerAxisAtZoomLevel(zoomLevel);

  const normalizedX = ((urlParameterX % totalTilesPerAxis) + totalTilesPerAxis) % totalTilesPerAxis;

  return normalizedX;
}

export function toWholeTileNumbers(fractionalTileNumbers: Vector2d): Vector2d {
  return fractionalTileNumbers.map(Math.floor) as Vector2d;
}

export function toWholeZoomLevel(fractionalZoomLevel: number): number {
  return Math.floor(fractionalZoomLevel);
}

export function calculateZoomLevelScaleFactor(
  originalZoomLevel: number,
  targetZoomLevel: number,
): number {
  const zoomDifference = targetZoomLevel - originalZoomLevel;
  return Math.pow(2, zoomDifference);
}

export function calculateZoomAdjustedTileDimensions(
  tileDimensions: Vector2d,
  originalZoomLevel: number,
  targetZoomLevel: number,
): Vector2d {
  const scaleFactor = calculateZoomLevelScaleFactor(originalZoomLevel, targetZoomLevel);
  return multiplyVector2d(scaleFactor, tileDimensions);
}
