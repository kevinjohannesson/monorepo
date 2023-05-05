import { ReactNode, createContext } from "react";
import { useRequiredContext } from "utils";

export interface MetaDataContextValue {
  /**
   * A unique identifier for a particular instance. If multiple components
   * share the same ID, they will share the same state. To create separate
   * state instances for components, provide unique IDs for each instance.
   */
  id: string;
}

const MetaDataContext = createContext({} as MetaDataContextValue);

export interface MetaDataProviderProps extends Required<MetaDataContextValue> {
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

/**
 * A custom hook for accessing the metadata context value.
 *
 * @returns The context value containing the metadata ID.
 * @throws {Error} If the context value is not provided.
 */
export function useMetaDataContext() {
  return useRequiredContext(MetaDataContext, "MetaData Context");
}
