import { type ReactElement } from "react";
import { TbCrosshair } from "react-icons/tb";
import { selectViewState } from "../view/slice";
import { useGisViewerSelector } from "../../slice";

export function ViewCenterCoordinatesMapInfoItem(): ReactElement {
  const centerCoordinate = useGisViewerSelector(selectViewState("centerCoordinate"));

  return (
    <div className={`flex gap-2 items-center text-sm font-mono text-slate-700`}>
      <TbCrosshair />
      <span>{centerCoordinate.map((p) => p.toFixed(0)).join(", ")}</span>
    </div>
  );
}
