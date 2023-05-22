import { toWholeZoomLevel } from "../utils/tile-number-utils";
import { useOsmBaseZoomLevel } from "./use-osm-base-zoom-level";
import { useViewZoomLevel } from "../../../view/hooks/use-view-state";

export function useOsmFractionalScaledZoomLevel(): number {
  const viewZoomLevel = useViewZoomLevel();
  const osmBaseZoomLevel = useOsmBaseZoomLevel();

  // The OSM base zoom level is added to the view zoom level.
  // This gives us a new zoom level that is scaled according to the OSM base zoom level.
  // This scaled zoom level allows us to maintain the desired level of detail in our map view,
  // regardless of the actual zoom level of the view.
  const osmScaledZoomLevel = viewZoomLevel + osmBaseZoomLevel;

  return osmScaledZoomLevel;
}

export function useOsmWholeScaledZoomLevel(): number {
  return toWholeZoomLevel(useOsmFractionalScaledZoomLevel());
}
