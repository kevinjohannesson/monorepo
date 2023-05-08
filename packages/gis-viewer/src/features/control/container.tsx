import { type ReactNode, forwardRef } from "react";

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

ControlsContainer.displayName = "ControlsContainer";
