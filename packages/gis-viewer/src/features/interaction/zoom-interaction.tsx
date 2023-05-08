import { isNull } from "utils";
import { updateZoomLevel } from "../view/slice";
import { useEffect } from "react";
import { useGisViewerDispatch } from "../../slice";
import { useViewContext } from "../view/context";

export function ZoomInteraction(): null {
  const { ref } = useViewContext();

  const dispatch = useGisViewerDispatch();

  useEffect(() => {
    const element = ref.current;
    if (isNull(element)) return;

    const handleWheel = (event: globalThis.WheelEvent): void => {
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
