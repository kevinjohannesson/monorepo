import { MdZoomIn } from "react-icons/md";
import { type ReactElement } from "react";
import { selectZoomLevel } from "../view/slice";
import { useGisViewerSelector } from "../../slice";

export function ZoomLevelInfoItem(): ReactElement {
  const zoomLevel = useGisViewerSelector(selectZoomLevel);

  return (
    <div
      className={`flex gap-2 items-center text-sm text-slate-700 z-10 font-mono`}
    >
      <MdZoomIn />
      <span>{zoomLevel.toFixed(2)}</span>
    </div>
  );
}
