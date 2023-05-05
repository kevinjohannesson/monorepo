import { useEffect } from "react";
import { renderRectangle } from "../../render/shapes/rectangle";
import { RenderType } from "../../render/types";
import { useInstanceSelector } from "../../store-hooks";
import { Coordinate, Dimensions } from "../../types";
import { assertNotNull } from "../../utils/assert";
import {
  addCoordinates,
  calculateCenterCoordinate,
  subtractCoordinates,
} from "../../utils/coordinate";
import { useLayerContext } from "../layers/layer";
import { selectViewState } from "../view/slice";

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

export function TestCrosshairSource() {
  const { ref } = useLayerContext();

  const viewDimensions = useInstanceSelector(selectViewState("dimensions"));

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
      startCoordinate: subtractCoordinates(centerCoordinate, [
        halfLineLength + padding,
        halfLineWidth + padding,
      ]),
      lineDimensions: addCoordinates(
        [crosshairLineLength, crosshairLineWidth],
        [padding, padding]
      ),
      fillStyle: "white",
    });

    renderCrosshairLine(canvas, {
      startCoordinate: subtractCoordinates(centerCoordinate, [
        halfLineWidth + padding,
        halfLineLength + padding,
      ]),
      lineDimensions: addCoordinates(
        [crosshairLineWidth, crosshairLineLength],
        padding
      ),
      fillStyle: "white",
    });

    renderCrosshairLine(canvas, {
      startCoordinate: subtractCoordinates(centerCoordinate, [
        halfLineLength + halfPadding,
        halfLineWidth + halfPadding,
      ]),
      lineDimensions: [crosshairLineLength, crosshairLineWidth],
      fillStyle: "black",
    });

    renderCrosshairLine(canvas, {
      startCoordinate: subtractCoordinates(centerCoordinate, [
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
