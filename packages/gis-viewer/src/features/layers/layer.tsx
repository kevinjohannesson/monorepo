import {
  createContext,
  CSSProperties,
  ReactNode,
  RefObject,
  useRef,
} from "react";
import { useRequiredContext } from "utils";
import { DEFAULT_IS_VISIBLE, DEFAULT_OPACITY } from "./constants";
import { useGisViewerSelector } from "../../slice";
import { selectViewState } from "../view/slice";

export interface LayerContextValue {
  ref: RefObject<HTMLCanvasElement>;
}

export const LayerContext = createContext({} as LayerContextValue);

export const useLayerContext = () =>
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
}: LayerProps) {
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
