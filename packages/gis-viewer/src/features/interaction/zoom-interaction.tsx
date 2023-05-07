import { useEffect, useRef } from "react";
import { useViewContext } from "../view/context";
import { useGisViewerDispatch } from "../../slice";
import { isNull } from "utils";
// import { useInstanceDispatch } from "../../store-hooks";
// import { useViewContext } from "../view";
// import { updateZoomLevel } from "../view/slice";

export function ZoomInteraction() {
  const { ref } = useViewContext();

  const lastWheelEventTimestamp = useRef<number>(0);

  const dispatch = useGisViewerDispatch();

  useEffect(() => {
    const element = ref.current;
    if (isNull(element)) return;

    const handleWheel = (event: globalThis.WheelEvent) => {
      event.preventDefault();

      // Get the current timestamp
      const currentTimestamp = new Date().getTime();

      // Calculate the time difference since the last wheel event
      const timeDifference = currentTimestamp - lastWheelEventTimestamp.current;

      // Update the last wheel event timestamp
      lastWheelEventTimestamp.current = currentTimestamp;

      // Calculate the velocity of the zooming (a larger value for faster scrolling)
      const zoomVelocity = Math.min(1, 200 / timeDifference);

      // Set a base scaling factor to control the zoom speed
      const baseScalingFactor = 0.01;

      // Apply the zoom velocity to the scaling factor
      const scalingFactor = baseScalingFactor * zoomVelocity;

      // Apply the scaling factor to the deltaY value
      const zoomChange = event.deltaY * scalingFactor;

      // dispatch(updateZoomLevel(-zoomChange));

      event.stopPropagation();
    };

    console.log("adding wheel");
    element.addEventListener("wheel", handleWheel);

    return () => {
      element.removeEventListener("wheel", handleWheel);
    };
  }, [ref, dispatch]);

  return null;
}
