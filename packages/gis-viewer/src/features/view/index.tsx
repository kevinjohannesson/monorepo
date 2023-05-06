import { ReactNode, useEffect, useRef } from "react";
import { ViewContainer } from "./container";
import { Coordinate, Dimensions, Limits } from "../../types";
import { Projection } from "../projections";
import {
  DEFAULT_CENTER_COORDINATE,
  DEFAULT_DIMENSIONS,
  DEFAULT_ZOOM_LIMITS,
} from "./constants";
import { EPSG_3857 } from "../projections/epsg3857";
import { isUndefined } from "lodash";
import { ViewContext } from "./context";
import { useGisViewerDispatch } from "../../slice";
import {
  calculateBaseResolution,
  calculateResolutionFromZoomLevel,
} from "./utils/resolution-utils";

export interface ResolutionProps {
  initialResolution: number;
  initialZoomLevel?: never;
}

export interface ZoomLevelProps {
  initialResolution?: never;
  initialZoomLevel?: number;
}

export interface ViewProps {
  children?: ReactNode;
  dimensions?: Dimensions;
  initialCenterCoordinate?: Coordinate;
  projection?: Projection;
  zoomLevelLimits?: Limits;
}

export function View({
  children = null,
  dimensions = DEFAULT_DIMENSIONS,
  initialCenterCoordinate = DEFAULT_CENTER_COORDINATE,
  initialResolution,
  initialZoomLevel,
  projection = EPSG_3857,
  zoomLevelLimits = DEFAULT_ZOOM_LIMITS,
}: ViewProps & (ResolutionProps | ZoomLevelProps)) {
  if (!isUndefined(initialZoomLevel) && !isUndefined(initialResolution)) {
    throw new Error(
      "Providing both initialZoomLevel and initialResolution is not supported."
    );
  }

  const ref = useRef<HTMLDivElement | null>(null);

  // const dispatch = useGisViewerDispatch();

  useEffect(() => {
    const baseResolution = calculateBaseResolution(
      projection.projectedExtent,
      dimensions
    );

    const currentResolution =
      initialResolution ??
      calculateResolutionFromZoomLevel(baseResolution, initialZoomLevel || 0);

    console.log({ baseResolution });
    console.log({ currentResolution });
    // dispatch(
    //   updateSlice({
    //     centerCoordinate: initialCenterCoordinate,
    //     currentResolution,
    //     dimensions,
    //     zoomLevelLimits,
    //   })
    // );
  }, [
    dimensions,
    // dispatch,
    initialCenterCoordinate,
    initialResolution,
    initialZoomLevel,
    projection,
    zoomLevelLimits,
  ]);

  return (
    <ViewContext.Provider value={{ ref }}>
      <ViewContainer ref={ref}>{children}</ViewContainer>
    </ViewContext.Provider>
  );
}
