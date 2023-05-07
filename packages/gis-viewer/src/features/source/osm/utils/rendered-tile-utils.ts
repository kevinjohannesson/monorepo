import { multiplyVector2d, subtractVector2d } from "utils";
import { Coordinate } from "../../../../types";

export function calculateRenderedTileCenterOffset(
  renderedTileSize: number,
  fractionalTileCoordinate: Coordinate,
  integerTileCoordinate: Coordinate
): Coordinate {
  const renderedCenter: Coordinate = [
    renderedTileSize / 2,
    renderedTileSize / 2,
  ];

  const difference = subtractVector2d(
    fractionalTileCoordinate,
    integerTileCoordinate
  );

  const offset = multiplyVector2d(difference, [
    renderedTileSize,
    renderedTileSize,
  ]);

  return subtractVector2d(renderedCenter, offset);
}
