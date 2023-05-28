import { ControlsContainer } from "gis-viewer/src/features/control/container";
import { PanControl } from "gis-viewer/src/features/control/pan-control";
import { ZoomControl } from "gis-viewer/src/features/control/zoom-control";
import { Layer } from "gis-viewer/src/features/layer";
import { LayersContainer } from "gis-viewer/src/features/layer/container";
import { MapInfoContainer } from "gis-viewer/src/features/map-info/container";
import { CrosshairSource } from "gis-viewer/src/features/source/cross-hair";
import { SlippyMapSource } from "gis-viewer/src/features/source/slippy-map/slippy-map-source";
import { GisViewer } from "gis-viewer/src/gis-viewer";
import { useElementSize } from "usehooks-ts";
import { Vector2d } from "utils";
import { OsmAttribution } from "../components/osm-attribution";

const MASTER_ID = "MASTER";
const INITIAL_ZOOM_LEVEL = 5;
const INITIAL_CENTER_COORDINATE: Vector2d = [
  568228.114364449, 6816936.078896927,
];

export function NavigationControlsFeature() {
  const [wrapperRef, { width, height }] = useElementSize();

  return (
    <div className="flex w-full h-full " ref={wrapperRef}>
      {width !== 0 && height !== 0 && (
        <GisViewer
          dimensions={[width, height]}
          id={MASTER_ID}
          initialCenterCoordinate={INITIAL_CENTER_COORDINATE}
          initialZoomLevel={INITIAL_ZOOM_LEVEL}
        >
          <LayersContainer>
            <Layer>
              <SlippyMapSource />
            </Layer>

            <Layer>
              <CrosshairSource />
            </Layer>

            <ControlsContainer>
              <ZoomControl />
              <PanControl />
            </ControlsContainer>

            <MapInfoContainer placement="bottom-right" direction="column">
              <OsmAttribution />
            </MapInfoContainer>
          </LayersContainer>
        </GisViewer>
      )}
    </div>
  );
}
