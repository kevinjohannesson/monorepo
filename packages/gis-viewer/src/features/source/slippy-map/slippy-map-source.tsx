import { type ReactElement } from "react";
import { SimpleImageFetcher } from "./slippy-map-simple-fetcher";
import { SlippyGrid } from "./slippy-grid";
import { TileImageCacheProvider } from "../../cache/tile-image-cache";

interface ISlippyMapSourceProps {
  url?: string;
  tileSize?: number;
  lowestAvailableZoomLevel?: number;
  highestAvailableZoomLevel?: number;
  displayTileNumbers?: boolean;
}

export function SlippyMapSource({
  tileSize = 256,
  url,
  lowestAvailableZoomLevel,
  highestAvailableZoomLevel,
  displayTileNumbers,
}: ISlippyMapSourceProps): ReactElement {
  return (
    <TileImageCacheProvider>
      <SimpleImageFetcher
        lowestAvailableZoomLevel={lowestAvailableZoomLevel}
        highestAvailableZoomLevel={highestAvailableZoomLevel}
        tileSize={tileSize}
        url={url}
      />
      <SlippyGrid tileSize={tileSize} displayTileNumbers={displayTileNumbers} />
    </TileImageCacheProvider>
  );
}
