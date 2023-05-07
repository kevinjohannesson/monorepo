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
import { PanControl } from "./features/control/pan-control";
import { ZoomInteraction } from "./features/interaction/zoom-interaction";
import { PanInteraction } from "./features/interaction/pan-interaction";

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
                <OsmSource />
              </Layer>

              <Layer>
                <CrosshairSource />
              </Layer>
            </LayersContainer>

            <ControlsContainer>
              <ZoomControl />

              <PanControl />
            </ControlsContainer>

            <MapInfoContainer>
              <CursorCoordinatesMapInfoItem />
            </MapInfoContainer>

            <ZoomInteraction />
            <PanInteraction />
          </View>
        </GisViewerInstance>
      </MetadataProvider>
    </Provider>
  );
}
