import {
  type CSSProperties,
  type ReactElement,
  type ReactNode,
  type RefObject,
  createContext,
  useRef,
} from "react";
import { DEFAULT_IS_VISIBLE, DEFAULT_OPACITY } from "./constants";
import { selectViewState } from "../view/slice";
import { useGisViewerSelector } from "../../slice";
import { useRequiredContext } from "utils";

export interface LayerContextValue {
  ref: RefObject<HTMLCanvasElement | null>;
}

export const LayerContext = createContext<LayerContextValue>({
  ref: { current: null },
});

export const useLayerContext = (): LayerContextValue =>
  useRequiredContext(LayerContext, "Layer Context");

const LayerBaseStyle: CSSProperties = {
  position: "absolute",
  top: 0,
  left: 0,
};

export interface LayerProps {
  children?: ReactNode;
  isVisible?: boolean;
  opacity?: number;
}

export function Layer({
  children,
  opacity = DEFAULT_OPACITY,
  isVisible = DEFAULT_IS_VISIBLE,
}: LayerProps): ReactElement {
  const ref = useRef<HTMLCanvasElement | null>(null);

  const [width, height] = useGisViewerSelector(selectViewState("dimensions"));

  return (
    <LayerContext.Provider value={{ ref }}>
      <canvas
        ref={ref}
        width={width}
        height={height}
        style={{
          ...LayerBaseStyle,
          opacity,
          visibility: isVisible ? "visible" : "hidden",
        }}
      />
      {children}
    </LayerContext.Provider>
  );
}
