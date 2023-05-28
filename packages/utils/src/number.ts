export function getClosestNumberFrom(numbers: number[], goal: number): number {
  return numbers.reduce((prev, curr) =>
    Math.abs(curr - goal) < Math.abs(prev - goal) ? curr : prev
  );
}

// refactor to not spread matches i think
export function getClosestNumberTo(target: number, ...matches: number[]) {
  return matches.reduce((prev, curr) =>
    Math.abs(curr - target) < Math.abs(prev - target) ? curr : prev
  );
}

export function getClosestHigherNumberFrom(
  numbers: number[],
  goal: number
): number | null {
  const higherNumbers = numbers.filter((num) => num > goal);

  if (higherNumbers.length === 0) {
    return null;
  }

  return higherNumbers.reduce((prev, curr) =>
    Math.abs(curr - goal) < Math.abs(prev - goal) ? curr : prev
  );
}
