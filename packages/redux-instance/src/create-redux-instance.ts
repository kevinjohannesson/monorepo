import {
  AnyAction,
  Draft,
  PayloadAction,
  Reducer,
  combineReducers,
  createSlice,
} from "@reduxjs/toolkit";
import { createObjectWithNamedActionInstance } from "./actions/create-object-with-named-action-instance";
import { createObjectWithNamedHookInstance } from "./hooks/create-object-with-named-hook-instance";
import { createInstanceHookFactories } from "./hooks/create-store-instance-hooks";
import { createObjectWithNamedSelectorInstance } from "./selectors/create-object-with-named-selector-instance";
import { createStoreInstanceSelectors } from "./selectors/create-store-instance-selectors";
import { Instances, InstancesSliceState } from "./types";
import { prefixIdWithName } from "./utils";

/**
 * Creates an InstancesSliceState object with the provided instances or an empty object if none are provided.
 * This function is mainly used to ensure correct type inference when initializing the slice state.
 *
 * @template T - The type of the instances being managed in the slice state.
 * @returns An InstancesSliceState object with the provided instances or an empty object.
 */
function createInstancesSliceState<T>(
  /** (optional) An Instances object containing the initial instances. */
  instances?: Instances<T>
): InstancesSliceState<T> {
  return {
    instances: instances || {},
  };
}

const INIT_INSTANCE_ACTION_TYPE = "@@custom-init";

/**
 * Creates a Redux instance for managing multiple instances of a slice with
 * a common reducer function. Returns an object containing the slice, actions,
 * selectors, and hooks associated with the instance.
 *
 * @template {N} name - The name of the slice.
 * @template {Reducer<S, AnyAction>} instanceReducer - The reducer function for instances of the type S.
 * @template {string} actionMatcherPrefix - The prefix for matching actions specific to this slice.
 * @template {Instances<S>} instances - Optional: Add instances during creation.
 *
 * @returns An object containing the created slice, actions, selectors, and hooks.
 */
export function createReduxInstance<N extends string, S>(
  name: N,
  instanceReducer: Reducer<S, AnyAction>,
  // actionMatcherPrefix: string,
  instances?: Instances<S>
) {
  const slice = createSlice({
    name,
    initialState: createInstancesSliceState(instances),
    reducers: {
      addInstance: (state, action: PayloadAction<{ id: string }>) => {
        const { id } = action.payload;
        state.instances[prefixIdWithName(name, id)] = instanceReducer(
          undefined,
          {
            type: INIT_INSTANCE_ACTION_TYPE,
          }
        ) as Draft<S>;
      },
      removeInstance: (state, action: PayloadAction<{ id: string }>) => {
        const { id } = action.payload;
        delete state.instances[prefixIdWithName(name, id)];
      },
    },
    extraReducers: (builder) => {
      builder.addMatcher(
        // (action) => action.type.startsWith(`${actionMatcherPrefix}/`),
        (action) => typeof action?.meta?.redux_instance_id === "string",
        (state, action) => {
          const id = action.meta.redux_instance_id;
          state.instances[prefixIdWithName(name, id)] = instanceReducer(
            state.instances[prefixIdWithName(name, id)] as S,
            action
          ) as Draft<S>;
        }
      );
    },
  });

  const { addInstance, removeInstance } = slice.actions;

  const { selectIsInstanceAvailable, selectInstance } =
    createStoreInstanceSelectors<S>()(name);

  const {
    useInstanceDispatchFactory: useSliceInstanceDispatchFactory,
    useInstanceSelectorFactory: useSliceInstanceSelectorFactory,
  } = createInstanceHookFactories(name, selectInstance);

  return {
    slice,
    actions: {
      ...createObjectWithNamedActionInstance(name, "add", addInstance),
      ...createObjectWithNamedActionInstance(name, "remove", removeInstance),
    },
    selectors: {
      ...createObjectWithNamedSelectorInstance(
        name,
        "instance",
        selectInstance
      ),
      ...createObjectWithNamedSelectorInstance(
        name,
        "instanceIsAvailable",
        selectIsInstanceAvailable
      ),
    },
    hooks: {
      ...createObjectWithNamedHookInstance(
        name,
        "selector",
        useSliceInstanceSelectorFactory
      ),
      ...createObjectWithNamedHookInstance(
        name,
        "dispatch",
        useSliceInstanceDispatchFactory
      ),
    },
  };
}

// TEST

interface TestSliceState {
  centerCoordinates: [number, number];
  zoomLevel: number;
}

const initialState: TestSliceState = {
  centerCoordinates: [0, 0],
  zoomLevel: 0,
};

export const testSlice = createSlice({
  name: `testSlice`,
  initialState,
  reducers: {
    updateSlice: (
      state,
      { payload }: PayloadAction<Partial<TestSliceState>>
    ) => {
      Object.assign(state, {
        ...state,
        ...payload,
      });
    },

    resetSlice: (state) => {
      Object.assign(state, initialState);
    },
  },
});

const selectZoomLevel = (state: TestInstanceState) => state.testSlice.zoomLevel;
const selectTestById = (pos: 0 | 1) => (state: TestInstanceState) =>
  state.testSlice.centerCoordinates[pos];

interface TestInstanceState {
  [testSlice.name]: TestSliceState;
}

const testInstanceReducer = combineReducers({
  [testSlice.name]: testSlice.reducer,
  // ...
});

const {
  selectors: { selectMapprInstance, selectMapprInstanceIsAvailable },
  actions: { addMappr, removeMappr },
  hooks: { useMapprInstanceDispatchFactory, useMapprInstanceSelectorFactory },
} = createReduxInstance("mappr", testInstanceReducer);
// } = createReduxInstance("mappr", testInstanceReducer, "mapprInstance");

const useFoo = () => {
  const foo1 = useMapprInstanceSelectorFactory("default")(selectZoomLevel);
  const foo2 = useMapprInstanceSelectorFactory("default")(selectTestById(1));

  const dispatch = useMapprInstanceDispatchFactory("default")();
  dispatch(addMappr);
  // const foo2 = useMapprInstanceSelector("default")(selectMapprInstanceIsAvailable("foo"));
};
