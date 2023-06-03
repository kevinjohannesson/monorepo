import { GisViewerInstance } from "./features/instance";
import { MetadataProvider, type MetadataProviderProps } from "./meta-data";
import { type ReactElement, type ReactNode } from "react";
import { type Vector2d } from "utils";
import { View, ViewMirror, type ViewProps } from "./features/view";

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
