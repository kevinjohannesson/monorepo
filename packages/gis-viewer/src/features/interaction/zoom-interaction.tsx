import { isNull } from "utils";
import { isTouchPadScroll } from "./utils";
import { updateZoomLevel } from "../view/slice";
import { useEffect } from "react";
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

  useEffect(() => {
    const element = ref.current;
    if (isNull(element)) return;

    const handleWheel = (event: globalThis.WheelEvent): void => {
      event.preventDefault();

      const delta = isTouchPadScroll(event) ? 0.1 : 0.5;
      const directionalDelta = zoomDirection * delta;

      dispatch(
        updateZoomLevel(
          event.deltaY < 0 ? -directionalDelta : directionalDelta,
        ),
      );

      event.stopPropagation();
    };

    element.addEventListener("wheel", handleWheel);

    return () => {
      element.removeEventListener("wheel", handleWheel);
    };
  }, []);

  return null;
}
