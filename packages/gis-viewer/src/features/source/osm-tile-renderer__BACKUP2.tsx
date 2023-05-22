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

function calculateTileDimensionsAfterZoom(
  zoomLevelScaleFactor: number,
  gridTileDimensions: Vector2d,
): Vector2d {
  return multiplyVector2d(zoomLevelScaleFactor, gridTileDimensions);
}

function calculateHalfZoomDeltaTileWidth(
  tileDimensionsAfterZoom: Vector2d,
  gridTileDimensions: Vector2d,
): Vector2d {
  return divideVector2d(subtractVector2d(tileDimensionsAfterZoom, gridTileDimensions), 2);
}

function calculateFractionalPartOfCenterTileNumbers(
  osmFractionalCenterTileNumbers: Vector2d,
  osmWholeCenterTileNumbers: Vector2d,
): Vector2d {
  return subtractVector2d(osmFractionalCenterTileNumbers, osmWholeCenterTileNumbers);
}

function calculatePixelOffsetInCenterTile(
  fractionalPartOfCenterTileNumbers: Vector2d,
  tileDimensionsAfterZoom: Vector2d,
): Vector2d {
  return multiplyVector2d(fractionalPartOfCenterTileNumbers, tileDimensionsAfterZoom);
}

function calculateHalfTileDimensionsAfterZoom(tileDimensionsAfterZoom: Vector2d): Vector2d {
  return divideVector2d(tileDimensionsAfterZoom, 2);
}

function calculatePixelOffsetFromCenterTile(
  halfTileDimensionsAfterZoom: Vector2d,
  pixelOffsetInCenterTile: Vector2d,
): Vector2d {
  return subtractVector2d(halfTileDimensionsAfterZoom, pixelOffsetInCenterTile);
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

function calculateOsmWholeTileNumbersForGridTileIndex(
  osmWholeCenterTileNumbers: Vector2d,
  gridTileIndex: Vector2d,
): Vector2d {
  return addVector2d(osmWholeCenterTileNumbers, gridTileIndex);
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

export function OsmTileRenderer(): ReactElement {
  // Get the current center coordinate of the view.
  const viewCenterCoordinate = useViewCenterCoordinate();

  // Obtain dimensional and offset data related to the tile grid.
  const { gridTileIndices, gridTileDimensions, pixelOffsetToCenterGrid } = useTileGridContext();
  const [gridTileWidth, gridTileHeight] = gridTileDimensions;
  const [pixelOffsetToCenterGridX, pixelOffsetToCenterGridY] = pixelOffsetToCenterGrid;

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
        // Calculate data related to the tile scale:
        // For each zoom level, we compute a scaling factor for the tile dimensions in relation
        // to the current zoom level. This ensures that if a tile is available and rendered, it
        // aligns properly with the tiles of higher and lower levels.

        const zoomLevelScaleFactor = calculateZoomLevelScaleFactor(
          osmFractionalScaledZoomLevel,
          zoomLevelFromCache,
        );

        const tileDimensionsAfterZoom = calculateTileDimensionsAfterZoom(
          zoomLevelScaleFactor,
          gridTileDimensions,
        );
        const [tileWidthAfterZoom, tileHeightAfterZoom] = tileDimensionsAfterZoom;

        const [halfZoomDeltaTileWidth, halfZoomDeltaTileHeight] = calculateHalfZoomDeltaTileWidth(
          tileDimensionsAfterZoom,
          gridTileDimensions,
        );

        const halfTileDimensionsAfterZoom =
          calculateHalfTileDimensionsAfterZoom(tileDimensionsAfterZoom);

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

        const fractionalPartOfCenterTileNumbers = calculateFractionalPartOfCenterTileNumbers(
          osmFractionalCenterTileNumbersAtZoomLevel,
          osmWholeCenterTileNumbersAtZoomLevel,
        );

        // Calculate data related to the view center coordinate:
        // These values accurately position the tile to coincide with the center coordinate of the view.

        const pixelOffsetInCenterTile = calculatePixelOffsetInCenterTile(
          fractionalPartOfCenterTileNumbers,
          tileDimensionsAfterZoom,
        );

        const pixelOffsetFromTileCenter = calculatePixelOffsetFromCenterTile(
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

              const osmWholeTileNumbersForGridTileIndex =
                calculateOsmWholeTileNumbersForGridTileIndex(
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

              // We make a decision on whether to render the image at this zoom level based on the following criteria:
              // 1. The tile dimensions after applying zoom must be larger than the grid tile dimensions.
              //    This ensures that the new image fully covers the image from the previous zoom level.
              // 2. The zoom level from the cache cannot be the lowest available one.
              //    This guarantees that we always have at least one image to render.
              // 3. We avoid rendering higher zoom level tiles that are significantly scaled down and
              //    would overlap lower zoom level tiles that are more suitable. This prevents the
              //    creation of a "nested rectangles" effect where increasingly zoomed-in tiles are
              //    all displayed at once, each one smaller than the last.
              const availableTileImageZoomLevelsForIndex =
                availableZoomLevelsInCacheForGridTileIndices[gridTileIndexX][gridTileIndexY];

              const isZoomLevelFromCacheLowestZoomLevel = isLowestNumber(
                zoomLevelFromCache,
                availableTileImageZoomLevelsForIndex,
              );

              const isZoomLevelFromCacheOnlyZoomLevel =
                availableTileImageZoomLevelsForIndex.length === 1 &&
                availableTileImageZoomLevelsForIndex[0] === zoomLevelFromCache;

              const tileDimensionsAfterZoomExceedGridTile =
                tileWidthAfterZoom >= gridTileWidth && tileHeightAfterZoom >= gridTileHeight;

              if (
                !tileDimensionsAfterZoomExceedGridTile &&
                !isZoomLevelFromCacheLowestZoomLevel &&
                !isZoomLevelFromCacheOnlyZoomLevel
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
              const dh = tileHeightAfterZoom;

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
