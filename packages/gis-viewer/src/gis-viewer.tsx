import { ControlsContainer } from "./features/control/container";
import { CrosshairSource } from "./features/source/cross-hair";
import { CursorCoordinatesMapInfoItem } from "./features/map-info/cursor-coordinates-map-info-item";
import { GisViewerInstance } from "./features/instance";
import { InteractionContainer } from "./features/interaction/container";
import { Layer } from "./features/layer";
import { LayersContainer } from "./features/layer/container";
import { MapInfoContainer } from "./features/map-info/container";
import { MetadataProvider, type MetadataProviderProps } from "./meta-data";
import { NewTiled } from "./features/source/osm/new-tiled";
import { OsmSourceOLD } from "./features/source/osm";
import { PanControl } from "./features/control/pan-control";
import { PanInteraction } from "./features/interaction/pan-interaction";
import { Provider } from "react-redux";
import { type ReactElement, type ReactNode } from "react";
import { TileImageCacheProvider } from "./features/cache";
import { type Vector2d } from "utils";
import { View, ViewMirror, type ViewProps } from "./features/view";
import { ZoomControl } from "./features/control/zoom-control";
import { ZoomInteraction } from "./features/interaction/zoom-interaction";
import { ZoomLevelInfoItem } from "./features/map-info/zoom-level-info-item";
import { combineReducers } from "redux";
import { configureStore } from "@reduxjs/toolkit";
import { slice } from "./slice";

const rootReducer = combineReducers({
  gisViewer: slice.reducer,
});

export const store = configureStore({
  reducer: rootReducer,
});

export interface GisViewerPropsOLD extends MetadataProviderProps, Omit<ViewProps, "children"> {
  children?: never;
}

export function GisViewerOLD({
  id,
  initialCenterCoordinate,
  initialZoomLevel,
}: GisViewerPropsOLD): ReactElement {
  // console.log({ id });

  return (
    <Provider store={store}>
      <TileImageCacheProvider>
        <MetadataProvider id={id}>
          <GisViewerInstance>
            <View
              initialCenterCoordinate={initialCenterCoordinate}
              initialZoomLevel={initialZoomLevel}
            >
              <LayersContainer>
                <Layer>
                  {/* <OsmSource /> */}
                  <NewTiled />
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
      </TileImageCacheProvider>
    </Provider>
  );
}

export type GisViewerPropsOLD2 = MetadataProviderProps & ViewProps;

export type GisViewerProps = MetadataProviderProps & ViewProps;

export function GisViewer({
  id,
  initialCenterCoordinate,
  initialZoomLevel,
  children,
  dimensions,
  zoomLevelLimits,
  wrapping,
}: GisViewerProps): ReactElement {
  return (
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
        </View>
      </GisViewerInstance>
    </MetadataProvider>
  );
}

export interface GisViewerMirrorProps {
  mirroredId: string;
  children?: ReactNode;
  dimensions?: Vector2d;
}
export function GisViewerMirror({
  mirroredId,
  children,
  dimensions,
}: GisViewerMirrorProps): ReactElement {
  return (
    <MetadataProvider id={mirroredId}>
      <GisViewerInstance>
        <ViewMirror dimensions={dimensions}>{children}</ViewMirror>
      </GisViewerInstance>
    </MetadataProvider>
  );
}

/** dit is wat 't moet worden maar de bovenstaande is makkelijker voor testen */
export function GisViewerResult({
  id,
  initialCenterCoordinate,
  initialZoomLevel,
  children,
  dimensions,
  zoomLevelLimits,
  wrapping,
}: GisViewerPropsOLD2): ReactElement {
  // console.log({ id });

  return (
    <TileImageCacheProvider>
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
              <ZoomLevelInfoItem />
            </MapInfoContainer>

            <InteractionContainer>
              <ZoomInteraction />
              <PanInteraction />
            </InteractionContainer>
          </View>
        </GisViewerInstance>
      </MetadataProvider>
    </TileImageCacheProvider>
  );
}
