import { MutableRefObject, createContext } from "react";
import { useRequiredContext } from "utils";

export interface ViewContextValue {
  ref: MutableRefObject<HTMLDivElement | null>;
}

export const ViewContext = createContext({} as ViewContextValue);

export function useViewContext() {
  return useRequiredContext(ViewContext, "View Context");
}
