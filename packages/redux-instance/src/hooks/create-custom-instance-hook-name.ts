import { toPascalCase } from "utils/src/transform-string";

/**
 * CustomInstanceHookName represents the name of a custom instance hook.
 * The resulting string has the format `use{N}Instance{T}`.
 *
 * @template N - A string representing the instance name.
 * @template T - A string representing the hook type.
 *
 * @example
 * // Given the instance name "user" and the hook type "selector":
 * type ExampleHook = CustomInstanceHookName<"user", "selector">; // "useUserInstanceSelector"
 */
export type CustomInstanceHookName<
  N extends string,
  T extends string
> = `use${Capitalize<N>}Instance${Capitalize<T>}`;

/**
 * Creates a custom instance hook name based on the provided name and type.
 *
 * @template {N} name - The name of the instance, used as a prefix for the generated hook name.
 * @template {T} type - The type of the hook instance, used as a suffix for the generated hook name.
 * @returns The generated custom instance hook name.
 *
 * @example
 * const hookName = createCustomInstanceHookName("myInstance", "counter");
 * // hookName will be "useMyInstanceInstanceCounter"
 */
export function createCustomInstanceHookName<
  N extends string,
  T extends string
>(name: N, type: T): CustomInstanceHookName<N, T> {
  const capitalizedName = toPascalCase(name);
  const capitalizedType = toPascalCase(type);
  return `use${capitalizedName}Instance${capitalizedType}` as CustomInstanceHookName<
    N,
    T
  >;
}
