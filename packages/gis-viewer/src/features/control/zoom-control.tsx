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
  console.log("ZoomInButton");
  const dispatch = useGisViewerDispatch();

  const handleClick = (deltaZoom: number) => () => {
    dispatch(updateZoomLevelToClosestInteger(deltaZoom));
  };

  return (
    <button className="control" disabled={isDisabled} onClick={handleClick(1)}>
      <AiOutlinePlus />
    </button>
  );
});

const ZoomOutButton = memo(function ({ isDisabled }: ButtonControlProps) {
  console.log("ZoomOutButton");

  const dispatch = useGisViewerDispatch();

  const handleClick = (deltaZoom: number) => () => {
    dispatch(updateZoomLevelToClosestInteger(deltaZoom));
  };

  return (
    <button className="control" disabled={isDisabled} onClick={handleClick(-1)}>
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
    <div className="tooltip controls flex flex-col gap-2">
      <ZoomInButton isDisabled={isZoomInDisabled} />
      <ZoomOutButton isDisabled={isZoomOutDisabled} />
      <span className="tooltip-content whitespace-nowrap">
        Current zoomlevel: {zoomLevel.toFixed(2)}
      </span>
    </div>
  );
}
