import { Vector2d } from "./types";

type Vector2dOrScalar = Vector2d | number;

export function ensureVector2d(input: Vector2dOrScalar): Vector2d {
  if (typeof input === "number") {
    return [input, input];
  } else {
    return input;
  }
}

export function addVector2d(
  firstVector2d: Vector2dOrScalar,
  ...vectors: Vector2dOrScalar[]
): Vector2d {
  const initialCoord = ensureVector2d(firstVector2d);

  return vectors.reduce((acc, coord) => {
    const [accX, accY] = acc as Vector2d;
    const [x, y] = ensureVector2d(coord);
    return [accX + x, accY + y];
  }, initialCoord) as Vector2d;
}

export function subtractVector2d(
  firstVector2d: Vector2dOrScalar,
  ...vectors: Vector2dOrScalar[]
): Vector2d {
  const initialCoord = ensureVector2d(firstVector2d);

  return vectors.reduce((acc, coord) => {
    const [accX, accY] = acc as Vector2d;
    const [x, y] = ensureVector2d(coord);
    return [accX - x, accY - y];
  }, initialCoord) as Vector2d;
}

export function multiplyVector2d(
  firstVector2d: Vector2dOrScalar,
  ...vectors: Vector2dOrScalar[]
): Vector2d {
  const initialCoord = ensureVector2d(firstVector2d);

  return vectors.reduce((acc, coord) => {
    const [accX, accY] = acc as Vector2d;
    const [x, y] = ensureVector2d(coord);
    return [accX * x, accY * y];
  }, initialCoord) as Vector2d;
}

export function divideVector2d(
  firstVector2d: Vector2dOrScalar,
  ...vectors: Vector2dOrScalar[]
): Vector2d {
  const initialCoord = ensureVector2d(firstVector2d);

  return vectors.reduce((acc, coord) => {
    const [accX, accY] = acc as Vector2d;
    const [x, y] = ensureVector2d(coord);
    return [accX / x, accY / y];
  }, initialCoord) as Vector2d;
}

export function calculateCenterCoordinate([width, height]: Vector2d): Vector2d {
  return [width / 2, height / 2];
}
