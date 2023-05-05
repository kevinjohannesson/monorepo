import { Coordinate } from "../../../../types";
import {
  multiplyCoordinates,
  subtractCoordinates,
} from "../../../../utils/coordinate";

export function calculateRenderedTileCenterOffset(
  renderedTileSize: number,
  fractionalTileCoordinate: Coordinate,
  integerTileCoordinate: Coordinate
): Coordinate {
  const renderedCenter: Coordinate = [
    renderedTileSize / 2,
    renderedTileSize / 2,
  ];

  const difference = subtractCoordinates(
    fractionalTileCoordinate,
    integerTileCoordinate
  );

  const offset = multiplyCoordinates(difference, [
    renderedTileSize,
    renderedTileSize,
  ]);

  return subtractCoordinates(renderedCenter, offset);
}
