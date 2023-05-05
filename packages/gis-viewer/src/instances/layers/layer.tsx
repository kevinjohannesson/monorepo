import { createContext, ReactNode, RefObject, useRef } from "react";
import { useInstanceSelector } from "../../store-hooks";
import { useRequiredContext } from "../../utils/use-required-context";
import { selectViewState } from "../view/slice";
import styled from "@emotion/styled";
import { DEFAULT_IS_VISIBLE, DEFAULT_OPACITY } from "./constants";

export interface LayerContextValue {
  ref: RefObject<HTMLCanvasElement>;
}

export const LayerContext = createContext({} as LayerContextValue);

export const useLayerContext = () => useRequiredContext(LayerContext);

interface LayerBaseProps {
  isVisible?: boolean;
  opacity?: number;
}

const LayerBase = styled("canvas")<LayerBaseProps>(
  ({ isVisible = DEFAULT_IS_VISIBLE, opacity = DEFAULT_OPACITY }) => ({
    position: "absolute",
    top: 0,
    left: 0,
    opacity,
    visibility: isVisible ? "visible" : "hidden",
  })
);

export interface LayerProps extends LayerBaseProps {
  children?: ReactNode;
}

export function Layer({
  children,
  opacity = DEFAULT_OPACITY,
  isVisible = DEFAULT_IS_VISIBLE,
  ...props
}: LayerProps) {
  const ref = useRef<HTMLCanvasElement | null>(null);

  const [width, height] = useInstanceSelector(selectViewState("dimensions"));

  return (
    <LayerContext.Provider value={{ ref }}>
      <LayerBase ref={ref} width={width} height={height} {...props} />
      {children}
    </LayerContext.Provider>
  );
}
