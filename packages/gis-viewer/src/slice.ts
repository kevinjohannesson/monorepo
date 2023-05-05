import { createReduxInstance } from "redux-instance";
import { DEFAULT_SLICE_PREFIX, GIS_VIEWER_NAME } from "./constants";
import { ViewState, viewSlice } from "./features/view/slice";
import { combineReducers } from "redux";
import { useMetadataContext } from "./meta-data";

interface GisViewerState {
  [viewSlice.name]: ViewState;
}

const gisViewerReducer = combineReducers<GisViewerState>({
  [viewSlice.name]: viewSlice.reducer,
  // ...
});

export const {
  slice,
  actions: { addGisViewer, removeGisViewer },
  selectors: { selectGisViewerInstance, selectGisViewerInstanceIsAvailable },
  hooks: { useGisViewerInstanceDispatch, useGisViewerInstanceSelector },
} = createReduxInstance(
  GIS_VIEWER_NAME,
  gisViewerReducer,
  DEFAULT_SLICE_PREFIX
);

console.log(
  createReduxInstance(GIS_VIEWER_NAME, gisViewerReducer, DEFAULT_SLICE_PREFIX)
);

export function useGisViewerDispatch() {
  const { id } = useMetadataContext();
  return useGisViewerInstanceDispatch(id);
}

export function useGisViewerSelector() {
  const { id } = useMetadataContext();
  return useGisViewerInstanceSelector(id);
}
