import { Provider } from "react-redux";
import { Instance } from "./features/instance";
import { ViewContainer } from "./features/view/container";
import { MetadataProvider, MetadataProviderProps } from "./meta-data";
import { combineReducers } from "redux";
import { configureStore } from "@reduxjs/toolkit";
import { slice } from "./slice";

const rootReducer = combineReducers({
  gisViewer: slice.reducer,
});

export const store = configureStore({
  reducer: rootReducer,
});

export interface GisViewerProps extends MetadataProviderProps {}

export function GisViewer({ id }: GisViewerProps) {
  console.log({ id });

  return (
    <Provider store={store}>
      <MetadataProvider id={id}>
        <Instance>
          <ViewContainer />
        </Instance>
      </MetadataProvider>
    </Provider>
  );
}
