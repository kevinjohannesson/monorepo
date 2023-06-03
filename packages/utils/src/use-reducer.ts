import { Reducer } from "react";

interface VersionState {
  version: number;
}

export interface Action<T = string> {
  type: T;
}

export type WithVersion<S> = S & VersionState;

export function withVersioning<S>(state: S): WithVersion<S> {
  return { ...state, version: 0 };
}

function enhanceVersion<S extends VersionState>(state: S): S {
  return { ...state, version: state.version + 1 };
}

export function withVersioningEnhancer<
  S extends VersionState,
  A extends Action
>(reducer: Reducer<S, A>, versionedActionTypes: Array<A["type"]>) {
  return function (state: S, action: A): WithVersion<S> {
    const shouldUpdateVersion = versionedActionTypes.includes(action.type);
    const updatedState = reducer(state, action);

    if (shouldUpdateVersion) {
      return enhanceVersion({ ...updatedState });
    } else {
      return { ...updatedState };
    }
  };
}

export function selectVersion<S extends VersionState>(
  state: S
): VersionState["version"] {
  return state.version;
}
