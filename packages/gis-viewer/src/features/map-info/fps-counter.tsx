import { type ReactElement, useEffect, useRef } from "react";
import { assertNotNull, getClosestNumberFrom, isNull } from "utils";

export function FpsCounter(): ReactElement {
  const frameCountRef = useRef(0);
  const lastTimeRef = useRef(performance.now());
  const fpsElementRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function update(): void {
      if (isNull(fpsElementRef.current)) return;

      frameCountRef.current++;

      const currentTime = performance.now();
      const deltaTime = currentTime - lastTimeRef.current;

      if (deltaTime > 1000) {
        const fps = (frameCountRef.current / deltaTime) * 1000;
        fpsElementRef.current.innerText = `FPS: ${fps.toFixed(2)}`;

        frameCountRef.current = 0;
        lastTimeRef.current = currentTime;

        const textColorClassName = {
          60: "text-green-500",
          58: "text-green-600",
          55: "text-green-700",
          50: "text-orange-500",
          45: "text-orange-600",
          40: "text-orange-700",
          35: "text-red-500",
          30: "text-red-600",
          25: "text-red-700",
        };

        const closestColor = getClosestNumberFrom(Object.keys(textColorClassName).map(Number), fps);

        Object.keys(textColorClassName).forEach((k) => {
          assertNotNull(fpsElementRef.current);
          fpsElementRef.current.classList.remove(
            textColorClassName[k as unknown as keyof typeof textColorClassName],
          );
        });

        fpsElementRef.current.classList.add(
          textColorClassName[closestColor as unknown as keyof typeof textColorClassName],
        );
      }

      requestAnimationFrame(update);
    }

    const animationId = requestAnimationFrame(update);

    return () => {
      cancelAnimationFrame(animationId);
    }; // Clean up on unmount
  }, []);

  return (
    <div className="text-sm font-mono" ref={fpsElementRef}>
      00.00
    </div>
  );
}
