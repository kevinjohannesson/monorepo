import { type ReactElement, type ReactNode, createContext, useMemo } from "react";
import { type Vector2d, ensureVector2d, useRequiredContext } from "utils";
import { useGridTileIndices } from "./hooks/use-grid-tile-indices";
import { usePixelOffsetToCenterGrid } from "./hooks/use-pixel-offset-to-center-grid";

interface TileGridContextValue {
  pixelOffsetToCenterGrid: Vector2d;
  gridTileIndices: Vector2d[];
  gridTileDimensions: Vector2d;
  gridDimensions: Vector2d;
}

const TileGridContext = createContext<TileGridContextValue>({} as any);

export interface TileGridProviderProps {
  gridDimensions: Vector2d;
  tileDimensions: Vector2d | number;
  children?: ReactNode;
}

export function TileGridProvider({
  gridDimensions,
  tileDimensions,
  children,
}: TileGridProviderProps): ReactElement | null {
  const pixelOffsetToCenterGrid = usePixelOffsetToCenterGrid(
    gridDimensions,
    ensureVector2d(tileDimensions),
  );

  const gridTileIndices = useGridTileIndices(gridDimensions, ensureVector2d(tileDimensions));

  const gridTileDimensions = ensureVector2d(tileDimensions);
  const value: TileGridContextValue = useMemo(
    () => ({
      pixelOffsetToCenterGrid,
      /** @todo remove the test values */
      gridTileIndices: [
        // [-1, -1],
        // [-1, 0],
        // [-1, 1],

        [0, -1],
        [0, 0],
        [0, 1],

        // [1, -1],
        // [1, 0],
        // [1, 1],
      ],
      gridTileDimensions,
      gridDimensions,
    }),
    [pixelOffsetToCenterGrid, gridTileIndices, gridTileDimensions.join()],
  );

  return <TileGridContext.Provider value={value}>{children}</TileGridContext.Provider>;
}

export function useTileGridContext(): TileGridContextValue {
  return useRequiredContext(TileGridContext, "Tile Grid Context");
}
