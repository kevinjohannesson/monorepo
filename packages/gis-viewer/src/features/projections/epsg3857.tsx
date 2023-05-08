import { type Projection } from ".";

export const EPSG_3857: Projection = {
  name: "WGS 84 / Pseudo-Mercator",
  code: "EPSG:3857",
  projectedExtent: [-20037508.34, -20048966.1, 20037508.34, 20048966.1],
  geographicExtent: [-180.0, -85.06, 180.0, 85.06],
};
