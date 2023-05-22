import { type Coordinate, type Dimensions } from "../../../types";
import { type Projection } from "../../projections";
import { type ReactElement, useEffect, useMemo, useState } from "react";
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
        1 + Math.ceil(width / 2 / scaledTileSize) * 2,
        1 + Math.ceil(height / 2 / scaledTileSize) * 2,
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

const useOsmScaledZoomLevel = (): number => {
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
  const osmFractionalBaseZoomLevel = useOsmScaledZoomLevel();

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
  [indexOffsetX, indexOffsetY]: Vector2d,
): UrlParameters => ({
  x: Math.floor(x) + indexOffsetX,
  y: Math.floor(y) + indexOffsetY,
  z: Math.floor(z),
});

const tileIndexOffsetsTestArray = [
  [0, 0],
  [1, 0],
  // [-1, 0],
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

  // const foo = identifyValidEdges()
  return (
    <>
      {tileIndexOffsetsTestArray.map((t) => (
        <OsmTile
          key={t.join()}
          osmScaledTileSize={osmScaledTileSize}
          tileIndexOffset={t}
          gridCenterOffset={gridCenterOffset}
        />
      ))}
    </>
  );
}

const drawTileWireframe = (
  ctx: CanvasRenderingContext2D,
  [xIndex, yIndex]: Vector2d,
  [xCoordinate, yCoordinate]: Vector2d,
  width: number,
  height = width,
): void => {
  ctx.beginPath();

  ctx.rect(xCoordinate, yCoordinate, width, height);
  ctx.lineWidth = 1;
  ctx.stroke();

  ctx.font = "24px Courier New";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  ctx.fillText(`x:${xIndex},y:${yIndex}`, xCoordinate + width / 2, yCoordinate + height / 2);
};

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

function OsmTile({
  tileIndexOffset,
  gridCenterOffset,
  osmScaledTileSize,
}: {
  tileIndexOffset: Vector2d;
  gridCenterOffset: Vector2d;
  osmScaledTileSize: number;
}): ReactElement | null {
  const viewCenterCoordinate = useViewCenterCoordinate();
  const [viewCenterCoordinateX, viewCenterCoordinateY] = viewCenterCoordinate;

  const viewProjection = useViewProjection();

  const layerContext = useLayerContext();

  const [tileIndexOffsetX, tileIndexOffsetY] = tileIndexOffset;

  const [gridCenterOffsetX, gridCenterOffsetY] = gridCenterOffset;

  const osmCenterCoordinate = useOsmCenterCoordinate();
  const [osmCenterX, osmCenterY] = osmCenterCoordinate;

  const osmZoomLevel = useOsmScaledZoomLevel();

  const currentOsmUrlParameters = createOsmUrlParameters(
    osmCenterX,
    osmCenterY,
    osmZoomLevel,
    tileIndexOffset,
  );

  const [osmTileImageUrl, setOsmTileImageUrl] = useState<string | null>(null);

  useEffect(() => {
    console.log("ping");
    const url = createOsmTileUrl(currentOsmUrlParameters);
    console.log({ url });
    if (!isValidOsmTileUrl(url)) {
      return;
    }

    const image = new Image();

    let timeoutId: number | null = null; // Variable to store timeout id for testing loading

    // We load the image before setting the url, that way the image data is already fetched when
    // painting the canvas.
    image.onload = () => {
      const delay = Math.random() * 2000 + 1000; // Random delay between 1 and 3 seconds

      timeoutId = window.setTimeout(() => {
        setOsmTileImageUrl(url);
      }, delay);
    };

    image.src = url;

    return () => {
      image.onload = null;
      image.onerror = null;
      if (!isNull(timeoutId)) clearTimeout(timeoutId); // Clear the timeout during cleanup
    };
  }, [currentOsmUrlParameters.x, currentOsmUrlParameters.y, currentOsmUrlParameters.z]);

  useEffect(() => {
    if (isNull(osmTileImageUrl)) return;
    // if ()
    console.log({ tileIndexOffsetX });
    console.log("pong");

    const ctx = layerContext.ref.current?.getContext("2d") ?? null;
    assertNotNull(ctx);

    const image = new Image();

    image.onload = () => {
      const urlParameters = getUrlParameters(osmTileImageUrl);

      const zoomScale = Math.pow(2, osmZoomLevel - urlParameters.z);
      const tileSizeAfterZoom = osmScaledTileSize * zoomScale;

      const tileIndexPixelOffsetX = tileIndexOffsetX * tileSizeAfterZoom;
      const tileIndexPixelOffsetY = tileIndexOffsetY * tileSizeAfterZoom;

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

      const differenceBetweenZoomAndScaledInPixels = tileSizeAfterZoom - osmScaledTileSize;
      const halfZoomDifference = differenceBetweenZoomAndScaledInPixels / 2;

      const dx =
        gridCenterOffsetX + tileIndexPixelOffsetX - halfZoomDifference + pixelOffsetFromCenterX;
      const dy =
        gridCenterOffsetY + tileIndexPixelOffsetY - halfZoomDifference + pixelOffsetFromCenterY;
      const dw = tileSizeAfterZoom;
      const dh = dw;

      ctx.drawImage(image, dx, dy, dw, dh);
      ctx.setLineDash([]);
      ctx.strokeStyle = "#393433";
      ctx.fillStyle = "#393433";
      drawTileWireframe(ctx, tileIndexOffset, [dx, dy], dw);
      ctx.strokeStyle = "#ed0c93";
      ctx.setLineDash([20, 20]);
      ctx.fillStyle = "#ed0c93";
      drawTileWireframe(
        ctx,
        tileIndexOffset,
        [
          gridCenterOffsetX + tileIndexOffsetX * osmScaledTileSize,
          gridCenterOffsetY + tileIndexOffsetY * osmScaledTileSize,
        ],
        osmScaledTileSize,
      );
    };

    if (isValidOsmTileUrl(osmTileImageUrl)) {
      image.src = osmTileImageUrl;
    }

    return () => {
      image.onload = null;
      image.onerror = null;
    };
  }, [
    viewCenterCoordinateX,
    viewCenterCoordinateY,
    osmTileImageUrl,
    tileIndexOffsetX,
    tileIndexOffsetY,
    gridCenterOffsetX,
    gridCenterOffsetY,
    osmScaledTileSize,
    osmZoomLevel,
    viewProjection.code,
  ]);

  return null;
}
