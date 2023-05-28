import * as SlippyGridUtils from "./slippy-grid-utils";
import * as SlippyTileUtils from "./slippy-tile-utils";
import { type Vector2d, assertNotNull, getClosestNumberFrom, isNull } from "utils";
import { getAvailableZoomLevelsForOffsets } from "./slippy-cache-utils";
import { isEmpty } from "lodash";
import { useEffect } from "react";
import { useEffectiveTileSize, useEffectiveZoomLevel } from "./slippy-map-hooks";
import { useLayerContext } from "../../layer";
import { useTileImageCacheContext } from "../../cache/tile-image-cache";
import {
  useViewCenterCoordinate,
  useViewDimensions,
  useViewProjection,
} from "../../view/hooks/use-view-state";

const MINIMUM_TILE_SIZE = 50;

interface SlippyGridProps {
  tileSize: number;
  displayTileNumbers?: boolean;
}

export function SlippyGrid({
  tileSize: originalTileSize,
  displayTileNumbers = false,
}: SlippyGridProps): null {
  const viewDimensions = useViewDimensions();
  const viewProjection = useViewProjection();
  const viewCenterCoordinate = useViewCenterCoordinate();

  const effectiveTileSize = useEffectiveTileSize(originalTileSize);
  const effectiveZoomLevel = useEffectiveZoomLevel(originalTileSize);

  const layer = useLayerContext();

  const cache = useTileImageCacheContext();

  useEffect(() => {
    const offscreenCanvas = new OffscreenCanvas(viewDimensions[0], viewDimensions[1]);
    const offscreenCtx = offscreenCanvas.getContext("2d");
    assertNotNull(offscreenCtx);

    cache.availableZoomLevels.forEach((cacheZoomLevel) => {
      const zoomAdjustedTileSize = SlippyGridUtils.calculateZoomAdjustedTileSize(
        effectiveTileSize,
        cacheZoomLevel,
        effectiveZoomLevel,
      );

      if (zoomAdjustedTileSize < MINIMUM_TILE_SIZE) return;

      const origin: Vector2d = SlippyGridUtils.calculateOrigin(viewDimensions);

      const viewCenterTilePosition = SlippyTileUtils.calculatePositionFromProjectedSource(
        viewCenterCoordinate,
        viewProjection.code,
        cacheZoomLevel,
      );

      const viewCenterOffset = viewCenterTilePosition.map((p) => (p % 1) * zoomAdjustedTileSize);

      const gridTileOffsets = SlippyGridUtils.generateTileOffsets(
        viewDimensions,
        zoomAdjustedTileSize,
      );

      const availableZoomLevelsForOffsets = getAvailableZoomLevelsForOffsets(
        cache,
        gridTileOffsets,
        {
          position: [viewCenterTilePosition[0], viewCenterTilePosition[1]],
          zoomLevel: cacheZoomLevel,
        },
      );

      gridTileOffsets.forEach((offset: Vector2d) => {
        const tilePositionX = viewCenterTilePosition[0] + offset[0];
        const tilePositionY = viewCenterTilePosition[1] + offset[1];

        const [tileNumbersX, tileNumbersY] = SlippyTileUtils.toTileNumbers([
          tilePositionX,
          tilePositionY,
        ]);

        const hasValidUrlParameters = SlippyTileUtils.isValidUrlParameters(
          tileNumbersX,
          tileNumbersY,
          cacheZoomLevel,
        );
        if (!hasValidUrlParameters) {
          return;
        }

        const hasImageAvailable = cache.hasTileImage(tileNumbersX, tileNumbersY, cacheZoomLevel);
        if (!hasImageAvailable) {
          return;
        }

        const availableZoomLevelsForIndex = availableZoomLevelsForOffsets[offset[0]]?.[offset[1]];

        const isTooHighZoomLevel = cacheZoomLevel > effectiveZoomLevel;

        const isClosestAvailableZoomLevel = isEmpty(availableZoomLevelsForIndex)
          ? false
          : getClosestNumberFrom(availableZoomLevelsForIndex, effectiveZoomLevel) ===
            cacheZoomLevel;

        if (isTooHighZoomLevel && !isClosestAvailableZoomLevel) {
          return;
        }

        const dx = origin[0] - viewCenterOffset[0] + offset[0] * zoomAdjustedTileSize;
        const dy = origin[1] - viewCenterOffset[1] + offset[1] * zoomAdjustedTileSize;
        const ds = zoomAdjustedTileSize;

        const isTileOutOfVisibleCanvas =
          dx + ds < 0 || dy + ds < 0 || dx > viewDimensions[0] || dy > viewDimensions[1];

        if (isTileOutOfVisibleCanvas) {
          return;
        }

        const image = cache.getTileImage(tileNumbersX, tileNumbersY, cacheZoomLevel);
        if (isNull(image)) return;

        offscreenCtx.drawImage(image, dx, dy, ds, ds);

        if (displayTileNumbers) {
          drawTileNumbers(offscreenCtx, dx, dy, zoomAdjustedTileSize, [tileNumbersX, tileNumbersY]);
        }
      });
    });

    const layerCtx = layer.ref.current?.getContext("2d");
    assertNotNull(layerCtx);

    layerCtx.drawImage(offscreenCanvas, 0, 0, viewDimensions[0], viewDimensions[1]);

    return () => {
      layerCtx.clearRect(0, 0, viewDimensions[0], viewDimensions[1]);
    };
  }, [
    effectiveZoomLevel,
    effectiveTileSize,
    cache.availableZoomLevels.join(),
    cache.version,
    viewDimensions.join(),
    viewCenterCoordinate.join(),
    viewProjection.code,
  ]);

  return null;
}

function drawTileNumbers(
  offscreenCtx: OffscreenCanvasRenderingContext2D,
  dx: number,
  dy: number,
  tileSize: number,
  tileNumbers: Vector2d,
): void {
  offscreenCtx.lineWidth = 1;
  offscreenCtx.strokeStyle = "#262626";
  offscreenCtx.strokeRect(dx, dy, tileSize, tileSize);

  const tileNumbersText = `[x:${tileNumbers[0]}, y:${tileNumbers[1]}]`;
  const origin: Vector2d = [dx + tileSize / 2, dy + tileSize / 2];

  offscreenCtx.font = "400 24px Courier New";
  offscreenCtx.textAlign = "center";
  offscreenCtx.textBaseline = "middle";
  offscreenCtx.strokeStyle = "white";
  offscreenCtx.lineWidth = 3;
  offscreenCtx.strokeText(tileNumbersText, origin[0], origin[1]);

  offscreenCtx.fillStyle = "#262626";
  offscreenCtx.fillText(tileNumbersText, origin[0], origin[1]);
}
