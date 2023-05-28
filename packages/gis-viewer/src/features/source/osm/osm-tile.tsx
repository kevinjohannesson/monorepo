/** @todo move this to folder for simple tile components */
import { assertNotNull } from "utils";
import { useEffect } from "react";
import { useLayerContext } from "../../layer";
import { useViewZoomLevel } from "../../view/hooks/use-view-state";

interface TileImageProps {
  dx: number;
  dy: number;
  dw: number;
  dh: number;
  image: HTMLImageElement;
}

export function TileImage({ dx, dy, dh, dw, image }: TileImageProps): null {
  const layerContext = useLayerContext();

  useEffect(() => {
    // console.log("TileImage");
    const ctx = layerContext.ref.current?.getContext("2d");
    assertNotNull(ctx);
    // console.log("Drawing image.");
    ctx.drawImage(image, dx, dy, dw, dh);
    ctx.strokeRect(dx, dy, dw, dh);
  }, [dw, dh, dx, dy]);

  return null;
}

export function TileClearer({ dx, dy, dh, dw }: Omit<TileImageProps, "image">): null {
  console.log("Clearing canvas.");
  const viewZoomLevel = useViewZoomLevel();
  const layerContext = useLayerContext();

  // useEffect(() => {
  const ctx = layerContext.ref.current?.getContext("2d");
  assertNotNull(ctx);
  ctx.clearRect(dx, dy, dw, dh);
  // }, [dw, dh, dx, dy]);

  return null;
}
