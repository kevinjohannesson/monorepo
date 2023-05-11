import { type Dimensions } from "../../../../types";
import { calculateOsmZoomBaseLevel } from "./tile-number-utils";

describe("calculate the correct OSM zoom level for the view dimensions", () => {
  it("should calculate the base resolution correctly", () => {
    const dimensions: Dimensions = [1920, 1080];
    const expectedOsmZoomLevel = 3;

    const result = calculateOsmZoomBaseLevel(dimensions);

    expect(result).toBeCloseTo(expectedOsmZoomLevel);
  });

  it("should calculate the base resolution correctly", () => {
    const dimensions: Dimensions = [600, 300];
    const expectedOsmZoomLevel = 2;

    const result = calculateOsmZoomBaseLevel(dimensions);

    expect(result).toBeCloseTo(expectedOsmZoomLevel);
  });

  it("should calculate the base resolution correctly", () => {
    const dimensions: Dimensions = [200, 400];
    const expectedOsmZoomLevel = 1;

    const result = calculateOsmZoomBaseLevel(dimensions);

    expect(result).toBeCloseTo(expectedOsmZoomLevel);
  });

  it("should calculate the OSM zoom level correctly for square dimensions", () => {
    const dimensions: Dimensions = [256, 256];
    const expectedOsmZoomLevel = 0;

    const result = calculateOsmZoomBaseLevel(dimensions);

    expect(result).toBeCloseTo(expectedOsmZoomLevel);
  });

  it("should calculate the OSM zoom level correctly for rectangular dimensions", () => {
    const dimensions: Dimensions = [512, 256];
    const expectedOsmZoomLevel = 1;

    const result = calculateOsmZoomBaseLevel(dimensions);

    expect(result).toBeCloseTo(expectedOsmZoomLevel);
  });

  it("should calculate the OSM zoom level correctly for large dimensions", () => {
    const dimensions: Dimensions = [1024, 1024];
    const expectedOsmZoomLevel = 2;

    const result = calculateOsmZoomBaseLevel(dimensions);

    expect(result).toBeCloseTo(expectedOsmZoomLevel);
  });

  it("should calculate the OSM zoom level correctly for small dimensions", () => {
    const dimensions: Dimensions = [128, 128];
    const expectedOsmZoomLevel = 0;

    const result = calculateOsmZoomBaseLevel(dimensions);

    expect(result).toBeCloseTo(expectedOsmZoomLevel);
  });
});
