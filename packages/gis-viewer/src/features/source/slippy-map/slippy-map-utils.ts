import { calculateClosestPowerOf2 } from "utils";

/**
 * Use this to calculate the tile count for each axis at a specific zoom level.
 */
export function calculateTileCountPerAxis(zoomLevel: number): number {
  return Math.pow(2, Math.floor(zoomLevel));
}

/**
 * Use this to calculate last tile number at a specific zoom level.
 */
export function calculateLastTileNumber(zoomLevel: number): number {
  return calculateTileCountPerAxis(zoomLevel) - 1;
}

/**
 * Use this to calculate the total tile count at a specific zoom level.
 */
export function calculateTileCount(zoomLevel: number): number {
  return Math.pow(calculateTileCountPerAxis(zoomLevel), 2);
}

/**
 * Returns the nearest power of two tile count necessary to cover a specified length.
 * This is useful for grid calculations where binary-based systems (like zoom levels) are used.
 */
export function calculateTileCountToCoverLength(length: number, tileSize: number): number {
  return calculateClosestPowerOf2(Math.ceil(length / tileSize));
}

/**
 * Calculates the zoom level required to cover a specified length.
 * This is typically used for determining the initial or 'base' zoom level in a GIS application.
 */
export function calculateZoomLevelToCoverLength(length: number, tileSize: number): number {
  return Math.log2(calculateTileCountToCoverLength(length, tileSize));
}

/**
 * Calculates and returns the base scale by a specified width.
 */
export function calculateBaseScale(width: number, tileSize: number): number {
  const baseTileCount = calculateTileCountToCoverLength(width, tileSize);
  const totalTileWidth = baseTileCount * tileSize;

  return width / totalTileWidth;
}

/**
 * Calculates and returns the effective size of a tile in the view.
 * The size is determined by scaling the actual tile size by the base scale.
 */
export function calculateEffectiveTileSize(initialTileSize: number, baseScale: number): number {
  return initialTileSize * baseScale;
}

/**
 * Calculates the effective zoom level that should be used for rendering.
 * This is the base zoom level adjusted by the current view zoom level.
 */
export function calculateEffectiveZoomLevel(viewZoomLevel: number, baseZoomLevel: number): number {
  return baseZoomLevel + viewZoomLevel;
}
