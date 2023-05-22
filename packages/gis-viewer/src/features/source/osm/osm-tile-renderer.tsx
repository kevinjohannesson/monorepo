import { Fragment, type ReactElement } from "react";
import {
  type ReferenceTile,
  type TileImageCacheContextValue,
  useTileImageCacheContext,
} from "../../cache/tile-image-cache";
import { TileImage } from "./osm-tile";
import {
  type Vector2d,
  addVector2d,
  divideVector2d,
  getClosestNumberTo,
  isLowestNumber,
  isNull,
  multiplyVector2d,
  subtractVector2d,
} from "utils";
import { isUndefined } from "lodash";
import { toWholeTileNumbers, toWholeZoomLevel } from "./utils/tile-number-utils";
import { useOsmFractionalScaledZoomLevel } from "./hooks/use-osm-scaled-zoom-level";
import { useOsmFractionalTileNumbers } from "./hooks/use-osm-tile-numbers";
import { useTileGridContext } from "../../tile-grid/tile-grid-provider";
import { useViewCenterCoordinate } from "../../view/hooks/use-view-state";

function calculateZoomLevelScaleFactor(
  osmFractionalScaledZoomLevel: number,
  zoomLevelFromCache: number,
): number {
  return Math.pow(2, osmFractionalScaledZoomLevel - zoomLevelFromCache);
}

function calculateHalfZoomDeltaTileWidth(
  tileDimensionsAfterZoom: Vector2d,
  gridTileDimensions: Vector2d,
): Vector2d {
  return divideVector2d(subtractVector2d(tileDimensionsAfterZoom, gridTileDimensions), 2);
}

function calculateOsmFractionalCenterTileNumbersAtZoomLevel(
  referenceTile: ReferenceTile,
  wholeZoomLevel: number,
): Vector2d {
  return multiplyVector2d(
    referenceTile.fractionalTileNumbers,
    2 ** (wholeZoomLevel - referenceTile.wholeZoomLevel),
  );
}

function getAvailableZoomLevelsInCacheForGridTileIndices(
  tileImageCache: TileImageCacheContextValue,
  gridTileIndices: Vector2d[],
  centerTile: ReferenceTile,
): Record<number, Record<number, number[]>> {
  const {
    fractionalTileNumbers: [centerTileFractionalTileNumbersX, centerTileFractionalTileNumbersY],
  } = centerTile;

  return gridTileIndices.reduce<Record<number, Record<number, number[]>>>(
    (record, [gridTileIndexX, gridTileIndexY]) => {
      const availableZoomLevels = tileImageCache.getAvailableZoomLevelsByReferenceTile(
        {
          ...centerTile,
          fractionalTileNumbers: [
            centerTileFractionalTileNumbersX,
            centerTileFractionalTileNumbersY,
          ],
        },
        [gridTileIndexX, gridTileIndexY],
      );

      if (isUndefined(record[gridTileIndexX])) {
        record[gridTileIndexX] = {};
      }

      record[gridTileIndexX][gridTileIndexY] = availableZoomLevels;

      return record;
    },
    {},
  );
}

function calculateLowerZoomLevelQuadrant(
  osmWholeTileNumbersAtZoomLevel: Vector2d,
  levelsToCheck = 1,
): Vector2d {
  let currentQuadrant = [...osmWholeTileNumbersAtZoomLevel];

  for (let i = 0; i < levelsToCheck; i++) {
    currentQuadrant = [Math.floor(currentQuadrant[0] / 2), Math.floor(currentQuadrant[1] / 2)];
  }

  return currentQuadrant as Vector2d;
}

function getLowerZoomLevelQuadrantTileZoomLevel(
  availableZoomLevels: number[],
  // make reference tile
  osmWholeTileNumbers: Vector2d,
  zoomLevelFromCache: number,
  tileImageCache: TileImageCacheContextValue,
): number | null {
  const lowerZoomLevelsInCacheReversed = [...availableZoomLevels].reverse();

  for (const lowerZoomLevel of lowerZoomLevelsInCacheReversed) {
    const [lowerZoomLevelQuadrantTileNumberX, lowerZoomLevelQuadrantTileNumberY] =
      calculateLowerZoomLevelQuadrant(
        osmWholeTileNumbers,
        Math.abs(lowerZoomLevel - zoomLevelFromCache),
      );

    const image = tileImageCache.getTileImage(
      lowerZoomLevelQuadrantTileNumberX,
      lowerZoomLevelQuadrantTileNumberY,
      lowerZoomLevel,
    );

    if (!isNull(image)) {
      return lowerZoomLevel;
    }
  }

  return null;
}

export function OsmTileRenderer(): ReactElement {
  // Get the current center coordinate of the view.
  const viewCenterCoordinate = useViewCenterCoordinate();

  // Obtain dimensional and offset data related to the tile grid.
  const { gridTileIndices, gridTileDimensions, pixelOffsetToCenterGrid, gridDimensions } =
    useTileGridContext();
  const [pixelOffsetToCenterGridX, pixelOffsetToCenterGridY] = pixelOffsetToCenterGrid;
  const [gridWidth, gridHeight] = gridDimensions;

  // Connect to the image cache context to later retrieve cached tile images.
  const tileImageCache = useTileImageCacheContext();

  // Define the reference tile based on the center tile and the scaled zoom level.
  const osmFractionalScaledZoomLevel = useOsmFractionalScaledZoomLevel();
  const osmWholeScaledZoomLevel = toWholeZoomLevel(osmFractionalScaledZoomLevel);
  const osmFractionalCenterTileNumbers = useOsmFractionalTileNumbers(viewCenterCoordinate);
  const osmCenterReferenceTile: ReferenceTile = {
    fractionalTileNumbers: osmFractionalCenterTileNumbers,
    wholeZoomLevel: osmWholeScaledZoomLevel,
  };

  // Obtain a list of the available zoom levels in the cache for all grid tiles.
  // This is computed only once to avoid unnecessary calculations.
  const availableZoomLevelsInCacheForGridTileIndices =
    getAvailableZoomLevelsInCacheForGridTileIndices(
      tileImageCache,
      gridTileIndices,
      osmCenterReferenceTile,
    );

  return (
    <>
      {tileImageCache.availableZoomLevels.map((zoomLevelFromCache) => {
        const availableZoomLevelsInCacheLowerThanZoomLevelFromCache =
          tileImageCache.availableZoomLevels
            .filter((zoomLevel) => zoomLevel < zoomLevelFromCache)
            .sort((a, b) => a - b);

        // Calculate data related to the tile scale:
        // For each zoom level, we compute a scaling factor for the tile dimensions in relation
        // to the current zoom level. This ensures that if a tile is available and rendered, it
        // aligns properly with the tiles of higher and lower levels.

        const zoomLevelScaleFactor = calculateZoomLevelScaleFactor(
          osmFractionalScaledZoomLevel,
          zoomLevelFromCache,
        );

        const tileDimensionsAfterZoom = multiplyVector2d(zoomLevelScaleFactor, gridTileDimensions);
        const [tileWidthAfterZoom, tileHeightAfterZoom] = tileDimensionsAfterZoom;

        const [halfZoomDeltaTileWidth, halfZoomDeltaTileHeight] = calculateHalfZoomDeltaTileWidth(
          tileDimensionsAfterZoom,
          gridTileDimensions,
        );

        const halfTileDimensionsAfterZoom = divideVector2d(tileDimensionsAfterZoom, 2);

        // Calculate data related to the OSM tile:
        // The fractional and whole tile numbers provide essential information for computing
        // tile numbers at other zoom levels and calculating the pixel offset to position the
        // tile image correctly.

        const osmFractionalCenterTileNumbersAtZoomLevel =
          calculateOsmFractionalCenterTileNumbersAtZoomLevel(
            osmCenterReferenceTile,
            zoomLevelFromCache,
          );

        const osmWholeCenterTileNumbersAtZoomLevel = toWholeTileNumbers(
          osmFractionalCenterTileNumbersAtZoomLevel,
        );

        const fractionalPartOfCenterTileNumbersAtZoomLevel = subtractVector2d(
          osmFractionalCenterTileNumbersAtZoomLevel,
          osmWholeCenterTileNumbersAtZoomLevel,
        );

        // Calculate data related to the view center coordinate:
        // These values accurately position the tile to coincide with the center coordinate of the view.

        const pixelOffsetInCenterTile = multiplyVector2d(
          fractionalPartOfCenterTileNumbersAtZoomLevel,
          tileDimensionsAfterZoom,
        );

        const pixelOffsetFromTileCenter = subtractVector2d(
          halfTileDimensionsAfterZoom,
          pixelOffsetInCenterTile,
        );
        const [pixelOffsetFromTileCenterX, pixelOffsetFromTileCenterY] = pixelOffsetFromTileCenter;

        // Create a new fragment for this zoom level, which will contain all tiles to be rendered at
        // this zoom level. The rest of the logic for each zoom level (e.g., determining which tiles
        // to render and how to position them) is handled on a specific per grid tile index level.

        return (
          <Fragment key={zoomLevelFromCache}>
            {gridTileIndices.map((gridTileIndex) => {
              // Attempt to retrieve an image from the cache for the current zoom level and grid tile
              // index. If there's no corresponding image in the cache, we exit early as there's
              // nothing more to do.

              const [gridTileIndexX, gridTileIndexY] = gridTileIndex;

              const osmWholeTileNumbersForGridTileIndex = addVector2d(
                osmWholeCenterTileNumbersAtZoomLevel,
                gridTileIndex,
              );

              const [osmWholeTileNumbersForGridTileIndexX, osmWholeTileNumbersForGridTileIndexY] =
                osmWholeTileNumbersForGridTileIndex;

              const imageFromCache = tileImageCache.getTileImage(
                osmWholeTileNumbersForGridTileIndexX,
                osmWholeTileNumbersForGridTileIndexY,
                zoomLevelFromCache,
              );

              if (isNull(imageFromCache)) {
                return null;
              }

              // Decision to render an image at this zoom level is based on multiple factors.
              // We generally skip tiles if they can be better represented by a tile from a different zoom level.

              // Check if the zoom level of the cached image is higher than the current view.
              // The purpose here is to avoid rendering tiles from higher zoom levels which would appear excessively small and
              // create a diminishing sequence of nested squares. Our primary goal is to render tiles that are at or below
              // the current view's zoom level, preventing the display of overly-scaled down versions of higher zoom level tiles.
              const zoomLevelFromCacheIsTooHigh = zoomLevelFromCache >= osmWholeScaledZoomLevel;

              // Get the available zoom levels for this grid index.
              const availableTileImageZoomLevelsForIndex =
                availableZoomLevelsInCacheForGridTileIndices[gridTileIndexX][gridTileIndexY];

              // Determine if the current zoom level from the cache is the lowest one available.
              // We must ensure that a tile is never left unrendered, so if the zoom level from the cache is the
              // lowest available, we need to render this image.
              const isLowestZoomLevelInCache = isLowestNumber(
                zoomLevelFromCache,
                availableTileImageZoomLevelsForIndex,
              );

              // Get the zoom level of the lower quadrant tile.
              const lowerZoomLevelQuadrantZoomLevel = getLowerZoomLevelQuadrantTileZoomLevel(
                availableZoomLevelsInCacheLowerThanZoomLevelFromCache,
                osmWholeTileNumbersForGridTileIndex,
                zoomLevelFromCache,
                tileImageCache,
              );

              // Check if the zoom level of this tile is closer to the current view level than a lower quadrant tile.
              // This condition helps to avoid large gaps in zoom levels. For example, if the available levels are 1, 2, and 9,
              // without this condition we might see a scaled version of level 2 from level 2 to 8.9. With this condition,
              // we start displaying the image at level 9 halfway through.
              const isCloserZoomLevelMatchThanLowerQuadrant =
                !isNull(lowerZoomLevelQuadrantZoomLevel) &&
                getClosestNumberTo(
                  osmFractionalScaledZoomLevel,
                  lowerZoomLevelQuadrantZoomLevel,
                  zoomLevelFromCache,
                ) === zoomLevelFromCache;

              // Check if a lower level quadrant tile exists.
              // We must ensure that a tile is never left unrendered, so if no lower level quadrant exists,
              // we need to render this image.
              const lowerQuadrantExists = !isNull(lowerZoomLevelQuadrantZoomLevel);

              // Skip rendering this tile if it's too zoomed out, a better resolution lower quadrant tile exists, and
              // either it's not the lowest available zoom level or a lower quadrant tile exists.
              if (
                zoomLevelFromCacheIsTooHigh &&
                !isCloserZoomLevelMatchThanLowerQuadrant &&
                (!isLowestZoomLevelInCache || lowerQuadrantExists)
              ) {
                return null;
              }

              // Compute the position and dimensions of the tile image.
              // This position calculation takes into account the offset to the grid center, the
              // scale of the zoom level, and the position of the center of view coordinate within the tile.

              const dx =
                pixelOffsetToCenterGridX +
                gridTileIndexX * tileWidthAfterZoom -
                halfZoomDeltaTileWidth +
                pixelOffsetFromTileCenterX;
              const dy =
                pixelOffsetToCenterGridY +
                gridTileIndexY * tileHeightAfterZoom -
                halfZoomDeltaTileHeight +
                pixelOffsetFromTileCenterY;
              const dw = tileWidthAfterZoom;
              const dh = dw;

              if (dx + dw < 0 || dy + dh < 0 || dx > gridWidth || dy > gridHeight) {
                // If a tile is completely outside the visible canvas area, we skip rendering it for performance.
                return null;
              }

              return (
                <TileImage
                  key={gridTileIndex.join()}
                  dx={dx}
                  dy={dy}
                  dw={dw}
                  dh={dh}
                  image={imageFromCache}
                />
              );
            })}
          </Fragment>
        );
      })}
    </>
  );
}
