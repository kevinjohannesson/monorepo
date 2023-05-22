import { type ReactElement, type ReactNode, createContext, useMemo, useRef } from "react";
import { useRequiredContext } from "utils";

export interface ImageTileCache {
  tiles: Record<string, HTMLImageElement>;
}

interface ImageTileCacheContextValue {
  getCache: (url: string) => HTMLImageElement | null;
  setCache: (url: string, image: HTMLImageElement) => void;
}

// eslint-disable-next-line @typescript-eslint/consistent-type-assertions
const ImageTileCacheContext = createContext({} as ImageTileCacheContextValue);

interface ImageTileCacheProviderProps {
  children?: ReactNode;
}

export function ImageTileCacheProvider({ children }: ImageTileCacheProviderProps): ReactElement {
  const cache = useRef<ImageTileCache>({ tiles: {} });

  const getCache = useMemo(() => (url: string) => cache.current.tiles[url] ?? null, []);

  const setCache = useMemo(
    () => (url: string, image: HTMLImageElement) => {
      cache.current.tiles[url] = image;
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
