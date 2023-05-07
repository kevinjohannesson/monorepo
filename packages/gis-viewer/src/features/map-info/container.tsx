import { CSSProperties, ReactNode, forwardRef } from "react";

const mapInfoContainerStyle: CSSProperties = {
  position: "absolute",
  bottom: 0,
  left: 0,
};

export interface MapInfoContainerProps {
  children: ReactNode;
}

export const MapInfoContainer = forwardRef<
  HTMLDivElement,
  MapInfoContainerProps
>(({ children }, ref) => {
  return (
    <div
      ref={ref}
      className="map-info-container rounded-tr-lg pl-4 pr-2 py-1 bg-white/[.9] flex gap-2 "
      style={mapInfoContainerStyle}
    >
      {children}
    </div>
  );
});
