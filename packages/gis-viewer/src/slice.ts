import { DEFAULT_SLICE_PREFIX, GIS_VIEWER_NAME } from "./constants";
import {
  type UseSliceInstanceDispatch,
  type UseSliceInstanceSelector,
  createReduxInstance,
} from "redux-instance";
import { type ViewState, viewSlice } from "./features/view/slice";
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
  // DEFAULT_SLICE_PREFIX,
);

export const useGisViewerDispatch: UseSliceInstanceDispatch = () => {
  const { id } = useMetadataContext();
  return useGisViewerInstanceDispatchFactory(id)();
};

export const useGisViewerSelector: UseSliceInstanceSelector<GisViewerState> = (
  selector,
) => {
  const { id } = useMetadataContext();
  return useGisViewerInstanceSelectorFactory(id)(selector);
};
