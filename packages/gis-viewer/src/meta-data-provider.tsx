import { ReactNode, createContext } from "react";
import { useRequiredContext } from "./utils/use-required-context";

interface MetaDataContextValue {
  id: string;
}

const MetaDataContext = createContext({} as MetaDataContextValue);

export interface MetaDataProviderProps {
  id?: string;
  children?: ReactNode;
}

export function MetaDataProvider({
  id = "default",
  children = null,
}: MetaDataProviderProps) {
  return (
    <MetaDataContext.Provider value={{ id }}>
      {children}
    </MetaDataContext.Provider>
  );
}

export function useMetaDataContext() {
  return useRequiredContext(MetaDataContext);
}
