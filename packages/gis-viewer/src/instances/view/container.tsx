import { Dimensions } from "../../types";
import styled from "@emotion/styled";
import { DEFAULT_DIMENSIONS } from "./constants";

interface ViewContainerProps {
  dimensions?: Dimensions;
}

export const ViewContainer = styled("div")<ViewContainerProps>(
  ({ dimensions: [width, height] = DEFAULT_DIMENSIONS }) => ({
    outline: "1px solid lightgray",
    overflow: "hidden",
    borderRadius: "4px",
    height,
    width,
    position: "relative",
    boxSizing: "border-box",
    "*": {
      boxSizing: "border-box",
    },
  })
);
