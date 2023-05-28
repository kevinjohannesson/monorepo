import { type ReactNode, forwardRef } from "react";
import clsx from "clsx";

export interface MapInfoContainerProps {
  children: ReactNode;
  placement?: "bottom-left" | "bottom-right";
  direction?: "row" | "column";
}

export const MapInfoContainer = forwardRef<HTMLDivElement, MapInfoContainerProps>(
  ({ children, placement = "bottom-left", direction = "row" }, ref) => {
    return (
      <div
        ref={ref}
        className={clsx(
          "map-info-container pl-4 pr-2 py-1 bg-white/50 backdrop-blur-md flex gap-4 absolute",
          placement === "bottom-left"
            ? "rounded-tr-lg  bottom-0 left-0"
            : "rounded-tl-lg  bottom-0 right-0",
          direction === "row" ? "flex-row" : "flex-col",
        )}
      >
        {children}
      </div>
    );
  },
);

MapInfoContainer.displayName = "MapInfoContainer";
