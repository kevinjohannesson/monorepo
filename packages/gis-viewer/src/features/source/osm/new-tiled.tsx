import { type Coordinate, type Dimensions } from "../../../types";
import {
  type MutableRefObject,
  type ReactElement,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { type Projection } from "../../projections";
import { type UrlParameters } from "./types";
import {
  type Vector2d,
  assertNotNull,
  calculateCenterCoordinate,
  createSpiralPattern,
  divideVector2d,
  isNull,
  subtractVector2d,
} from "utils";
import {
  calculateFractionalTileNumbers,
  calculateNextPowerOf2,
  calculatePreviousPowerOf2,
  calculateTileNumbers,
} from "./utils/tile-number-utils";
import { calculateRenderedTileCenterOffset } from "./utils/rendered-tile-utils";
import { createSpiralPattern2 } from "utils/src/pattern";
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

const useScaledTileSize = (): number => {
  const osmBaseScale = useOsmBaseScale();

  // The size of the tiles that are rendered on screen might not be the same as the original OSM_TILE_SIZE,
  // because we apply a scaling factor to the tiles to fit them into our view.
  // Therefore, we calculate the size of the rendered tiles by multiplying the OSM_TILE_SIZE by the scale factor.
  const scaledTileSize = osmBaseScale * OSM_TILE_SIZE;

  return scaledTileSize;
};

const useTileIndexOffsets = (): number[][] => {
  const [width, height] = useViewDimensions();
  const scaledTileSize = useScaledTileSize();

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
  return tileIndexOffsets;
};

const useGridCenterOffset = (): Vector2d => {
  const [width, height] = useViewDimensions();
  const scaledTileSize = useScaledTileSize();

  // In order to align the tile grid with the center of the view, we need to calculate an offset.
  // This offset is simply the difference between the actual center of the view and
  // the center of the tile that would be at the center of the view if the tile grid was aligned to the top-left corner of the view.
  // The center of the view can be calculated simply by halving the width and height of the view.
  // The center of the central tile (if the tile grid was aligned to the top-left corner of the view) can be calculated by halving the scaledTileSize.
  // We then subtract these two coordinates to get the offset that needs to be applied to the tile grid to align it with the center of the view.
  const centerOffset = useMemo(() => {
    const viewCenter = calculateCenterCoordinate([width, height]);
    const tileCenter = divideVector2d(scaledTileSize, 2);
    return subtractVector2d(viewCenter, tileCenter);
  }, [width, height, scaledTileSize]);

  return centerOffset;
};

// const useOsmTileParameters = (): UrlParameters => {

// }

// maybe remove "baseScaled"?
const useOsmFractionalBaseScaledZoomLevel = (): number => {
  const viewZoomLevel = useViewZoomLevel();
  const osmBaseZoomLevel = useOsmBaseZoomLevel();

  // The OSM base zoom level is added to the view zoom level.
  // This gives us a new zoom level that is scaled according to the OSM base zoom level.
  // This scaled zoom level allows us to maintain the desired level of detail in our map view,
  // regardless of the actual zoom level of the view.
  const osmBaseScaledZoomLevel = viewZoomLevel + osmBaseZoomLevel;

  return osmBaseScaledZoomLevel;
};

// maybe remove "baseScaled"?
const useOsmIntegerBaseScaledZoomLevel = (): number => {
  const osmFractionalBaseZoomLevel = useOsmFractionalBaseScaledZoomLevel();

  // We first take the floor of the current view's zoom level, effectively removing any decimal part.
  // This gives us the closest lower integer zoom level, which we will use as a base for further calculations.
  const integerZoomLevel = Math.floor(osmFractionalBaseZoomLevel);

  return integerZoomLevel;
};

const useOsmFractionalTileNumbersForCenterCoordinateAtCurrentZoomLevel = (): Vector2d => {
  const projection = useViewProjection();
  const centerCoordinate = useViewCenterCoordinate();
  const osmBaseScaledZoomLevel = useOsmIntegerBaseScaledZoomLevel();

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

export function NewTiled(): ReactElement | null {
  const scaledTileSize = useScaledTileSize();
  const tileIndexOffsets = useTileIndexOffsets();
  const gridCenterOffset = useGridCenterOffset();
  const osmFractionalTileNumbersForCenterCoordinateAtCurrentZoomLevel =
    useOsmFractionalTileNumbersForCenterCoordinateAtCurrentZoomLevel();
  const osmIntegerTileNumbersForCenterCoordinateAtCurrentZoomLevel =
    osmFractionalTileNumbersForCenterCoordinateAtCurrentZoomLevel.map(Math.floor) as Vector2d;
  const osmIntegerBaseScaledZoomLevel = useOsmIntegerBaseScaledZoomLevel();
  const osmFractionalBaseScaledZoomLevel = useOsmFractionalBaseScaledZoomLevel();

  // const renderedCenterOffset = useMemo(
  //   () =>
  //     calculateRenderedTileCenterOffset(
  //       scaledTileSize,
  //       osmFractionalTileNumbersForCenterCoordinateAtCurrentZoomLevel,
  //       osmIntegerTileNumbersForCenterCoordinateAtCurrentZoomLevel,
  //     ),
  //   [
  //     scaledTileSize,
  //     osmFractionalTileNumbersForCenterCoordinateAtCurrentZoomLevel,
  //     osmIntegerTileNumbersForCenterCoordinateAtCurrentZoomLevel,
  //   ],
  // );

  // console.log({ renderedCenterOffset });
  // console.log({ osmFractionalTileNumbersForCenterCoordinateAtCurrentZoomLevel });
  // console.log({ osmIntegerTileNumbersForCenterCoordinateAtCurrentZoomLevel });
  // console.log(
  //   subtractVector2d(
  //     osmFractionalTileNumbersForCenterCoordinateAtCurrentZoomLevel,
  //     osmIntegerTileNumbersForCenterCoordinateAtCurrentZoomLevel,
  //   ),
  // );
  const [centerCoordinateNormalizedOffsetX, centerCoordinateNormalizedOffsetY] = subtractVector2d(
    osmFractionalTileNumbersForCenterCoordinateAtCurrentZoomLevel,
    osmIntegerTileNumbersForCenterCoordinateAtCurrentZoomLevel,
  );

  // console.log({ centerCoordinateNormalizedOffsetX, centerCoordinateNormalizedOffsetY });
  // const viewZoomLevel = useViewZoomLevel();
  // const osmBaseZoomLevel = useOsmBaseZoomLevel();
  // const diff = viewZoomLevel + osmBaseZoomLevel - osmIntegerBaseScaledZoomLevel;
  // console.log({ diff });

  // console.log({ tileIndexOffsets });
  // console.log(osmTileNumbersForCenterCoordinateAtCurrentZoomLevel);
  // console.log({ osmFractionalBaseScaledZoomLevel });
  return (
    <>
      {/* {tileIndexOffsets.map(([tileIndexOffsetX, tileIndexOffsetY]) => ( */}
      {(
        [
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
        ] as Vector2d[]
      ).map(([tileIndexOffsetX, tileIndexOffsetY]) => (
        <RenderValidTile
          key={[tileIndexOffsetX, tileIndexOffsetY].join()}
          scaledTileSize={scaledTileSize}
          tileIndexOffsetX={tileIndexOffsetX}
          tileIndexOffsetY={tileIndexOffsetY}
          gridCenterOffset={gridCenterOffset}
          osmTileNumberX={
            osmIntegerTileNumbersForCenterCoordinateAtCurrentZoomLevel[0] + tileIndexOffsetX
          }
          osmTileNumberY={
            osmIntegerTileNumbersForCenterCoordinateAtCurrentZoomLevel[1] + tileIndexOffsetY
          }
          osmIntegerBaseScaledZoomLevel={osmIntegerBaseScaledZoomLevel}
          osmFractionalBaseScaledZoomLevel={osmFractionalBaseScaledZoomLevel}
          centerCoordinateNormalizedOffsetX={centerCoordinateNormalizedOffsetX}
          centerCoordinateNormalizedOffsetY={centerCoordinateNormalizedOffsetY}
        />
      ))}
    </>
  );
}

// memo to layer?
const getContext = (ref: MutableRefObject<HTMLCanvasElement | null>): CanvasRenderingContext2D => {
  const canvas = ref.current;
  assertNotNull(canvas);
  const context = canvas.getContext("2d");
  assertNotNull(context);
  return context;
};

interface TileRendererProps {
  scaledTileSize: number;
  tileIndexOffsetX: number;
  tileIndexOffsetY: number;
  gridCenterOffset: Vector2d;
  osmTileNumberX: number;
  osmTileNumberY: number;
  centerCoordinateNormalizedOffsetX: number;
  centerCoordinateNormalizedOffsetY: number;
  osmIntegerBaseScaledZoomLevel: number;
  osmFractionalBaseScaledZoomLevel: number;
}

function TileRenderer({
  scaledTileSize,
  tileIndexOffsetX,
  tileIndexOffsetY,
  gridCenterOffset,
  osmTileNumberX,
  osmTileNumberY,
  centerCoordinateNormalizedOffsetX,
  centerCoordinateNormalizedOffsetY,
  osmIntegerBaseScaledZoomLevel,
  osmFractionalBaseScaledZoomLevel,
}: TileRendererProps): null {
  const { ref } = useLayerContext();

  const lastImage = useRef<HTMLImageElement | null>(null);
  const lastZoomLevel = useRef(osmFractionalBaseScaledZoomLevel);

  useEffect(() => {
    const urlParameters: UrlParameters = {
      x: osmTileNumberX,
      y: osmTileNumberY,
      z: osmIntegerBaseScaledZoomLevel,
    };
    // console.log({ osmFractionalBaseScaledZoomLevel });

    const ctx = getContext(ref);

    if (isValidOsmUrlParameters(urlParameters)) {
      const tileUrl = OSM_TILE_SERVER_URL.replace("{z}", urlParameters.z.toString())
        .replace("{x}", urlParameters.x.toString())
        .replace("{y}", urlParameters.y.toString());

      const image = new Image();

      // context.clearRect(
      //   topLeftPixelCoordinate[0],
      //   topLeftPixelCoordinate[1],
      //   renderedTileSize,
      //   renderedTileSize,
      // );
      image.onload = function () {
        // console.log("image onload");
        // console.log({ x: osmTileNumberX, y: osmTileNumberY });
        // console.log(osmFractionalBaseScaledZoomLevel);
        // console.log(lastZoomLevel.current);
        // console.log(osmFractionalBaseScaledZoomLevel / lastZoomLevel.current);
        // console.log(osmFractionalBaseScaledZoomLevel % osmIntegerBaseScaledZoomLevel);

        const scale = 1 + (osmFractionalBaseScaledZoomLevel % osmIntegerBaseScaledZoomLevel);
        // const scale = 1;
        // console.log({ scale });
        // ctx.globalAlpha = 0.5;
        // const offscreenCanvas = new OffscreenCanvas(scaledTileSize, scaledTileSize);
        // const offscreenCtx = offscreenCanvas.getContext("2d")!;
        // const offset = scaledTileSize * scale - scaledTileSize;
        // console.log({ x: tileIndexOffsetX, y: tileIndexOffsetY });

        // console.log({ scaledTileSize });
        // console.log({ offset });
        // console.log(tileIndexOffsetX);

        // console.log(offset * tileIndexOffsetX);
        // offscreenCtx.drawImage(
        //   image,
        //   offset * tileIndexOffsetX,
        //   offset * tileIndexOffsetY,
        //   scaledTileSize * scale,
        //   scaledTileSize * scale,
        // );
        // console.log({ scale });
        const tileSizeAfterZoom = scale * scaledTileSize;
        // console.log({ gridCenterOffset });
        const originX = gridCenterOffset[0] + tileIndexOffsetX * scaledTileSize;
        const originY = gridCenterOffset[1] + tileIndexOffsetY * scaledTileSize;
        // console.log({ originX, originY });
        const scaledScaleDifference = tileSizeAfterZoom - scaledTileSize;
        const halfDifference = scaledScaleDifference / 2;
        // console.log({ scaledScaleDifference });
        const offsetFromTopLeftPxX = centerCoordinateNormalizedOffsetX * tileSizeAfterZoom;
        const offsetFromTopLeftPxY = centerCoordinateNormalizedOffsetY * tileSizeAfterZoom;
        // console.log({ offsetFromTopLeftPxX, offsetFromTopLeftPxY });

        const offsetFromCenterPxX = tileSizeAfterZoom / 2 - offsetFromTopLeftPxX;
        const offsetFromCenterPxY = tileSizeAfterZoom / 2 - offsetFromTopLeftPxY;
        // console.log({ offsetFromCenterPxX, offsetFromCenterPxY });

        const offscreenCanvas = new OffscreenCanvas(scaledTileSize, scaledTileSize);
        const offscreenCtx = offscreenCanvas.getContext("2d")!;

        offscreenCtx.drawImage(
          image,
          0 - halfDifference,
          0 - halfDifference,
          tileSizeAfterZoom,
          tileSizeAfterZoom,
        );
        console.log({ scaledTileSize });
        console.log({ originX });
        ctx.drawImage(offscreenCanvas, originX, originY, scaledTileSize, scaledTileSize);
        // ctx.drawImage(
        //   image,
        //   originX - halfDifference + offsetFromCenterPxX,
        //   originY - halfDifference + offsetFromCenterPxY,
        //   tileSizeAfterZoom,
        //   tileSizeAfterZoom,
        // );

        // ctx.drawImage(
        //   image,
        //   gridCenterOffset[0] +
        //     tileIndexOffsetX * scaledTileSize +
        //     scaledTileSize / 2 -
        //     centerCoordinateNormalizedOffsetX * scaledTileSize,
        //   gridCenterOffset[1] +
        //     tileIndexOffsetY * scaledTileSize +
        //     scaledTileSize / 2 -
        //     centerCoordinateNormalizedOffsetY * scaledTileSize,
        //   scaledTileSize ,
        //   scaledTileSize ,
        // );
        // console.log("hello");
        lastImage.current = image;
        lastZoomLevel.current = osmIntegerBaseScaledZoomLevel;
        // console.log("bye");
        // ctx.globalAlpha = 1;

        ctx.beginPath();

        ctx.rect(
          gridCenterOffset[0] + tileIndexOffsetX * scaledTileSize,
          gridCenterOffset[1] + tileIndexOffsetY * scaledTileSize,
          scaledTileSize,
          scaledTileSize,
        );
        ctx.lineWidth = 1;
        ctx.stroke();

        ctx.font = "24px Courier New";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";

        ctx.fillText(
          `x: ${tileIndexOffsetX}, y: ${tileIndexOffsetY}`,
          gridCenterOffset[0] + tileIndexOffsetX * scaledTileSize + scaledTileSize / 2,
          gridCenterOffset[1] + tileIndexOffsetY * -scaledTileSize + scaledTileSize / 2,
        );
      };

      image.src = tileUrl;

      return () => {
        image.onload = null;
      };
    }
  }, [
    scaledTileSize,
    tileIndexOffsetX,
    tileIndexOffsetY,
    gridCenterOffset,
    osmTileNumberX,
    osmTileNumberY,
    osmIntegerBaseScaledZoomLevel,
    osmFractionalBaseScaledZoomLevel,
    centerCoordinateNormalizedOffsetX,
    centerCoordinateNormalizedOffsetY,
  ]);
  return null;
}

function TileClearer({ topLeftPixelCoordinate, renderedTileSize, offset, zoomLevel }: any): null {
  const { ref } = useLayerContext();

  useEffect(() => {
    const canvas = ref.current;
    assertNotNull(canvas);
    const context = canvas.getContext("2d");
    assertNotNull(context);

    // context.clearRect(
    //   topLeftPixelCoordinate[0],
    //   topLeftPixelCoordinate[1],
    //   renderedTileSize,
    //   renderedTileSize,
    // );
    // context.fillStyle = "red";
    // context.fillRect(
    //   topLeftPixelCoordinate[0],
    //   topLeftPixelCoordinate[1],
    //   renderedTileSize,
    //   renderedTileSize,
    // );

    // context.fillStyle = "black";

    // renderGridTile(canvas, topLeftPixelCoordinate, [renderedTileSize, renderedTileSize]);
    // renderGridTileIndices(canvas, offset, topLeftPixelCoordinate, [
    //   renderedTileSize,
    //   renderedTileSize,
    // ]);
  });

  return null;
}

function RenderValidTile({
  scaledTileSize,
  tileIndexOffsetX,
  tileIndexOffsetY,
  gridCenterOffset,
  osmTileNumberX,
  osmTileNumberY,
  centerCoordinateNormalizedOffsetX,
  centerCoordinateNormalizedOffsetY,
  osmIntegerBaseScaledZoomLevel,
  osmFractionalBaseScaledZoomLevel,
}: TileRendererProps): ReactElement | null {
  const urlParameters: UrlParameters = {
    x: osmTileNumberX,
    y: osmTileNumberY,
    z: osmIntegerBaseScaledZoomLevel,
  };
  if (isValidOsmUrlParameters(urlParameters)) {
    return (
      <TileRendererNew2
        scaledTileSize={scaledTileSize}
        tileIndexOffsetX={tileIndexOffsetX}
        tileIndexOffsetY={tileIndexOffsetY}
        gridCenterOffset={gridCenterOffset}
        osmTileNumberX={osmTileNumberX}
        osmTileNumberY={osmTileNumberY}
        centerCoordinateNormalizedOffsetX={centerCoordinateNormalizedOffsetX}
        centerCoordinateNormalizedOffsetY={centerCoordinateNormalizedOffsetY}
        osmIntegerBaseScaledZoomLevel={osmIntegerBaseScaledZoomLevel}
        osmFractionalBaseScaledZoomLevel={osmFractionalBaseScaledZoomLevel}
      />
    );
  }

  return null;
  // return <TileClearer />
}

function useOsmTileImage(x: number, y: number, z: number): { loaded: boolean; error: boolean } {
  const [status, setStatus] = useState({ loaded: false, error: false });

  useEffect(() => {
    const url = OSM_TILE_SERVER_URL.replace("{z}", z.toString())
      .replace("{x}", x.toString())
      .replace("{y}", y.toString());

    const img = new Image();
    img.onload = () => {
      setStatus({ loaded: true, error: false });
    };
    img.onerror = () => {
      setStatus({ loaded: false, error: true });
    };
    img.src = url;

    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [x, y, z]);

  return status;
}

const createOsmTileUrl = (x: number, y: number, z: number): string =>
  OSM_TILE_SERVER_URL.replace("{z}", z.toString())
    .replace("{x}", x.toString())
    .replace("{y}", y.toString());

function useOsmTileUrl(x: number, y: number, z: number): string {
  const [osmTileUrl, setOsmTileUrl] = useState(createOsmTileUrl(x, y, z));

  useEffect(() => {
    setOsmTileUrl(createOsmTileUrl(x, y, z));
  }, [x, y, z]);

  return osmTileUrl;
}

function getZValue(url: string): string | null {
  const regex = /https:\/\/tile\.openstreetmap\.org\/(\d+)\/\d+\/\d+\.png/;
  const match = url.match(regex);

  if (match != null && match[1]) {
    return match[1];
  } else {
    return null;
  }
}

function TileRendererNew({
  scaledTileSize,
  tileIndexOffsetX,
  tileIndexOffsetY,
  gridCenterOffset,
  osmTileNumberX,
  osmTileNumberY,
  centerCoordinateNormalizedOffsetX,
  centerCoordinateNormalizedOffsetY,
  osmIntegerBaseScaledZoomLevel,
  osmFractionalBaseScaledZoomLevel,
}: TileRendererProps): null {
  const { ref } = useLayerContext();

  // const [image, setImage] = useState<null>(null);
  // const imageRef = useRef<null | HTMLImageElement>(null);
  // const [tileImage, setTileImage] = useState<null | HTMLImageElement>(null);
  // const { loaded, error } = useOsmTileImage(
  //   osmTileNumberX,
  //   osmTileNumberY,
  //   osmIntegerBaseScaledZoomLevel,
  // );
  // const osmTileUrl = useOsmTileUrl(osmTileNumberX, osmTileNumberY, osmIntegerBaseScaledZoomLevel);
  const [osmTileUrl, setOsmTileUrl] = useState<string | null>(
    // createOsmTileUrl(osmTileNumberX, osmTileNumberY, osmIntegerBaseScaledZoomLevel),
    null,
  );
  const [centerCoordinateNormalizedOffsetXState, setCenterCoordinateNormalizedOffsetX] = useState<
    null | number
  >(null);
  const [centerCoordinateNormalizedOffsetYState, setCenterCoordinateNormalizedOffsetY] = useState<
    null | number
  >(null);
  // const [initialLoaded, setInitialLoaded] = useState(false);

  // useEffect(() => {
  //   const url = createOsmTileUrl(osmTileNumberX, osmTileNumberY, osmIntegerBaseScaledZoomLevel);
  //   // console.log({ osmIntegerBaseScaledZoomLevel });
  //   const image = new Image();
  //   image.onload = () => {
  //     // setTimeout(() => {
  //     setOsmTileUrl(url);
  //     setCenterCoordinateNormalizedOffsetX(centerCoordinateNormalizedOffsetX);
  //     setCenterCoordinateNormalizedOffsetY(centerCoordinateNormalizedOffsetY);
  //     // if (!initialLoaded) {
  //     //   setInitialLoaded(true);
  //     // }
  //     // }, 3000);
  //   };
  //   image.src = url;

  //   return () => {
  //     image.onload = null;
  //     image.onerror = null;
  //   };
  // }, [
  //   // initialLoaded,
  //   centerCoordinateNormalizedOffsetX,
  //   centerCoordinateNormalizedOffsetY,
  //   osmTileNumberX,
  //   osmTileNumberY,
  //   osmIntegerBaseScaledZoomLevel,
  // ]);

  useEffect(() => {
    const url = createOsmTileUrl(osmTileNumberX, osmTileNumberY, osmIntegerBaseScaledZoomLevel);
    const image = new Image();

    let timeoutId: number | null = null; // Variable to store timeout id

    image.onload = () => {
      const delay = Math.random() * 2000 + 1000; // Random delay between 1 and 3 seconds

      timeoutId = window.setTimeout(() => {
        // Store timeout id
        setOsmTileUrl(url);
        setCenterCoordinateNormalizedOffsetX(centerCoordinateNormalizedOffsetX);
        setCenterCoordinateNormalizedOffsetY(centerCoordinateNormalizedOffsetY);
      }, delay);
    };

    image.src = url;

    return () => {
      image.onload = null;
      image.onerror = null;
      if (timeoutId) clearTimeout(timeoutId); // Clear the timeout during cleanup
    };
  }, [
    centerCoordinateNormalizedOffsetX,
    centerCoordinateNormalizedOffsetY,
    osmTileNumberX,
    osmTileNumberY,
    osmIntegerBaseScaledZoomLevel,
  ]);

  // useEffect(() => {
  //   const urlParameters: UrlParameters = {
  //     x: osmTileNumberX,
  //     y: osmTileNumberY,
  //     z: osmIntegerBaseScaledZoomLevel,
  //   };

  //   if (isValidUrlParameters(urlParameters)) {
  //     const tileUrl = OSM_TILE_SERVER_URL.replace("{z}", urlParameters.z.toString())
  //       .replace("{x}", urlParameters.x.toString())
  //       .replace("{y}", urlParameters.y.toString());

  //     const image = new Image();

  //     image.onload = function () {
  //       console.log("on load");
  //       // imageRef.current = image;
  //       // setTileImage(image);
  //     };

  //     image.src = tileUrl;

  //     return () => {
  //       image.onload = null;
  //     };
  //   }
  // }, [osmTileNumberX, osmTileNumberY, osmIntegerBaseScaledZoomLevel]);

  useEffect(() => {
    // if (!loaded || error) return;
    if (isNull(osmTileUrl)) return;
    if (isNull(centerCoordinateNormalizedOffsetXState)) return;
    if (isNull(centerCoordinateNormalizedOffsetYState)) return;
    // if (!initialLoaded) return;
    // console.log(initialLoaded);

    // if (isNull(tileImage)) return;

    // will be defined later:
    // eslint-disable-next-line prefer-const
    let cleanupPrevTile = () => {};

    const image = new Image();

    image.onload = () => {
      const ctx = getContext(ref);

      // console.log({ osmFractionalBaseScaledZoomLevel });
      // console.log(Number(getZValue(osmTileUrl)!));
      // const zoomScale = 1 + (osmFractionalBaseScaledZoomLevel % osmIntegerBaseScaledZoomLevel);
      // const zoomScale = 1 + (osmFractionalBaseScaledZoomLevel - Number(getZValue(osmTileUrl)!));
      // console.log(zoomScale);

      const baseZoomLevel = Number(getZValue(osmTileUrl)!);
      const zoomScale = Math.pow(2, osmFractionalBaseScaledZoomLevel - baseZoomLevel);

      const tileSizeAfterZoom = zoomScale * scaledTileSize;
      // console.log({ zoomScale });
      // console.log({ tileSizeAfterZoom });

      const originX = gridCenterOffset[0] + tileIndexOffsetX * tileSizeAfterZoom;
      const originY = gridCenterOffset[1] + tileIndexOffsetY * tileSizeAfterZoom;

      const scaledScaleDifference = tileSizeAfterZoom - scaledTileSize;
      const halfDifference = scaledScaleDifference / 2;

      const offsetFromTopLeftPxX = centerCoordinateNormalizedOffsetXState * tileSizeAfterZoom;
      // const offsetFromTopLeftPxX = centerCoordinateNormalizedOffsetX * tileSizeAfterZoom;
      const offsetFromTopLeftPxY = centerCoordinateNormalizedOffsetYState * tileSizeAfterZoom;
      // const offsetFromTopLeftPxY = centerCoordinateNormalizedOffsetY * tileSizeAfterZoom;

      const offsetFromCenterPxX = tileSizeAfterZoom / 2 - offsetFromTopLeftPxX;
      const offsetFromCenterPxY = tileSizeAfterZoom / 2 - offsetFromTopLeftPxY;

      // ctx.clearRect(
      //   originX - halfDifference + offsetFromCenterPxX,
      //   originY - halfDifference + offsetFromCenterPxY,
      //   tileSizeAfterZoom,
      //   tileSizeAfterZoom,
      // );
      console.log("drawing image");
      ctx.drawImage(
        // imageRef.current,
        image,
        originX - halfDifference + offsetFromCenterPxX,
        originY - halfDifference + offsetFromCenterPxY,
        tileSizeAfterZoom,
        tileSizeAfterZoom,
      );

      // cleanupPrevTile = () => {
      //   console.log("cleaning up");
      //   ctx.clearRect(
      //     originX - halfDifference + offsetFromCenterPxX,
      //     originY - halfDifference + offsetFromCenterPxY,
      //     tileSizeAfterZoom,
      //     tileSizeAfterZoom,
      //   );

      //   // ctx.fillStyle = "red";
      //   // ctx.fillRect(
      //   //   originX - halfDifference + offsetFromCenterPxX,
      //   //   originY - halfDifference + offsetFromCenterPxY,
      //   //   tileSizeAfterZoom,
      //   //   tileSizeAfterZoom,
      //   // );
      //   // ctx.fillStyle = "black";
      // };

      ctx.beginPath();

      ctx.rect(
        gridCenterOffset[0] + tileIndexOffsetX * scaledTileSize,
        gridCenterOffset[1] + tileIndexOffsetY * scaledTileSize,
        scaledTileSize,
        scaledTileSize,
      );
      ctx.lineWidth = 1;
      ctx.stroke();

      ctx.font = "24px Courier New";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      ctx.fillText(
        `x: ${tileIndexOffsetX}, y: ${tileIndexOffsetY}`,
        gridCenterOffset[0] + tileIndexOffsetX * scaledTileSize + scaledTileSize / 2,
        gridCenterOffset[1] + tileIndexOffsetY * -scaledTileSize + scaledTileSize / 2,
      );
    };
    image.onerror = () => {
      console.log("tile made an oopsie!");
    };
    image.src = osmTileUrl;

    return () => {
      image.onload = null;
      image.onerror = null;

      cleanupPrevTile();
    };
  }, [
    // loaded,
    // error,
    // osmTileUrl,
    // initialLoaded,
    osmTileUrl,
    scaledTileSize,
    tileIndexOffsetX,
    tileIndexOffsetY,
    gridCenterOffset,
    osmIntegerBaseScaledZoomLevel,
    osmFractionalBaseScaledZoomLevel,
    centerCoordinateNormalizedOffsetX,
    centerCoordinateNormalizedOffsetY,
  ]);

  return null;
}
function TileRendererNew2({
  scaledTileSize,
  tileIndexOffsetX,
  tileIndexOffsetY,
  gridCenterOffset,
  osmTileNumberX,
  osmTileNumberY,
  centerCoordinateNormalizedOffsetX,
  centerCoordinateNormalizedOffsetY,
  osmIntegerBaseScaledZoomLevel,
  osmFractionalBaseScaledZoomLevel,
}: TileRendererProps): null {
  const { ref } = useLayerContext();

  const [osmTileUrl, setOsmTileUrl] = useState<string[] | null>(null);
  const [centerCoordinateNormalizedOffsetXState, setCenterCoordinateNormalizedOffsetX] = useState<
    null | number
  >(null);
  const [centerCoordinateNormalizedOffsetYState, setCenterCoordinateNormalizedOffsetY] = useState<
    null | number
  >(null);

  useEffect(() => {
    let timeoutId: number | null = null;
    const images: HTMLImageElement[] = [];

    const loadTile = async (
      osmTileNumberX: number,
      osmTileNumberY: number,
      osmIntegerBaseScaledZoomLevel: number,
    ): Promise<HTMLImageElement> => {
      return await new Promise((resolve, reject) => {
        const url = createOsmTileUrl(osmTileNumberX, osmTileNumberY, osmIntegerBaseScaledZoomLevel);
        const image = new Image();

        image.onload = () => {
          resolve(image);
        };
        image.onerror = (err) => {
          reject(err);
        };

        image.src = url;
        images.push(image);
      });
    };

    const calculateNeighbouringTiles = (
      xIndex: number,
      yIndex: number,
      xCoordinateNormalizedOffset: number,
      yCoordinateNormalizedOffset: number,
    ) => {
      const horizontal = xIndex + (xCoordinateNormalizedOffset <= 0.5 ? -1 : 1);
      const vertical = yIndex + (yCoordinateNormalizedOffset <= 0.5 ? -1 : 1);

      const h = [horizontal, yIndex];
      const v = [xIndex, vertical];
      const c = [horizontal, vertical];

      return { h, v, c };
    };

    const { h, v, c } = calculateNeighbouringTiles(
      osmTileNumberX,
      osmTileNumberY,
      centerCoordinateNormalizedOffsetX,
      centerCoordinateNormalizedOffsetY,
    );
    console.log({ h, v, c });

    Promise.all([
      loadTile(osmTileNumberX, osmTileNumberY, osmIntegerBaseScaledZoomLevel),
      // loadTile(h[0], h[1], osmIntegerBaseScaledZoomLevel),
      // loadTile(v[0], v[1], osmIntegerBaseScaledZoomLevel),
      // loadTile(c[0], c[1], osmIntegerBaseScaledZoomLevel),
    ])
      .then((images) => {
        const delay = Math.random() * 2000 + 1000; // Random delay between 1 and 3 seconds

        timeoutId = window.setTimeout(() => {
          setOsmTileUrl(images.map((img) => img.src));
          setCenterCoordinateNormalizedOffsetX(centerCoordinateNormalizedOffsetX);
          setCenterCoordinateNormalizedOffsetY(centerCoordinateNormalizedOffsetY);
        }, delay);
      })
      .catch((err) => {
        console.log(err);
      });

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      for (const image of images) {
        image.onload = null;
        image.onerror = null;
      }
    };
  }, [
    centerCoordinateNormalizedOffsetX,
    centerCoordinateNormalizedOffsetY,
    osmTileNumberX,
    osmTileNumberY,
    osmIntegerBaseScaledZoomLevel,
  ]);

  useEffect(() => {
    if (isNull(osmTileUrl)) return;
    if (isNull(centerCoordinateNormalizedOffsetXState)) return;
    if (isNull(centerCoordinateNormalizedOffsetYState)) return;

    const image = new Image();

    image.onload = () => {
      const ctx = getContext(ref);

      const baseZoomLevel = Number(getZValue(osmTileUrl[0])!);
      const zoomScale = Math.pow(2, osmFractionalBaseScaledZoomLevel - baseZoomLevel);

      const tileSizeAfterZoom = zoomScale * scaledTileSize;

      const originX = gridCenterOffset[0] + tileIndexOffsetX * tileSizeAfterZoom;
      const originY = gridCenterOffset[1] + tileIndexOffsetY * tileSizeAfterZoom;

      const scaledScaleDifference = tileSizeAfterZoom - scaledTileSize;
      const halfDifference = scaledScaleDifference / 2;

      const offsetFromTopLeftPxX = centerCoordinateNormalizedOffsetXState * tileSizeAfterZoom;
      const offsetFromTopLeftPxY = centerCoordinateNormalizedOffsetYState * tileSizeAfterZoom;
      const offsetFromCenterPxX = tileSizeAfterZoom / 2 - offsetFromTopLeftPxX;
      const offsetFromCenterPxY = tileSizeAfterZoom / 2 - offsetFromTopLeftPxY;

      ctx.drawImage(
        image,
        originX - halfDifference + offsetFromCenterPxX,
        originY - halfDifference + offsetFromCenterPxY,
        tileSizeAfterZoom,
        tileSizeAfterZoom,
      );

      ctx.beginPath();

      ctx.rect(
        gridCenterOffset[0] + tileIndexOffsetX * scaledTileSize,
        gridCenterOffset[1] + tileIndexOffsetY * scaledTileSize,
        scaledTileSize,
        scaledTileSize,
      );
      ctx.lineWidth = 1;
      ctx.stroke();

      ctx.font = "24px Courier New";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      ctx.fillText(
        `x: ${tileIndexOffsetX}, y: ${tileIndexOffsetY}`,
        gridCenterOffset[0] + tileIndexOffsetX * scaledTileSize + scaledTileSize / 2,
        gridCenterOffset[1] + tileIndexOffsetY * -scaledTileSize + scaledTileSize / 2,
      );
    };
    image.onerror = () => {
      console.log("tile made an oopsie!");
    };
    image.src = osmTileUrl[0];

    return () => {
      image.onload = null;
      image.onerror = null;
    };
  }, [
    osmTileUrl,
    scaledTileSize,
    tileIndexOffsetX,
    tileIndexOffsetY,
    gridCenterOffset,
    osmIntegerBaseScaledZoomLevel,
    osmFractionalBaseScaledZoomLevel,
    centerCoordinateNormalizedOffsetX,
    centerCoordinateNormalizedOffsetY,
  ]);

  return null;
}
