import { type Coordinate, type Dimensions } from "../../../types";
import { type ReactElement, useEffect, useMemo, useRef } from "react";
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
import { isValidOsmUrlParameters } from "./utils/url-parameters-utils";
import { selectViewState, selectZoomLevel } from "../../view/slice";
import { useGisViewerSelector } from "../../../slice";
import { useLayerContext } from "../../layer";
import { useTileImageCacheContext } from "../../cache";

const TILE_SERVER_URL = "https://tile.openstreetmap.org/{z}/{x}/{y}.png";

export interface TileRendererProps {
  topLeftPixelCoordinate: Coordinate;
  urlParameters: UrlParameters;
  renderedTileSize: number;
  offset: Vector2d;
  zoomLevel: number;
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
  zoomLevel,
}: TileRendererProps): null {
  const { ref } = useLayerContext();
  const { getCache, setCache } = useTileImageCacheContext();

  const latestImage = useRef<null | HTMLImageElement>(null);
  const latestZoomLevel = useRef(zoomLevel);
  useEffect(() => {
    const canvas = ref.current;
    assertNotNull(canvas);
    const context = canvas.getContext("2d");
    assertNotNull(context);

    const cachedImage = getCache(urlParameters.z, urlParameters.x, urlParameters.y);

    const tileUrl = TILE_SERVER_URL.replace("{z}", urlParameters.z.toString())
      .replace("{x}", urlParameters.x.toString())
      .replace("{y}", urlParameters.y.toString());

    const image = new Image();

    // console.log({ zoomLevel });

    if (cachedImage != null) {
      context.drawImage(
        cachedImage,
        topLeftPixelCoordinate[0],
        topLeftPixelCoordinate[1],
        renderedTileSize,
        renderedTileSize,
      );
      renderGridTile(canvas, topLeftPixelCoordinate, [renderedTileSize, renderedTileSize]);
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

      // console.log("new tile");
      if (latestImage.current != null) {
        // console.log("drawing latest image");
        context.drawImage(
          latestImage.current,
          topLeftPixelCoordinate[0],
          topLeftPixelCoordinate[1],
          renderedTileSize * Math.pow(1 + zoomLevel - latestZoomLevel.current, 2),
          renderedTileSize * Math.pow(1 + zoomLevel - latestZoomLevel.current, 2),
        );
        console.log(zoomLevel);
        console.log(latestZoomLevel.current);
        console.log(zoomLevel - latestZoomLevel.current);
        console.log(1 + zoomLevel - latestZoomLevel.current);
      }
      // context.drawImage(
      //   image,
      //   topLeftPixelCoordinate[0],
      //   topLeftPixelCoordinate[1],
      //   renderedTileSize,
      //   renderedTileSize,
      // );
      // console.log({ zoomLevel });
      image.onload = function () {
        window.setTimeout(() => {
          console.log("drawing image");
          context.drawImage(
            image,
            topLeftPixelCoordinate[0],
            topLeftPixelCoordinate[1],
            renderedTileSize,
            renderedTileSize,
          );

          setCache(image, urlParameters.z, urlParameters.x, urlParameters.y);

          latestImage.current = image;
          latestZoomLevel.current = zoomLevel;

          renderGridTile(canvas, topLeftPixelCoordinate, [renderedTileSize, renderedTileSize]);
          renderGridTileIndices(canvas, offset, topLeftPixelCoordinate, [
            renderedTileSize,
            renderedTileSize,
          ]);
        }, 3000);

        // context.drawImage(
        //   image,
        //   topLeftPixelCoordinate[0],
        //   topLeftPixelCoordinate[1],
        //   renderedTileSize,
        //   renderedTileSize,
        // );

        // setCache(image, urlParameters.z, urlParameters.x, urlParameters.y);

        // latestImage.current = image;
        // latestZoomLevel.current = zoomLevel;

        // renderGridTile(canvas, topLeftPixelCoordinate, [
        //   renderedTileSize,
        //   renderedTileSize,
        // ]);
        // renderGridTileIndices(canvas, offset, topLeftPixelCoordinate, [
        //   renderedTileSize,
        //   renderedTileSize,
        // ]);
      };

      image.src = tileUrl;
    }

    image.src = tileUrl;

    return () => {
      console.log("removing onload");
      image.onload = null;
    };
  }, [ref, urlParameters, topLeftPixelCoordinate, renderedTileSize, zoomLevel]);

  return null;
}

interface TileClearerProps extends Omit<TileRendererProps, "urlParameters"> {}

function TileClearer({
  topLeftPixelCoordinate,
  renderedTileSize,
  offset,
  zoomLevel,
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
    // context.fillStyle = "red";
    // context.fillRect(
    //   topLeftPixelCoordinate[0],
    //   topLeftPixelCoordinate[1],
    //   renderedTileSize,
    //   renderedTileSize,
    // );

    // context.fillStyle = "black";

    renderGridTile(canvas, topLeftPixelCoordinate, [renderedTileSize, renderedTileSize]);
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
  fractionalZoomLevel: number;
}

function ValidTileRenderer({
  tileNumbers: [tileX, tileY],
  zoomLevel,
  isWrapped,
  topLeftPixelCoordinate,
  renderedTileSize,
  offset,
  fractionalZoomLevel,
}: ValidTileRendererProps): ReactElement {
  const x = isWrapped ? calculateWrappedTileNumberX(tileX, zoomLevel) : tileX;
  const y = tileY;

  const urlParameters: UrlParameters = {
    z: zoomLevel,
    x,
    y,
  };

  if (isValidOsmUrlParameters(urlParameters)) {
    return (
      <TileRenderer
        topLeftPixelCoordinate={topLeftPixelCoordinate}
        renderedTileSize={renderedTileSize}
        urlParameters={urlParameters}
        offset={offset}
        zoomLevel={fractionalZoomLevel}
      />
    );
  }

  return (
    <TileClearer
      topLeftPixelCoordinate={topLeftPixelCoordinate}
      renderedTileSize={renderedTileSize}
      offset={offset}
      zoomLevel={zoomLevel}
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
  const n = (calculateTotalTilesPerAxisAtZoomLevel(osmBaseZoomLevel) * TILE_SIZE) / width;
  const renderedTileSize = (TILE_SIZE / n) * scale;
  return { integerZoomLevel, renderedTileSize };
}

export function OsmTiledSource(): ReactElement {
  const [width, height] = useGisViewerSelector(selectViewState("dimensions"));
  const projection = useGisViewerSelector(selectViewState("projection"));
  const centerCoordinate = useGisViewerSelector(selectViewState("centerCoordinate"));
  const isWrappedX = useGisViewerSelector(selectViewState("wrapping")).isWrappedX;
  const zoomLevel = useGisViewerSelector(selectZoomLevel);

  const { integerZoomLevel, renderedTileSize } = useMemo(
    () => getOsmBaseLevelAndRenderedTileSize(width, zoomLevel),
    [width, zoomLevel],
  );

  const tileNumbers = useMemo(
    () => calculateTileNumbers(centerCoordinate, projection.code, integerZoomLevel),
    [centerCoordinate, projection.code, integerZoomLevel],
  );
  const fractionalTileNumbers = useMemo(
    () => calculateFractionalTileNumbers(centerCoordinate, projection.code, integerZoomLevel),
    [centerCoordinate, projection.code, integerZoomLevel],
  );

  const centered: Coordinate = useMemo(
    () => [width / 2 - renderedTileSize / 2, height / 2 - renderedTileSize / 2],
    [width, height, renderedTileSize],
  );
  const renderedCenterOffset = useMemo(
    () => calculateRenderedTileCenterOffset(renderedTileSize, fractionalTileNumbers, tileNumbers),
    [renderedTileSize, fractionalTileNumbers, tileNumbers],
  );

  const topLeftPixelCoordinate = addVector2d(centered, renderedCenterOffset);

  console.log({ centered });
  console.log({ renderedCenterOffset });
  console.log({ renderedTileSize });
  console.log(renderedCenterOffset[0] / renderedTileSize);
  const offsets = useMemo(
    () =>
      createSpiralPattern(
        1 + Math.ceil(width / 2 / renderedTileSize) * 2,
        1 + Math.ceil(height / 2 / renderedTileSize) * 2,
      ),
    [width, height, renderedTileSize],
  );

  // const prevZoomLevel = useRef(zoomLevel);
  // useEffect(() => {
  //   console.log("Zoomlevel: ", zoomLevel);
  //   console.log("prevZoomlevel: ", prevZoomLevel.current);
  //   console.log(`Zooming ${prevZoomLevel.current < zoomLevel ? "in" : "out"}`);
  //   // we have a fetched tile
  //   // we can find out at which zoom level this was procured
  //   // we can find out the current zoom level
  //   // we can subtract the procured zoomlevel from the current zoomlevel
  //   // e.g. 5.1 current, tile fetched at 2,
  //   prevZoomLevel.current = zoomLevel;
  // }, [zoomLevel]);

  return (
    <>
      {/* {offsets.map((offset) => ( */}
      {[[0, 0] as Vector2d].map((offset) => (
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
          fractionalZoomLevel={zoomLevel}
        />
      ))}
    </>
  );
}
