import { type Limits } from "../../../types";
import {
  calculateUpdatedZoomLevel,
  calculateZoomLevelFromResolution,
  isZoomLevelWithinLimits,
} from "./zoom-level-utils";

describe("calculateZoomLevelFromResolution", () => {
  it("should calculate the zoom level correctly", () => {
    const baseResolution = 0.375;
    const resolution = 0.09375;

    const expectedZoomLevel = 2;
    const result = calculateZoomLevelFromResolution(baseResolution, resolution);

    expect(result).toBeCloseTo(expectedZoomLevel);
  });
});

describe("calculateUpdatedZoomLevel", () => {
  it("should calculate the updated zoom level correctly", () => {
    const baseResolution = 0.375;
    const currentResolution = 0.09375;
    const deltaZoom = 1;

    const expectedUpdatedZoomLevel = 3;
    const result = calculateUpdatedZoomLevel(
      baseResolution,
      currentResolution,
      deltaZoom,
    );

    expect(result).toBeCloseTo(expectedUpdatedZoomLevel);
  });
});

describe("isZoomLevelWithinLimits", () => {
  it("should return true for a zoom level within the limits", () => {
    const zoomLevel = 3;
    const limits: Limits = [1, 5];

    const result = isZoomLevelWithinLimits(zoomLevel, limits);

    expect(result).toBe(true);
  });

  it("should return false for a zoom level below the lower limit", () => {
    const zoomLevel = 0;
    const limits: Limits = [1, 5];

    const result = isZoomLevelWithinLimits(zoomLevel, limits);

    expect(result).toBe(false);
  });

  it("should return false for a zoom level above the upper limit", () => {
    const zoomLevel = 6;
    const limits: Limits = [1, 5];

    const result = isZoomLevelWithinLimits(zoomLevel, limits);

    expect(result).toBe(false);
  });
});
