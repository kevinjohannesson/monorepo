import { CSSProperties, ReactNode, forwardRef } from "react";

const layersContainerStyle: CSSProperties = {
  position: "absolute",
  top: 0,
  left: 0,
  width: "100%",
  height: "100%",
};

export interface LayersContainerProps {
  children: ReactNode;
}

export const LayersContainer = forwardRef<HTMLDivElement, LayersContainerProps>(
  ({ children }, ref) => {
    return (
      <div ref={ref} className="layers-container" style={layersContainerStyle}>
        {children}
      </div>
    );
  }
);
