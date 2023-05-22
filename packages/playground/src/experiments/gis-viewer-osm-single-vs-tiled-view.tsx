import { GisViewer } from "gis-viewer";
import { Layer } from "gis-viewer/src/features/layer";
import { LayersContainer } from "gis-viewer/src/features/layer/container";
import { CrosshairSource } from "gis-viewer/src/features/source/cross-hair";
import { OsmSourceOLD } from "gis-viewer/src/features/source/osm";
import { OsmSingleTileSource } from "gis-viewer/src/features/source/osm/single-tile";
import { GisViewerResult, store } from "gis-viewer/src/gis-viewer";
import { GisViewerOsmSingleTile } from "gis-viewer/src/temp/experiments/gis-viewer-osm-single-tile";
import { Coordinate } from "gis-viewer/src/types";
import { OsmTiledSource } from "../../../gis-viewer/src/features/source/osm/tiled";
import { Provider } from "react-redux";

export function GisViewerOsmSingleVsTiledView() {
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
      >
        <LayersContainer>
          <Layer>
            <OsmSingleTileSource />
          </Layer>

          <Layer>
            <CrosshairSource />
          </Layer>
        </LayersContainer>
      </GisViewerResult>

      <GisViewerResult
        id={id}
        initialCenterCoordinate={initialCenterCoordinate}
        initialZoomLevel={initialZoomLevel}
      >
        <LayersContainer>
          <Layer>
            <OsmTiledSource />
          </Layer>

          <Layer>
            <CrosshairSource />
          </Layer>
        </LayersContainer>
      </GisViewerResult>
      {/* <GisViewerOsmSingleTile
        id={id}
        initialCenterCoordinate={initialCenterCoordinate}
        initialZoomLevel={initialZoomLevel}
      />
      <GisViewer
        id={id}
        initialCenterCoordinate={initialCenterCoordinate}
        initialZoomLevel={initialZoomLevel}
      /> */}
    </Provider>
  );
}
