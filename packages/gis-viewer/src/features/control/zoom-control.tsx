import { AiOutlineMinus, AiOutlinePlus } from "react-icons/ai";
import { type ReactElement, memo } from "react";
import {
  selectViewState,
  selectZoomLevel,
  updateZoomLevelToClosestInteger,
} from "../view/slice";
import { useGisViewerDispatch, useGisViewerSelector } from "../../slice";

interface ButtonControlProps {
  isDisabled?: boolean;
}

const ZoomInButton = memo(function ({ isDisabled }: ButtonControlProps) {
  const dispatch = useGisViewerDispatch();

  const handleClick = (deltaZoom: number) => () => {
    dispatch(updateZoomLevelToClosestInteger(deltaZoom));
  };

  return (
    <button
      className="control button"
      disabled={isDisabled}
      onClick={handleClick(1)}
    >
      <AiOutlinePlus />
    </button>
  );
});
ZoomInButton.displayName = "ZoomInButton";

const ZoomOutButton = memo(function ({ isDisabled }: ButtonControlProps) {
  const dispatch = useGisViewerDispatch();

  const handleClick = (deltaZoom: number) => () => {
    dispatch(updateZoomLevelToClosestInteger(deltaZoom));
  };

  return (
    <button
      className="control button"
      disabled={isDisabled}
      onClick={handleClick(-1)}
    >
      <AiOutlineMinus />
    </button>
  );
});
ZoomOutButton.displayName = "ZoomOutButton";

export function ZoomControl(): ReactElement {
  const [minZoomLevel, maxZoomLevel] = useGisViewerSelector(
    selectViewState("zoomLevelLimits"),
  );

  const zoomLevel = useGisViewerSelector(selectZoomLevel);

  const isZoomInDisabled = zoomLevel >= maxZoomLevel;
  const isZoomOutDisabled = zoomLevel <= minZoomLevel;

  return (
    <div className="tooltip left flex flex-col items-end gap-2">
      <ZoomInButton isDisabled={isZoomInDisabled} />
      <ZoomOutButton isDisabled={isZoomOutDisabled} />
      <span className="tooltip-content whitespace-nowrap">
        Current zoomlevel: {zoomLevel.toFixed(2)}
      </span>
    </div>
  );
}
