import { configureStore } from "@reduxjs/toolkit";
import { Provider } from "react-redux";
import { combineReducers } from "redux";
import { GisViewerInstance } from "./features/instance";
import { View } from "./features/view";
import { MetadataProvider, MetadataProviderProps } from "./meta-data";
import { slice } from "./slice";
import { LayersContainer } from "./features/layer/container";
import { MapInfoContainer } from "./features/map-info/container";
import { Layer } from "./features/layer";
import { CrosshairSource } from "./features/source/cross-hair";
import { CursorCoordinatesMapInfoItem } from "./features/map-info/cursor-coordinates-map-info-item";
import { OsmSource } from "./features/source/osm";
import { ControlsContainer } from "./features/control/container";
import { ZoomControl } from "./features/control/zoom-control";

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

              <Layer>
                <OsmSource />
              </Layer>
            </LayersContainer>

            <ControlsContainer>
              <ZoomControl />
            </ControlsContainer>

            <MapInfoContainer>
              <CursorCoordinatesMapInfoItem />
            </MapInfoContainer>
          </View>
        </GisViewerInstance>
      </MetadataProvider>
    </Provider>
  );
}
