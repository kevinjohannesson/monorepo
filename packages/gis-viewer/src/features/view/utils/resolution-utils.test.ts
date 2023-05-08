import { type Dimensions, type Extent } from "../../../types";
import {
  calculateBaseResolution,
  calculateResolutionFromZoomLevel,
} from "./resolution-utils";

describe("calculateBaseResolution", () => {
  it("should calculate the base resolution correctly", () => {
    const extent: Extent = [-360, -90, 360, 90];
    const dimensions: Dimensions = [1920, 1080];

    const expectedBaseResolution = 720 / 1920;
    const result = calculateBaseResolution(extent, dimensions);

    expect(result).toBeCloseTo(expectedBaseResolution);
  });
});

describe("calculateResolutionFromZoomLevel", () => {
  it("should calculate the resolution for a given zoom level correctly", () => {
    const baseResolution = 0.09375;
    const zoomLevel = 2;

    const expectedResolution = baseResolution / Math.pow(2, zoomLevel);
    const result = calculateResolutionFromZoomLevel(baseResolution, zoomLevel);

    expect(result).toBeCloseTo(expectedResolution);
  });
});
