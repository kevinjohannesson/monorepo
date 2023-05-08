import { type MutableRefObject, createContext } from "react";
import { useRequiredContext } from "utils";

export interface ViewContextValue {
  ref: MutableRefObject<HTMLDivElement | null>;
}

export const ViewContext = createContext<ViewContextValue>({
  ref: { current: null },
});

export function useViewContext(): ViewContextValue {
  return useRequiredContext(ViewContext, "View Context");
}
