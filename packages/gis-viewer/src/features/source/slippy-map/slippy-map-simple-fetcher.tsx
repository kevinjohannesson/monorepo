import * as SlippyMapGridUtils from "./slippy-map-grid-utils";
import * as SlippyMapTileUtils from "./slippy-map-tile-utils";
import { addVector2d } from "utils";
import { useEffect } from "react";
import { useEffectiveZoomLevel } from "./slippy-map-hooks";
import { useSlippyMapCacheContext } from "./slippy-map-cache";
import {
  useViewCenterCoordinate,
  useViewDimensions,
  useViewProjection,
} from "../../view/hooks/use-view-state";

interface SimpleImageFetcherProps {
  tileSize?: number;
  url?: string;
  lowestAvailableZoomLevel?: number;
  highestAvailableZoomLevel?: number;
}

export function SimpleImageFetcher({
  tileSize = 256,
  lowestAvailableZoomLevel = 0,
  highestAvailableZoomLevel = 18,
  url = "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
}: SimpleImageFetcherProps): null {
  const viewDimensions = useViewDimensions();

  const cache = useSlippyMapCacheContext();

  const effectiveZoomLevel = useEffectiveZoomLevel(tileSize);

  const tileOffsets = SlippyMapGridUtils.generateTileOffsets(viewDimensions, tileSize);

  const z = Math.min(
    Math.max(Math.floor(effectiveZoomLevel), lowestAvailableZoomLevel),
    highestAvailableZoomLevel,
  );

  const viewCenterCoordinate = useViewCenterCoordinate();
  const viewProjection = useViewProjection();

  const centerTileNumbers = SlippyMapTileUtils.toTileNumbers(
    SlippyMapTileUtils.calculatePositionFromProjectedSource(
      viewCenterCoordinate,
      viewProjection.code,
      z,
    ),
  );

  useEffect(() => {
    const images: HTMLImageElement[] = [];
    // const timeouts: number[] = [];

    tileOffsets.forEach((offset) => {
      const [x, y] = addVector2d(offset, centerTileNumbers);

      if (cache.hasTileImage(x, y, z)) return;

      const image = new Image();
      // let timeoutId: number | null = null;

      image.onload = () => {
        // const delay = Math.random() * 3000 + 1000; // Random delay for simulating slow internet
        // timeoutId = window.setTimeout(() => {
        cache.addTileImage(image, x, y, z);
        // }, delay);
        // timeouts.push(timeoutId);
      };
      if (SlippyMapTileUtils.isValidUrlParameters(x, y, z)) {
        image.crossOrigin = "anonymous";
        image.src = SlippyMapTileUtils.createTileUrl(url, x, y, z);
        images.push(image);
      }
    });

    return () => {
      images.forEach((i) => {
        i.onload = null;
        i.onerror = null;
      });
      // timeouts.forEach((t) => {
      //   clearTimeout(t);
      // });
    };
  }, [url, tileOffsets.join(), centerTileNumbers.join(), z]);

  return null;
}
