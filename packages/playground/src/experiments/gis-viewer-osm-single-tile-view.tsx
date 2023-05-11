import { GisViewerOsmSingleTile } from "gis-viewer/src/temp/experiments/gis-viewer-osm-single-tile";

export function GisViewerOsmSingleTileView() {
  return (
    <GisViewerOsmSingleTile
      id="default"
      initialCenterCoordinate={[568228.114364449, 6816936.078896927]}
      initialZoomLevel={5}
    />
  );
}
