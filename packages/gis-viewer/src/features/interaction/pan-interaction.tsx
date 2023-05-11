// import { isNull } from "utils";
// import { isNumber } from "lodash";
// import { updateCenterCoordinateByPixel } from "../view/slice";
// import { useEffect, useRef } from "react";
// import { useGisViewerDispatch } from "../../slice";
// import { useViewContext } from "../view/context";

// export function PanInteraction(): null {
//   const { ref } = useViewContext();

//   const dispatch = useGisViewerDispatch();

//   const isDragging = useRef(false);
//     const movementX = useRef(0);
//   const movementY = useRef(0);

//   useEffect(() => {
//     const element = ref.current;
//     if (isNull(element)) return;

//     const handleMouseDown = (): void => {
//       isDragging.current = true;
//     };

//     element.addEventListener("mousedown", handleMouseDown);

//     return () => {
//       element.removeEventListener("mousedown", handleMouseDown);
//     };
//   }, []);

//   useEffect(() => {
//     const element = ref.current;
//     if (isNull(element)) return;

//     const handleMouseUpLeave = (): void => {
//       isDragging.current = false;
//     };

//     element.addEventListener("mouseup", handleMouseUpLeave);
//     element.addEventListener("mouseleave", handleMouseUpLeave);

//     return () => {
//       element.removeEventListener("mouseup", handleMouseUpLeave);
//       element.removeEventListener("mouseleave", handleMouseUpLeave);
//     };
//   }, []);

//   // useEffect(() => {
//   //   const element = ref.current;
//   //   if (isNull(element)) return;

//   //   const handleMouseMove = (e: globalThis.MouseEvent): void => {
//   //     e.preventDefault();

//   //     if (!isDragging.current) return;

//   //     dispatch(updateCenterCoordinateByPixel([-e.movementX, e.movementY]));

//   //     e.stopPropagation();
//   //   };

//   //   element.addEventListener("mousemove", handleMouseMove);

//   //   return () => {
//   //     element.removeEventListener("mousemove", handleMouseMove);
//   //   };
//   // }, []);

//   useEffect(() => {
//     const element = ref.current;
//     if (isNull(element)) return;

//     let lastTime = 0; // Store the last time the event was called
//     let requestId: number | null = null;

//     const handleMouseMove = (e: globalThis.MouseEvent): void => {
//       e.preventDefault();
//       if (!isDragging.current) return;
//       if (isNumber(requestId)) cancelAnimationFrame(requestId); // Cancel the last frame request

//       requestId = requestAnimationFrame((time) => {
//         if (time - lastTime >= 16.67) {
//           // 60 fps = 1000 ms/60 = 16.67ms
//           dispatch(updateCenterCoordinateByPixel([-e.movementX, e.movementY]));
//           e.stopPropagation();
//           lastTime = time;
//         }
//       });
//     };

//     element.addEventListener("mousemove", handleMouseMove);

//     return () => {
//       if (isNumber(requestId)) {
//         cancelAnimationFrame(requestId); // Cancel the last frame request on cleanup
//       }
//       element.removeEventListener("mousemove", handleMouseMove);
//     };
//   }, []);

//   // useEffect(() => {
//   //   const element = ref.current;
//   //   if (isNull(element)) return;

//   //   let lastTime = 0; // Store the last time the event was called
//   //   let requestId: number | null = null;

//   //   const handleMouseMove = (e: globalThis.MouseEvent): void => {
//   //     e.preventDefault();
//   //     if (!isDragging.current) return;

//   //   };

//   //   element.addEventListener("mousemove", handleMouseMove);

//   //   return () => {
//   //     if (isNumber(requestId)) {
//   //       cancelAnimationFrame(requestId); // Cancel the last frame request on cleanup
//   //     }
//   //     element.removeEventListener("mousemove", handleMouseMove);
//   //   };
//   // }, []);

//   return null;
// }

import { isNull } from "utils";
import { updateCenterCoordinateByPixel } from "../view/slice";
import { useEffect, useRef } from "react";
import { useGisViewerDispatch } from "../../slice";
import { useViewContext } from "../view/context";
export function PanInteraction(): null {
  const { ref } = useViewContext();

  const dispatch = useGisViewerDispatch();

  const isDragging = useRef(false);
  const movementX = useRef(0);
  const movementY = useRef(0);
  const frameId = useRef<number | null>(null);

  useEffect(() => {
    const element = ref.current;
    if (isNull(element)) return;

    const handleMouseDown = (): void => {
      isDragging.current = true;
    };

    element.addEventListener("mousedown", handleMouseDown);

    return () => {
      element.removeEventListener("mousedown", handleMouseDown);
    };
  }, []);

  useEffect(() => {
    const element = ref.current;
    if (isNull(element)) return;

    const handleMouseUpLeave = (): void => {
      isDragging.current = false;
      if (frameId.current !== null) {
        cancelAnimationFrame(frameId.current);
        frameId.current = null;
      }
    };

    element.addEventListener("mouseup", handleMouseUpLeave);
    element.addEventListener("mouseleave", handleMouseUpLeave);

    return () => {
      element.removeEventListener("mouseup", handleMouseUpLeave);
      element.removeEventListener("mouseleave", handleMouseUpLeave);
    };
  }, []);

  useEffect(() => {
    const element = ref.current;
    if (isNull(element)) return;

    const handleMouseMove = (e: globalThis.MouseEvent): void => {
      e.preventDefault();

      if (!isDragging.current) return;

      movementX.current += e.movementX;
      movementY.current += e.movementY;

      if (frameId.current === null) {
        frameId.current = requestAnimationFrame(() => {
          dispatch(
            updateCenterCoordinateByPixel([
              -movementX.current,
              movementY.current,
            ]),
          );
          movementX.current = 0;
          movementY.current = 0;
          frameId.current = null;
        });
      }

      e.stopPropagation();
    };

    element.addEventListener("mousemove", handleMouseMove);

    return () => {
      element.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  return null;
}
