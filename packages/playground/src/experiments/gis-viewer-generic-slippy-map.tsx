import { GisViewer } from "gis-viewer";
import { Layer } from "gis-viewer/src/features/layer";
import { LayersContainer } from "gis-viewer/src/features/layer/container";
import { CrosshairSource } from "gis-viewer/src/features/source/cross-hair";
import { OsmSource, OsmSourceOLD } from "gis-viewer/src/features/source/osm";
import { OsmSingleTileSource } from "gis-viewer/src/features/source/osm/single-tile";
import { GisViewerResult, store } from "gis-viewer/src/gis-viewer";
import { GisViewerOsmSingleTile } from "gis-viewer/src/temp/experiments/gis-viewer-osm-single-tile";
import { Coordinate } from "gis-viewer/src/types";
import { OsmTiledSource } from "gis-viewer/src/features/source/osm/tiled";
import { NewTiled as NewTiledOriginal } from "gis-viewer/src/features/source/osm/new-tiled copy";
import { Provider } from "react-redux";
import { NewTiled } from "gis-viewer/src/features/source/osm/new-tiled";
import { OsmTiledSource as NewNewTiledd } from "gis-viewer/src/features/source/osm/new-new-new-tiled";
import { SlippyMapSource } from "../../../gis-viewer/src/features/source/slippy-map/slippy-map-source";

export function GisViewerGenericSlippyMapView() {
  const id = "default";
  const initialZoomLevel = 0;
  const initialCenterCoordinate: Coordinate = [
    568228.114364449, 6816936.078896927,
  ];
  return (
    <Provider store={store}>
      {/* <h3>new *new* **new** tiled test, also with fake lag</h3>
      <GisViewerResult
        id={"newtiledtest"}
        initialCenterCoordinate={initialCenterCoordinate}
        initialZoomLevel={initialZoomLevel}
        dimensions={[900, 400]}
        zoomLevelLimits={[-2, 16]}
        wrapping={{
          isWrappedX: false,
          isWrappedY: false,
        }}
      >
        <LayersContainer>
          <Layer>
            <NewNewTiledd />
          </Layer>

          <Layer>
            <CrosshairSource />
          </Layer>
        </LayersContainer>
      </GisViewerResult> */}
      <h3>Refactored OSM tile viewer</h3>
      <p>(contains fake lag for testing purposes)</p>
      <GisViewerResult
        id={"refactored"}
        initialCenterCoordinate={initialCenterCoordinate}
        initialZoomLevel={initialZoomLevel}
        dimensions={[700, 400]}
        zoomLevelLimits={[-2, 35]}
        wrapping={{
          isWrappedX: false,
          isWrappedY: false,
        }}
      >
        <LayersContainer>
          <Layer>
            <OsmSource />
          </Layer>

          <Layer>
            <CrosshairSource />
          </Layer>
        </LayersContainer>
      </GisViewerResult>
      <h3>Generic slippy map w/ offscreen canvas</h3>
      <GisViewerResult
        id={"refactored"}
        initialCenterCoordinate={initialCenterCoordinate}
        initialZoomLevel={initialZoomLevel}
        dimensions={[700, 400]}
        zoomLevelLimits={[-2, 35]}
        wrapping={{
          isWrappedX: false,
          isWrappedY: false,
        }}
      >
        <LayersContainer>
          <Layer>
            <SlippyMapSource />
          </Layer>

          <Layer>
            <CrosshairSource />
          </Layer>
        </LayersContainer>
      </GisViewerResult>
      {/* <h3> new tiled test</h3>
      <GisViewerResult
        id={"newtiledoriginal"}
        initialCenterCoordinate={initialCenterCoordinate}
        initialZoomLevel={initialZoomLevel}
        dimensions={[700, 300]}
        zoomLevelLimits={[-2, 16]}
        wrapping={{
          isWrappedX: false,
          isWrappedY: false,
        }}
      >
        <LayersContainer>
          <Layer>
            <NewTiledOriginal />
          </Layer>

          <Layer>
            <CrosshairSource />
          </Layer>
        </LayersContainer>
      </GisViewerResult>
      <h3>original tiled</h3>
      <GisViewerResult
        id={"tiled"}
        initialCenterCoordinate={initialCenterCoordinate}
        initialZoomLevel={initialZoomLevel}
        dimensions={[700, 300]}
        zoomLevelLimits={[-2, 16]}
        wrapping={{
          isWrappedX: false,
          isWrappedY: false,
        }}
      >
        <LayersContainer>
          <Layer>
            <OsmTiledSource />
          </Layer>

          <Layer>
            <CrosshairSource />
          </Layer>
        </LayersContainer>
      </GisViewerResult> */}
    </Provider>
  );
}
