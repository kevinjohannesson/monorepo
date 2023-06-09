import { type ReactElement, type ReactNode, createContext } from "react";
import { useRequiredContext } from "utils";

export interface MetadataContextValue {
  id: string;
}

const MetadataContext = createContext({ id: "Uninitialized" });

export interface MetadataProviderProps {
  /**
   * A unique identifier for a particular instance. If multiple components
   * share the same ID, they will share the same state. To create separate
   * state instances for components, provide unique IDs for each instance.
   *
   * @default "default"
   */
  id?: string;
  children?: ReactNode;
}

export function MetadataProvider({
  id = "default",
  children = null,
}: MetadataProviderProps): ReactElement {
  return (
    <MetadataContext.Provider value={{ id }}>
      {children}
    </MetadataContext.Provider>
  );
}

export function useMetadataContext(): MetadataContextValue {
  return useRequiredContext(MetadataContext, "Metadata Context");
}
