import { GlobalStoreStateProxy } from "../types";
import { prefixIdWithName } from "../utils";

/**
 * A higher-order function that creates a set of selectors for a specific state shape `S`.
 * @template S The shape of the state.
 * @returns A function that takes the name of the state slice as an argument and returns an object containing selectors.
 *
 * Example usage:
 *
 * // Define your state shape
 * interface MyState {
 *   key: number;
 * }
 *
 * // Create a set of selectors for the state shape
 * const mySelectors = createStoreInstanceSelectors<MyState>();
 *
 * // Use the created selectors for a specific state slice
 * const myName = "myName";
 * const { selectInstance, selectIsInstanceAvailable } = mySelectors(myName);
 */
export function createStoreInstanceSelectors<S>() {
  return function _createSelectors<N extends string>(name: N) {
    return {
      /** A selector to get an instance with the given ID from the state slice. */
      selectInstance(id: string) {
        return function (state: GlobalStoreStateProxy<S, N>) {
          return state[name].instances[prefixIdWithName(name, id)];
        };
      },
      /** A selector to check if an instance with the given ID is available in the state slice. */
      selectIsInstanceAvailable(id: string) {
        return function (state: GlobalStoreStateProxy<S, N>) {
          return !!state[name].instances[prefixIdWithName(name, id)];
        };
      },
    };
  };
}
