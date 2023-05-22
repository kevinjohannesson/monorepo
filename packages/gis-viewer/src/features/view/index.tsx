import { type Coordinate, type Dimensions, type Limits } from "../../types";
import { DEFAULT_DIMENSIONS } from "./constants";
import { EPSG_3857 } from "../projections/epsg3857";
import { type Projection } from "../projections";
import { type ReactElement, type ReactNode, useEffect, useRef } from "react";
import { ViewContainer } from "./container";
import { ViewContext } from "./context";
import { type ViewWrapping, selectIsInitialized, setIsInitialized, updateSlice } from "./slice";
import {
  calculateBaseResolution,
  calculateResolutionFromZoomLevel,
} from "./utils/resolution-utils";
import { isUndefined } from "lodash";
import { useGisViewerDispatch, useGisViewerSelector } from "../../slice";

export interface ResolutionProps {
  initialResolution: number;
  initialZoomLevel?: never;
}

export interface ZoomLevelProps {
  initialResolution?: never;
  initialZoomLevel?: number;
}

export interface ViewPropsBase {
  children?: ReactNode;
  dimensions?: Dimensions;
  initialCenterCoordinate?: Coordinate;
  projection?: Projection;
  zoomLevelLimits?: Limits;
  wrapping?: ViewWrapping;
}

export type ViewProps = ViewPropsBase & (ResolutionProps | ZoomLevelProps);

export function View({
  children = null,
  dimensions = DEFAULT_DIMENSIONS,
  initialCenterCoordinate,
  initialResolution,
  initialZoomLevel,
  projection = EPSG_3857,
  zoomLevelLimits,
  wrapping,
}: ViewProps): ReactElement {
  if (!isUndefined(initialZoomLevel) && !isUndefined(initialResolution)) {
    throw new Error("Providing both initialZoomLevel and initialResolution is not supported.");
  }

  const ref = useRef<HTMLDivElement | null>(null);

  const dispatch = useGisViewerDispatch();

  const isInitialized = useGisViewerSelector(selectIsInitialized);

  useEffect(() => {
    const baseResolution = calculateBaseResolution(projection.projectedExtent, dimensions);

    const currentResolution =
      initialResolution ?? calculateResolutionFromZoomLevel(baseResolution, initialZoomLevel ?? 0);

    dispatch(
      updateSlice({
        centerCoordinate: initialCenterCoordinate,
        currentResolution,
        dimensions,
        wrapping,
        zoomLevelLimits,
      }),
    );

    dispatch(setIsInitialized());
  }, [
    dimensions,
    dispatch,
    initialCenterCoordinate,
    initialResolution,
    initialZoomLevel,
    projection,
    wrapping,
    zoomLevelLimits,
  ]);

  return (
    <ViewContext.Provider value={{ ref }}>
      <ViewContainer ref={ref} dimensions={dimensions}>
        {isInitialized ? children : null}
      </ViewContainer>
    </ViewContext.Provider>
  );
}
