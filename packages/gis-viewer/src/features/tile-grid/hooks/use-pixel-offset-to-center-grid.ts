import { type Vector2d, calculateCenterCoordinate, divideVector2d, subtractVector2d } from "utils";
import { useMemo } from "react";

export function usePixelOffsetToCenterGrid(
  gridDimensions: Vector2d,
  tileDimensions: Vector2d,
): Vector2d {
  // This hook calculates the offset needed to center a tile grid within a given space, specified by gridDimensions.
  // The offset is calculated as the difference between the center of the grid and
  // the center of the tile that would be in the center if the tile grid was aligned to the top-left corner of the space.
  // We determine the center of the grid by halving its width and height.
  // Similarly, the center of a tile is calculated by halving the tile size.
  // The required offset is then the subtraction of these two coordinates, which will align the grid in the center of the space.

  const [gridWidth, gridHeight] = gridDimensions;

  const gridCenterPixelOffset = useMemo(() => {
    const gridCenterPixelCoordinate = calculateCenterCoordinate([gridWidth, gridHeight]);
    const tileCenterPixelCoordinate = divideVector2d(tileDimensions, 2);

    return subtractVector2d(gridCenterPixelCoordinate, tileCenterPixelCoordinate);
  }, [gridWidth, gridHeight, tileDimensions]);

  return gridCenterPixelOffset;
}
