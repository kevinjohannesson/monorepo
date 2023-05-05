import { Extent } from "../../types";

export interface Projection {
  name: string;
  code: string;
  projectedExtent: Extent;
  geographicExtent: Extent;
}

// export class Projection {
//   name: string;
//   code: string;
//   projectedExtent: Extent;
//   geographicExtent: Extent;

//   constructor({
//     name,
//     code,
//     projectedExtent,
//     geographicExtent,
//   }: ProjectionProps) {
//     this.name = name;
//     this.code = code;
//     this.projectedExtent = projectedExtent;
//     this.geographicExtent = geographicExtent;
//   }
// }
