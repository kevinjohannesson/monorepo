import { Vector2d } from "./types";

/**
 * This function generates coordinates in a counter-clockwise spiral pattern.
 * The pattern starts from the center point (0,0), moves 1 step to the right,
 * then moves in a counter-clockwise spiral.
 *
 * [0,0], [1,0], [1,1], [0,1], [-1,1], [-1,0], [-1,-1], [0, -1], [1,-1], [2, -1], ...
 *
 * @param {number} width - The width of the rectangle. Must be an integer greater than 0.
 * @param {number} height - The height of the rectangle. Must be an integer greater than 0.
 * Default value is the same as the width.
 *
 * @returns {Vector2d[]} - An array of [x, y] coordinates.
 */
export function createSpiralPattern(width: number, height = width): Vector2d[] {
  // Check if both width and height are valid integers greater than 0.
  if (!Number.isInteger(width) || !Number.isInteger(height)) {
    throw new Error("Width and height must be integer values.");
  }
  if (width <= 0 || height <= 0) {
    throw new Error("Width and height must be greater than zero.");
  }

  // Determine the size of the spiral, which is the maximum of width and height.
  const size = Math.max(width, height);

  // Initialize an empty array to store the coordinates.
  const pattern: Vector2d[] = [];

  // Initialize the coordinates at the center of the spiral.
  let x = 0;
  let y = 0;

  // Initialize the change in x (dx) and y (dy) for moving in the spiral.
  // The initial direction is set so that after the first direction change,
  // the movement will be upwards in a counter-clockwise spiral.
  let dx = 0;
  let dy = -1;

  // Generate the spiral pattern.
  for (let i = 0; i < size ** 2; i++) {
    // If the current coordinates are within the bounds, add them to the pattern.
    if (-size <= x && x <= size && -size <= y && y <= size) {
      pattern.push([x, y]);
    }

    // If the current coordinates meet the conditions for changing direction,
    // change the direction by swapping dx and dy and inverting dy.
    if (x === y || (x < 0 && x === -y) || (x > 0 && x === 1 - y)) {
      [dx, dy] = [-dy, dx];
    }

    // Update the coordinates for the next step in the spiral.
    x += dx;
    y += dy;
  }

  // If the width and height are not equal, filter out the coordinates that are out of bounds.
  return width === height
    ? pattern
    : pattern.filter(
        ([x, y]) =>
          y > Math.floor(-height / 2) &&
          y <= Math.floor(height / 2) &&
          x > Math.floor(-width / 2) &&
          x <= Math.floor(width / 2)
      );
}
export function createSpiralPattern2(
  width: number,
  height = width,
  direction: "counter-clockwise" | "clockwise" = "counter-clockwise"
): Vector2d[] {
  // Check if both width and height are valid integers greater than 0.
  if (!Number.isInteger(width) || !Number.isInteger(height)) {
    throw new Error("Width and height must be integer values.");
  }
  if (width <= 0 || height <= 0) {
    throw new Error("Width and height must be greater than zero.");
  }

  // Determine the size of the spiral, which is the maximum of width and height.
  const size = Math.max(width, height);

  // Initialize an empty array to store the coordinates.
  const pattern: Vector2d[] = [];

  // Initialize the coordinates at the center of the spiral.
  let x = 0;
  let y = 0;

  // Initialize the change in x (dx) and y (dy) for moving in the spiral.
  // The initial direction is set so that after the first direction change,
  // the movement will be upwards in a counter-clockwise spiral.
  let dx = 0;
  let dy = direction === "counter-clockwise" ? -1 : 1;

  // Generate the spiral pattern.
  for (let i = 0; i < size * size; i++) {
    // If the current coordinates are within the bounds, add them to the pattern.
    if (-size <= x && x <= size && -size <= y && y <= size) {
      pattern.push([x, y]);
    }

    // If the current coordinates meet the conditions for changing direction,
    // change the direction by swapping dx and dy and inverting dy.
    if (x === y || (x < 0 && x === -y) || (x > 0 && x === 1 - y)) {
      let temp = dx;
      dx = direction === "counter-clockwise" ? -dy : dy;
      dy = direction === "counter-clockwise" ? temp : -temp;
    }

    // Update the coordinates for the next step in the spiral.
    x += dx;
    y += dy;
  }

  // If the width and height are not equal, filter out the coordinates that are out of bounds.
  return width === height
    ? pattern
    : pattern.filter(
        ([x, y]) =>
          y > Math.floor(-height / 2) &&
          y <= Math.floor(height / 2) &&
          x > Math.floor(-width / 2) &&
          x <= Math.floor(width / 2)
      );
}
