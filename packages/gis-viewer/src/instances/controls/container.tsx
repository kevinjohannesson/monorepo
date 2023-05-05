import styled from "@emotion/styled";

export const ControlsContainer = styled("div")(() => ({
  position: "absolute",
  display: "flex",
  flexDirection: "column",
  top: 20,
  left: 20,
  zIndex: 1,
  pointerEvents: "none",
  "*": {
    pointerEvents: "auto",
  },
}));
