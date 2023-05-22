export function getClosestNumberFrom(numbers: number[], goal: number): number {
  return numbers.reduce((prev, curr) =>
    Math.abs(curr - goal) < Math.abs(prev - goal) ? curr : prev
  );
}

export function getClosestNumberTo(target: number, ...matches: number[]) {
  return matches.reduce((prev, curr) =>
    Math.abs(curr - target) < Math.abs(prev - target) ? curr : prev
  );
}
