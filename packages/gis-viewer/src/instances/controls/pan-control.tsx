import { memo } from "react";
import { useInstanceDispatch, useInstanceSelector } from "../../store-hooks";
import { Coordinate } from "../../types";
import { selectViewState, updateCenterCoordinateByPixel } from "../view/slice";

interface ButtonControlProps {
  isDisabled?: boolean;
}

const PanRightButton = memo(function ({ isDisabled }: ButtonControlProps) {
  const dispatch = useInstanceDispatch();

  const handleClick = (deltaPan: Coordinate) => () => {
    dispatch(updateCenterCoordinateByPixel(deltaPan));
  };

  return (
    <button disabled={isDisabled} onClick={handleClick([300, 0])}>
      ▶️
    </button>
  );
});

export function PanControl() {
  const centerCoordinate = useInstanceSelector(
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
