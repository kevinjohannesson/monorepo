import { memo } from "react";
import { Coordinate } from "../../types";
import { selectViewState } from "../view/slice";
import { useGisViewerDispatch, useGisViewerSelector } from "../../slice";

interface ButtonControlProps {
  isDisabled?: boolean;
}

const PanRightButton = memo(function ({ isDisabled }: ButtonControlProps) {
  const dispatch = useGisViewerDispatch();

  const handleClick = (deltaPan: Coordinate) => () => {
    // dispatch(updateCenterCoordinateByPixel(deltaPan));
  };

  return (
    <button disabled={isDisabled} onClick={handleClick([300, 0])}>
      ▶️
    </button>
  );
});

export function PanControl() {
  const centerCoordinate = useGisViewerSelector(
    selectViewState("centerCoordinate")
  );

  return (
    <>
      {centerCoordinate.map(Math.round).map((position, i) => (
        <div key={i}>{`${i === 0 ? "x" : "y"}: ${position}`}</div>
      ))}
      <PanRightButton />
    </>
  );
}
