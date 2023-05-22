import { type Vector2d } from "utils";
import { calculateFractionalTileNumbers, toWholeTileNumbers } from "../utils/tile-number-utils";
import { useMemo } from "react";
import { useOsmFractionalScaledZoomLevel } from "./use-osm-scaled-zoom-level";
import { useViewProjection } from "../../../view/hooks/use-view-state";

export function useOsmFractionalTileNumbers(projectedCoordinate: Vector2d): Vector2d {
  const projection = useViewProjection();
  const osmScaledZoomLevel = Math.floor(useOsmFractionalScaledZoomLevel());

  // The calculation of tile numbers depends on the center coordinate of the view,
  // the projection being used, and the current scaled zoom level.
  // We use a useMemo hook to avoid unnecessary recalculations.
  // The tile numbers will only be recalculated if any of these dependencies change.
  const osmFractionalTileNumbers = useMemo(
    () => calculateFractionalTileNumbers(projectedCoordinate, projection.code, osmScaledZoomLevel),
    [projectedCoordinate.join(), projection.code, osmScaledZoomLevel],
  );

  return osmFractionalTileNumbers;
}

export function useOsmWholeTileNumbers(projectedCoordinate: Vector2d): Vector2d {
  const osmFractionalTileNumbers = useOsmFractionalTileNumbers(projectedCoordinate);

  const osmWholeTileNumbers = useMemo(
    () => toWholeTileNumbers(osmFractionalTileNumbers),
    [osmFractionalTileNumbers.join()],
  );

  return osmWholeTileNumbers;
}
