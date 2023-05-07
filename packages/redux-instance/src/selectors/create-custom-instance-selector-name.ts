import { toPascalCase } from "utils";

/**
 * CustomInstanceSelectorName represents the name of a custom instance selector.
 * The resulting string has the format `select{N}{T}`.
 *
 * @template N - A string representing the capitalized instance name.
 * @template T - A string representing the capitalized selector type.
 *
 * @example
 * // Given the instance name "user" and the selector type "data":
 * type ExampleSelector = CustomInstanceSelectorName<"user", "data">; // "selectUserData"
 */
export type CustomInstanceSelectorName<
  N extends string,
  T extends string
> = `select${Capitalize<N>}${Capitalize<T>}`;

/**
 * Creates a custom instance selector name based on the provided name and type.
 *
 * @template {N} name - The name of the instance, used as a prefix for the generated selector name.
 * @template {T} type - The type of the selector instance, used as a suffix for the generated selector name.
 * @returns The generated custom instance selector name.
 *
 * @example
 * const selectorName = createCustomInstanceSelectorName("myInstance", "someValue");
 * // selectorName will be "selectMyInstanceSomeValue"
 */
export function createCustomInstanceSelectorName<
  N extends string,
  T extends string
>(name: N, type: T): CustomInstanceSelectorName<N, T> {
  const capitalizedName = toPascalCase(name);
  const capitalizedType = toPascalCase(type);
  return `select${capitalizedName}${capitalizedType}` as CustomInstanceSelectorName<
    N,
    T
  >;
}
