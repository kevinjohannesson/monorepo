import styled from "@emotion/styled";
import { DEFAULT_IS_VISIBLE, DEFAULT_OPACITY } from "./constants";

interface OverlayProps {
  isVisible?: boolean;
  opacity?: number;
}

export const Overlay = styled("div")<OverlayProps>(
  ({ isVisible = DEFAULT_IS_VISIBLE, opacity = DEFAULT_OPACITY }) => ({
    position: "absolute",
    top: 0,
    left: 0,
    opacity,
    visibility: isVisible ? "visible" : "hidden",
    background: "rgba(0, 0, 0, 0.05)",
  })
);
