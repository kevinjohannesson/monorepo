import { addVector2d, assertNotNull } from "utils";
import {
  calculateFractionalTileNumbers,
  calculateTileNumbers,
  calculateWrappedTileNumberX,
} from "./utils/tile-number-utils";
import { isValidUrlParameters } from "./utils/url-parameters-utils";
import { calculateRenderedTileCenterOffset } from "./utils/rendered-tile-utils";
import { Coordinate } from "../../../types";
import { useLayerContext } from "../../layer";
import { UrlParameters } from "./types";
import { useEffect } from "react";
import { useGisViewerSelector } from "../../../slice";
import { selectViewState, selectZoomLevel } from "../../view/slice";

const tileOffsets = [
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

const TILE_SERVER_URL = "https://tile.openstreetmap.org/{z}/{x}/{y}.png";

export interface ImageProps {
  topLeftPixelCoordinate: Coordinate;
  urlParameters: UrlParameters;
  renderedTileSize: number;
}

export function TileRenderer({
  topLeftPixelCoordinate,
  urlParameters,
  renderedTileSize,
}: ImageProps) {
  const { ref } = useLayerContext();

  useEffect(() => {
    const canvas = ref.current;
    assertNotNull(canvas);

    const image = new Image();

    const handleAsyncEffect = async () => {
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
          renderedTileSize
        );
      };

      image.src = tileUrl;
    };

    handleAsyncEffect();

    return () => {
      const context = canvas.getContext("2d");
      assertNotNull(context);

      // context.clearRect(0, 0, renderedTileSize, renderedTileSize);

      image.onload = null;
    };
  }, [ref, urlParameters, topLeftPixelCoordinate, renderedTileSize]);

  return null;
}

export function OsmSource() {
  const [width, height] = useGisViewerSelector(selectViewState("dimensions"));
  const projection = useGisViewerSelector(selectViewState("projection"));
  const centerCoordinate = useGisViewerSelector(
    selectViewState("centerCoordinate")
  );
  const zoomLevel = Math.round(useGisViewerSelector(selectZoomLevel));

  const renderedTileSize = Math.max(width, height);

  const tileNumbers = calculateTileNumbers(
    centerCoordinate,
    projection.code,
    zoomLevel
  );

  const fractionalTileNumbers = calculateFractionalTileNumbers(
    centerCoordinate,
    projection.code,
    zoomLevel
  );

  const centered: Coordinate = [
    width / 2 - renderedTileSize / 2,
    height / 2 - renderedTileSize / 2,
  ];

  const renderedCenterOffset = calculateRenderedTileCenterOffset(
    renderedTileSize,
    fractionalTileNumbers,
    tileNumbers
  );

  const topLeftPixelCoordinate = addVector2d(centered, renderedCenterOffset);

  return (
    <>
      {tileOffsets
        .filter((offset) => {
          // console.log({
          //   x: calculateWrappedTileNumberX(
          //     tileNumbers[0] + offset[0],
          //     zoomLevel
          //   ),
          // });
          return isValidUrlParameters(
            {
              z: zoomLevel,
              // x: tileNumbers[0] + offset[0],
              x: calculateWrappedTileNumberX(
                tileNumbers[0] + offset[0],
                zoomLevel
              ),
              y: tileNumbers[1] + offset[1],
            },
            false
          );
        })
        .map((offset) => {
          // console.log({ x: tileNumbers[0] + offset[0] });
          return (
            <TileRenderer
              key={offset.join(", ")}
              urlParameters={{
                z: zoomLevel,
                // x: tileNumbers[0] + offset[0],
                x: calculateWrappedTileNumberX(
                  tileNumbers[0] + offset[0],
                  zoomLevel
                ),
                y: tileNumbers[1] + offset[1],
              }}
              topLeftPixelCoordinate={addVector2d(topLeftPixelCoordinate, [
                offset[0] * renderedTileSize,
                offset[1] * renderedTileSize,
              ])}
              renderedTileSize={renderedTileSize}
            />
          );
        })}
    </>
  );
}
