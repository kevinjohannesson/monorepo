import { Action } from "@reduxjs/toolkit";
import { useDispatch, useSelector } from "react-redux";
import {
  GlobalDispatchProxy,
  GlobalSelectorProxy,
  GlobalStoreStateProxy,
} from "../types";
import { prefixIdWithName } from "../utils";

/**
 * Creates instance hooks for a given store instance name and instance selector function.
 *
 * @template N - The name of the instance.
 * @template S - The type of the store state.
 *
 * @returns An object containing the `useSliceInstanceDispatch` and `useSliceInstanceSelector` hooks.
 * @example
 * const { useSliceInstanceDispatch, useSliceInstanceSelector } = createStoreInstanceHooks("counter", (id) => (state) => state.counters[id]);
 */
export function createStoreIntanceHooks<N extends string, S>(
  name: N,
  selectInstance: (id: string) => (state: GlobalStoreStateProxy<S, N>) => S
) {
  const useGlobalSelector: GlobalSelectorProxy<S, N> = useSelector;
  const useGlobalDispatch: () => GlobalDispatchProxy<S> = useDispatch;

  return {
    /**
     * A hook for selecting a specific slice of the instance state.
     *
     * @template R - The return type of the selector function.
     */
    useSliceInstanceSelector(id: string) {
      return function useInstanceSelectorWithId<R>(
        selector: (state: S) => R
      ): R {
        const value = useGlobalSelector((state) =>
          selector(selectInstance(prefixIdWithName(name, id))(state))
        );

        return value;
      };
    },
    /**
     * A hook for dispatching actions with added metadata from the context.
     */
    useSliceInstanceDispatch(id: string) {
      return function useSliceInstanceDispatchWithId() {
        const dispatch = useGlobalDispatch();

        return <T extends Action>(action: T): T => {
          if (typeof action === "function") {
            throw new Error(
              `useSliceInstanceDispatch should only be used for object actions.`
            );
          }

          return dispatch({ ...action, meta: { id } });
        };
      };
    },
  };
}
