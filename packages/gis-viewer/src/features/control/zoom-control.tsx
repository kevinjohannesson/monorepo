import { memo } from "react";
import {
  selectViewState,
  selectZoomLevel,
  updateZoomLevelToClosestInteger,
} from "../view/slice";
import { useGisViewerDispatch, useGisViewerSelector } from "../../slice";
import { AiOutlinePlus } from "react-icons/ai";
import { AiOutlineMinus } from "react-icons/ai";
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

export function ZoomControl() {
  const [minZoomLevel, maxZoomLevel] = useGisViewerSelector(
    selectViewState("zoomLevelLimits")
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
