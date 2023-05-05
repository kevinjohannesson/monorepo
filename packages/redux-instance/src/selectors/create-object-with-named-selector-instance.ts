import {
  CustomInstanceSelectorName,
  createCustomInstanceSelectorName,
} from "./create-custom-instance-selector-name";

/**
 * Creates an object containing a named selector instance as a member.
 *
 * @template {N} name - The name of the instance, which is used as a prefix for the generated selector name.
 * @template {T} type - The type of the selector instance, which is used as a suffix for the generated selector name.
 * @template {F} fn - The selector function to be associated with the generated selector name.
 * @returns An object with a single key-value pair, where the key is the generated selector name, and the value is the selector function.
 *
 * @example
 * const mySelector = (state: MyState) => state.someValue;
 * const namedSelectorInstance = createObjectWithNamedSelectorInstance("myInstance", "someValue", mySelector);
 * // namedSelectorInstance will be an object like: { selectMyInstanceSomeValue: mySelector }
 */

export function createObjectWithNamedSelectorInstance<
  N extends string,
  T extends string,
  F extends (...args: any[]) => any
>(name: N, type: T, fn: F): Record<CustomInstanceSelectorName<N, T>, F> {
  return {
    [createCustomInstanceSelectorName(name, type)]: fn,
  } as Record<CustomInstanceSelectorName<N, T>, F>;
}
