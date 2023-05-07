import {
  createReduxInstance,
  UseSliceInstanceSelector,
  UseSliceInstanceDispatch,
} from "redux-instance";
import { DEFAULT_SLICE_PREFIX, GIS_VIEWER_NAME } from "./constants";
import { ViewState, viewSlice } from "./features/view/slice";
import { combineReducers } from "redux";
import { useMetadataContext } from "./meta-data";

export interface GisViewerState {
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
  hooks: {
    useGisViewerInstanceDispatchFactory,
    useGisViewerInstanceSelectorFactory,
  },
} = createReduxInstance(
  GIS_VIEWER_NAME,
  gisViewerReducer,
  DEFAULT_SLICE_PREFIX
);

console.log(
  createReduxInstance(GIS_VIEWER_NAME, gisViewerReducer, DEFAULT_SLICE_PREFIX)
);

// export function useGisViewerDispatch() {
//   const { id } = useMetadataContext();
//   return useGisViewerInstanceDispatchFactory(id);
// }
export const useGisViewerDispatch: UseSliceInstanceDispatch = () => {
  const { id } = useMetadataContext();
  return useGisViewerInstanceDispatchFactory(id)();
};

export const useGisViewerSelector: UseSliceInstanceSelector<GisViewerState> = (
  selector
) => {
  const { id } = useMetadataContext();
  return useGisViewerInstanceSelectorFactory(id)(selector);
};
// export function useGisViewerSelector<R>(
//   selector: (state: GisViewerState) => R
// ): R {
//   const { id } = useMetadataContext();
//   return useGisViewerInstanceSelectorFactory(id)(selector);
// }
