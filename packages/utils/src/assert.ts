export function isNull<T>(value: T | null): value is null {
  return value === null;
}

export function isNotNull<T>(value: T | null): value is NonNullable<T> {
  return value !== null;
}

export function assertNotNull<T>(
  value: T | null,
  name = "Value"
): asserts value is NonNullable<T> {
  if (isNull(value)) {
    throw new Error(`${name} is null.`);
  }
}

export function isLowestNumber(num: number, arr: number[]): boolean {
  const min = Math.min(...arr);
  return num === min;
}

export function isHighestNumber(num: number, arr: number[]): boolean {
  const min = Math.max(...arr);
  return num === min;
}
