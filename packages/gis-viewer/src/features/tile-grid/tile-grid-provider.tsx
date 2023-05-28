import { type ReactElement, type ReactNode, createContext, useMemo } from "react";
import { type Vector2d, ensureVector2d, useRequiredContext } from "utils";
import { useGridTileIndices } from "./hooks/use-grid-tile-indices";
import { usePixelOffsetToCenterGrid } from "./hooks/use-pixel-offset-to-center-grid";

interface TileGridContextValue {
  pixelOffsetToCenterGrid: Vector2d;
  indices: Vector2d[];
  gridTileDimensions: Vector2d;
  dimensions: Vector2d;
}

const TileGridContext = createContext<TileGridContextValue>({} as any);

export interface TileGridProviderProps {
  dimensions: Vector2d;
  tileDimensions: Vector2d | number;
  additionalRings?: number;
  children?: ReactNode;
}

export function TileGridProvider({
  dimensions,
  tileDimensions,
  additionalRings,
  children,
}: TileGridProviderProps): ReactElement | null {
  const pixelOffsetToCenterGrid = usePixelOffsetToCenterGrid(
    dimensions,
    ensureVector2d(tileDimensions),
  );

  const indices = useGridTileIndices(dimensions, ensureVector2d(tileDimensions), additionalRings);

  const gridTileDimensions = ensureVector2d(tileDimensions);
  const value: TileGridContextValue = useMemo(
    () => ({
      pixelOffsetToCenterGrid,
      indices,
      // /** @todo remove the test values */
      // gridTileIndices: [
      //   // [-1, -1],
      //   // [-1, 0],
      //   // [-1, 1],

      //   [0, -1],
      //   [0, 0],
      //   [0, 1],

      //   // [1, -1],
      //   // [1, 0],
      //   // [1, 1],
      // ],
      gridTileDimensions,
      dimensions,
    }),
    [pixelOffsetToCenterGrid, indices, gridTileDimensions.join()],
  );

  return <TileGridContext.Provider value={value}>{children}</TileGridContext.Provider>;
}

export function useTileGridContext(): TileGridContextValue {
  return useRequiredContext(TileGridContext, "Tile Grid Context");
}
