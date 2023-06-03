import {
  type ReactElement,
  type ReactNode,
  createContext,
  useCallback,
  useMemo,
  useReducer,
} from "react";
import {
  type WithVersion,
  isNull,
  selectVersion,
  useRequiredContext,
  withVersioning,
  withVersioningEnhancer,
} from "utils";

// const CACHE_SIZE_LIMIT = 100;

type TiledImageCache = Record<number, Record<number, Record<number, HTMLImageElement>>>;

type SlippyMapCacheState = WithVersion<{
  availableImageTiles: TiledImageCache;
}>;

const SLIPPY_MAP_CACHE_INITIAL_STATE: SlippyMapCacheState = withVersioning({
  availableImageTiles: {},
});

const ADD_IMAGE = "ADD_IMAGE" as const;

interface AddImageAction {
  type: typeof ADD_IMAGE;
  payload: { image: HTMLImageElement; x: number; y: number; z: number };
}

type SlippyMapCacheActions = AddImageAction;

function tileImageCacheReducer(
  state: SlippyMapCacheState,
  action: SlippyMapCacheActions,
): SlippyMapCacheState {
  switch (action.type) {
    case ADD_IMAGE: {
      const { image, x, y, z } = action.payload;

      const availableImageTiles = {
        ...state.availableImageTiles,
        [z]: {
          ...state.availableImageTiles[z],
          [x]: {
            ...state.availableImageTiles[z]?.[x],
            [y]: image,
          },
        },
      };
      // Cleanup logic to limit the cache here...

      return { ...state, availableImageTiles };
    }
    default:
      throw new Error();
  }
}

function addImage(image: HTMLImageElement, x: number, y: number, z: number): AddImageAction {
  return {
    type: ADD_IMAGE,
    payload: {
      image,
      x,
      y,
      z,
    },
  };
}

function selectTileImageFromCache(
  state: SlippyMapCacheState,
  x: number,
  y: number,
  z: number,
): HTMLImageElement | null {
  return state.availableImageTiles[z]?.[x]?.[y] ?? null;
}

function selectAvailableZoomLevelsInCache(state: SlippyMapCacheState): number[] {
  return Object.keys(state.availableImageTiles).map(Number);
}

interface UseTileImageCache {
  addTileImage: (image: HTMLImageElement, x: number, y: number, z: number) => void;
  getTileImage: (x: number, y: number, z: number) => HTMLImageElement | null;
  hasTileImage: (x: number, y: number, z: number) => boolean;
  version: SlippyMapCacheState["version"];
  availableZoomLevels: number[];
  // for testing
  state: SlippyMapCacheState;
}

export function useSlippyMapCacheReducer(
  initialState: SlippyMapCacheState = SLIPPY_MAP_CACHE_INITIAL_STATE,
): UseTileImageCache {
  const [state, dispatch] = useReducer(
    withVersioningEnhancer(tileImageCacheReducer, [ADD_IMAGE]),
    initialState,
  );

  const addTileImage = useCallback((image: HTMLImageElement, x: number, y: number, z: number) => {
    dispatch(addImage(image, x, y, z));
  }, []);

  const getTileImage = useCallback(
    (x: number, y: number, z: number) => selectTileImageFromCache(state, x, y, z),

    [state],
  );

  const hasTileImage = useCallback(
    (x: number, y: number, z: number) => !isNull(selectTileImageFromCache(state, x, y, z)),

    [state],
  );

  const availableZoomLevels = useMemo(
    () => selectAvailableZoomLevelsInCache(state).sort((a, b) => a - b),
    [Object.keys(state.availableImageTiles).join()],
  );

  const version = useMemo(() => selectVersion(state), [state.version]);

  return {
    addTileImage,
    hasTileImage,
    getTileImage,
    version,
    availableZoomLevels,
    state,
  };
}

export interface SlippyMapCacheContextValue extends UseTileImageCache {}
const SlippyMapCacheContext = createContext<SlippyMapCacheContextValue>({} as any);

interface SlippyMapCacheProviderProps {
  children: ReactNode;
}

export function SlippyMapCacheProvider({ children }: SlippyMapCacheProviderProps): ReactElement {
  const { addTileImage, hasTileImage, getTileImage, version, availableZoomLevels, state } =
    useSlippyMapCacheReducer();

  const value = useMemo(
    () => ({
      addTileImage,
      hasTileImage,
      getTileImage,
      version,
      availableZoomLevels,
      state,
    }),
    [addTileImage, getTileImage, availableZoomLevels.join()],
  );

  return <SlippyMapCacheContext.Provider value={value}>{children}</SlippyMapCacheContext.Provider>;
}

export function useSlippyMapCacheContext(): SlippyMapCacheContextValue {
  return useRequiredContext(SlippyMapCacheContext, "Slippy Map Cache Context");
}
