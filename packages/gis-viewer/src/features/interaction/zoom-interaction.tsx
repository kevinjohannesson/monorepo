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

// export function ZoomInteraction({
//   zoomDirection = DEFAULT_ZOOM_DIRECTION,
// }: ZoomInteractionProps): ReactElement | null {
//   const { ref } = useViewContext();
//   const [cursorPosition, setCursorPosition] = useState<Coordinate | null>(null)

//   const dispatch = useGisViewerDispatch();

//   useEffect(() => {
//     const element = ref.current;
//     if (isNull(element)) return;

//     const handleWheel = (event: globalThis.WheelEvent): void => {
//       event.preventDefault();

//       const delta = isTouchPadScroll(event) ? 0.1 : 0.1;
//       const directionalDelta = zoomDirection * delta;

//       dispatch(
//         updateZoomLevel(
//           event.deltaY < 0 ? -directionalDelta : directionalDelta,
//         ),
//       );

//       event.stopPropagation();
//     };

//     element.addEventListener("wheel", handleWheel);

//     return () => {
//       element.removeEventListener("wheel", handleWheel);
//     };
//   }, []);

//   if(isNull(cursorPosition)) return null;
//   return <div>hello world</div>;
// }

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
      event.preventDefault();

      const delta = isTouchPadScroll(event) ? 0.1 : 0.1;
      const directionalDelta = zoomDirection * delta;

      zoomDelta.current +=
        event.deltaY < 0 ? -directionalDelta : directionalDelta;

      if (frameId.current === null) {
        frameId.current = requestAnimationFrame(() => {
          dispatch(updateZoomLevel(zoomDelta.current));
          zoomDelta.current = 0;
          frameId.current = null;
        });
      }

      event.stopPropagation();
    };

    element.addEventListener("wheel", handleWheel);

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
