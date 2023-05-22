import { OSM_TILE_SIZE } from "../constants";
import { calculateClosestPowerOf2 } from "utils";
import { useMemo } from "react";
import { useViewDimensions } from "../../../view/hooks/use-view-state";

export function useOsmBaseZoomLevel(): number {
  // The OSM base zoom level is calculated based on the width of the view.
  // We obtain this using the useViewDimensions hook.
  const [width] = useViewDimensions();

  const osmBaseZoomLevel = useMemo(() => {
    // First, we calculate the ratio of the view width to the size of an OSM tile.
    // This tells us how many OSM tiles can fit across the width of our view.
    const tilesAcrossViewWidth = width / OSM_TILE_SIZE;

    // However, we can't have a fractional number of tiles, and OSM uses a power-of-2
    // tile grid. So, we find the closest power of 2 that is greater than or equal to
    // our calculated number of tiles. This will be the number of tiles we actually use.
    const closestPowerOf2Tiles = calculateClosestPowerOf2(tilesAcrossViewWidth);

    // The OSM zoom level is defined such that at zoom level N, there are 2^N tiles across
    // the width of the world. Therefore, we can calculate the base OSM zoom level by taking
    // the base-2 logarithm of our calculated number of tiles. This gives us the power N such
    // that 2^N is our number of tiles, which is by definition our zoom level.
    const osmBaseZoomLevel = Math.log2(closestPowerOf2Tiles);

    return osmBaseZoomLevel;
  }, [width]);

  return osmBaseZoomLevel;
}
