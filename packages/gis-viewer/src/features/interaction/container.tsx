import { type ReactNode, forwardRef } from "react";

export interface InteractionContainerProps {
  children: ReactNode;
}

export const InteractionContainer = forwardRef<
  HTMLDivElement,
  InteractionContainerProps
>(({ children }, ref) => {
  return (
    <div
      ref={ref}
      className="interaction-container w-full h-full absolute top-0 left-0 border border-2 border-red-500"
    >
      {children}
    </div>
  );
});

InteractionContainer.displayName = "InteractionContainer";
