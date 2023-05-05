import { memo } from "react";
import { useInstanceDispatch, useInstanceSelector } from "../../store-hooks";
import {
  selectViewState,
  selectZoomLevel,
  updateZoomLevelToClosestInteger,
} from "../view/slice";

interface ButtonControlProps {
  isDisabled?: boolean;
}

const ZoomInButton = memo(function ({ isDisabled }: ButtonControlProps) {
  const dispatch = useInstanceDispatch();

  const handleClick = (deltaZoom: number) => () => {
    dispatch(updateZoomLevelToClosestInteger(deltaZoom));
  };

  return (
    <button disabled={isDisabled} onClick={handleClick(1)}>
      +
    </button>
  );
});

const ZoomOutButton = memo(function ({ isDisabled }: ButtonControlProps) {
  const dispatch = useInstanceDispatch();

  const handleClick = (deltaZoom: number) => () => {
    dispatch(updateZoomLevelToClosestInteger(deltaZoom));
  };

  return (
    <button disabled={isDisabled} onClick={handleClick(-1)}>
      -
    </button>
  );
});

export function ZoomControl() {
  const [minZoomLevel, maxZoomLevel] = useInstanceSelector(
    selectViewState("zoomLevelLimits")
  );

  const zoomLevel = useInstanceSelector(selectZoomLevel);

  const isZoomInDisabled = zoomLevel >= maxZoomLevel;
  const isZoomOutDisabled = zoomLevel <= minZoomLevel;

  return (
    <>
      {zoomLevel.toFixed(2)}
      <ZoomInButton isDisabled={isZoomInDisabled} />
      <ZoomOutButton isDisabled={isZoomOutDisabled} />
    </>
  );
}
