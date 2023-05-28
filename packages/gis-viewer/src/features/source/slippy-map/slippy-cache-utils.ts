import * as SlippyTileUtils from "./slippy-tile-utils";
import { type TileImageCacheContextValue } from "../../cache/tile-image-cache";
import { type Vector2d } from "utils";
import { isUndefined } from "lodash";

type IAvailableZoomLevelsByOffset = Record<number, Record<number, number[]>>;

export function getAvailableZoomLevelsForOffsets(
  cacheState: TileImageCacheContextValue,
  offsets: Vector2d[],
  currentState: SlippyTileUtils.ICurrentState,
): IAvailableZoomLevelsByOffset {
  return offsets.reduce<IAvailableZoomLevelsByOffset>((record, offset) => {
    const availableZoomLevels = cacheState.availableZoomLevels.reduce<number[]>((zoomLevels, z) => {
      const [x, y] = SlippyTileUtils.calculateTileNumbersAtDifferentZoomLevel(
        {
          ...currentState,
          position: [currentState.position[0] + offset[0], currentState.position[1] + offset[1]],
        },
        z,
      );

      if (cacheState.hasTileImage(x, y, z)) return [...zoomLevels, z];
      return zoomLevels;
    }, []);

    if (isUndefined(record[offset[0]])) record[offset[0]] = {};
    record[offset[0]][offset[1]] = availableZoomLevels;

    return record;
  }, {});
}
