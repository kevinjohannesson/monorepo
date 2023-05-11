import { type Coordinate } from "../../../types";
import { type ReactElement, useEffect } from "react";
import { type UrlParameters } from "./types";
import {
  type Vector2d,
  addVector2d,
  assertNotNull,
  multiplyVector2d,
} from "utils";
import {
  calculateFractionalTileNumbers,
  calculateTileNumbers,
  calculateWrappedTileNumberX,
} from "./utils/tile-number-utils";
import { calculateRenderedTileCenterOffset } from "./utils/rendered-tile-utils";
import { isValidUrlParameters } from "./utils/url-parameters-utils";
import { selectViewState, selectZoomLevel } from "../../view/slice";
import { useGisViewerSelector } from "../../../slice";
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

  useEffect(() => {
    const canvas = ref.current;
    assertNotNull(canvas);

    const image = new Image();

    const tileUrl = TILE_SERVER_URL.replace("{z}", urlParameters.z.toString())
      .replace("{x}", urlParameters.x.toString())
      .replace("{y}", urlParameters.y.toString());

    image.onload = function () {
      const context = canvas.getContext("2d");
      assertNotNull(context);

      context.imageSmoothingEnabled = false;

      context.drawImage(
        image,
        topLeftPixelCoordinate[0],
        topLeftPixelCoordinate[1],
        renderedTileSize,
        renderedTileSize,
      );
    };

    image.src = tileUrl;

    return () => {
      const context = canvas.getContext("2d");
      assertNotNull(context);

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

  if (isValidUrlParameters(urlParameters, isWrapped)) {
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

const tileOffsets: Vector2d[] = [
  [0, 0],
  [-1, 0],
  [1, 0],
  [0, -1],
  [0, 1],
  [-1, -1],
  [1, 1],
  [-1, 1],
  [1, -1],
];

const epsilon = 1e-6;

export function OsmSingleTileSource(): ReactElement {
  const [width, height] = useGisViewerSelector(selectViewState("dimensions"));
  const projection = useGisViewerSelector(selectViewState("projection"));
  const centerCoordinate = useGisViewerSelector(
    selectViewState("centerCoordinate"),
  );
  const isWrappedX = useGisViewerSelector(
    selectViewState("wrapping"),
  ).isWrappedX;

  const zoomLevel = useGisViewerSelector(selectZoomLevel);
  const integerZoomLevel = Math.floor(zoomLevel + epsilon);
  const fractionalZoom = zoomLevel - integerZoomLevel;

  const scale = 1 + fractionalZoom;

  const renderedTileSize = Math.max(width, height) * scale;

  const tileNumbers = calculateTileNumbers(
    centerCoordinate,
    projection.code,
    integerZoomLevel,
  );

  const fractionalTileNumbers = calculateFractionalTileNumbers(
    centerCoordinate,
    projection.code,
    integerZoomLevel,
  );

  const centered: Coordinate = [
    width / 2 - renderedTileSize / 2,
    height / 2 - renderedTileSize / 2,
  ];

  const renderedCenterOffset = calculateRenderedTileCenterOffset(
    renderedTileSize,
    fractionalTileNumbers,
    tileNumbers,
  );

  const topLeftPixelCoordinate = addVector2d(centered, renderedCenterOffset);

  return (
    <>
      {tileOffsets.map((offset) => (
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
