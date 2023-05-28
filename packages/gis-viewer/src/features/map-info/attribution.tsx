import { type ReactNode, forwardRef } from "react";

export interface AttributionProps {
  children: ReactNode;
}

export const Attribution = forwardRef<HTMLSpanElement, AttributionProps>(({ children }, ref) => {
  return (
    <span ref={ref} className="attribution">
      {children}
    </span>
  );
});

Attribution.displayName = "Attribution";
