import { type ReactElement } from "react";
import { SimpleImageFetcher } from "./slippy-map-simple-fetcher";
import { SlippyMapCacheProvider } from "./slippy-map-cache";
import { SlippyMapGrid } from "./slippy-map-grid";

interface SlippyMapSourceProps {
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
}: SlippyMapSourceProps): ReactElement {
  return (
    <SlippyMapCacheProvider>
      <SimpleImageFetcher
        lowestAvailableZoomLevel={lowestAvailableZoomLevel}
        highestAvailableZoomLevel={highestAvailableZoomLevel}
        tileSize={tileSize}
        url={url}
      />
      <SlippyMapGrid tileSize={tileSize} displayTileNumbers={displayTileNumbers} />
    </SlippyMapCacheProvider>
  );
}
