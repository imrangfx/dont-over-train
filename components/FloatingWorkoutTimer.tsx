"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import WorkoutSessionTimerDisplay from "@/components/WorkoutSessionTimerDisplay";
import {
  formatElapsedClock,
  getActiveWorkoutSession,
  getLiveElapsedMs,
} from "@/lib/workoutSession";

/**
 * Global live workout clock — same elapsed source and visuals as the Session timer.
 * Fixed to the viewport (top-right); hidden on `/workout/session`.
 */
export default function FloatingWorkoutTimer() {
  const pathname = usePathname();
  const [elapsedMs, setElapsedMs] = useState(0);
  const [active, setActive] = useState(false);

  useEffect(() => {
    const tick = () => {
      const session = getActiveWorkoutSession();
      if (!session) {
        setActive(false);
        setElapsedMs(0);
        return;
      }
      setActive(true);
      setElapsedMs(getLiveElapsedMs());
    };

    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, []);

  const onSessionPage =
    pathname === "/workout/session" ||
    pathname.startsWith("/workout/session/");

  if (!active || onSessionPage) return null;

  return (
    <Link
      href="/workout/session"
      className="fixed top-14 right-6 z-60"
      aria-label={`Workout timer ${formatElapsedClock(elapsedMs)}. Return to workout session.`}
    >
      <WorkoutSessionTimerDisplay elapsedMs={elapsedMs} />
    </Link>
  );
}
