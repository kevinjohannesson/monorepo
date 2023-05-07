import { isNull } from "lodash";

export function assertNotNull<T>(
  value: T | null,
  name = "Value"
): asserts value is NonNullable<T> {
  if (isNull(value)) {
    throw new Error(`${name} is null.`);
  }
}
