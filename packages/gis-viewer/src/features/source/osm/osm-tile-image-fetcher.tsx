import { addVector2d } from "utils";
import {
  createOsmTileImageUrl,
  createOsmTileImageUrlParameters,
  isValidOsmUrlParameters,
} from "./utils/url-parameters-utils";
import { useEffect } from "react";
import { useOsmWholeScaledZoomLevel } from "./hooks/use-osm-scaled-zoom-level";
import { useOsmWholeTileNumbers } from "./hooks/use-osm-tile-numbers";
import { useTileGridContext } from "../../tile-grid/tile-grid-provider";
import { useTileImageCacheContext } from "../../cache/tile-image-cache";
import { useViewCenterCoordinate } from "./new-tiled";

export function OsmTileImageFetcher(): null {
  const viewCenterCoordinate = useViewCenterCoordinate();

  const { gridTileIndices } = useTileGridContext();

  const { addTileImage } = useTileImageCacheContext();

  const osmWholeScaledZoomLevel = useOsmWholeScaledZoomLevel();
  const osmWholeTileNumbersForViewCenterCoordinate = useOsmWholeTileNumbers(viewCenterCoordinate);

  useEffect(() => {
    const images: HTMLImageElement[] = [];
    const timeouts: number[] = [];

    gridTileIndices.forEach((gridTileIndex) => {
      // console.log("%cOsmTileImageFetcher", "background: #44803F; color: white;");

      // console.log(`'gridTileIndex': [${gridTileIndex.join(", ")}]`);
      const [osmWholeTileNumberX, osmWholeTileNumberY] = addVector2d(
        gridTileIndex,
        osmWholeTileNumbersForViewCenterCoordinate,
      );
      const osmUrlParameters = createOsmTileImageUrlParameters(
        osmWholeTileNumberX,
        osmWholeTileNumberY,
        osmWholeScaledZoomLevel,
      );
      const url = createOsmTileImageUrl(osmUrlParameters);

      const image = new Image();
      let timeoutId: number | null = null;

      image.onload = () => {
        const delay = Math.random() * 3000 + 1000; // Random delay for simulating slow internet

        timeoutId = window.setTimeout(() => {
          addTileImage(image, osmWholeTileNumberX, osmWholeTileNumberY, osmWholeScaledZoomLevel);
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
  }, [
    gridTileIndices.join(),
    osmWholeTileNumbersForViewCenterCoordinate.join(),
    osmWholeScaledZoomLevel,
  ]);

  return null;
}
