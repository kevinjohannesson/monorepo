import styled from "@emotion/styled";

export const Watermark = styled("div")(() => ({
  "&::before": {
    alignItems: "center",
    color: "rgba(0,0,0,0.02)",
    content: "'mappr'",
    display: "flex",
    fontSize: "120px",
    paddingBottom: "40px",
    justifyContent: "center",
  },
  alignItems: "center",
  display: "flex",
  height: "100%",
  justifyContent: "center",
  width: "100%",
  zIndex: -1,
  position: "absolute",
  top: 0,
  left: 0,
}));
