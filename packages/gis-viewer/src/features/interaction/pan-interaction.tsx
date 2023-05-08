import { isNull } from "utils";
import { updateCenterCoordinateByPixel } from "../view/slice";
import { useEffect, useRef } from "react";
import { useGisViewerDispatch } from "../../slice";
import { useViewContext } from "../view/context";

export function PanInteraction(): null {
  const { ref } = useViewContext();

  const dispatch = useGisViewerDispatch();

  const isDragging = useRef(false);

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

      dispatch(updateCenterCoordinateByPixel([-e.movementX, e.movementY]));

      e.stopPropagation();
    };

    element.addEventListener("mousemove", handleMouseMove);

    return () => {
      element.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  return null;
}
