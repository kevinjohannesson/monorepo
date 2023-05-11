import {
  type ReactElement,
  type ReactNode,
  createContext,
  useMemo,
  useRef,
} from "react";
import { get, set } from "lodash";
import { useRequiredContext } from "utils";

export interface ImageTileCache {
  tiles: Record<number, Record<number, Record<number, HTMLImageElement>>>;
}

interface ImageTileCacheContextValue {
  getCache: (
    zoomLevel: number,
    xIndex: number,
    yIndex: number,
  ) => HTMLImageElement | null;
  setCache: (
    image: HTMLImageElement,
    zoomLevel: number,
    xIndex: number,
    yIndex: number,
  ) => void;
}

// eslint-disable-next-line @typescript-eslint/consistent-type-assertions
const ImageTileCacheContext = createContext({} as ImageTileCacheContextValue);

interface ImageTileCacheProviderProps {
  children?: ReactNode;
}

export function ImageTileCacheProvider({
  children,
}: ImageTileCacheProviderProps): ReactElement {
  const cache = useRef<ImageTileCache>({ tiles: {} });

  const getCache = useMemo(
    () => (zoomLevel: number, xIndex: number, yIndex: number) =>
      get(cache.current.tiles, `${zoomLevel}/${xIndex}/${yIndex}`, null),
    [],
  );

  const setCache = useMemo(
    () =>
      (
        image: HTMLImageElement,
        zoomLevel: number,
        xIndex: number,
        yIndex: number,
      ) => {
        set(cache.current.tiles, `${zoomLevel}/${xIndex}/${yIndex}`, image);
      },
    [],
  );

  return (
    <ImageTileCacheContext.Provider value={{ getCache, setCache }}>
      {children}
    </ImageTileCacheContext.Provider>
  );
}

export const useImageTileCacheContext = (): ImageTileCacheContextValue =>
  useRequiredContext(ImageTileCacheContext, "Image Tile Cache Context");