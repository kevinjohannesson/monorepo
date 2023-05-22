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
  getClosestNumberFrom,
  getClosestNumberTo,
  isLowestNumber,
  isNull,
  multiplyVector2d,
  subtractVector2d,
} from "utils";
import {
  createOsmTileImageUrlParameters,
  isValidOsmUrlParameters,
} from "./utils/url-parameters-utils";
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

function calculateLowerZoomLevelQuadrantMultiLevel(
  osmWholeTileNumbersAtZoomLevel: Vector2d,
  // zoomLevelFromCache: number,
  levelsToCheck: number,
): Vector2d {
  let currentQuadrant = [...osmWholeTileNumbersAtZoomLevel];

  for (let i = 0; i < levelsToCheck; i++) {
    currentQuadrant = [
      // 2 * Math.floor(currentQuadrant[0] / 2),
      // 2 * Math.floor(currentQuadrant[1] / 2),
      Math.floor(currentQuadrant[0] / 2),
      Math.floor(currentQuadrant[1] / 2),
    ];
  }

  return currentQuadrant as Vector2d;
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
  const osmWholeCenterTileNumbers = toWholeTileNumbers(osmFractionalCenterTileNumbers);
  const [osmWholeCenterTileNumbersX, osmWholeCenterTileNumbersY] = osmWholeCenterTileNumbers;
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

  const totalValidTileNumbersAtCurrentZoomLevel = gridTileIndices.filter(
    ([gridTileIndexX, gridTileIndexY]) =>
      isValidOsmUrlParameters(
        createOsmTileImageUrlParameters(
          osmWholeCenterTileNumbersX + gridTileIndexX,
          osmWholeCenterTileNumbersY + gridTileIndexY,
          osmWholeScaledZoomLevel,
        ),
      ),
  ).length;

  const totalFetchedTileImagesForCurrentZoomLevel = gridTileIndices.filter(
    ([gridTileIndexX, gridTileIndexY]) =>
      Boolean(
        tileImageCache.getTileImage(
          osmWholeCenterTileNumbersX + gridTileIndexX,
          osmWholeCenterTileNumbersY + gridTileIndexY,
          osmWholeScaledZoomLevel,
        ),
      ),
  ).length;

  const allPossibleTileImagesForCurrentZoomLevelAreCached =
    totalFetchedTileImagesForCurrentZoomLevel === totalValidTileNumbersAtCurrentZoomLevel;

  return (
    <>
      {tileImageCache.availableZoomLevels.map((zoomLevelFromCache) => {
        // if (
        //   allPossibleTileImagesForCurrentZoomLevelAreCached &&
        //   zoomLevelFromCache !== osmWholeScaledZoomLevel
        // ) {
        //   return null;
        // }

        const availableZoomLevelsInCacheLowerThanZoomLevelFromCache =
          tileImageCache.availableZoomLevels.filter((zoomLevel) => zoomLevel < zoomLevelFromCache);

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

        const fractionalPartOfCenterTileNumbersAtZoomLevel =
          calculateFractionalPartOfCenterTileNumbers(
            osmFractionalCenterTileNumbersAtZoomLevel,
            osmWholeCenterTileNumbersAtZoomLevel,
          );

        // Calculate data related to the view center coordinate:
        // These values accurately position the tile to coincide with the center coordinate of the view.

        const pixelOffsetInCenterTile = calculatePixelOffsetInCenterTile(
          fractionalPartOfCenterTileNumbersAtZoomLevel,
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
              // 1. We always render the lowest possible tile.
              //    This guarantees that we always have at least one image to render.
              // 2. We avoid rendering higher zoom level tiles that are significantly scaled down and
              //    would overlap lower zoom level tiles that are more suitable. This prevents the
              //    creation of a "nested rectangles" effect where increasingly zoomed-in tiles are
              //    all displayed at once, each one smaller than the last.
              const availableTileImageZoomLevelsForIndex =
                availableZoomLevelsInCacheForGridTileIndices[gridTileIndexX][gridTileIndexY];

              const isLowestZoomLevelInCache = isLowestNumber(
                zoomLevelFromCache,
                availableTileImageZoomLevelsForIndex,
              );

              // const hasLowerQuadrant =
              //   availableZoomLevelsInCacheForGridTileIndices[
              //     osmWholeTileNumbersForGridTileIndexX +
              //       (fractionalPartOfCenterTileNumbersAtZoomLevel[0] < 0.5 ? -1 : 1)
              //   ]?.[
              //     osmWholeTileNumbersForGridTileIndexY +
              //       (fractionalPartOfCenterTileNumbersAtZoomLevel[1] < 0.5 ? -1 : 1)
              //   ];

              // const lowerZoomLevelQuadrant = [
              //   2 * Math.floor(osmWholeCenterTileNumbersAtZoomLevel[0] / 2) +
              //     (fractionalPartOfCenterTileNumbersAtZoomLevel[0] < 0.5 ? 0 : 1),
              //   2 * Math.floor(osmWholeCenterTileNumbersAtZoomLevel[1] / 2) +
              //     (fractionalPartOfCenterTileNumbersAtZoomLevel[1] < 0.5 ? 0 : 1),
              // ];

              // console.log(
              //   `Lower quadrant: [${lowerZoomLevelQuadrant[0]}, ${lowerZoomLevelQuadrant[1]}]`,
              // );
              // const lowerZoomLevelQuadrant = [
              //   Math.floor(osmWholeTileNumbersForGridTileIndexX / 2),
              //   Math.floor(osmWholeTileNumbersForGridTileIndexY / 2),
              // ];

              // const hasLowerZoomLevelQuadrantTile = Boolean(
              //   tileImageCache.getTileImage(
              //     lowerZoomLevelQuadrant[0],
              //     lowerZoomLevelQuadrant[1],
              //     zoomLevelFromCache - 1,
              //   ),
              // );
              const isZoomLevelFromCacheHigherThanCurrent =
                zoomLevelFromCache > osmWholeScaledZoomLevel;

              const hasLowerZoomLevelQuadrantTile = (() => {
                let hasLowerZoomLevelQuadrantTile = false;

                for (const lowerZoomLevel of availableZoomLevelsInCacheLowerThanZoomLevelFromCache) {
                  // console.log(Math.abs(lowerZoomLevel - zoomLevelFromCache));
                  const lowerZoomLevelQuadrant = calculateLowerZoomLevelQuadrantMultiLevel(
                    osmWholeTileNumbersForGridTileIndex,
                    // zoomLevelFromCache,
                    Math.abs(lowerZoomLevel - zoomLevelFromCache),
                  );
                  // console.log({ lowerZoomLevelQuadrant });

                  if (
                    tileImageCache.getTileImage(
                      lowerZoomLevelQuadrant[0],
                      lowerZoomLevelQuadrant[1],
                      lowerZoomLevel,
                    ) != null
                  ) {
                    hasLowerZoomLevelQuadrantTile = true;
                    break; // stop checking as soon as we find a lower zoom level quadrant tile
                  }
                }

                return hasLowerZoomLevelQuadrantTile;
              })();

              const lowerZoomLevelQuadrantTile = (() => {
                const lowerZoomLevelsInCacheReversed = [
                  ...availableZoomLevelsInCacheLowerThanZoomLevelFromCache,
                ]
                  .sort((a, b) => a - b)
                  .reverse();
                for (const lowerZoomLevel of lowerZoomLevelsInCacheReversed) {
                  console.log({ lowerZoomLevel });
                  // console.log(Math.abs(lowerZoomLevel - zoomLevelFromCache));
                  const lowerZoomLevelQuadrant = calculateLowerZoomLevelQuadrantMultiLevel(
                    osmWholeTileNumbersForGridTileIndex,
                    // zoomLevelFromCache,
                    Math.abs(lowerZoomLevel - zoomLevelFromCache),
                  );
                  // console.log({ lowerZoomLevelQuadrant });
                  const image = tileImageCache.getTileImage(
                    lowerZoomLevelQuadrant[0],
                    lowerZoomLevelQuadrant[1],
                    lowerZoomLevel,
                  );

                  if (!isNull(image)) {
                    return { zoomLevel: lowerZoomLevel, image };
                  }
                }

                return null;
              })();
              // if (gridTileIndexX === 1) {
              // console.log(gridTileIndex.join());
              // console.log({
              //   availableZoomLevelsInCacheLowerThanCurrentZoomLevel:
              //     availableZoomLevelsInCacheLowerThanZoomLevelFromCache,
              // });
              // console.log({ zoomLevelFromCache });
              // console.log({ osmWholeTileNumbersForGridTileIndexX });
              // console.log({ osmWholeTileNumbersForGridTileIndexY });
              // console.log(
              //   `Tilenumber fractions: [${fractionalPartOfCenterTileNumbersAtZoomLevel.join()}]`,
              // );
              // console.log({ isZoomLevelFromCacheHigherThanCurrent });
              // console.log({ isLowestZoomLevelInCache });
              // console.log({ hasLowerZoomLevelQuadrantTile });
              // console.log({ hasLowerZoomLevelQuadrantTile2 });
              // console.log(
              //   `Lower quadrant: [${lowerZoomLevelQuadrant[0]}, ${lowerZoomLevelQuadrant[1]}]`,
              // );
              // console.log(
              //   "isValidOsmUrlParameters",
              //   isValidOsmUrlParameters({
              //     x: lowerZoomLevelQuadrant[0],
              //     y: lowerZoomLevelQuadrant[1],
              //     z: zoomLevelFromCache - 1,
              //   }),
              // );

              const closestLevelInCacheToCurrentZoomLevel = getClosestNumberFrom(
                availableTileImageZoomLevelsForIndex,
                osmWholeScaledZoomLevel,
              );

              const isClosestLevelInCacheToCurrentZoomLevel =
                closestLevelInCacheToCurrentZoomLevel === zoomLevelFromCache;

              const isZoomLevelCloserToCurrentZoomLevelThanLowerQuadrantTile =
                !isNull(lowerZoomLevelQuadrantTile) &&
                getClosestNumberTo(
                  osmFractionalScaledZoomLevel,
                  lowerZoomLevelQuadrantTile.zoomLevel,
                  zoomLevelFromCache,
                ) === zoomLevelFromCache;
              console.log({
                isClosertToCurrentZoomLevelThanLowerQuadrantTile:
                  isZoomLevelCloserToCurrentZoomLevelThanLowerQuadrantTile,
              });

              if (gridTileIndexY === 1) {
                // console.log(gridTileIndex.join());
                console.log({ zoomLevelFromCache });
                console.log({ osmFractionalScaledZoomLevel });
                console.log({ lowerZoomLevelQuadrantTile });
                console.log({
                  isClosertToCurrentZoomLevelThanLowerQuadrantTile:
                    isZoomLevelCloserToCurrentZoomLevelThanLowerQuadrantTile,
                });
                console.log({ isLowestZoomLevelInCache });
                console.log({ hasLowerZoomLevelQuadrantTile });
                console.log(
                  !isNull(lowerZoomLevelQuadrantTile) &&
                    isZoomLevelCloserToCurrentZoomLevelThanLowerQuadrantTile,
                );
              }
              if (
                isZoomLevelFromCacheHigherThanCurrent &&
                !isZoomLevelCloserToCurrentZoomLevelThanLowerQuadrantTile &&
                (!isLowestZoomLevelInCache || hasLowerZoomLevelQuadrantTile)
              ) {
                // console.log("%cNot rendering.", "background:red;");

                return null;
              }

              // if (isZoomLevelFromCacheHigherThanCurrent) {
              //   // console.log({ isZoomLevelFromCacheHigherThanCurrent });
              //   if (isLowestZoomLevelInCache) {
              //     // console.log({ isLowestZoomLevelInCache });
              //     if (!isNull(lowerZoomLevelQuadrantTile)) {
              //       // console.log({ lowerZoomLevelQuadrantTile });
              //       // console.log("zoomLevel", lowerZoomLevelQuadrantTile.zoomLevel);

              //       const isClosertToCurrentZoomLevelThanLowerQuadrantTile =
              //         getClosestNumberTo(
              //           osmFractionalScaledZoomLevel,
              //           lowerZoomLevelQuadrantTile.zoomLevel,
              //           zoomLevelFromCache,
              //         ) === zoomLevelFromCache;
              //       console.log({ isClosertToCurrentZoomLevelThanLowerQuadrantTile });

              //       if (!isClosertToCurrentZoomLevelThanLowerQuadrantTile) {
              //         return null;
              //       }
              //     }
              //   }
              // }
              // if (
              //   isZoomLevelFromCacheHigherThanCurrent &&
              //   (!isLowestZoomLevelInCache || hasLowerZoomLevelQuadrantTile2)
              // ) {
              //   console.log("isZoomLevelFromCacheHigherThanCurrent");
              //   // if (!isLowestZoomLevelInCache) {
              //   //   console.log("isNotLowestZoomLevelInCache");
              //   //   if (hasLowerZoomLevelQuadrantTile2) {
              //   //     console.log("hasLowerZoomLevelQuadrantTile");
              //   return null;
              //   //   }
              //   // }
              // }
              // if (isZoomLevelFromCacheHigherThanCurrent) {
              //   console.log("isZoomLevelFromCacheHigherThanCurrent");
              //   if (isLowestZoomLevelInCache) {
              //     console.log("isLowestZoomLevelInCache");
              //     if (hasLowerZoomLevelQuadrantTile2) {
              //       console.log("hasLowerZoomLevelQuadrantTile");
              //       return null;
              //     }
              //   }
              // }
              // (!isLowestZoomLevelInCache || hasLowerZoomLevelQuadrantTile)

              // console.log("%cNot rendering.", "background:red;");
              // return null;
              // }
              // }

              // console.log(
              //   `Lower quadrant: [${
              //     osmWholeTileNumbersForGridTileIndexX +
              //     (fractionalPartOfCenterTileNumbers[0] < 0.5 ? -1 : 1)
              //   },${
              //     osmWholeTileNumbersForGridTileIndexY +
              //     (fractionalPartOfCenterTileNumbers[1] < 0.5 ? -1 : 1)
              //   }]`,
              // );
              // console.log({ hasLowerQuadrant });
              // console.log(tileImageCache.state);
              // console.log(fractionalPartOfCenterTileNumbers.join());
              // console.log(
              //   osmWholeTileNumbersForGridTileIndexX +
              //     (fractionalPartOfCenterTileNumbers[0] < 0.5 ? -1 : 1),
              // );

              // if (isZoomLevelFromCacheHigherThanCurrent && !isLowestZoomLevelInCache) {
              //   console.log("%cdoing this", "background:red;");
              //   return null;
              // }

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
                console.log(
                  "%cI'm outside of the visible area of the canvas!",
                  "background: green;",
                );
                // These tiles fall completely outside of the visible area of the canvas so we
                // don't render an image.
                return null;
              }

              // I have the following variables:
              // `dx`: the x of the topleft pixelof the painted image
              // `dy`: the y of the topleft pixel of the painted image
              // `dw`: the width of the painted image
              // `dh`: the height of the painted image (same as `dw`)

              // I could do something of the following:
              // ```ts
              // if((dx > gridWidth) ||  dx + dw <= 0){
              //   // don't render image
              // }
              // ```

              // However I'd need to check in 2 dimensions. Could you help me with the `if-statement`?

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
