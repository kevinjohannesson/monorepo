import { useEffect, useRef, useState } from "react";
import { MdOutlineMouse } from "react-icons/md";
import {
  divideVector2d,
  isNull,
  multiplyVector2d,
  subtractVector2d,
} from "utils";
import { useGisViewerSelector } from "../../../slice";
import { Coordinate } from "../../../types";
import { useViewContext } from "../../view/context";
import { selectViewState } from "../../view/slice";

export function CursorCoordinatesMapInfoItem({
  placeholderText = "Cursor is out of view",
}: {
  placeholderText?: string | null;
}) {
  const frameRef = useRef<number | null>(null);

  const { ref } = useViewContext();

  const dimensions = useGisViewerSelector(selectViewState("dimensions"));
  const currentResolution = useGisViewerSelector(
    selectViewState("currentResolution")
  );

  const [cursorCoordinate, setCursorCoordinate] = useState<Coordinate | null>(
    null
  );

  useEffect(() => {
    const element = ref.current;
    if (isNull(element)) return;

    const listener = (e: MouseEvent) => {
      if (!frameRef.current) {
        const cursorPixelCoordinateInView: Coordinate = [
          Math.max(e.offsetX, 0),
          Math.max(e.offsetY, 0),
        ];
        const viewCenterPixelCoordinate: Coordinate = divideVector2d(
          dimensions,
          2
        );
        const cursorOffsetFromViewCenter: Coordinate = subtractVector2d(
          cursorPixelCoordinateInView,
          viewCenterPixelCoordinate
        );
        const cursorProjectedCoordinate: Coordinate = multiplyVector2d(
          cursorOffsetFromViewCenter,
          currentResolution
        );

        frameRef.current = requestAnimationFrame(() => {
          setCursorCoordinate(
            cursorProjectedCoordinate.map(Math.round) as Coordinate
          );
          frameRef.current = null;
        });
      }
    };

    element.addEventListener("mousemove", listener);

    return () => {
      element.removeEventListener("mousemove", listener);
    };
  }, [ref, dimensions, currentResolution]);

  useEffect(() => {
    const element = ref.current;
    if (isNull(element)) return;

    const listener = () => {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
        frameRef.current = null;
      }
      setCursorCoordinate(null);
    };

    element.addEventListener("mouseleave", listener);

    return () => {
      element.removeEventListener("mouseleave", listener);
    };
  }, [ref, frameRef]);

  const coordinatesOrPlaceholder = cursorCoordinate
    ? `x: ${cursorCoordinate[0]}, y: ${cursorCoordinate[1]}`
    : placeholderText;

  return (
    <div
      className={`flex gap-2 items-center text-sm ${
        isNull(cursorCoordinate) ? "text-slate-400" : "text-slate-700"
      } z-10`}
    >
      <MdOutlineMouse />
      <span>{coordinatesOrPlaceholder}</span>
    </div>
  );
}
