import { useEffect, useRef, useState, type RefObject } from "react";

export type ContainerSize = { width: number; height: number };

/**
 * Reusable hook that tracks an element's rendered pixel size via
 * ResizeObserver. Used by ExerciseChart to place SVG points at exact
 * pixel coordinates (rather than relying on viewBox scaling), so it stays
 * crisp and interaction math (tooltip hit-testing) stays simple. Safe for
 * SSR - returns {0,0} until mounted and observed client-side.
 */
export function useContainerSize<T extends HTMLElement>(): {
  ref: RefObject<T | null>;
  size: ContainerSize;
} {
  const ref = useRef<T | null>(null);
  const [size, setSize] = useState<ContainerSize>({ width: 0, height: 0 });

  useEffect(() => {
    const element = ref.current;
    if (!element || typeof ResizeObserver === "undefined") return;

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) return;
      const { width, height } = entry.contentRect;
      setSize((prev) => (prev.width === width && prev.height === height ? prev : { width, height }));
    });

    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return { ref, size };
}
