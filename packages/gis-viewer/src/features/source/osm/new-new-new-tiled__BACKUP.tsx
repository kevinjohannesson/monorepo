import { type Coordinate, type Dimensions } from "../../../types";
import { type Projection } from "../../projections";
import { type ReactElement, useEffect, useMemo, useRef, useState } from "react";
import { type UrlParameters } from "./types";
import {
  type Vector2d,
  assertNotNull,
  calculateCenterCoordinate,
  createSpiralPattern,
  divideVector2d,
  isNull,
  multiplyVector2d,
  subtractVector2d,
} from "utils";
import {
  calculateFractionalTileNumbers,
  calculateNextPowerOf2,
  calculatePreviousPowerOf2,
} from "./utils/tile-number-utils";
import { isEmpty } from "lodash";
import { isValidOsmUrlParameters } from "./utils/url-parameters-utils";
import { selectViewState, selectZoomLevel } from "../../view/slice";
import { useGisViewerSelector } from "../../../slice";
import { useLayerContext } from "../../layer";

const OSM_TILE_SIZE = 256;
const OSM_TILE_SERVER_URL = "https://tile.openstreetmap.org/{z}/{x}/{y}.png";

const EPSILON = 1e-6;

export const useViewDimensions = (): Dimensions =>
  useGisViewerSelector(selectViewState("dimensions"));
export const useViewProjection = (): Projection =>
  useGisViewerSelector(selectViewState("projection"));
export const useViewCenterCoordinate = (): Coordinate =>
  useGisViewerSelector(selectViewState("centerCoordinate"));
export const useViewZoomLevel = (): number =>
  Number((useGisViewerSelector(selectZoomLevel) + EPSILON).toFixed(5));

function calculateClosestPowerOf2(x: number): number {
  const nextPowerOf2 = calculateNextPowerOf2(x);
  const prevPowerOf2 = calculatePreviousPowerOf2(x);

  const distanceToNext = Math.abs(nextPowerOf2 - x);
  const distanceToPrev = Math.abs(prevPowerOf2 - x);

  return distanceToNext < distanceToPrev ? nextPowerOf2 : prevPowerOf2;
}

const useOsmBaseZoomLevel = (): number => {
  // The OSM base zoom level is calculated based on the width of the view.
  // We obtain this using the useViewDimensions hook.
  const [width] = useViewDimensions();

  const osmBaseZoomLevel = useMemo(() => {
    // First, we calculate the ratio of the view width to the size of an OSM tile.
    // This tells us how many OSM tiles can fit across the width of our view.
    const tilesAcrossViewWidth = width / OSM_TILE_SIZE;

    // However, we can't have a fractional number of tiles, and OSM uses a power-of-2
    // tile grid. So, we find the closest power of 2 that is greater than or equal to
    // our calculated number of tiles. This will be the number of tiles we actually use.
    const closestPowerOf2Tiles = calculateClosestPowerOf2(tilesAcrossViewWidth);

    // The OSM zoom level is defined such that at zoom level N, there are 2^N tiles across
    // the width of the world. Therefore, we can calculate the base OSM zoom level by taking
    // the base-2 logarithm of our calculated number of tiles. This gives us the power N such
    // that 2^N is our number of tiles, which is by definition our zoom level.
    const osmBaseZoomLevel = Math.log2(closestPowerOf2Tiles);

    return osmBaseZoomLevel;
  }, [width]);

  return osmBaseZoomLevel;
};

const useOsmBaseScale = (): number => {
  const [width] = useViewDimensions();

  // First, we need to determine how many tiles span the width of our view at the OSM base zoom level.
  // We calculate this using the useOsmBaseZoomLevel hook.
  const osmBaseZoomLevel = useOsmBaseZoomLevel();

  const osmBaseScale = useMemo(() => {
    // Knowing the base zoom level, we can calculate the total pixel extent of this zoom level.
    // Each OSM tile has a fixed size (OSM_TILE_SIZE). So, the total pixel extent of the base zoom level
    // can be calculated by multiplying the number of tiles (which is 2^osmBaseZoomLevel) by the size of each tile.
    // This gives us the total width of the OSM pixel grid at the base zoom level.
    const osmBasePixelExtent = Math.pow(2, osmBaseZoomLevel) * OSM_TILE_SIZE;

    // However, our view might not be exactly the same size as the OSM base pixel extent. To account for this,
    // we calculate a scale factor that can be used to convert coordinates in our view to coordinates in the OSM pixel grid at the base zoom level.
    // This scale factor is simply the ratio of the width of our view to the OSM base pixel extent.
    // If the scale factor is less than 1, our view is smaller than the OSM base pixel extent, and if it's greater than 1, our view is larger.
    const osmBaseScale = width / osmBasePixelExtent;

    // Finally, we return this scale factor so it can be used elsewhere in our application.
    return osmBaseScale;
  }, [width, osmBaseZoomLevel]);

  return osmBaseScale;
};

const useOsmScaledTileSize = (): number => {
  const osmBaseScale = useOsmBaseScale();

  // The size of the tiles that are rendered on screen might not be the same as the original OSM_TILE_SIZE,
  // because we apply a scaling factor to the tiles to fit them into our view.
  // Therefore, we calculate the size of the rendered tiles by multiplying the OSM_TILE_SIZE by the scale factor.
  const osmScaledTileSize = osmBaseScale * OSM_TILE_SIZE;

  return osmScaledTileSize;
};

const useTileIndexOffsets = (): Vector2d[] => {
  const [width, height] = useViewDimensions();
  const scaledTileSize = useOsmScaledTileSize();

  // The tiles are arranged in a grid pattern, and we need to determine the index offsets of the tiles within this grid.
  // These offsets are used when rendering the tiles, to place them at the correct positions in the view.
  // We create a spiral pattern, starting from the center of the view and moving outwards.
  // The size of the pattern is determined by the size of our view and the size of the rendered tiles.
  // We add 1 to ensure that we always have at least one tile in the center,
  // and we multiply by 2 to ensure that we cover both halves of the view (left and right, or top and bottom).
  // Finally, we use Math.ceil to round up, because we can't have a fraction of a tile.
  // It is worth noting that in the Canvas coordinate system, the positive y direction is downwards,
  // which is why we invert the y coordinates in our spiral pattern.
  const tileIndexOffsets = useMemo(
    () =>
      createSpiralPattern(
        // 1 + Math.ceil(width / 2 / scaledTileSize) * 2,
        1 + Math.round(width / 2 / scaledTileSize) * 2,
        // 1 + Math.ceil(height / 2 / scaledTileSize) * 2,
        1 + Math.round(height / 2 / scaledTileSize) * 2,
      ).map(([x, y]) => [x, -y]),
    [width, height, scaledTileSize],
  );

  // Return the calculated tile index offsets so they can be used elsewhere in the application.
  return tileIndexOffsets as Vector2d[];
};

const useGridCenterOffset = (): Vector2d => {
  const [width, height] = useViewDimensions();

  const osmScaledTileSize = useOsmScaledTileSize();

  // In order to align the tile grid with the center of the view, we need to calculate an offset.
  // This offset is simply the difference between the actual center of the view and
  // the center of the tile that would be at the center of the view if the tile grid was aligned to the top-left corner of the view.
  // The center of the view can be calculated simply by halving the width and height of the view.
  // The center of the central tile (if the tile grid was aligned to the top-left corner of the view) can be calculated by halving the tile size.
  // We then subtract these two coordinates to get the offset that needs to be applied to the tile grid to align it with the center of the view.
  const centerOffset = useMemo(() => {
    const viewCenter = calculateCenterCoordinate([width, height]);
    const tileCenter = divideVector2d(osmScaledTileSize, 2);
    return subtractVector2d(viewCenter, tileCenter);
  }, [width, height, osmScaledTileSize]);

  return centerOffset;
};

const useOsmZoomLevel = (): number => {
  const viewZoomLevel = useViewZoomLevel();
  const osmBaseZoomLevel = useOsmBaseZoomLevel();

  // The OSM base zoom level is added to the view zoom level.
  // This gives us a new zoom level that is scaled according to the OSM base zoom level.
  // This scaled zoom level allows us to maintain the desired level of detail in our map view,
  // regardless of the actual zoom level of the view.
  const osmBaseScaledZoomLevel = viewZoomLevel + osmBaseZoomLevel;

  return osmBaseScaledZoomLevel;
};

const useScaledOsmIntegerZoomLevel = (): number => {
  const osmFractionalBaseZoomLevel = useOsmZoomLevel();

  // We first take the floor of the current view's zoom level, effectively removing any decimal part.
  // This gives us the closest lower integer zoom level, which we will use as a base for further calculations.
  const integerZoomLevel = Math.floor(osmFractionalBaseZoomLevel);

  return integerZoomLevel;
};

const useOsmCenterCoordinate = (): Vector2d => {
  const projection = useViewProjection();
  const centerCoordinate = useViewCenterCoordinate();
  const osmBaseScaledZoomLevel = useScaledOsmIntegerZoomLevel();

  // The calculation of tile numbers depends on the center coordinate of the view,
  // the projection being used, and the current scaled zoom level.
  // We use a useMemo hook to avoid unnecessary recalculations.
  // The tile numbers will only be recalculated if any of these dependencies change.
  const osmFractionalTileNumbers = useMemo(
    () => calculateFractionalTileNumbers(centerCoordinate, projection.code, osmBaseScaledZoomLevel),
    [centerCoordinate, projection.code, osmBaseScaledZoomLevel],
  );

  return osmFractionalTileNumbers;
};

const createOsmUrlParameters = (
  x: number,
  y: number,
  z: number,
  offset?: Vector2d,
): UrlParameters => ({
  x: Math.floor(x) + (offset?.[0] ?? 0),
  y: Math.floor(y) + (offset?.[1] ?? 0),
  z: Math.floor(z),
});

const tileIndexOffsetsTestArray = [
  [0, 0],
  [1, 0],
  [-1, 0],
  // [-2, 0],
  // [2, 0],

  // [0, -1],
  // [1, -1],
  // [-1, -1],
  // [-2, -1],
  // [2, -1],

  // [0, 1],
  // [1, 1],
  // [-1, 1],
  // [-2, 1],
  // [2, 1],
] as Vector2d[];

export function OsmTiledSource(): ReactElement | null {
  const gridCenterOffset = useGridCenterOffset();
  const tileIndexOffsets = useTileIndexOffsets();
  const osmScaledTileSize = useOsmScaledTileSize();

  return (
    <>
      <ImageTileLoader
        tileIndexOffsets={tileIndexOffsetsTestArray}
        osmScaledTileSize={osmScaledTileSize}
        gridCenterOffset={gridCenterOffset}
      />
    </>
  );
}

function getClosestNumber(numbers: number[], goal: number): number {
  return numbers.reduce((prev, curr) =>
    Math.abs(curr - goal) < Math.abs(prev - goal) ? curr : prev,
  );
}

function ImageTileLoader({
  tileIndexOffsets,
  osmScaledTileSize,
  gridCenterOffset,
}: {
  tileIndexOffsets: Vector2d[];
  osmScaledTileSize: number;
  gridCenterOffset: Vector2d;
}): ReactElement | null {
  const [gridCenterOffsetX, gridCenterOffsetY] = gridCenterOffset;

  const viewCenterCoordinate = useViewCenterCoordinate();
  const [viewCenterCoordinateX, viewCenterCoordinateY] = viewCenterCoordinate;

  const viewProjection = useViewProjection();

  const layerContext = useLayerContext();

  const osmZoomLevel = useOsmZoomLevel();
  const osmCenterCoordinate = useOsmCenterCoordinate();
  const [osmCenterX, osmCenterY] = osmCenterCoordinate;

  const [osmTileImages, setOsmTileImages] = useState<
    Record<number, Record<number, Record<number, HTMLImageElement | null>>>
  >({});

  useEffect(() => {
    const images: HTMLImageElement[] = [];
    const timeouts: number[] = [];

    tileIndexOffsets.forEach((io) => {
      const url = createOsmTileUrl(
        createOsmUrlParameters(osmCenterX, osmCenterY, osmZoomLevel, io),
      );

      const image = new Image();
      let timeoutId: number | null = null;

      image.onload = () => {
        const delay = Math.random() * 2000 + 1000; // Random delay between 1 and 3 seconds for simulating slow internet

        timeoutId = window.setTimeout(
          () => {
            setOsmTileImages((state) => ({
              ...state,
              [io[0]]: {
                ...state[io[0]],
                [io[1]]: {
                  ...state[io[0]]?.[io[1]],
                  [Math.floor(osmZoomLevel)]: image,
                },
              },
            }));
          },
          io[0] === 1 ? 6000 : delay,
        );

        timeouts.push(timeoutId);
      };

      if (isValidOsmTileUrl(url)) {
        image.src = url;
        images.push(image);
      }
    });

    return () => {
      images.forEach((i) => {
        i.onload = null;
        i.onerror = null;
      });
      timeouts.forEach((t) => {
        clearTimeout(t);
      });
    };
  }, [
    Math.floor(osmCenterX),
    Math.floor(osmCenterY),
    Math.floor(osmZoomLevel),
    tileIndexOffsets.join(),
  ]);

  useEffect(() => {
    const totalValidTiles = tileIndexOffsets.filter(([offsetX, offsetY]) =>
      isValidOsmUrlParameters(
        createOsmUrlParameters(osmCenterX + offsetX, osmCenterY + offsetY, osmZoomLevel),
      ),
    ).length;
    console.log({ totalValidTiles });
    const imagesByClosestZoomLevel = tileIndexOffsets
      .flatMap(
        (
          curr,
        ): Array<{ image: HTMLImageElement; zoomLevel: number; x: number; y: number }> | [] => {
          const availableZoomLevels = Object.keys(osmTileImages[curr[0]]?.[curr[1]] ?? {}).map(
            Number,
          );
          if (availableZoomLevels.length === 0) return [];

          const closestZoomLevel = getClosestNumber(availableZoomLevels, osmZoomLevel);
          const image = osmTileImages[curr[0]]?.[curr[1]]?.[closestZoomLevel];

          return image != null
            ? [{ image, zoomLevel: closestZoomLevel, x: curr[0], y: curr[1] }]
            : [];
        },
      )
      .sort((a, b) => {
        const zoomScale = Math.pow(2, osmZoomLevel - Math.floor(osmZoomLevel));
        const tileSize = zoomScale * osmScaledTileSize;

        // console.log({ tileSize });
        return a.zoomLevel - b.zoomLevel;
      });

    const totalImagesByZoomLevel = tileIndexOffsets.flatMap(
      (curr): Array<{ image: HTMLImageElement; zoomLevel: number; x: number; y: number }> | [] => {
        const availableZoomLevels = Object.keys(osmTileImages[curr[0]]?.[curr[1]] ?? {}).map(
          Number,
        );
        if (availableZoomLevels.length === 0) return [];

        const image = osmTileImages[curr[0]]?.[curr[1]]?.[Math.floor(osmZoomLevel)];

        return image != null ? [{ image, zoomLevel: osmZoomLevel, x: curr[0], y: curr[1] }] : [];
      },
    ).length;
    console.log({ totalImagesByZoomLevel });
    const ctx = layerContext.ref.current?.getContext("2d");
    assertNotNull(ctx);

    tileIndexOffsets.forEach(([x, y]) => {
      const paintTile = (img: HTMLImageElement): void => {
        const urlParameters = getUrlParameters(img.src);

        const zoomScale = Math.pow(2, osmZoomLevel - urlParameters.z);
        const tileSizeAfterZoom = zoomScale * osmScaledTileSize;
        const halfZoomDifference = (tileSizeAfterZoom - osmScaledTileSize) / 2;

        const centerTileNumbers = calculateFractionalTileNumbers(
          viewCenterCoordinate,
          viewProjection.code,
          urlParameters.z,
        );

        const [pixelOffsetFromCenterX, pixelOffsetFromCenterY] = subtractVector2d(
          tileSizeAfterZoom / 2,
          multiplyVector2d(
            subtractVector2d(centerTileNumbers, centerTileNumbers.map(Math.floor) as Vector2d),
            tileSizeAfterZoom,
          ),
        );

        const dx =
          gridCenterOffsetX + x * tileSizeAfterZoom - halfZoomDifference + pixelOffsetFromCenterX;
        const dy =
          gridCenterOffsetY + y * tileSizeAfterZoom - halfZoomDifference + pixelOffsetFromCenterY;

        ctx.drawImage(img, dx, dy, tileSizeAfterZoom, tileSizeAfterZoom);
        ctx.strokeRect(dx, dy, tileSizeAfterZoom, tileSizeAfterZoom);
      };

      const availableZoomLevels = Object.keys(osmTileImages[x]?.[y] ?? {}).map(Number);

      if (isEmpty(availableZoomLevels)) return;

      const sortedAvailableZoomLevels = [...availableZoomLevels]; // .sort((a, b) => {
      //   return a - b;
      // });

      const filteredAvailableZoomLevels = [...sortedAvailableZoomLevels].filter((zl, i, arr) => {
        const zoomScale = Math.pow(2, osmZoomLevel - zl);
        const tileSize = zoomScale * osmScaledTileSize;

        return tileSize >= osmScaledTileSize;
      });
      // console.log({ filteredAvailableZoomLevels });
      if (isEmpty(filteredAvailableZoomLevels)) {
        // console.log("empty list!");
        if (totalImagesByZoomLevel !== totalValidTiles) {
          const closestZoomLevel = getClosestNumber(sortedAvailableZoomLevels, osmZoomLevel);
          const img = osmTileImages[x]?.[y]?.[closestZoomLevel] ?? null;
          if (!isNull(img)) {
            paintTile(img);
          }
        }
      } else {
        for (const z of filteredAvailableZoomLevels) {
          const img = osmTileImages[x]?.[y]?.[z] ?? null;
          if (!isNull(img)) {
            paintTile(img);
          }
        }
      }
    });
  }, [
    tileIndexOffsets.join(),
    osmTileImages,
    osmZoomLevel,
    osmCenterX,
    osmCenterY,
    osmScaledTileSize,
    gridCenterOffsetX,
    gridCenterOffsetY,
    viewCenterCoordinateX,
    viewCenterCoordinateY,
    viewProjection.code,
  ]);

  return null;
}

function getUrlParameters(url: string): UrlParameters {
  const regex = /https:\/\/tile\.openstreetmap\.org\/(-?\d+)\/(-?\d+)\/(-?\d+)\.png/;
  const match = url.match(regex);

  let result: UrlParameters | null = null;

  if (match != null && match[1] !== "" && match[2] !== "" && match[3] !== "") {
    result = {
      z: parseInt(match[1]),
      x: parseInt(match[2]),
      y: parseInt(match[3]),
    };
  }

  assertNotNull(result);

  return result;
}

const createOsmTileUrl = ({ x, y, z }: UrlParameters): string =>
  OSM_TILE_SERVER_URL.replace("{z}", z.toString())
    .replace("{x}", x.toString())
    .replace("{y}", y.toString());

function isValidOsmTileUrl(url: string): boolean {
  return isValidOsmUrlParameters(getUrlParameters(url));
}