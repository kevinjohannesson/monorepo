import { isNull } from "utils";
import { isTouchPadScroll } from "./utils";
import { updateZoomLevel } from "../view/slice";
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

  useEffect(() => {
    const element = ref.current;
    if (isNull(element)) return;

    const handleWheel = (event: globalThis.WheelEvent): void => {
      // event.preventDefault(); // Since the event is passive we have no need for this.

      const delta = isTouchPadScroll(event) ? 0.1 : 0.1;
      const directionalDelta = zoomDirection * delta;

      zoomDelta.current += event.deltaY < 0 ? -directionalDelta : directionalDelta;

      if (frameId.current === null) {
        frameId.current = requestAnimationFrame(() => {
          dispatch(updateZoomLevel(zoomDelta.current));
          zoomDelta.current = 0;
          frameId.current = null;
        });
      }

      event.stopPropagation();
    };

    element.addEventListener("wheel", handleWheel, { passive: true });

    return () => {
      element.removeEventListener("wheel", handleWheel);
      if (frameId.current !== null) {
        cancelAnimationFrame(frameId.current);
        frameId.current = null;
      }
    };
  }, []);

  return null;
}
