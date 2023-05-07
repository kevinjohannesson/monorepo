import { Dimensions } from "../../types";
import { DEFAULT_DIMENSIONS } from "./constants";
import { CSSProperties, ReactNode, forwardRef } from "react";

const viewContainerStyle: CSSProperties = {
  outline: "1px solid lightgray",
  overflow: "hidden",
  borderRadius: "4px",
  position: "relative",
  boxSizing: "border-box",
};

export interface ViewContainerProps {
  children: ReactNode;
  dimensions?: Dimensions;
}

export const ViewContainer = forwardRef<HTMLDivElement, ViewContainerProps>(
  ({ children, dimensions: [width, height] = DEFAULT_DIMENSIONS }, ref) => {
    return (
      <div
        ref={ref}
        className="view-container"
        style={{ ...viewContainerStyle, width, height }}
      >
        {children}
      </div>
    );
  }
);
