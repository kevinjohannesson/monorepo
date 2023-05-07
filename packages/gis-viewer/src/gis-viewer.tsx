import { configureStore } from "@reduxjs/toolkit";
import { Provider } from "react-redux";
import { combineReducers } from "redux";
import { GisViewerInstance } from "./features/instance";
import { View } from "./features/view";
import { MetadataProvider, MetadataProviderProps } from "./meta-data";
import { slice } from "./slice";
import { LayersContainer } from "./features/layers/container";
import { Layer } from "./features/layers/layer";
import { CrosshairSource } from "./features/source/cross-hair";

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
        <GisViewerInstance>
          <View>
            <LayersContainer>
              <Layer>
                <CrosshairSource />
              </Layer>
            </LayersContainer>
          </View>
        </GisViewerInstance>
      </MetadataProvider>
    </Provider>
  );
}
