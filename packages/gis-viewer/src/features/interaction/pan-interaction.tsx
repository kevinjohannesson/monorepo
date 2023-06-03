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

      element.style.cursor = "grabbing";
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

      element.style.cursor = "";

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
          dispatch(updateCenterCoordinateByPixel([-movementX.current, movementY.current]));
          movementX.current = 0;
          movementY.current = 0;
          frameId.current = null;
        });
      }

      // e.stopPropagation();
    };

    element.addEventListener("mousemove", handleMouseMove);

    return () => {
      element.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  return null;
}
