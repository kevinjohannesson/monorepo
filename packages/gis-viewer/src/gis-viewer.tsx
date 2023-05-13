import { ControlsContainer } from "./features/control/container";
import { CrosshairSource } from "./features/source/cross-hair";
import { CursorCoordinatesMapInfoItem } from "./features/map-info/cursor-coordinates-map-info-item";
import { GisViewerInstance } from "./features/instance";
import { ImageTileCacheProvider } from "./features/cache";
import { Layer } from "./features/layer";
import { LayersContainer } from "./features/layer/container";
import { MapInfoContainer } from "./features/map-info/container";
import { MetadataProvider, type MetadataProviderProps } from "./meta-data";
import { OsmSource } from "./features/source/osm";
import { PanControl } from "./features/control/pan-control";
import { PanInteraction } from "./features/interaction/pan-interaction";
import { Provider } from "react-redux";
import { type ReactElement } from "react";
import { View, type ViewProps } from "./features/view";
import { ZoomControl } from "./features/control/zoom-control";
import { ZoomInteraction } from "./features/interaction/zoom-interaction";
import { combineReducers } from "redux";
import { configureStore } from "@reduxjs/toolkit";
import { slice } from "./slice";

const rootReducer = combineReducers({
  gisViewer: slice.reducer,
});

export const store = configureStore({
  reducer: rootReducer,
});

export interface GisViewerProps
  extends MetadataProviderProps,
    Omit<ViewProps, "children"> {
  children?: never;
}

export function GisViewer({
  id,
  initialCenterCoordinate,
  initialZoomLevel,
}: GisViewerProps): ReactElement {
  console.log({ id });

  return (
    <Provider store={store}>
      <ImageTileCacheProvider>
        <MetadataProvider id={id}>
          <GisViewerInstance>
            <View
              initialCenterCoordinate={initialCenterCoordinate}
              initialZoomLevel={initialZoomLevel}
            >
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
      </ImageTileCacheProvider>
    </Provider>
  );
}

export type GisViewerProps2 = MetadataProviderProps & ViewProps;

/** dit is wat 't moet worden maar de bovenstaande is makkelijker voor testen */
export function GisViewerResult({
  id,
  initialCenterCoordinate,
  initialZoomLevel,
  children,
  dimensions,
  zoomLevelLimits,
  wrapping,
}: GisViewerProps2): ReactElement {
  console.log({ id });

  return (
    <ImageTileCacheProvider>
      <MetadataProvider id={id}>
        <GisViewerInstance>
          <View
            initialCenterCoordinate={initialCenterCoordinate}
            initialZoomLevel={initialZoomLevel}
            dimensions={dimensions}
            zoomLevelLimits={zoomLevelLimits}
            wrapping={wrapping}
          >
            {children}
            {/* Ik weet niet of ik dit er standaard in wil */}
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
    </ImageTileCacheProvider>
  );
}
