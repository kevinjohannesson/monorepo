import { type Extent } from "../../../types";
import { type Vector2d } from "utils";
import { useCallback } from "react";
import {
  useViewCenterCoordinate,
  useViewCurrentResolution,
  useViewDimensions,
} from "./use-view-state";

export function useViewExtent(): Extent {
  const [width, height] = useViewDimensions();
  const centerCoordinates = useViewCenterCoordinate();
  const currentResolution = useViewCurrentResolution();

  const halfExtentX = (width / 2) * currentResolution;
  const halfExtentY = (height / 2) * currentResolution;

  return [
    centerCoordinates[0] - halfExtentX,
    centerCoordinates[1] - halfExtentY,
    centerCoordinates[0] + halfExtentX,
    centerCoordinates[1] + halfExtentY,
  ];
}

function isVectorOutsideExtent([xMin, yMin, xMax, yMax]: Extent, [x, y]: Vector2d): boolean {
  return x < xMin || y < yMin || x > xMax || y > yMax;
}

function calculateHalfProjectedExtent(resolution: number, size: number): number {
  return (size / 2) * resolution;
}

export function calculateProjectedExtent(
  [x, y]: Vector2d,
  resolution: number,
  [width, height]: Vector2d,
): Extent {
  const halfExtentX = calculateHalfProjectedExtent(resolution, width);
  const halfExtentY = calculateHalfProjectedExtent(resolution, height);

  return [x - halfExtentX, y - halfExtentY, x + halfExtentX, y + halfExtentY];
}

interface UseViewPixelExtent {
  xMin: number;
  xMax: number;
  yMin: number;
  yMax: number;
  extent: Extent;
  isPixelOutsideExtent: (pixel: Vector2d) => boolean;
  isPixelRectOutsideExtent: (topLeftPixel: Vector2d, bottomRightPixel: Vector2d) => boolean;
}

export function useViewPixelExtent(): UseViewPixelExtent {
  const [width, height] = useViewDimensions();

  const extent: Extent = [0, 0, width, height];
  const [xMin, yMin, xMax, yMax]: Extent = extent;

  const isPixelOutsideExtent = useCallback(
    (pixel: Vector2d) => {
      return isVectorOutsideExtent(extent, pixel);
    },
    [xMin, yMin, xMax, yMax],
  );

  const isPixelRectOutsideExtent = useCallback(
    (
      [topLeftPixelX, topLeftPixelY]: Vector2d,
      [bottomRightPixelX, bottomRightPixelY]: Vector2d,
    ) => {
      return (
        bottomRightPixelX < 0 ||
        bottomRightPixelY < 0 ||
        topLeftPixelX > width ||
        topLeftPixelY > height
      );
    },
    [width, height],
  );

  return {
    xMin,
    xMax,
    yMin,
    yMax,
    extent,
    isPixelOutsideExtent,
    isPixelRectOutsideExtent,
  };
}

interface UseViewProjectedExtent {
  xMin: number;
  xMax: number;
  yMin: number;
  yMax: number;
  extent: Extent;
  isCoordinateOutsideExtent: (coordinate: Vector2d) => boolean;
}

export function useViewProjectedExtent(): UseViewProjectedExtent {
  const dimensions = useViewDimensions();
  const centerCoordinates = useViewCenterCoordinate();
  const currentResolution = useViewCurrentResolution();

  const extent = calculateProjectedExtent(centerCoordinates, currentResolution, dimensions);
  const [xMin, yMin, xMax, yMax] = extent;

  const isCoordinateOutsideExtent = useCallback(
    (coordinate: Vector2d) => {
      return isVectorOutsideExtent(extent, coordinate);
    },
    [xMin, yMin, xMax, yMax],
  );

  return {
    xMin,
    xMax,
    yMin,
    yMax,
    extent,
    isCoordinateOutsideExtent,
  };
}
