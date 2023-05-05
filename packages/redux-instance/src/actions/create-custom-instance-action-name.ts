import { capitalize, uncapitalize } from "utils";

/**
 * CustomInstanceActionName represents the name of a custom instance action.
 * The resulting string has the format `{T}{N}{S}`.
 *
 * @template N - A string representing the capitalized instance name.
 * @template T - A string representing the uncapitalized action type.
 * @template S - An optional string representing the capitalized suffix. Defaults to an empty string.
 *
 * @example
 * // Given the action type "add", the instance name "user", and the optional suffix "request":
 * type ExampleAction = CustomInstanceActionName<"user", "add", "request">; // "addUserRequest"
 *
 * // Given the action type "add" and the instance name "user" without a suffix:
 * type ExampleActionNoSuffix = CustomInstanceActionName<"user", "add">; // "addUser"
 */
export type CustomInstanceActionName<
  N extends string,
  T extends string,
  S extends string = ""
> = `${Uncapitalize<T>}${Capitalize<N>}${Capitalize<S>}`;

/**
 * Creates a custom instance action name based on the provided name, type, and an optional suffix.
 *
 * @template {N} name - The name of the instance, used as a prefix for the generated action name.
 * @template {T} type - The type of the action instance, used as a suffix for the generated action name.
 * @template {S} suffix - An optional suffix to be added at the end of the generated action name.
 * @returns The generated custom instance action name.
 *
 * @example
 * const actionName = createCustomInstanceActionName("myInstance", "counter", "action");
 * // actionName will be "counterMyInstanceAction"
 */
export function createCustomInstanceActionName<
  N extends string,
  T extends string,
  S extends string = ""
>(name: N, type: T, suffix?: S): CustomInstanceActionName<N, T, S> {
  const capitalizedName = capitalize(name);
  const uncapitalizedType = uncapitalize(type);
  const capitalizedSuffix = uncapitalize(suffix || "");
  return `${uncapitalizedType}${capitalizedName}${capitalizedSuffix}` as CustomInstanceActionName<
    N,
    T,
    S
  >;
}
