import { InteractionContainer } from "gis-viewer/src/features/interaction/container";
import { PanInteraction } from "gis-viewer/src/features/interaction/pan-interaction";
import { ZoomInteraction } from "gis-viewer/src/features/interaction/zoom-interaction";
import { Layer } from "gis-viewer/src/features/layer";
import { LayersContainer } from "gis-viewer/src/features/layer/container";
import { MapInfoContainer } from "gis-viewer/src/features/map-info/container";
import { CrosshairSource } from "gis-viewer/src/features/source/cross-hair";
import { SlippyMapSource } from "gis-viewer/src/features/source/slippy-map/slippy-map-source";
import { GisViewer, GisViewerMirror } from "gis-viewer/src/gis-viewer";
import { Fragment } from "react";
import { useElementSize } from "usehooks-ts";
import { Vector2d } from "utils";
import { OsmAttribution } from "../components/osm-attribution";
import { StamenAttribution } from "../components/stamen-attribution";

const MASTER_ID = "MASTER";
const INITIAL_ZOOM_LEVEL = 5;
const INITIAL_CENTER_COORDINATE: Vector2d = [
  568228.114364449, 6816936.078896927,
];

export function MasterSlaveFeature() {
  const [wrapperRef, { width, height }] = useElementSize();

  return (
    <div className="flex w-full h-full " ref={wrapperRef}>
      {width !== 0 && height !== 0 && (
        <Fragment>
          <div className="flex flex-col">
            <GisViewer
              id={MASTER_ID}
              dimensions={[width / 2, height]}
              initialZoomLevel={INITIAL_ZOOM_LEVEL}
              initialCenterCoordinate={INITIAL_CENTER_COORDINATE}
            >
              <LayersContainer>
                <Layer>
                  <SlippyMapSource />
                </Layer>

                <Layer>
                  <CrosshairSource />
                </Layer>

                <InteractionContainer>
                  <ZoomInteraction />
                  <PanInteraction />
                </InteractionContainer>

                <MapInfoContainer placement="bottom-right" direction="column">
                  <OsmAttribution />
                </MapInfoContainer>
              </LayersContainer>
            </GisViewer>
          </div>
          <div className="flex flex-col gap-2">
            <div className="cursor-not-allowed">
              <GisViewerMirror
                mirroredId={MASTER_ID}
                dimensions={[width / 2, height]}
              >
                <Layer>
                  <SlippyMapSource url="https://stamen-tiles.a.ssl.fastly.net/toner/{z}/{x}/{y}.png" />
                </Layer>

                <MapInfoContainer placement="bottom-right" direction="column">
                  <StamenAttribution />
                </MapInfoContainer>
              </GisViewerMirror>
            </div>
          </div>
        </Fragment>
      )}
    </div>
  );
}
