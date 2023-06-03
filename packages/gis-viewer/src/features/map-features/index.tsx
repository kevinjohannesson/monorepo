import { type MouseEvent, type ReactElement, useEffect, useRef, useState } from "react";
import { type Vector2d, assertNotNull, isNull } from "utils";
import { useLayerContext } from "../layer";
import {
  useViewCenterCoordinate,
  useViewCurrentResolution,
  useViewDimensions,
} from "../view/hooks/use-view-state";
import { useViewExtent } from "../view/hooks/use-view-extent";

type Bounds = [number, number, number, number];

function isWithinBounds(vector: Vector2d, bounds: Bounds): boolean {
  const [x, y] = vector;
  const [xmin, ymin, xmax, ymax] = bounds;

  return x >= xmin && x <= xmax && y >= ymin && y <= ymax;
}

function vectorDistance(a: Vector2d, b: Vector2d): number {
  const dx = a[0] - b[0];
  const dy = a[1] - b[1];
  return Math.sqrt(dx * dx + dy * dy);
}

function isVectorInArrayWithProximity(b: Vector2d, a: Vector2d[], epsilon: number): boolean {
  for (let i = 0; i < a.length; i++) {
    if (vectorDistance(a[i], b) <= epsilon) {
      return true;
    }
  }
  return false;
}

function getVectorInArrayWithProximity(
  b: Vector2d,
  a: ILocation[],
  epsilon: number,
): ILocation | null {
  for (let i = 0; i < a.length; i++) {
    if (vectorDistance(a[i].coordinates, b) <= epsilon) {
      return a[i];
    }
  }
  return null;
}
function findIndexOfVectorInArrayWithProximity(
  b: Vector2d,
  a: Vector2d[],
  epsilon: number,
): number {
  for (let i = 0; i < a.length; i++) {
    if (vectorDistance(a[i], b) <= epsilon) {
      return i;
    }
  }
  return -1;
}

interface ILocation {
  coordinates: Vector2d;
  content: string;
}
export function LocationMarker({ locations }: { locations: ILocation[] }): ReactElement | null {
  const viewDimensions = useViewDimensions();
  const viewCenterCoordinates = useViewCenterCoordinate();
  const viewCurrentResolution = useViewCurrentResolution();
  const layerContext = useLayerContext();

  const ref = useRef<HTMLDivElement | null>(null);

  const [popup, setPopup] = useState<string | null>(null);

  const halfExtentX = (viewDimensions[0] / 2) * viewCurrentResolution;
  const halfExtentY = (viewDimensions[1] / 2) * viewCurrentResolution;
  const currentExtent: Bounds = [
    viewCenterCoordinates[0] - halfExtentX,
    viewCenterCoordinates[1] - halfExtentY,
    viewCenterCoordinates[0] + halfExtentX,
    viewCenterCoordinates[1] + halfExtentY,
  ];

  useEffect(() => {
    const canvas = layerContext.ref.current;
    assertNotNull(canvas);
    // const element = ref.current;
    // assertNotNull(element);
    const listener = (e: globalThis.MouseEvent): void => {
      const coordinatesUnderCursor: Vector2d = [
        currentExtent[0] + e.offsetX * viewCurrentResolution,
        currentExtent[3] - e.offsetY * viewCurrentResolution,
      ];

      const epsilon = 20 * viewCurrentResolution;

      if (!isNull(getVectorInArrayWithProximity(coordinatesUnderCursor, locations, epsilon))) {
        canvas.style.cursor = "pointer";
        // element.classList.remove("hidden");
      } else {
        canvas.style.cursor = "";
        // element.classList.add("hidden");
      }
      // coordinates={[545139, 6868755]}
    };

    canvas.addEventListener("mousemove", listener);

    return () => {
      canvas.removeEventListener("mousemove", listener);
    };
  }, [currentExtent.join(), viewCurrentResolution, JSON.stringify(locations)]);

  useEffect(() => {
    const canvas = layerContext.ref.current;
    assertNotNull(canvas);
    const element = ref.current;
    assertNotNull(element);
    const listener = (e: globalThis.MouseEvent): void => {
      const coordinatesUnderCursor: Vector2d = [
        currentExtent[0] + e.offsetX * viewCurrentResolution,
        currentExtent[3] - e.offsetY * viewCurrentResolution,
      ];

      const epsilon = 20 * viewCurrentResolution;

      const vectorInProximity = getVectorInArrayWithProximity(
        coordinatesUnderCursor,
        locations,
        epsilon,
      );
      if (!isNull(vectorInProximity)) {
        const x =
          Math.abs(vectorInProximity.coordinates[0] - currentExtent[0]) / viewCurrentResolution;
        const y =
          Math.abs(vectorInProximity.coordinates[1] - currentExtent[3]) / viewCurrentResolution;
        element.style.left = x.toString() + "px";
        element.style.top = y.toString() + "px";
        element.classList.toggle("hidden");
        setPopup(vectorInProximity.content);
      } else {
        element.classList.add("hidden");
        setPopup(null);
      }
      // coordinates={[545139, 6868755]}
    };

    canvas.addEventListener("click", listener);

    return () => {
      canvas.removeEventListener("click", listener);
    };
  }, [
    currentExtent.join(),
    viewCurrentResolution,
    JSON.stringify(locations),
    viewDimensions.join(),
  ]);

  useEffect(() => {
    const ctx = layerContext.ref.current?.getContext("2d");
    assertNotNull(ctx);
    const element = ref.current;
    assertNotNull(element);

    const offscreenCanvas = new OffscreenCanvas(viewDimensions[0], viewDimensions[1]);
    const offscreenCtx = offscreenCanvas.getContext("2d");
    assertNotNull(offscreenCtx);

    locations.forEach((loc) => {
      const x = Math.abs(loc.coordinates[0] - currentExtent[0]) / viewCurrentResolution;
      const y = Math.abs(loc.coordinates[1] - currentExtent[3]) / viewCurrentResolution;
      if (isWithinBounds(loc.coordinates, currentExtent)) {
        offscreenCtx.beginPath();
        offscreenCtx.arc(x, y, 10, 0, 2 * Math.PI);
        offscreenCtx.fillStyle = "#048ABF";
        offscreenCtx.fill();
        offscreenCtx.lineWidth = 2;
        offscreenCtx.strokeStyle = "#F25CAF";
        offscreenCtx.stroke();

        // element.style.left = x.toString() + "px";
        // element.style.top = y.toString() + "px";

        // element.classList.remove("hidden");
      } else {
        // element.classList.add("hidden");
        // ctx.clearRect(x - 5, y - 5, 10, 10);
      }
    });

    ctx.drawImage(offscreenCanvas, 0, 0, viewDimensions[0], viewDimensions[1]);

    return () => {
      ctx.clearRect(0, 0, viewDimensions[0], viewDimensions[1]);
    };
  }, [
    JSON.stringify(locations),
    currentExtent.join(),
    // viewCenterCoordinates.join(),
    viewDimensions.join(),
    viewCurrentResolution,
  ]);

  return (
    <div
      className="pointer-events-none absolute pb-5 z-50 hidden -translate-y-full -translate-x-1/2"
      ref={ref}
    >
      <div className="pointer-events-auto px-4 py-2 bg-white drop-shadow-lg rounded-lg">
        {popup}
      </div>
    </div>
  );
  // return null;
}

// interface IFeature {
//   location: {
//     coordinates: Vector2d;
//   };
// }

function MapFeatures({ features }: { features: Array<GeoJSON.Feature<GeoJSON.Point>> }) {
  const viewCurrentResolution = useViewCurrentResolution();
  const viewExtent = useViewExtent();

  const layerContext = useLayerContext();

  const featureInProximity = useRef<GeoJSON.Feature | null>(null);

  const epsilon = 20 * viewCurrentResolution;

  const allFeatureCoordinates = features.map((f) => f.geometry.coordinates);

  useEffect(() => {
    const canvas = layerContext.ref.current;
    assertNotNull(canvas);

    const listener = (e: globalThis.MouseEvent): void => {
      const coordinatesUnderCursor: Vector2d = [
        viewExtent[0] + e.offsetX * viewCurrentResolution,
        viewExtent[3] - e.offsetY * viewCurrentResolution,
      ];

      const indexOfFeatureInProximity = findIndexOfVectorInArrayWithProximity(
        coordinatesUnderCursor,
        allFeatureCoordinates as Vector2d[],
        epsilon,
      );

      if (indexOfFeatureInProximity >= 0) {
        featureInProximity.current = features[indexOfFeatureInProximity];
      } else {
        featureInProximity.current = null;
      }
    };

    canvas.addEventListener("mousemove", listener);

    return () => {
      canvas.removeEventListener("mousemove", listener);
    };
  }, [viewExtent.join(), viewCurrentResolution, allFeatureCoordinates.join()]);

  return null;
}

// type WithValidator<T> = T & { shouldRender: boolean };

// function ValidatorComponent({ shouldRender, ...props }: WithValidator<IRenderingComponentProps>) {
//   if (!shouldRender) return null;
//   return <RenderingComponent {...props} />;
// }

// markers.map( ({position, color, popup, tooltip}) => (

//   <React.Suspense fallback={null}>
{
  /* <Marker position={[0, 0]} color={"blue"}>
  <Marker.Popup>
    <h1>This is a pop up, visible upon click.</h1>
    <p>It contains some markup.</p>
  </Marker.Popup>

  <Marker.Tooltip>
    This is a tooltip, visible upon hover. This one contains no markup
  </Marker.Tooltip>
</Marker>; */
}
// </React.Suspense>
//   ))
