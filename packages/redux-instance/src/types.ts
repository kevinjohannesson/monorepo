import {
  AnyAction,
  Dispatch,
  EmptyObject,
  ThunkDispatch,
} from "@reduxjs/toolkit";
import { TypedUseSelectorHook } from "react-redux";

/**
 * Instances is a utility type that represents a collection of instances of a particular type, keyed by a string.
 *
 * @template T - The type of the instances being managed in the collection.
 */
export type Instances<T> = Record<string, T>;

/**
 * InstancesSliceState represents the state shape of a Redux slice that manages a collection of instances.
 * It includes a single property 'instances' that contains the instances keyed by a string.
 *
 * @template T - The type of the instances being managed in the slice state.
 */
export interface InstancesSliceState<T> {
  instances: Instances<T>;
}

/**
 * GlobalStoreStateProxy is a type that mimics the structure of the global Redux store for the purpose of providing
 * correct typings within the context of a specific Redux slice. It creates a stand-in store structure that contains
 * only the desired slice, allowing for easier interaction with the slice's state, actions, and selectors.
 *
 * @template S - The state type of the Redux slice being worked with.
 * @template N - The name of the Redux slice as a string literal type.
 *
 * @example
 * type MySliceState = { counter: number };
 * const mySliceName = 'mySlice';
 *
 * // Using GlobalStoreStateProxy to create a stand-in for the global store containing only the 'mySlice' slice.
 * type MySliceGlobalStoreStateProxy = GlobalStoreStateProxy<MySliceState, typeof mySliceName>;
 */
export type GlobalStoreStateProxy<S, N extends string> = EmptyObject & {
  [key in N]: InstancesSliceState<S>;
};

/**
 * GlobalDispatchProxy is a type that mimics the structure of the global Redux dispatch function, providing
 * correct typings for dispatching actions and thunks within the context of a specific Redux slice. It is
 * created by combining ThunkDispatch and Dispatch, which are used by Redux when defining the store.dispatch type.
 *
 * @template T - The state type of the Redux slice being worked with.
 *
 * @example
 * type MySliceState = { counter: number };
 *
 * // Using GlobalDispatchProxy to create a stand-in for the global dispatch function for 'mySlice' slice.
 * type MySliceGlobalDispatchProxy = GlobalDispatchProxy<MySliceState>;
 */
export type GlobalDispatchProxy<T> = ThunkDispatch<T, undefined, AnyAction> &
  Dispatch<AnyAction>;

/**
 * `GlobalSelectorProxy` is a type that wraps the TypedUseSelectorHook
 * from the Redux library with a GlobalStoreStateProxy.
 *
 * It is used to create type-safe useSelector hooks for global
 * store states that include a slice of the state tree identified
 * by a specific name.
 *
 * @template S - The type of the state slice.
 * @template N - The string type representing the name of the state slice.
 *
 * @example
 * // Assume we have a global state with a "user" slice:
 * interface RootState {
 *   user: UserState;
 * }
 *
 * // Define a selector that retrieves the user by ID:
 * const selectUserById = (state: UserState, id: string) => state.byId[id];
 *
 * // Create a type-safe useSelector hook for the global state with the "user" slice:
 * const useGlobalUserSelector: GlobalSelectorProxy<UserState, 'user'> = useSelector;
 *
 * // Use the type-safe useSelector hook with the selector:
 * const user = useGlobalUserSelector(state => selectUserById(state.user, '123'));
 */
export type GlobalSelectorProxy<S, N extends string> = TypedUseSelectorHook<
  GlobalStoreStateProxy<S, N>
>;
