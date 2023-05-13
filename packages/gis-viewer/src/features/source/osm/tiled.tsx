import { type Coordinate } from "../../../types";
import { type ReactElement, useEffect, useMemo } from "react";
import {
  TILE_SIZE,
  calculateFractionalTileNumbers,
  calculateOsmZoomBaseLevel2,
  calculateTileNumbers,
  calculateTotalTilesPerAxisAtZoomLevel,
  calculateWrappedTileNumberX,
} from "./utils/tile-number-utils";
import { type UrlParameters } from "./types";
import {
  type Vector2d,
  addVector2d,
  assertNotNull,
  multiplyVector2d,
} from "utils";
import { calculateRenderedTileCenterOffset } from "./utils/rendered-tile-utils";
import { isValidUrlParameters } from "./utils/url-parameters-utils";
import { selectViewState, selectZoomLevel } from "../../view/slice";
import { useGisViewerSelector } from "../../../slice";
import { useImageTileCacheContext } from "../../cache";
import { useLayerContext } from "../../layer";

const TILE_SERVER_URL = "https://tile.openstreetmap.org/{z}/{x}/{y}.png";

export interface TileRendererProps {
  topLeftPixelCoordinate: Coordinate;
  urlParameters: UrlParameters;
  renderedTileSize: number;
}

export function TileRenderer({
  topLeftPixelCoordinate,
  urlParameters,
  renderedTileSize,
}: TileRendererProps): null {
  const { ref } = useLayerContext();
  const { getCache, setCache } = useImageTileCacheContext();

  useEffect(() => {
    const canvas = ref.current;
    assertNotNull(canvas);
    const context = canvas.getContext("2d");
    assertNotNull(context);

    const cachedImage = getCache(
      urlParameters.z,
      urlParameters.x,
      urlParameters.y,
    );

    const tileUrl = TILE_SERVER_URL.replace("{z}", urlParameters.z.toString())
      .replace("{x}", urlParameters.x.toString())
      .replace("{y}", urlParameters.y.toString());

    const image = new Image();

    if (cachedImage != null) {
      context.drawImage(
        cachedImage,
        topLeftPixelCoordinate[0],
        topLeftPixelCoordinate[1],
        renderedTileSize,
        renderedTileSize,
      );
    } else {
      context.clearRect(
        topLeftPixelCoordinate[0],
        topLeftPixelCoordinate[1],
        renderedTileSize,
        renderedTileSize,
      );
      image.onload = function () {
        setCache(image, urlParameters.z, urlParameters.x, urlParameters.y);

        context.drawImage(
          image,
          topLeftPixelCoordinate[0],
          topLeftPixelCoordinate[1],
          renderedTileSize,
          renderedTileSize,
        );
      };

      image.src = tileUrl;
    }

    image.src = tileUrl;

    return () => {
      image.onload = null;
    };
  }, [ref, urlParameters, topLeftPixelCoordinate, renderedTileSize]);

  return null;
}

interface TileClearerProps extends Omit<TileRendererProps, "urlParameters"> {}

function TileClearer({
  topLeftPixelCoordinate,
  renderedTileSize,
}: TileClearerProps): null {
  const { ref } = useLayerContext();

  useEffect(() => {
    const canvas = ref.current;
    assertNotNull(canvas);
    const context = canvas.getContext("2d");
    assertNotNull(context);

    context.clearRect(
      topLeftPixelCoordinate[0],
      topLeftPixelCoordinate[1],
      renderedTileSize,
      renderedTileSize,
    );
  });

  return null;
}

interface ValidTileRendererProps
  extends Omit<TileRendererProps, "urlParameters">,
    TileClearerProps {
  tileNumbers: Coordinate;
  zoomLevel: number;
  isWrapped: boolean;
}

function ValidTileRenderer({
  tileNumbers: [tileX, tileY],
  zoomLevel,
  isWrapped,
  topLeftPixelCoordinate,
  renderedTileSize,
}: ValidTileRendererProps): ReactElement {
  const x = isWrapped ? calculateWrappedTileNumberX(tileX, zoomLevel) : tileX;
  const y = tileY;

  const urlParameters: UrlParameters = {
    z: zoomLevel,
    x,
    y,
  };

  if (isValidUrlParameters(urlParameters)) {
    return (
      <TileRenderer
        topLeftPixelCoordinate={topLeftPixelCoordinate}
        renderedTileSize={renderedTileSize}
        urlParameters={urlParameters}
      />
    );
  }

  return (
    <TileClearer
      topLeftPixelCoordinate={topLeftPixelCoordinate}
      renderedTileSize={renderedTileSize}
    />
  );
}

const epsilon = 1e-6;

// Helper functions
function getOsmBaseLevelAndRenderedTileSize(
  width: number,
  height: number,
  zoomLevel: number,
): {
  integerZoomLevel: number;
  renderedTileSize: number;
} {
  const initialIntegerZoomLevel = Math.floor(zoomLevel + epsilon);
  const fractionalZoom = zoomLevel - initialIntegerZoomLevel;
  const scale = 1 + fractionalZoom;
  const osmBaseZoomLevel = calculateOsmZoomBaseLevel2([width, height]);
  const integerZoomLevel = initialIntegerZoomLevel + osmBaseZoomLevel;
  const n =
    (calculateTotalTilesPerAxisAtZoomLevel(osmBaseZoomLevel) * TILE_SIZE) /
    Math.max(width, height);
  const renderedTileSize = (TILE_SIZE / n) * scale;
  return { integerZoomLevel, renderedTileSize };
}

// function getOffsets(width: number, height: number): Vector2d[] {
//   const offsetX = Math.ceil(width / 2 / TILE_SIZE);
//   const offsetY = Math.ceil(height / 2 / TILE_SIZE);
//   const offsets: Vector2d[] = [];
//   for (let x = -offsetX; x <= offsetX; x++) {
//     for (let y = -offsetY; y <= offsetY; y++) {
//       offsets.push([x, y]);
//     }
//   }
//   return offsets;
// }

// generate the offsets in a spiral like array:
function getOffsets(width: number, height: number): Vector2d[] {
  const offsetX = Math.ceil(width / 2 / TILE_SIZE);
  const offsetY = Math.ceil(height / 2 / TILE_SIZE);

  const offsets: Vector2d[] = [];
  let x = 0;
  let y = 0;
  let dx = 0;
  let dy = -1;

  for (let i = 0; i < Math.max(offsetX, offsetY) ** 2; i++) {
    if (-offsetX <= x && x <= offsetX && -offsetY <= y && y <= offsetY) {
      offsets.push([x, y]);
    }

    if (x === y || (x < 0 && x === -y) || (x > 0 && x === 1 - y)) {
      // Change direction
      [dx, dy] = [-dy, dx];
    }

    x += dx;
    y += dy;
  }

  // For the case where the view width and height are not equal,
  // we might have missed some offsets. Fill them in a brute force way.
  for (let xx = -offsetX; xx <= offsetX; xx++) {
    for (let yy = -offsetY; yy <= offsetY; yy++) {
      const exists = offsets.some(([x, y]) => x === xx && y === yy);
      if (!exists) {
        offsets.push([xx, yy]);
      }
    }
  }

  return offsets;
}

export function OsmTiledSource(): ReactElement {
  const [width, height] = useGisViewerSelector(selectViewState("dimensions"));
  const projection = useGisViewerSelector(selectViewState("projection"));
  const centerCoordinate = useGisViewerSelector(
    selectViewState("centerCoordinate"),
  );
  const isWrappedX = useGisViewerSelector(
    selectViewState("wrapping"),
  ).isWrappedX;
  const zoomLevel = useGisViewerSelector(selectZoomLevel);

  const { integerZoomLevel, renderedTileSize } = useMemo(
    () => getOsmBaseLevelAndRenderedTileSize(width, height, zoomLevel),
    [width, height, zoomLevel],
  );

  const tileNumbers = useMemo(
    () =>
      calculateTileNumbers(centerCoordinate, projection.code, integerZoomLevel),
    [centerCoordinate, projection.code, integerZoomLevel],
  );
  const fractionalTileNumbers = useMemo(
    () =>
      calculateFractionalTileNumbers(
        centerCoordinate,
        projection.code,
        integerZoomLevel,
      ),
    [centerCoordinate, projection.code, integerZoomLevel],
  );

  const centered: Coordinate = useMemo(
    () => [width / 2 - renderedTileSize / 2, height / 2 - renderedTileSize / 2],
    [width, height, renderedTileSize],
  );
  const renderedCenterOffset = useMemo(
    () =>
      calculateRenderedTileCenterOffset(
        renderedTileSize,
        fractionalTileNumbers,
        tileNumbers,
      ),
    [renderedTileSize, fractionalTileNumbers, tileNumbers],
  );
  const topLeftPixelCoordinate = addVector2d(centered, renderedCenterOffset);

  const offsets = useMemo(() => getOffsets(width, height), [width, height]);

  return (
    <>
      {offsets.map((offset) => (
        <ValidTileRenderer
          key={offset.join()}
          tileNumbers={addVector2d(tileNumbers, offset)}
          zoomLevel={integerZoomLevel}
          isWrapped={isWrappedX}
          renderedTileSize={renderedTileSize}
          topLeftPixelCoordinate={addVector2d(
            topLeftPixelCoordinate,
            multiplyVector2d(offset, renderedTileSize),
          )}
        />
      ))}
    </>
  );
}
