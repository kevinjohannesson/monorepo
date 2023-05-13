import { GisViewer } from "gis-viewer";
import { Layer } from "gis-viewer/src/features/layer";
import { LayersContainer } from "gis-viewer/src/features/layer/container";
import { CrosshairSource } from "gis-viewer/src/features/source/cross-hair";
import { OsmSource } from "gis-viewer/src/features/source/osm";
import { OsmSingleTileSource } from "gis-viewer/src/features/source/osm/single-tile";
import { GisViewerResult, store } from "gis-viewer/src/gis-viewer";
import { GisViewerOsmSingleTile } from "gis-viewer/src/temp/experiments/gis-viewer-osm-single-tile";
import { Coordinate } from "gis-viewer/src/types";
import { OsmTiledSource } from "../../../gis-viewer/src/features/source/osm/tiled";
import { Provider } from "react-redux";

export function GisViewerLargeScreenView() {
  const id = "default";
  const initialZoomLevel = 0;
  const initialCenterCoordinate: Coordinate = [
    568228.114364449, 6816936.078896927,
  ];
  return (
    <Provider store={store}>
      <GisViewerResult
        id={id}
        initialCenterCoordinate={initialCenterCoordinate}
        initialZoomLevel={initialZoomLevel}
        dimensions={[1600, 900]}
        zoomLevelLimits={[-2, 16]}
        wrapping={{
          isWrappedX: false,
          isWrappedY: false,
        }}
      >
        <LayersContainer>
          <Layer>
            {/* <OsmSingleTileSource /> */}
            <OsmTiledSource />
          </Layer>

          <Layer>
            <CrosshairSource />
          </Layer>
        </LayersContainer>
      </GisViewerResult>
    </Provider>
  );
}
