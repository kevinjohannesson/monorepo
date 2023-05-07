import { memo } from "react";
import { Coordinate } from "../../types";
import { selectViewState, updateCenterCoordinateByPixel } from "../view/slice";
import { useGisViewerDispatch, useGisViewerSelector } from "../../slice";
import { RiArrowLeftSLine } from "react-icons/ri";
import { RiArrowDownSLine } from "react-icons/ri";
import { RiArrowRightSLine } from "react-icons/ri";
import { RiArrowUpSLine } from "react-icons/ri";

const DEFAULT_DELTA_PAN = 100;

interface ButtonControlProps {
  isDisabled?: boolean;
}

const PanUpButton = memo(function ({ isDisabled }: ButtonControlProps) {
  const dispatch = useGisViewerDispatch();

  const handleClick = () => {
    dispatch(updateCenterCoordinateByPixel([0, DEFAULT_DELTA_PAN]));
  };

  return (
    <button
      type="button"
      className="col-span-2 flex items-center justify-center"
      disabled={isDisabled}
      onClick={handleClick}
    >
      <RiArrowUpSLine />
    </button>
  );
});

const PanLeftButton = memo(function ({ isDisabled }: ButtonControlProps) {
  const dispatch = useGisViewerDispatch();

  const handleClick = () => {
    dispatch(updateCenterCoordinateByPixel([-DEFAULT_DELTA_PAN, 0]));
  };

  return (
    <button
      type="button"
      className="flex items-center justify-start"
      disabled={isDisabled}
      onClick={handleClick}
    >
      <RiArrowLeftSLine />
    </button>
  );
});

const PanRightButton = memo(function ({ isDisabled }: ButtonControlProps) {
  const dispatch = useGisViewerDispatch();

  const handleClick = () => {
    dispatch(updateCenterCoordinateByPixel([DEFAULT_DELTA_PAN, 0]));
  };

  return (
    <button
      type="button"
      className="flex items-center justify-end"
      disabled={isDisabled}
      onClick={handleClick}
    >
      <RiArrowRightSLine />
    </button>
  );
});

const PanDownButton = memo(function ({ isDisabled }: ButtonControlProps) {
  const dispatch = useGisViewerDispatch();

  const handleClick = () => {
    dispatch(updateCenterCoordinateByPixel([0, -DEFAULT_DELTA_PAN]));
  };

  return (
    <button
      type="button"
      className="col-span-2 flex items-center justify-center"
      disabled={isDisabled}
      onClick={handleClick}
    >
      <RiArrowDownSLine />
    </button>
  );
});

function CenterCoordinateTooltip() {
  const centerCoordinate = useGisViewerSelector(
    selectViewState("centerCoordinate")
  );

  return (
    <div className="tooltip-content flex flex-col">
      <div>{`Center coordinates`}</div>
      <div>{`x: ${Math.round(centerCoordinate[0])}, y: ${Math.round(
        centerCoordinate[1]
      )}`}</div>
    </div>
  );
}

export function PanControl() {
  return (
    <div className="tooltip left">
      <div className="control joystick w-12 h-12 grid grid-rows-3 grid-cols-2 rounded-full">
        <PanUpButton />
        <PanLeftButton />
        <PanRightButton />
        <PanDownButton />
      </div>

      <CenterCoordinateTooltip />
    </div>
  );
}
