import { Layer } from "gis-viewer/src/features/layer";
import { LayersContainer } from "gis-viewer/src/features/layer/container";
import { CrosshairSource } from "gis-viewer/src/features/source/cross-hair";
import { GisViewerResult, store } from "gis-viewer/src/gis-viewer";
import { Coordinate } from "gis-viewer/src/types";
import { Provider } from "react-redux";
import { OsmTiledSource } from "../../../gis-viewer/src/features/source/osm/tiled";

export function GisViewerTiledView() {
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
