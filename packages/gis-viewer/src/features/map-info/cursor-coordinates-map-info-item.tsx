import { type Coordinate } from "../../types";
import { MdOutlineMouse } from "react-icons/md";
import { type ReactElement, useEffect, useRef, useState } from "react";
import {
  addVector2d,
  divideVector2d,
  isNotNull,
  isNull,
  multiplyVector2d,
  subtractVector2d,
} from "utils";
import { selectViewState } from "../view/slice";
import { useGisViewerSelector } from "../../slice";
import { useViewContext } from "../view/context";

export function CursorCoordinatesMapInfoItem({
  placeholderText = "Cursor is out of view",
}: {
  placeholderText?: string | null;
}): ReactElement {
  const frameRef = useRef<number | null>(null);

  const { ref } = useViewContext();

  const dimensions = useGisViewerSelector(selectViewState("dimensions"));
  const currentResolution = useGisViewerSelector(selectViewState("currentResolution"));
  const centerCoordinate = useGisViewerSelector(selectViewState("centerCoordinate"));

  const [cursorCoordinate, setCursorCoordinate] = useState<Coordinate | null>(null);

  useEffect(() => {
    const element = ref.current;
    if (isNull(element)) return;

    const listener = (e: MouseEvent): void => {
      if (isNull(frameRef.current)) {
        const cursorPixelCoordinateInView: Coordinate = [
          Math.max(e.offsetX, 0),
          Math.max(e.offsetY, 0),
        ];

        const viewCenterPixelCoordinate: Coordinate = divideVector2d(dimensions, 2);

        const cursorOffsetFromViewCenter: Coordinate = subtractVector2d(
          cursorPixelCoordinateInView,
          viewCenterPixelCoordinate,
        );

        const cursorProjectedOffset: Coordinate = multiplyVector2d(
          cursorOffsetFromViewCenter,
          currentResolution,
        );

        const cursorProjectedCoordinate: Coordinate = addVector2d(
          cursorProjectedOffset,
          centerCoordinate,
        );

        frameRef.current = requestAnimationFrame(() => {
          setCursorCoordinate(cursorProjectedCoordinate.map(Math.round) as Coordinate);
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

    const listener = (): void => {
      if (isNotNull(frameRef.current)) {
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

  const coordinatesOrPlaceholder =
    cursorCoordinate != null
      ? `x: ${cursorCoordinate[0]}, y: ${cursorCoordinate[1]}`
      : placeholderText;

  return (
    <div
      className={`flex gap-2 items-center text-sm ${cursorCoordinate != null ? "font-mono" : ""} ${
        isNull(cursorCoordinate) ? "text-slate-400" : "text-slate-700"
      } z-10`}
    >
      <MdOutlineMouse />
      <span>{coordinatesOrPlaceholder}</span>
    </div>
  );
}
