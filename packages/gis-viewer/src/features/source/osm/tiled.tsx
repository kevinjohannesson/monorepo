import { type Coordinate, type Dimensions } from "../../../types";
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
  createSpiralPattern,
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
  offset: Vector2d;
}

export function renderGridTileIndices(
  canvas: HTMLCanvasElement,
  indices: Coordinate,
  topLeftPixelCoordinate: Coordinate,
  tileDimensions: Dimensions,
): void {
  const context = canvas.getContext("2d");
  assertNotNull(context);

  context.font = "24px Arial";
  context.textAlign = "center";
  context.textBaseline = "middle";

  context.fillText(
    `x: ${indices[0]}, y: ${indices[1]}`,
    topLeftPixelCoordinate[0] + tileDimensions[0] / 2,
    topLeftPixelCoordinate[1] + tileDimensions[1] / 2,
  );
}

export function renderGridTile(
  canvas: HTMLCanvasElement,
  topLeftPixelCoordinate: Coordinate,
  tileDimensions: Dimensions,
): void {
  const context = canvas.getContext("2d");
  assertNotNull(context);

  context.beginPath();
  context.rect(
    topLeftPixelCoordinate[0],
    topLeftPixelCoordinate[1],
    tileDimensions[0],
    tileDimensions[1],
  );
  context.lineWidth = 1;
  context.strokeStyle = "#737373";
  context.stroke();
}

// function TileCoordinateRenderer({
//   topLeftPixelCoordinate,
//   coordinates,
//   renderedTileSize,
// }: any): null {
//   const { ref } = useLayerContext();

//   useEffect(() => {
//     const canvas = ref.current;
//     assertNotNull(canvas);
//     const context = canvas.getContext("2d");
//     assertNotNull(context);

//     context.beginPath();
//     context.rect(
//       topLeftPixelCoordinate[0],
//       topLeftPixelCoordinate[1],
//       renderedTileSize,
//       renderedTileSize,
//     );
//     context.stroke();

//     renderGridTileIndices(canvas, coordinates, topLeftPixelCoordinate, [
//       renderedTileSize,
//       renderedTileSize,
//     ]);
//   }, [ref, coordinates, topLeftPixelCoordinate, renderedTileSize]);

//   return null;
// }

export function TileRenderer({
  topLeftPixelCoordinate,
  urlParameters,
  renderedTileSize,
  offset,
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
      renderGridTile(canvas, topLeftPixelCoordinate, [
        renderedTileSize,
        renderedTileSize,
      ]);
      renderGridTileIndices(canvas, offset, topLeftPixelCoordinate, [
        renderedTileSize,
        renderedTileSize,
      ]);
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
        renderGridTile(canvas, topLeftPixelCoordinate, [
          renderedTileSize,
          renderedTileSize,
        ]);
        renderGridTileIndices(canvas, offset, topLeftPixelCoordinate, [
          renderedTileSize,
          renderedTileSize,
        ]);
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
  offset,
}: TileClearerProps): null {
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
    context.fillStyle = "red";
    context.fillRect(
      topLeftPixelCoordinate[0],
      topLeftPixelCoordinate[1],
      renderedTileSize,
      renderedTileSize,
    );

    context.fillStyle = "black";

    renderGridTile(canvas, topLeftPixelCoordinate, [
      renderedTileSize,
      renderedTileSize,
    ]);
    renderGridTileIndices(canvas, offset, topLeftPixelCoordinate, [
      renderedTileSize,
      renderedTileSize,
    ]);
  });

  return null;
}

interface ValidTileRendererProps
  extends Omit<TileRendererProps, "urlParameters">,
    TileClearerProps {
  tileNumbers: Coordinate;
  zoomLevel: number;
  isWrapped: boolean;
  offset: Vector2d;
}

function ValidTileRenderer({
  tileNumbers: [tileX, tileY],
  zoomLevel,
  isWrapped,
  topLeftPixelCoordinate,
  renderedTileSize,
  offset,
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
        offset={offset}
      />
    );
  }

  return (
    <TileClearer
      topLeftPixelCoordinate={topLeftPixelCoordinate}
      renderedTileSize={renderedTileSize}
      offset={offset}
    />
  );
}

const epsilon = 1e-6;

// Helper functions
function getOsmBaseLevelAndRenderedTileSize(
  width: number,
  // height: number,
  zoomLevel: number,
): {
  integerZoomLevel: number;
  renderedTileSize: number;
} {
  const initialIntegerZoomLevel = Math.floor(zoomLevel + epsilon);
  const fractionalZoom = zoomLevel - initialIntegerZoomLevel;
  const scale = 1 + fractionalZoom;
  const osmBaseZoomLevel = calculateOsmZoomBaseLevel2(width);
  const integerZoomLevel = initialIntegerZoomLevel + osmBaseZoomLevel;
  const n =
    (calculateTotalTilesPerAxisAtZoomLevel(osmBaseZoomLevel) * TILE_SIZE) /
    width;
  const renderedTileSize = (TILE_SIZE / n) * scale;
  return { integerZoomLevel, renderedTileSize };
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
    () => getOsmBaseLevelAndRenderedTileSize(width, zoomLevel),
    [width, zoomLevel],
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

  const offsets2 = useMemo(
    () =>
      createSpiralPattern(
        1 + Math.ceil(width / 2 / renderedTileSize) * 2,
        1 + Math.ceil(height / 2 / renderedTileSize) * 2,
      ),
    [width, height],
  );

  return (
    <>
      {offsets2.map((offset) => (
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
          offset={offset}
        />
      ))}
    </>
  );
}
