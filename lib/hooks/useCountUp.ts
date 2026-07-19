import { useEffect, useRef, useState } from "react";

function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

function prefersReducedMotion(): boolean {
  return (
    typeof window !== "undefined" &&
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

/**
 * Reusable count-up animation hook (no new dependency). Animates smoothly
 * from whatever is currently displayed to a new `target` whenever it
 * changes, via requestAnimationFrame + easeOutCubic. Purely presentational
 * - never recomputes or alters the underlying value, and skips the
 * animation entirely for prefers-reduced-motion users.
 */
export function useCountUp(target: number, durationMs = 700): number {
  const [display, setDisplay] = useState(target);
  const displayRef = useRef(target);
  const frameRef = useRef<number | null>(null);

  useEffect(() => {
    displayRef.current = display;
  }, [display]);

  useEffect(() => {
    if (prefersReducedMotion()) {
      // Deferred via rAF (rather than called synchronously here) so the
      // jump-to-target still happens through a callback, not the effect
      // body itself - keeps this branch symmetric with the animated path.
      frameRef.current = requestAnimationFrame(() => setDisplay(target));
      return () => {
        if (frameRef.current != null) cancelAnimationFrame(frameRef.current);
      };
    }

    const from = displayRef.current;
    if (Math.abs(from - target) < 0.001) return;

    const startTime = performance.now();

    function tick(now: number) {
      const progress = Math.min(1, (now - startTime) / durationMs);
      const eased = easeOutCubic(progress);
      setDisplay(from + (target - from) * eased);

      if (progress < 1) {
        frameRef.current = requestAnimationFrame(tick);
      }
    }

    frameRef.current = requestAnimationFrame(tick);

    return () => {
      if (frameRef.current != null) cancelAnimationFrame(frameRef.current);
    };
  }, [target, durationMs]);

  return display;
}
