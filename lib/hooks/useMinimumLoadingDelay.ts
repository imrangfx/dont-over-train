import { useEffect, useState } from "react";

/**
 * Keeps a brief branded loading screen on-screen for at least `durationMs`
 * before a route's real content is revealed. These routes render
 * synchronously from local data (no real network fetch to wait on), so
 * without this the "Before You Start" / "Before You Lift" guidance would
 * never actually be visible. Capped short by default so navigation never
 * feels artificially slow.
 */
export function useMinimumLoadingDelay(durationMs = 700): boolean {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), durationMs);
    return () => clearTimeout(timer);
  }, [durationMs]);

  return isLoading;
}
