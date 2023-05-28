import { addVector2d } from "utils";
import { calculateZoomAdjustedTileDimensions, toWholeZoomLevel } from "./utils/tile-number-utils";
import {
  createOsmTileImageUrl,
  createOsmTileImageUrlParameters,
  isValidOsmUrlParameters,
} from "./utils/url-parameters-utils";
import { isNull } from "lodash";
import { useEffect } from "react";
import {
  useOsmFractionalScaledZoomLevel,
  useOsmWholeScaledZoomLevel,
} from "./hooks/use-osm-scaled-zoom-level";
import { useOsmWholeTileNumbers } from "./hooks/use-osm-tile-numbers";
import { useTileGridContext } from "../../tile-grid/tile-grid-provider";
import { useTileImageCacheContext } from "../../cache/tile-image-cache";
import { useViewCenterCoordinate } from "./new-tiled";

export function OsmTileImageFetcher(): null {
  const viewCenterCoordinate = useViewCenterCoordinate();

  const tileGrid = useTileGridContext();
  const [gridWidth, gridHeight] = tileGrid.dimensions;
  const { addTileImage, getTileImage } = useTileImageCacheContext();

  const scaledOsmFractionalZoomLevel = useOsmFractionalScaledZoomLevel();
  const scaledWholeOsmZoomLevel = toWholeZoomLevel(scaledOsmFractionalZoomLevel);
  const wholeOsmTileNumbersForCenterView = useOsmWholeTileNumbers(viewCenterCoordinate);

  const [zoomAdjustedTileWidth, zoomAdjustedTileHeight] = calculateZoomAdjustedTileDimensions(
    tileGrid.dimensions,
    scaledWholeOsmZoomLevel,
    scaledOsmFractionalZoomLevel,
  );

  const visibleGridIndices = tileGrid.indices.filter(([xIndex, yIndex]) => {
    return (
      xIndex * zoomAdjustedTileWidth <= gridWidth / 2 + zoomAdjustedTileWidth &&
      xIndex * zoomAdjustedTileWidth >= -gridWidth / 2 - zoomAdjustedTileWidth &&
      yIndex * zoomAdjustedTileHeight <= gridHeight / 2 + zoomAdjustedTileHeight &&
      yIndex * zoomAdjustedTileHeight >= -gridHeight / 2 - zoomAdjustedTileHeight
    );
  });

  useEffect(() => {
    const images: HTMLImageElement[] = [];
    const timeouts: number[] = [];

    visibleGridIndices.forEach((gridTileIndex) => {
      const [osmWholeTileNumberX, osmWholeTileNumberY] = addVector2d(
        gridTileIndex,
        wholeOsmTileNumbersForCenterView,
      );

      const osmUrlParameters = createOsmTileImageUrlParameters(
        osmWholeTileNumberX,
        osmWholeTileNumberY,
        scaledWholeOsmZoomLevel,
        // Math.min(Math.max(scaledWholeOsmZoomLevel, 0), 18),
      );

      // console.log({ osmUrlParameters });

      if (!isNull(getTileImage(osmUrlParameters.x, osmUrlParameters.y, osmUrlParameters.z))) return;
      // const cachedImage = getTileImage(osmUrlParameters.x, osmUrlParameters.y, osmUrlParameters.z)
      // if(!isNull(cachedImage)){
      //   if(cachedImage.)
      // }
      const url = createOsmTileImageUrl(osmUrlParameters);
      // console.log({ url });
      const image = new Image();
      let timeoutId: number | null = null;

      image.onload = () => {
        const delay = Math.random() * 3000 + 1000; // Random delay for simulating slow internet

        timeoutId = window.setTimeout(() => {
          addTileImage(image, osmUrlParameters.x, osmUrlParameters.y, osmUrlParameters.z);
        }, delay);

        timeouts.push(timeoutId);
      };

      if (isValidOsmUrlParameters(osmUrlParameters)) {
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
  }, [tileGrid.indices.join(), wholeOsmTileNumbersForCenterView.join(), scaledWholeOsmZoomLevel]);

  return null;
}
