import { type Coordinate, type Dimensions } from "../../../types";
import { type Projection } from "../../projections";
import { selectViewState, selectZoomLevel } from "../slice";
import { useGisViewerSelector } from "../../../slice";

/** @todo move to utils package?  */
const EPSILON = 1e-6;

export const useViewDimensions = (): Dimensions =>
  useGisViewerSelector(selectViewState("dimensions"));

export const useViewProjection = (): Projection =>
  useGisViewerSelector(selectViewState("projection"));

export const useViewCenterCoordinate = (): Coordinate =>
  useGisViewerSelector(selectViewState("centerCoordinate"));

export const useViewZoomLevel = (): number =>
  Number((useGisViewerSelector(selectZoomLevel) + EPSILON).toFixed(5));
