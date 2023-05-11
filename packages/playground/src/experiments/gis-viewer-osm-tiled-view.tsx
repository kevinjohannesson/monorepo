import { GisViewer } from "gis-viewer";

export function GisViewerTiledView() {
  return (
    <GisViewer
      id="default"
      initialCenterCoordinate={[568228.114364449, 6816936.078896927]}
      initialZoomLevel={0}
    />
  );
}
