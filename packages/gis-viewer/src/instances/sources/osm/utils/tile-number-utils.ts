import proj4 from "proj4";
import { Coordinate } from "../../../../types";
import { deg2rad } from "../../../../utils/convert";

export function calculateTotalTilesPerAxisAtZoomLevel(zoomLevel: number) {
  return Math.pow(2, zoomLevel);
}

export function calculateMaxTileNumberAtZoomLevel(zoomLevel: number): number {
  return calculateTotalTilesPerAxisAtZoomLevel(zoomLevel) - 1;
}

function calculateFractionalTileNumberX(
  longitude: number,
  numberOfTilesPerAxis: number
): number {
  return numberOfTilesPerAxis * ((longitude + 180) / 360);
}

function calculateFractionalTileNumberY(
  latitude: number,
  numberOfTilesPerAxis: number
): number {
  return (
    (numberOfTilesPerAxis *
      (1 -
        Math.log(
          Math.tan(deg2rad(latitude)) + 1 / Math.cos(deg2rad(latitude))
        ) /
          Math.PI)) /
    2
  );
}

function calculateFractionalTileNumbersFromLonLat(
  [longitude, latitude]: Coordinate,
  numberOfTilesPerAxis: number
): Coordinate {
  const xFractionalTileNumber = calculateFractionalTileNumberX(
    longitude,
    numberOfTilesPerAxis
  );

  const yFractionalTileNumber = calculateFractionalTileNumberY(
    latitude,
    numberOfTilesPerAxis
  );

  return [xFractionalTileNumber, yFractionalTileNumber];
}

export function calculateFractionalTileNumbers(
  coordinate: Coordinate,
  sourceProjectionCode: string,
  zoomLevel: number
) {
  const lonLatCoordinate = proj4(sourceProjectionCode, "EPSG:4326", coordinate);

  const numberOfTilesPerAxisAtZoomLevel =
    calculateTotalTilesPerAxisAtZoomLevel(zoomLevel);

  return calculateFractionalTileNumbersFromLonLat(
    lonLatCoordinate,
    numberOfTilesPerAxisAtZoomLevel
  );
}

export function calculateTileNumbers(
  coordinate: Coordinate,
  sourceProjectionCode: string,
  zoomLevel: number
): Coordinate {
  const fractionalTileNumbers = calculateFractionalTileNumbers(
    coordinate,
    sourceProjectionCode,
    zoomLevel
  );

  return fractionalTileNumbers.map(Math.floor) as Coordinate;
}

export function calculateWrappedTileNumberX(
  urlParameterX: number,
  zoomLevel: number
) {
  const totalTilesPerAxis = calculateTotalTilesPerAxisAtZoomLevel(zoomLevel);

  const normalizedX =
    ((urlParameterX % totalTilesPerAxis) + totalTilesPerAxis) %
    totalTilesPerAxis;

  return normalizedX;
}
