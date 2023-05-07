import { useEffect } from "react";
import { RenderType, renderRectangle } from "canvas";
import { Coordinate, Dimensions } from "../../types";
import {
  addVector2d,
  assertNotNull,
  calculateCenterCoordinate,
  subtractVector2d,
} from "utils";
import { useLayerContext } from "../layers/layer";
import { selectViewState } from "../view/slice";
import { useGisViewerSelector } from "../../slice";

interface CrosshairLineConfig {
  startCoordinate: Coordinate;
  lineDimensions: Dimensions;
  fillStyle: string;
}

const renderCrosshairLine = (
  canvas: HTMLCanvasElement,
  { startCoordinate, lineDimensions, fillStyle }: CrosshairLineConfig
) => {
  renderRectangle(
    canvas,
    startCoordinate.map(Math.floor) as Coordinate,
    lineDimensions,
    RenderType.FILL,
    { fillStyle }
  );
};

export function CrosshairSource() {
  const { ref } = useLayerContext();

  const viewDimensions = useGisViewerSelector(selectViewState("dimensions"));

  useEffect(() => {
    const canvas = ref.current;
    assertNotNull(canvas);

    const centerCoordinate = calculateCenterCoordinate(viewDimensions);

    const crosshairLineLength = 25;
    const crosshairLineWidth = 1;

    const halfLineLength = crosshairLineLength / 2;
    const halfLineWidth = crosshairLineWidth / 2;

    const padding = 2;
    const halfPadding = padding / 2;

    renderCrosshairLine(canvas, {
      startCoordinate: subtractVector2d(centerCoordinate, [
        halfLineLength + padding,
        halfLineWidth + padding,
      ]),
      lineDimensions: addVector2d(
        [crosshairLineLength, crosshairLineWidth],
        [padding, padding]
      ),
      fillStyle: "white",
    });

    renderCrosshairLine(canvas, {
      startCoordinate: subtractVector2d(centerCoordinate, [
        halfLineWidth + padding,
        halfLineLength + padding,
      ]),
      lineDimensions: addVector2d(
        [crosshairLineWidth, crosshairLineLength],
        padding
      ),
      fillStyle: "white",
    });

    renderCrosshairLine(canvas, {
      startCoordinate: subtractVector2d(centerCoordinate, [
        halfLineLength + halfPadding,
        halfLineWidth + halfPadding,
      ]),
      lineDimensions: [crosshairLineLength, crosshairLineWidth],
      fillStyle: "black",
    });

    renderCrosshairLine(canvas, {
      startCoordinate: subtractVector2d(centerCoordinate, [
        halfLineWidth + halfPadding,
        halfLineLength + halfPadding,
      ]),
      lineDimensions: [crosshairLineWidth, crosshairLineLength],
      fillStyle: "black",
    });

    return () => {
      const context = canvas.getContext("2d");
      assertNotNull(context);

      const [viewWidth, viewHeight] = viewDimensions;

      context.clearRect(0, 0, viewWidth, viewHeight);
    };
  }, [ref, viewDimensions]);

  return null;
}
