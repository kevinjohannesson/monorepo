import { Action } from "@reduxjs/toolkit";
import { useDispatch, useSelector } from "react-redux";
import {
  GlobalDispatchProxy,
  GlobalSelectorProxy,
  GlobalStoreStateProxy,
} from "../types";
import { prefixIdWithName } from "../utils";

/**
 * A type representing a custom instance version of Redux `useSelector`
 *
 * @template S - The instance state type.
 */
export type UseInstanceSelector<S> = <R>(selector: (state: S) => R) => R;

/**
 * A type representing a factory function for creating a custom instance version of Redux `useSelector`
 *
 * @template S - The instance state type.
 */
type InstanceSelectorFactory<S> = (id: string) => UseInstanceSelector<S>;

/**
 * A type representing a custom instance version of Redux `useDispatch`.
 */
export type UseInstanceDispatch = () => <T extends Action>(action: T) => T;

/**
 * A type representing a factory function for creating a custom instance version of Redux `useDispatch`.
 */
type InstanceDispatchFactory = (id: string) => UseInstanceDispatch;

/**
 * A utility function for generating custom hook factories to manage instanceable Redux slices.
 *
 * @template N - The name type of the instanceable slice.
 * @template S - The instance state type.
 * @param name - The name of the instanceable slice.
 * @param selectInstance - A selector function to select the instance by ID.
 * @returns An object containing the hooks to interact with the instance.
 */
export function createInstanceHookFactories<N extends string, S>(
  name: N,
  selectInstance: (id: string) => (state: GlobalStoreStateProxy<S, N>) => S
) {
  const useGlobalSelector: GlobalSelectorProxy<S, N> = useSelector;
  const useGlobalDispatch: () => GlobalDispatchProxy<S> = useDispatch;

  /**
   * A factory function for creating a custom instance version of Redux `useSelector`.
   *
   * @template S - The instance state type.
   * @template R - The return type of the selector function.
   * @param id - The instance ID.
   * @returns A custom instance version of Redux `useSelector`.
   */
  const useInstanceSelectorFactory: InstanceSelectorFactory<S> = (id) =>
    function useInstanceSelector(selector) {
      return useGlobalSelector((state) => selector(selectInstance(id)(state)));
    };

  /**
   * A factory function for creating a custom instance version of Redux `useDispatch`.
   *
   * @param id - The instance ID.
   * @returns A function that, when called, returns a custom instance version of Redux `useDispatch`.
   */
  const useInstanceDispatchFactory: InstanceDispatchFactory = (id) =>
    function useInstanceDispatch() {
      const dispatch = useGlobalDispatch();
      return (action) => dispatch({ ...action, meta: { id } });
    };

  return {
    useInstanceSelectorFactory,
    useInstanceDispatchFactory,
    // useSliceInstanceSelectorFactory(id: string) {
    //   return function useInstanceSelectorWithId<R>(
    //     selector: (state: S) => R
    //   ): R {
    //     const value = useGlobalSelector((state) =>
    //       selector(selectInstance(prefixIdWithName(name, id))(state))
    //     );

    //     return value;
    //   };
    // },
    // useSliceInstanceDispatchFactory(id: string) {
    //   const dispatch = useGlobalDispatch();

    //   return function useSliceInstaceDispatch() {
    //     return function instanceDispatch(action){
    //       return dispatch({ ...action, meta: { id } });
    //     }
    //   }
    //   // return function useSliceInstanceDispatchWithId<T extends Action>(
    //   //   action: T
    //   // ): T {
    //   //   if (typeof action === "function") {
    //   //     throw new Error(
    //   //       `useSliceInstanceDispatch should only be used for object actions.`
    //   //     );
    //   //   }

    //   //   return dispatch({ ...action, meta: { id } });
    //   // };
    // },
  };
}
