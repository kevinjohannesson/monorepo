import { Fragment, type ReactElement } from "react";
import { TileImage } from "./osm-tile";
import { type Vector2d, divideVector2d, isNull, multiplyVector2d, subtractVector2d } from "utils";
import { isEmpty } from "lodash";
import { toWholeTileNumbers, toWholeZoomLevel } from "./utils/tile-number-utils";
import { useOsmFractionalScaledZoomLevel } from "./hooks/use-osm-scaled-zoom-level";
import { useOsmFractionalTileNumbers } from "./hooks/use-osm-tile-numbers";
import { useTileGridContext } from "../../tile-grid/tile-grid-provider";
import { useTileImageCacheContext } from "../../cache/tile-image-cache";
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

export function OsmTileRenderer(): ReactElement {
  const viewCenterCoordinate = useViewCenterCoordinate();

  const { gridTileIndices, gridTileDimensions, pixelOffsetToCenterGrid } = useTileGridContext();
  const [gridTileWidth, gridTileHeight] = gridTileDimensions;
  const [pixelOffsetToCenterGridX, pixelOffsetToCenterGridY] = pixelOffsetToCenterGrid;

  const tileImageCache = useTileImageCacheContext();

  const osmFractionalScaledZoomLevel = useOsmFractionalScaledZoomLevel();
  const osmWholeScaledZoomLevel = toWholeZoomLevel(osmFractionalScaledZoomLevel);
  const osmFractionalCenterTileNumbers = useOsmFractionalTileNumbers(viewCenterCoordinate);
  const [osmFractionalCenterTileNumbersX, osmFractionalCenterTileNumbersY] =
    osmFractionalCenterTileNumbers;

  const availableZoomLevelsInCacheForGridTileIndices = gridTileIndices.map(
    ([gridTileIndexX, gridTileIndexY]) => {
      return tileImageCache.getAvailableZoomLevelsByReferenceTile({
        fractionalTileNumbers: [
          osmFractionalCenterTileNumbersX + gridTileIndexX,
          osmFractionalCenterTileNumbersY + gridTileIndexY,
        ],
        wholeZoomLevel: osmWholeScaledZoomLevel,
      });
    },
  );

  const availableZoomLevelsInCacheForGridTileIndices2 = gridTileIndices.reduce<
    Record<string, Record<string, number[]>>
  >((record, [gridTileIndexX, gridTileIndexY]) => {
    const availableZoomLevels = tileImageCache.getAvailableZoomLevelsByReferenceTile({
      fractionalTileNumbers: [
        osmFractionalCenterTileNumbersX + gridTileIndexX,
        osmFractionalCenterTileNumbersY + gridTileIndexY,
      ],
      wholeZoomLevel: osmWholeScaledZoomLevel,
    });

    if (!record[gridTileIndexX]) {
      record[gridTileIndexX] = {};
    }

    record[gridTileIndexX][gridTileIndexY] = availableZoomLevels;

    return record;
  }, {});

  const tileIndicesWithImagesByZoomLevel = gridTileIndices.map(
    ([gridTileIndexX, gridTileIndexY]) => {
      return {
        gridTileIndex: [gridTileIndexX, gridTileIndexY],
        availableImages: tileImageCache.getTileImagesForAllZoomLevelsByReferenceTile({
          fractionalTileNumbers: [
            osmFractionalCenterTileNumbersX + gridTileIndexX,
            osmFractionalCenterTileNumbersY + gridTileIndexY,
          ],
          wholeZoomLevel: osmWholeScaledZoomLevel,
        }),
      };
    },
  );

  // console.log({ tileIndicesWithImagesByZoomLevel });

  return (
    <>
      {tileImageCache.availableZoomLevels.map((zoomLevelFromCache) => {
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

        const osmFractionalCenterTileNumbersAtZoomLevel = multiplyVector2d(
          osmFractionalCenterTileNumbers,
          2 ** (zoomLevelFromCache - osmWholeScaledZoomLevel),
        );
        const [
          osmFractionalCenterTileNumbersAtZoomLevelX,
          osmFractionalCenterTileNumbersAtZoomLevelY,
        ] = osmFractionalCenterTileNumbersAtZoomLevel;

        const fractionalPartOfCenterTileNumbers = calculateFractionalPartOfCenterTileNumbers(
          osmFractionalCenterTileNumbersAtZoomLevel,
          toWholeTileNumbers(osmFractionalCenterTileNumbersAtZoomLevel),
        );

        const pixelOffsetInCenterTile = calculatePixelOffsetInCenterTile(
          fractionalPartOfCenterTileNumbers,
          tileDimensionsAfterZoom,
        );

        const halfTileDimensionsAfterZoom =
          calculateHalfTileDimensionsAfterZoom(tileDimensionsAfterZoom);

        const pixelOffsetFromTileCenter = calculatePixelOffsetFromCenterTile(
          halfTileDimensionsAfterZoom,
          pixelOffsetInCenterTile,
        );
        const [pixelOffsetFromTileCenterX, pixelOffsetFromTileCenterY] = pixelOffsetFromTileCenter;

        return (
          <Fragment key={zoomLevelFromCache}>
            {tileIndicesWithImagesByZoomLevel.map(({ gridTileIndex, availableImages }) => {
              const [gridTileIndexX, gridTileIndexY] = gridTileIndex;

              const osmWholeCenterTileNumbersAtZoomLevel = toWholeTileNumbers(
                osmFractionalCenterTileNumbersAtZoomLevel,
              );

              const [osmWholeCenterTileNumbersAtZoomLevelX, osmWholeCenterTileNumbersAtZoomLevelY] =
                osmWholeCenterTileNumbersAtZoomLevel;

              // ////////////////////////////////////////////////////////////////////////////

              const availableZoomLevelsInCache =
                tileImageCache.getAvailableZoomLevelsByReferenceTile({
                  fractionalTileNumbers: [
                    osmFractionalCenterTileNumbersAtZoomLevelX + gridTileIndexX,
                    osmFractionalCenterTileNumbersAtZoomLevelY + gridTileIndexY,
                  ],
                  wholeZoomLevel: zoomLevelFromCache,
                });

              // console.log({ availableZoomLevelsInCache });
              // console.log({ availableZoomLevelsInCacheForGridTileIndices });
              // console.log({ availableZoomLevelsInCacheForGridTileIndices2 });

              const zoomLevelsInCacheLargerThanGridTileDimensions =
                availableZoomLevelsInCache.filter((zl) => {
                  const zoomScale = Math.pow(2, osmFractionalScaledZoomLevel - zl);
                  const tileWidth = zoomScale * gridTileWidth;
                  const tileHeight = zoomScale * gridTileHeight;

                  return tileWidth >= gridTileWidth && tileHeight >= gridTileHeight;
                });

              const otherAvailableZoomLevelsInCache =
                tileImageCache.getAvailableZoomLevelsByReferenceTile({
                  fractionalTileNumbers: [
                    osmFractionalCenterTileNumbersAtZoomLevelX + gridTileIndexX,
                    osmFractionalCenterTileNumbersAtZoomLevelY + gridTileIndexY,
                  ],
                  wholeZoomLevel: zoomLevelFromCache,
                });

              const otherZoomLevelsInCacheLargerThanGridTileDimensions =
                availableZoomLevelsInCache.filter((zl) => {
                  if (zl === zoomLevelFromCache) return false;
                  const [width, height] = calculateTileDimensionsAfterZoom(
                    calculateZoomLevelScaleFactor(osmFractionalScaledZoomLevel, zl),
                    gridTileDimensions,
                  );

                  return width >= gridTileWidth && height >= gridTileHeight;
                });

              // console.log(zoomLevelsInCacheLargerThanGridTileDimensions);
              // console.log(otherZoomLevelsInCacheLargerThanGridTileDimensions);
              // console.log({ availableImages });

              function isLowest(num: number, arr: number[]): boolean {
                const min = Math.min(...arr);
                return num === min;
              }
              // console.log(
              //   "isLowest: ",
              //   isLowest(
              //     zoomLevelFromCache,
              //     availableImages.map((im) => im.zoomLevel),
              //   ),
              // );
              console.log({ availableZoomLevelsInCacheForGridTileIndices2 });

              console.log(
                availableZoomLevelsInCacheForGridTileIndices2[gridTileIndexX]?.[gridTileIndexY],
              );

              const avlZoomLvls =
                availableZoomLevelsInCacheForGridTileIndices2[gridTileIndexX]?.[gridTileIndexY];
              if (!avlZoomLvls) {
                console.warn("No zoomlevels found. This indicates a problem in the code.");
              }

              // const isLowestZoomLevel = isLowest(
              //   zoomLevelFromCache,
              //   availableImages.map((im) => im.zoomLevel),
              // );
              const isLowestZoomLevel = isLowest(zoomLevelFromCache, avlZoomLvls);
              const isLargerThanGridTile =
                tileWidthAfterZoom >= gridTileWidth && tileHeightAfterZoom >= gridTileHeight;
              console.log("%cNew", "background: green;");

              console.log({ isLowestZoomLevel });
              console.log({ isLargerThanGridTile });

              const noLowerZoomLevelAvailable =
                isEmpty(zoomLevelsInCacheLargerThanGridTileDimensions) ||
                (zoomLevelsInCacheLargerThanGridTileDimensions.length === 1 &&
                  zoomLevelsInCacheLargerThanGridTileDimensions[0] === zoomLevelFromCache);

              const isLargerThanGridTileDimensions =
                !!zoomLevelsInCacheLargerThanGridTileDimensions.find(
                  (z) => z === zoomLevelFromCache,
                );
              console.log("%cOld", "background: red;");
              console.log({ isLowestZoomLevel });
              console.log({ isLargerThanGridTile });

              // if (!isLargerThanGridTileDimensions && !noLowerZoomLevelAvailable) {

              if (!isLargerThanGridTile && !isLowestZoomLevel) {
                console.log(
                  "%cI'm smaller than a grid tile and there is a lower zoom level tile available to fill the space!",
                  "background: red;",
                );
                return null;
              }
              // ////////////////////////////////////////////////////////////////////////////

              const imageFromCache = tileImageCache.getTileImage(
                osmWholeCenterTileNumbersAtZoomLevelX + gridTileIndexX,
                osmWholeCenterTileNumbersAtZoomLevelY + gridTileIndexY,
                zoomLevelFromCache,
              );

              if (isNull(imageFromCache)) {
                console.warn(
                  `No image was found for { x: ${
                    osmWholeCenterTileNumbersAtZoomLevelX + gridTileIndexX
                  }, y: ${
                    osmWholeCenterTileNumbersAtZoomLevelY + gridTileIndexY
                  }, z: ${zoomLevelFromCache}}`,
                );
                return null;
              }

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
