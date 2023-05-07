import { useEffect, useRef } from "react";
import { useViewContext } from "../view/context";
import { useGisViewerDispatch } from "../../slice";
import { isNull } from "utils";

export function PanInteraction() {
  const { ref } = useViewContext();

  const dispatch = useGisViewerDispatch();

  const isDragging = useRef(false);

  useEffect(() => {
    const element = ref.current;
    if (isNull(element)) return;

    const handleMouseDown = () => {
      isDragging.current = true;
    };

    element.addEventListener("mousedown", handleMouseDown);

    return () => {
      element.removeEventListener("mousedown", handleMouseDown);
    };
  }, [ref]);

  useEffect(() => {
    const element = ref.current;
    if (isNull(element)) return;

    const handleMouseUpLeave = () => {
      isDragging.current = false;
    };

    element.addEventListener("mouseup", handleMouseUpLeave);
    element.addEventListener("mouseleave", handleMouseUpLeave);

    return () => {
      element.removeEventListener("mouseup", handleMouseUpLeave);
      element.removeEventListener("mouseleave", handleMouseUpLeave);
    };
  }, [ref]);

  useEffect(() => {
    const element = ref.current;
    if (isNull(element)) return;

    const handleMouseMove = (e: globalThis.MouseEvent) => {
      e.preventDefault();

      if (!isDragging.current) return;

      // dispatch(updateCenterCoordinateByPixel([-e.movementX, e.movementY]));

      e.stopPropagation();
    };

    element.addEventListener("mousemove", handleMouseMove);

    return () => {
      element.removeEventListener("mousemove", handleMouseMove);
    };
  }, [ref, dispatch]);

  return null;
}
