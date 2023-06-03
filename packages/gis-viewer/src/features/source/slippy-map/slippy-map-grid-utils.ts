import { type Vector2d } from "utils";

export function calculateZoomLevelScaleFactor(
  originalZoomLevel: number,
  targetZoomLevel: number,
): number {
  const zoomDifference = targetZoomLevel - originalZoomLevel;
  return Math.pow(2, zoomDifference);
}

export function calculateZoomAdjustedTileSize(
  tileSize: number,
  originalZoomLevel: number,
  targetZoomLevel: number,
): number {
  const scaleFactor = calculateZoomLevelScaleFactor(originalZoomLevel, targetZoomLevel);
  return scaleFactor * tileSize;
}

export function generateTileOffsets([width, height]: Vector2d, tileSize: number): Vector2d[] {
  const halfTileCountX = Math.ceil(width / 2 / tileSize);
  const halfTileCountY = Math.ceil(height / 2 / tileSize);

  const tiles: Vector2d[] = [];

  for (let x = -halfTileCountX; x <= halfTileCountX; x++) {
    for (let y = -halfTileCountY; y <= halfTileCountY; y++) {
      tiles.push([x, y]);
    }
  }

  return tiles;
}

export function calculateOrigin([width, height]: Vector2d): Vector2d {
  const x = width / 2;
  const y = height / 2;

  return [x, y];
}
