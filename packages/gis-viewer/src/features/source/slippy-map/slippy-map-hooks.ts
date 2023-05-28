import * as SlippyMapUtils from "./slippy-map-utils";
import * as SlippyTileUtils from "./slippy-tile-utils";
import { type Vector2d } from "utils";
import {
  useViewCenterCoordinate,
  useViewDimensions,
  useViewProjection,
  useViewZoomLevel,
} from "../../view/hooks/use-view-state";

/**
 * Use this hook to get the base zoom level which is calculated based on the width of the view.
 */
export function useBaseZoomLevel(tileSize: number): number {
  const [width] = useViewDimensions();

  return SlippyMapUtils.calculateZoomLevelToCoverLength(width, tileSize);
}

/**
 * Use this hook to get the effective zoom level that should be used for rendering.
 * This is the base zoom level adjusted by the current view zoom level.
 */
export function useEffectiveZoomLevel(tileSize: number): number {
  const viewZoomLevel = useViewZoomLevel();

  const effectiveTileSize = useEffectiveTileSize(tileSize);
  const baseZoomLevel = useBaseZoomLevel(effectiveTileSize);

  return SlippyMapUtils.calculateEffectiveZoomLevel(baseZoomLevel, viewZoomLevel);
}

/**
 * Calculates and returns the position of the tile at the center of the view.
 * The position is based on the projected source of the view and the effective zoom level.
 */
export function useCenterTilePosition(tileSize: number): Vector2d {
  const centerCoordinates = useViewCenterCoordinate();
  const viewProjection = useViewProjection();

  const effectiveZoomLevel = useEffectiveZoomLevel(tileSize);

  return SlippyTileUtils.calculatePositionFromProjectedSource(
    centerCoordinates,
    viewProjection.code,
    effectiveZoomLevel,
  );
}

/**
 * Calculates and returns the base scale of the view.
 * The base scale is determined by the ratio of the view width to the total width of tiles at the base zoom level.
 */
export function useBaseScale(originalTileSize: number): number {
  const [viewWidth] = useViewDimensions();

  return SlippyMapUtils.calculateBaseScale(viewWidth, originalTileSize);
}

/**
 * Calculates and returns the size of an base tile in the view.
 * The size is determined by scaling the actual tile size by the base scale.
 */
export function useEffectiveTileSize(originalTileSize: number): number {
  const baseScale = useBaseScale(originalTileSize);

  return SlippyMapUtils.calculateEffectiveTileSize(originalTileSize, baseScale);
}

export function useCreateTileUrl(url: string): (x: number, y: number, z: number) => string {
  return (x: number, y: number, z: number) => SlippyTileUtils.createTileUrl(url, x, y, z);
}
