import {
  type ReactElement,
  type ReactNode,
  createContext,
  useCallback,
  useMemo,
  useReducer,
} from "react";
import { type Vector2d, isNull, useRequiredContext } from "utils";

// const CACHE_SIZE_LIMIT = 100;

type TileImageCache = Record<number, Record<number, Record<number, HTMLImageElement>>>;

interface TileImageCacheState {
  availableImageTiles: TileImageCache;
}
const TILE_IMAGE_CACHE_INITIAL_STATE: TileImageCacheState = {
  availableImageTiles: {},
};

const ADD_IMAGE = "ADD_IMAGE" as const;

interface AddTileImageToCacheAction {
  type: typeof ADD_IMAGE;
  payload: { image: HTMLImageElement; x: number; y: number; z: number };
}

type TileImageCacheActions = AddTileImageToCacheAction;

function tileImageCacheReducer(
  state: TileImageCacheState,
  action: TileImageCacheActions,
): TileImageCacheState {
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

function addTileImageToCache(
  image: HTMLImageElement,
  x: number,
  y: number,
  z: number,
): AddTileImageToCacheAction {
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
  state: TileImageCacheState,
  x: number,
  y: number,
  z: number,
): HTMLImageElement | null {
  return state.availableImageTiles[z]?.[x]?.[y] ?? null;
}

function selectAvailableZoomLevelsInCache(state: TileImageCacheState): number[] {
  return Object.keys(state.availableImageTiles).map(Number);
}

function scaleFractionalTileNumber(deltaZoomLevel: number) {
  return function (fractionalTileNumber: number) {
    return fractionalTileNumber * Math.pow(2, deltaZoomLevel);
  };
}

interface ReferenceTile {
  fractionalTileNumbers: Vector2d;
  wholeZoomLevel: number;
}

function getScaledFractionalTileNumbersAtZoomLevel(
  referenceTile: ReferenceTile,
  zoomLevel: number,
): Vector2d {
  const deltaZoomLevel = zoomLevel - referenceTile.wholeZoomLevel;

  return referenceTile.fractionalTileNumbers.map(
    scaleFractionalTileNumber(deltaZoomLevel),
  ) as Vector2d;
}

function selectZoomLevelsWithImageInCacheForReferenceTile(
  state: TileImageCacheState,
  referenceTile: ReferenceTile,
): number[] {
  const zoomLevelsWithImage = [];

  for (const cachedZoomLevelKey in state.availableImageTiles) {
    const cachedZoomLevel = parseInt(cachedZoomLevelKey, 10);

    const fractionalTileNumbersAtZoomLevel = getScaledFractionalTileNumbersAtZoomLevel(
      referenceTile,
      cachedZoomLevel,
    );

    const [wholeTileNumbersAtZoomLevelX, wholeTileNumbersAtZoomLevelY] =
      fractionalTileNumbersAtZoomLevel.map(Math.floor);

    const hasImageAtZoomLevel = Boolean(
      state.availableImageTiles[cachedZoomLevel]?.[wholeTileNumbersAtZoomLevelX]?.[
        wholeTileNumbersAtZoomLevelY
      ] ?? null,
    );

    if (hasImageAtZoomLevel) {
      zoomLevelsWithImage.push(cachedZoomLevel);
    }
  }

  return zoomLevelsWithImage;
}
interface ImageByZoomLevel {
  image: HTMLImageElement;
  zoomLevel: number;
}
function selectTileImagesForAllZoomLevelsByReferenceTile(
  state: TileImageCacheState,
  referenceTile: ReferenceTile,
): ImageByZoomLevel[] {
  const imagesByZoomLevel: ImageByZoomLevel[] = [];

  for (const cachedZoomLevelKey in state.availableImageTiles) {
    const cachedZoomLevel = parseInt(cachedZoomLevelKey, 10);

    const fractionalTileNumbersAtZoomLevel = getScaledFractionalTileNumbersAtZoomLevel(
      referenceTile,
      cachedZoomLevel,
    );

    const [wholeTileNumbersAtZoomLevelX, wholeTileNumbersAtZoomLevelY] =
      fractionalTileNumbersAtZoomLevel.map(Math.floor);

    const image =
      state.availableImageTiles[cachedZoomLevel]?.[wholeTileNumbersAtZoomLevelX]?.[
        wholeTileNumbersAtZoomLevelY
      ] ?? null;

    if (!isNull(image)) {
      const imageByZoomLevel: ImageByZoomLevel = {
        zoomLevel: cachedZoomLevel,
        image,
      };
      imagesByZoomLevel.push(imageByZoomLevel);
    }
  }

  return imagesByZoomLevel;
}

interface UseTileImageCache {
  addTileImage: (image: HTMLImageElement, x: number, y: number, z: number) => void;
  getTileImage: (x: number, y: number, z: number) => HTMLImageElement | null;
  availableZoomLevels: number[];
  getAvailableZoomLevelsByReferenceTile: (referenceTile: ReferenceTile) => number[];
  getTileImagesForAllZoomLevelsByReferenceTile: (
    referenceTile: ReferenceTile,
  ) => ImageByZoomLevel[];
  // for testing
  state: TileImageCacheState;
}

export function useTileImageCacheReducer(
  initialState: TileImageCacheState = TILE_IMAGE_CACHE_INITIAL_STATE,
): UseTileImageCache {
  const [state, dispatch] = useReducer(tileImageCacheReducer, initialState);

  const addTileImage = useCallback((image: HTMLImageElement, x: number, y: number, z: number) => {
    dispatch(addTileImageToCache(image, x, y, z));
  }, []);

  const getTileImage = useCallback(
    (x: number, y: number, z: number) => selectTileImageFromCache(state, x, y, z),

    [state],
  );

  const getAvailableZoomLevelsByReferenceTile = useCallback(
    (referenceTile: ReferenceTile) => {
      return selectZoomLevelsWithImageInCacheForReferenceTile(state, referenceTile);
    },
    [state],
  );

  const getTileImagesForAllZoomLevelsByReferenceTile = useCallback(
    (referenceTile: ReferenceTile) => {
      return selectTileImagesForAllZoomLevelsByReferenceTile(state, referenceTile);
    },
    [state],
  );

  const availableZoomLevels = useMemo(
    () => selectAvailableZoomLevelsInCache(state).sort((a, b) => a - b),
    [Object.keys(state.availableImageTiles).join()],
  );

  return {
    addTileImage,
    getTileImage,
    availableZoomLevels,
    getAvailableZoomLevelsByReferenceTile,
    getTileImagesForAllZoomLevelsByReferenceTile,
    state,
  };
}

interface TileImageCacheContextValue extends UseTileImageCache {}
const TileImageCacheContext = createContext<TileImageCacheContextValue>({} as any);

interface TileImageCacheProviderProps {
  children: ReactNode;
}

export function TileImageCacheProvider({ children }: TileImageCacheProviderProps): ReactElement {
  const {
    addTileImage,
    getTileImage,
    availableZoomLevels,
    state,
    getAvailableZoomLevelsByReferenceTile,
    getTileImagesForAllZoomLevelsByReferenceTile,
  } = useTileImageCacheReducer();

  const value = useMemo(
    () => ({
      addTileImage,
      getTileImage,
      availableZoomLevels,
      state,
      getAvailableZoomLevelsByReferenceTile,
      getTileImagesForAllZoomLevelsByReferenceTile,
    }),
    [
      addTileImage,
      getTileImage,
      getAvailableZoomLevelsByReferenceTile,
      getTileImagesForAllZoomLevelsByReferenceTile,
      availableZoomLevels.join(),
    ],
  );

  return <TileImageCacheContext.Provider value={value}>{children}</TileImageCacheContext.Provider>;
}

export function useTileImageCacheContext(): TileImageCacheContextValue {
  return useRequiredContext(TileImageCacheContext, "Tile Image Cache Context");
}
