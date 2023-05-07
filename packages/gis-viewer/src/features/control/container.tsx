import { CSSProperties, ReactNode, forwardRef } from "react";

const controlsContainerStyle: CSSProperties = {
  position: "absolute",
  display: "flex",
  flexDirection: "column",
  top: 20,
  left: 20,
  zIndex: 1,
  pointerEvents: "none",
};

export interface ControlsContainerProps {
  children: ReactNode;
}

export const ControlsContainer = forwardRef<
  HTMLDivElement,
  ControlsContainerProps
>(({ children }, ref) => {
  return (
    <div
      ref={ref}
      className="controls-container w-auto h-auto absolute flex flex-col items-center justify-center z-10 bottom-5 right-5 gap-4"
    >
      {children}
    </div>
  );
});
