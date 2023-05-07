import { useEffect } from "react";
import { isNull } from "utils";
import { useGisViewerDispatch } from "../../slice";
import { useViewContext } from "../view/context";
import { updateZoomLevel } from "../view/slice";

export function ZoomInteraction() {
  const { ref } = useViewContext();

  const dispatch = useGisViewerDispatch();

  useEffect(() => {
    const element = ref.current;
    if (isNull(element)) return;

    const handleWheel = (event: globalThis.WheelEvent) => {
      event.preventDefault();

      dispatch(updateZoomLevel(event.deltaY < 0 ? -1 : 1));

      event.stopPropagation();
    };

    element.addEventListener("wheel", handleWheel);

    return () => {
      element.removeEventListener("wheel", handleWheel);
    };
  }, []);

  return null;
}
