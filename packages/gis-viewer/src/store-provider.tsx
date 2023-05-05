import { ReactNode } from "react";
import { Provider } from "react-redux";
import { store } from "./store";

export interface StoreProviderProps {
  children?: ReactNode;
}

export function StoreProvider({ children = null }: StoreProviderProps) {
  return <Provider store={store}>{children}</Provider>;
}
