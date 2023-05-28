import { type Vector2d, createSpiralPattern } from "utils";
import { useMemo } from "react";

export function useGridTileIndices(
  gridDimensions: Vector2d,
  tileDimensions: Vector2d,
  additionalRings = 0,
): Vector2d[] {
  // This hook determines the indices of tiles within a grid layout.
  // A spiral pattern is created starting from the center of the grid and moving outwards.
  // The size of the pattern is based on the dimensions of the grid and the size of each tile.
  // We add 1 to ensure there's always a tile at the center,
  // and we multiply by 2 to cover both halves of the grid (e.g., left and right, or top and bottom).
  // Math.ceil is used to round the values, as tile indices are whole numbers.

  const [gridWidth, gridHeight] = gridDimensions;
  const [tileWidth, tileHeight] = tileDimensions;
  // console.log({ gridWidth, tileWidth });
  // console.log(1 * 2 + Math.ceil(gridWidth / 2 / tileWidth) * 2);
  const gridTileIndices = useMemo(
    () =>
      createSpiralPattern(
        1 + additionalRings * 2 + Math.ceil(gridWidth / 2 / tileWidth) * 2,
        1 + additionalRings * 2 + Math.ceil(gridHeight / 2 / tileHeight) * 2,
      ),
    [gridWidth, gridHeight, tileWidth, tileHeight],
  );

  return gridTileIndices;
}
