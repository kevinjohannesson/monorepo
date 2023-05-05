import {
  MutableRefObject,
  ReactNode,
  createContext,
  useEffect,
  useRef,
} from "react";
import { useInstanceDispatch } from "../../store-hooks";
import { Coordinate, Dimensions, Limits } from "../../types";
import {
  DEFAULT_CENTER_COORDINATE,
  DEFAULT_DIMENSIONS,
  DEFAULT_MAX_ZOOM_LEVEL,
  DEFAULT_MIN_ZOOM_LEVEL,
} from "./constants";
import { updateSlice } from "./slice";
import { isUndefined } from "lodash";
import { Projection } from "../projections";
import { EPSG_3857 } from "../projections/epsg3857";
import {
  calculateBaseResolution,
  calculateResolutionFromZoomLevel,
} from "./utils/resolution-utils";
import { ViewContainer } from "./container";
import { useRequiredContext } from "../../utils/use-required-context";

interface ViewContextValue {
  ref: MutableRefObject<HTMLDivElement | null>;
}

const ViewContext = createContext({} as ViewContextValue);

export function useViewContext() {
  return useRequiredContext(ViewContext);
}

interface ResolutionProps {
  initialResolution: number;
  initialZoomLevel?: never;
}

interface ZoomLevelProps {
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
  zoomLevelLimits = [DEFAULT_MIN_ZOOM_LEVEL, DEFAULT_MAX_ZOOM_LEVEL],
}: ViewProps & (ResolutionProps | ZoomLevelProps)) {
  if (!isUndefined(initialZoomLevel) && !isUndefined(initialResolution)) {
    throw new Error(
      "Providing both initialZoomLevel and initialResolution is not supported."
    );
  }
  const ref = useRef<HTMLDivElement | null>(null);

  const dispatch = useInstanceDispatch();

  useEffect(() => {
    const baseResolution = calculateBaseResolution(
      projection.projectedExtent,
      dimensions
    );

    const currentResolution =
      initialResolution ??
      calculateResolutionFromZoomLevel(baseResolution, initialZoomLevel || 0);

    dispatch(
      updateSlice({
        centerCoordinate: initialCenterCoordinate,
        currentResolution,
        dimensions,
        zoomLevelLimits,
      })
    );
  }, [
    dimensions,
    dispatch,
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
