import { ReactNode, createContext } from "react";
import { useRequiredContext } from "utils";

interface ReduxInstanceMetadataContextValue {
  /**
   * A unique identifier for a particular instance. If multiple components
   * share the same ID, they will share the same state. To create separate
   * state instances for components, provide unique IDs for each instance.
   */
  id: string;
}

const ReduxInstanceMetadataContext = createContext(
  {} as ReduxInstanceMetadataContextValue
);

interface ReduxInstanceMetadataProviderProps
  extends Required<ReduxInstanceMetadataContextValue> {
  children?: ReactNode;
}

export function ReduxInstanceMetadataProvider({
  id = "default",
  children = null,
}: ReduxInstanceMetadataProviderProps) {
  return (
    <ReduxInstanceMetadataContext.Provider value={{ id }}>
      {children}
    </ReduxInstanceMetadataContext.Provider>
  );
}

/**
 * A custom hook for accessing the metadata context value.
 *
 * @returns The context value containing the metadata ID.
 * @throws {Error} If the context value is not provided.
 */
export function useReduxInstanceMetadataContext() {
  return useRequiredContext(
    ReduxInstanceMetadataContext,
    "Redux Instance Metadata Context"
  );
}
