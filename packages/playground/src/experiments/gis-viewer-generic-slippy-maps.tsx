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
import { SlippyMapSource } from "gis-viewer/src/features/source/slippy-map/slippy-map-source";

export function GisViewerGenericSlippyMapsView() {
  const id = "default";
  const initialZoomLevel = 0;
  const initialCenterCoordinate: Coordinate = [
    568228.114364449, 6816936.078896927,
  ];
  return (
    <Provider store={store}>
      <div style={{ display: "flex", flexDirection: "column" }}>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <h3>Slippy Maps OSM</h3>
          <GisViewerResult
            id={"refactored"}
            initialCenterCoordinate={initialCenterCoordinate}
            initialZoomLevel={initialZoomLevel}
            dimensions={[600, 300]}
            zoomLevelLimits={[-2, 25]}
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
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <h3>Slippy Maps Stamen Watercolor</h3>
          <GisViewerResult
            id={"refactored"}
            initialCenterCoordinate={initialCenterCoordinate}
            initialZoomLevel={initialZoomLevel}
            dimensions={[600, 300]}
            zoomLevelLimits={[-2, 25]}
            wrapping={{
              isWrappedX: false,
              isWrappedY: false,
            }}
          >
            <LayersContainer>
              <Layer>
                <SlippyMapSource url="https://stamen-tiles.a.ssl.fastly.net/watercolor/{z}/{x}/{y}.jpg" />
              </Layer>

              <Layer>
                <CrosshairSource />
              </Layer>
            </LayersContainer>
          </GisViewerResult>
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <h3>Slippy Maps Stamen Toner</h3>
          <GisViewerResult
            id={"refactored"}
            initialCenterCoordinate={initialCenterCoordinate}
            initialZoomLevel={initialZoomLevel}
            dimensions={[600, 300]}
            zoomLevelLimits={[-2, 25]}
            wrapping={{
              isWrappedX: false,
              isWrappedY: false,
            }}
          >
            <LayersContainer>
              <Layer>
                <SlippyMapSource url="https://stamen-tiles.a.ssl.fastly.net/toner/{z}/{x}/{y}.png" />
              </Layer>

              <Layer>
                <CrosshairSource />
              </Layer>
            </LayersContainer>
          </GisViewerResult>
        </div>
      </div>
    </Provider>
  );
}
