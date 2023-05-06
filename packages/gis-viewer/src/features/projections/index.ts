import { Extent } from "../../types";

export interface Projection {
  name: string;
  code: string;
  projectedExtent: Extent;
  geographicExtent: Extent;
}
