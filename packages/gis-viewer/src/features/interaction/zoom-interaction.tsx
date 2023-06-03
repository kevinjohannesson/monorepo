import { isNull } from "utils";
import { isTouchPadScroll } from "./utils";
import { updateZoomLevelPreservingPointPosition } from "../view/slice";
import { useEffect, useRef } from "react";
import { useGisViewerDispatch } from "../../slice";
import { useViewContext } from "../view/context";

export const DEFAULT_ZOOM_DIRECTION = -1;

export interface ZoomInteractionProps {
  zoomDirection?: -1 | 1;
}

export function ZoomInteraction({
  zoomDirection = DEFAULT_ZOOM_DIRECTION,
}: ZoomInteractionProps): null {
  const { ref } = useViewContext();

  const dispatch = useGisViewerDispatch();

  const zoomDelta = useRef(0);
  const frameId = useRef<number | null>(null);

  const zoomTicks = useRef<Array<{ timeStamp: number; direction: number; value: number }>>([]);

  useEffect(() => {
    const element = ref.current;
    if (isNull(element)) return;

    const handleWheel = (event: globalThis.WheelEvent): void => {
      const now = event.timeStamp;
      const direction = Math.sign(event.deltaY);

      if (isTouchPadScroll(event)) {
        const delta = event.deltaY / 100;

        const directionalDelta = zoomDirection * delta;

        zoomDelta.current += directionalDelta;
      } else {
        // If there's been a direction change or enough time has passed since the last event, reset the zoomTicks array
        if (zoomTicks.current.length > 0) {
          const lastEvent = zoomTicks.current[zoomTicks.current.length - 1];
          if (lastEvent.direction !== direction || now - lastEvent.timeStamp > 200) {
            zoomTicks.current = [];
          }
        }

        // Append new zoom "tick". The value doubles if it's a subsequent event in the same direction.
        zoomTicks.current.push({
          timeStamp: now,
          direction,
          value:
            zoomTicks.current.length > 0
              ? zoomTicks.current[zoomTicks.current.length - 1].value * 2
              : 0.01,
        });

        // Limit the array size
        if (zoomTicks.current.length > 50) {
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const [_, ...rest] = zoomTicks.current;
          zoomTicks.current = rest;
        }

        // The zoomSpeed is determined by the last "tick"
        const zoomSpeed = zoomDirection * zoomTicks.current[zoomTicks.current.length - 1].value;

        const directionalDelta = zoomDirection * -zoomSpeed;

        zoomDelta.current += direction * directionalDelta;
      }

      if (frameId.current === null) {
        frameId.current = requestAnimationFrame(() => {
          dispatch(
            updateZoomLevelPreservingPointPosition({
              deltaZoom: zoomDelta.current,
              pixelOriginForZoom: [event.offsetX, event.offsetY],
            }),
          );
          zoomDelta.current = 0;
          frameId.current = null;
        });
      }
    };

    element.addEventListener("wheel", handleWheel, { passive: true });

    return () => {
      element.removeEventListener("wheel", handleWheel);
      if (frameId.current !== null) {
        cancelAnimationFrame(frameId.current);
        frameId.current = null;
      }
    };
  }, [zoomDirection]);

  return null;
}
