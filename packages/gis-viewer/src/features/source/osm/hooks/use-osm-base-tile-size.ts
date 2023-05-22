import { OSM_TILE_SIZE } from "../constants";
import { useOsmBaseScale } from "./use-osm-base-scale";

export function useOsmBaseTileSize(): number {
  const osmBaseScale = useOsmBaseScale();

  // The size of the tiles that are rendered on screen might not be the same as the original OSM_TILE_SIZE,
  // because we apply a scaling factor to the tiles to fit them into our view.
  // Therefore, we calculate the size of the rendered tiles by multiplying the OSM_TILE_SIZE by the scale factor.
  const osmBaseTileSize = osmBaseScale * OSM_TILE_SIZE;

  return osmBaseTileSize;
}
