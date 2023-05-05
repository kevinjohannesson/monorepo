import { useEffect } from "react";
import { useInstanceSelector } from "../../store-hooks";
import { Coordinate } from "../../types";
import { assertNotNull } from "../../utils/assert";
import { addCoordinates } from "../../utils/coordinate";
import { useLayerContext } from "../layers/layer";
import { selectViewState, selectZoomLevel } from "../view/slice";

import { isValidUrlParameters } from "./osm/utils/url-parameters-utils";
import { calculateRenderedTileCenterOffset } from "./osm/utils/rendered-tile-utils";
import {
  calculateFractionalTileNumbers,
  calculateTileNumbers,
  calculateWrappedTileNumberX,
} from "./osm/utils/tile-number-utils";

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

interface UrlParameters {
  x: number;
  y: number;
  z: number;
}

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

export function TestImageSource() {
  const [width, height] = useInstanceSelector(selectViewState("dimensions"));
  const projection = useInstanceSelector(selectViewState("projection"));
  const centerCoordinate = useInstanceSelector(
    selectViewState("centerCoordinate")
  );
  const zoomLevel = Math.round(useInstanceSelector(selectZoomLevel));

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

  const topLeftPixelCoordinate = addCoordinates(centered, renderedCenterOffset);

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
              topLeftPixelCoordinate={addCoordinates(topLeftPixelCoordinate, [
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
