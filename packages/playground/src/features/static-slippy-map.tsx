import { Layer } from "gis-viewer/src/features/layer";
import { LayersContainer } from "gis-viewer/src/features/layer/container";
import { MapInfoContainer } from "gis-viewer/src/features/map-info/container";
import { SlippyMapSource } from "gis-viewer/src/features/source/slippy-map/slippy-map-source";
import { GisViewer } from "gis-viewer/src/gis-viewer";
import { useElementSize } from "usehooks-ts";
import { Vector2d } from "utils";
import { OsmAttribution } from "gis-viewer/src/features/map-info/osm-attribution";

const MASTER_ID = "MASTER";
const INITIAL_ZOOM_LEVEL = 5;
const INITIAL_CENTER_COORDINATE: Vector2d = [
  568228.114364449, 6816936.078896927,
];

export function StaticSlippyMapFeature() {
  const [wrapperRef, { width, height }] = useElementSize();

  return (
    <div className="flex w-full h-full " ref={wrapperRef}>
      {width !== 0 && height !== 0 && (
        <GisViewer
          id={MASTER_ID}
          dimensions={[width, height]}
          initialZoomLevel={INITIAL_ZOOM_LEVEL}
          initialCenterCoordinate={INITIAL_CENTER_COORDINATE}
        >
          <LayersContainer>
            <Layer>
              <SlippyMapSource displayTileNumbers />
            </Layer>

            <MapInfoContainer placement="bottom-right" direction="column">
              <OsmAttribution />
            </MapInfoContainer>
          </LayersContainer>
        </GisViewer>
      )}
    </div>
  );
}
