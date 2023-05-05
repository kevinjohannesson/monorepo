import { Coordinate, Dimensions } from "../types";

type CoordinateOrNumber = Coordinate | number;

function ensureCoordinate(input: CoordinateOrNumber): Coordinate {
  if (typeof input === "number") {
    return [input, input];
  } else {
    return input;
  }
}

export function addCoordinates(
  firstCoordinate: CoordinateOrNumber,
  ...coordinates: CoordinateOrNumber[]
): Coordinate {
  const initialCoord = ensureCoordinate(firstCoordinate);

  return coordinates.reduce((acc, coord) => {
    const [accX, accY] = acc as Coordinate;
    const [x, y] = ensureCoordinate(coord);
    return [accX + x, accY + y];
  }, initialCoord) as Coordinate;
}

export function subtractCoordinates(
  firstCoordinate: CoordinateOrNumber,
  ...coordinates: CoordinateOrNumber[]
): Coordinate {
  const initialCoord = ensureCoordinate(firstCoordinate);

  return coordinates.reduce((acc, coord) => {
    const [accX, accY] = acc as Coordinate;
    const [x, y] = ensureCoordinate(coord);
    return [accX - x, accY - y];
  }, initialCoord) as Coordinate;
}

export function multiplyCoordinates(
  firstCoordinate: CoordinateOrNumber,
  ...coordinates: CoordinateOrNumber[]
): Coordinate {
  const initialCoord = ensureCoordinate(firstCoordinate);

  return coordinates.reduce((acc, coord) => {
    const [accX, accY] = acc as Coordinate;
    const [x, y] = ensureCoordinate(coord);
    return [accX * x, accY * y];
  }, initialCoord) as Coordinate;
}

export function divideCoordinates(
  firstCoordinate: CoordinateOrNumber,
  ...coordinates: CoordinateOrNumber[]
): Coordinate {
  const initialCoord = ensureCoordinate(firstCoordinate);

  return coordinates.reduce((acc, coord) => {
    const [accX, accY] = acc as Coordinate;
    const [x, y] = ensureCoordinate(coord);
    return [accX / x, accY / y];
  }, initialCoord) as Coordinate;
}

export function calculateCenterCoordinate([
  width,
  height,
]: Dimensions): Coordinate {
  return [width / 2, height / 2];
}
