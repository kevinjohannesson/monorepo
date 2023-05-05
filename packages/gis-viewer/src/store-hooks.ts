import { Action } from "@reduxjs/toolkit";
import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux";
import { useMetaDataContext } from "./meta-data-provider";
import { selectInstance } from "./root-slice";
import { InstanceState, RootDispatch, RootState } from "./store";

export const useRootSelector: TypedUseSelectorHook<RootState> = useSelector;

export const useRootDispatch: () => RootDispatch = useDispatch;

export function useInstanceSelector<T>(
  selector: (state: InstanceState) => T
): T {
  const { id } = useMetaDataContext();
  const value = useRootSelector((state) => selector(selectInstance(id)(state)));

  return value;
}

function useAddMetaData() {
  const { id } = useMetaDataContext();

  return function <T extends Action>(action: T) {
    return { ...action, meta: { id } };
  };
}

export function useInstanceDispatch() {
  const dispatch = useRootDispatch();
  const addMetaData = useAddMetaData();

  return <T extends Action>(action: T): T => {
    if (typeof action === "function") {
      throw new Error(
        "useInstanceDispatch should only be used for object actions."
      );
    }

    return dispatch(addMetaData(action));
  };
}
