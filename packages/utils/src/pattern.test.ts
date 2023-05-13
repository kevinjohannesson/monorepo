import { createSpiralPattern } from "./pattern";
import { Vector2d } from "./types";

describe("createSpiralPattern", () => {
  test("should create a 1x1 spiral pattern", () => {
    const result = createSpiralPattern(1);
    const expected = [[0, 0]];
    expect(result).toEqual(expected);
  });

  test("should create a 2x2 spiral pattern", () => {
    const result = createSpiralPattern(2);
    const expected = [
      [0, 0],
      [1, 0],
      [1, 1],
      [0, 1],
    ];

    expect(result).toEqual(expected);
  });

  test("should create a 3x3 spiral pattern", () => {
    const result = createSpiralPattern(3);
    const expected = [
      [0, 0],
      [1, 0],
      [1, 1],
      [0, 1],
      [-1, 1],
      [-1, 0],
      [-1, -1],
      [0, -1],
      [1, -1],
    ];

    expect(result).toEqual(expected);
  });

  test("should create a 4x4 spiral pattern", () => {
    const result = createSpiralPattern(4);
    const expected = [
      [0, 0],
      [1, 0],
      [1, 1],
      [0, 1],
      [-1, 1],
      [-1, 0],
      [-1, -1],
      [0, -1],
      [1, -1],
      [2, -1],
      [2, 0],
      [2, 1],
      [2, 2],
      [1, 2],
      [0, 2],
      [-1, 2],
    ];

    expect(result).toEqual(expected);
  });

  test("should create a 5x5 spiral pattern", () => {
    const result = createSpiralPattern(5);
    const expected = [
      [0, 0],
      [1, 0],
      [1, 1],
      [0, 1],
      [-1, 1],
      [-1, 0],
      [-1, -1],
      [0, -1],
      [1, -1],
      [2, -1],
      [2, 0],
      [2, 1],
      [2, 2],
      [1, 2],
      [0, 2],
      [-1, 2],
      [-2, 2],
      [-2, 1],
      [-2, 0],
      [-2, -1],
      [-2, -2],
      [-1, -2],
      [0, -2],
      [1, -2],
      [2, -2],
    ];

    expect(result).toEqual(expected);
  });

  test("should create a 4x2 spiral pattern", () => {
    const result = createSpiralPattern(4, 2);
    const expected = [
      [0, 0],
      [1, 0],
      [1, 1],
      [0, 1],
      [-1, 1],
      [-1, 0],
      [2, 0],
      [2, 1],
    ];
    expect(result).toEqual(expected);
  });

  test("should create a 2x4 spiral pattern", () => {
    const result = createSpiralPattern(2, 4);
    const expected = [
      [0, 0],
      [1, 0],
      [1, 1],
      [0, 1],
      [0, -1],
      [1, -1],
      [1, 2],
      [0, 2],
    ];
    expect(result).toEqual(expected);
  });

  test("should create a 1x4 spiral pattern", () => {
    const result = createSpiralPattern(1, 4);
    const expected = [
      [0, 0],
      [0, 1],
      [0, -1],
      [0, 2],
    ];
    expect(result).toEqual(expected);
  });

  test("should create a 4x3 spiral pattern", () => {
    const result = createSpiralPattern(4, 3);
    const expected = [
      [0, 0],
      [1, 0],
      [1, 1],
      [0, 1],
      [-1, 1],
      [-1, 0],
      [-1, -1],
      [0, -1],
      [1, -1],
      [2, -1],
      [2, 0],
      [2, 1],
    ];
    expect(result).toEqual(expected);
  });

  test("should throw error on 0 rows or columns", () => {
    expect(() => createSpiralPattern(0)).toThrow();
  });

  test("should throw error on negative input", () => {
    expect(() => createSpiralPattern(-3)).toThrow();
  });

  test("should throw error on non-integer input", () => {
    expect(() => createSpiralPattern(3.5)).toThrow();
  });
});
