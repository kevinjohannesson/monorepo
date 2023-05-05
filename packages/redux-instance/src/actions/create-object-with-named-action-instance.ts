import {
  CustomInstanceActionName,
  createCustomInstanceActionName,
} from "./create-custom-instance-action-name";

/**
 * Creates an object containing a named action instance as a member.
 *
 * @template {N} name - The name of the instance, used as a prefix for the generated action name.
 * @template {T} type - The type of the action instance, used as a suffix for the generated action name.
 * @template {A} action - The action object to be associated with the generated action name.
 * @template {S} suffix - An optional suffix to be added at the end of the generated action name.
 * @returns An object with a single key-value pair, where the key is the generated action name, and the value is the action object.
 *
 * @example
 * const myAction = { type: "INCREMENT_COUNTER" };
 * const namedActionInstance = createObjectWithNamedActionInstance("myInstance", "counter", myAction, "action");
 * // namedActionInstance will be an object like: { counterMyInstanceAction: myAction }
 */
export function createObjectWithNamedActionInstance<
  N extends string,
  T extends string,
  A,
  S extends string = ""
>(
  name: N,
  type: T,
  action: A,
  suffix?: S
): Record<CustomInstanceActionName<N, T, S>, A> {
  return {
    [createCustomInstanceActionName(name, type, suffix)]: action,
  } as Record<CustomInstanceActionName<N, T, S>, A>;
}
