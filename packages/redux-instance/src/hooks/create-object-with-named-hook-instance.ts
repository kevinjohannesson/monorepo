import {
  CustomInstanceHookName,
  createCustomInstanceHookFactoryName,
} from "./create-custom-instance-hook-name";

/**
 * Creates an object containing a named hook instance as a member. This is mainly used for correct
 * type inference.
 *
 * @template {N} name - The name of the instance, used as a prefix for the generated hook name.
 * @template {T} type - The type of the hook instance, used as a suffix for the generated hook name.
 * @template {F} fn - The hook function to be associated with the generated hook name.
 * @returns An object with a single key-value pair, where the key is the generated hook name, and the value is the hook function.
 *
 * @example
 * const myHook = () => useState(0);
 * const namedHookInstance = createObjectWithNamedHookInstance("myInstance", "counter", myHook);
 * // namedHookInstance will be an object like: { useMyInstanceInstanceCounter: myHook }
 */
export function createObjectWithNamedHookInstance<
  N extends string,
  T extends string,
  F extends (...args: any[]) => any
>(name: N, type: T, fn: F): Record<CustomInstanceHookName<N, T>, F> {
  return {
    [createCustomInstanceHookFactoryName(name, type)]: fn,
  } as Record<CustomInstanceHookName<N, T>, F>;
}
