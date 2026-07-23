"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  formatClockTime,
  getActiveWorkoutSession,
  startWorkoutSession,
} from "@/lib/workoutSession";
import type { InProgressWorkoutItem } from "@/lib/workouts";

export default function StartWorkoutPage() {
  const router = useRouter();
  const [clock, setClock] = useState(() => formatClockTime());
  const [exerciseCount, setExerciseCount] = useState(0);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("currentWorkout");
    const parsed = saved ? JSON.parse(saved) : null;
    const list: InProgressWorkoutItem[] = parsed
      ? Array.isArray(parsed)
        ? parsed
        : [parsed]
      : [];

    queueMicrotask(() => {
      // Active session → resume the live workout, never re-show Start.
      if (getActiveWorkoutSession()) {
        router.replace("/workout/session");
        return;
      }

      // No exercises left (workout already finished / cleared) → leave flow.
      if (list.length === 0) {
        router.replace("/home");
        return;
      }

      setExerciseCount(list.length);
      setReady(true);
    });
  }, [router]);

  useEffect(() => {
    const tick = setInterval(() => {
      setClock(formatClockTime());
    }, 1000);

    return () => clearInterval(tick);
  }, []);

  function handleStart() {
    startWorkoutSession();
    // replace so Back from session cannot return to Start after starting.
    router.replace("/workout/session");
  }

  if (!ready) {
    return (
      <main
        role="status"
        aria-label="Loading"
        className="flex min-h-screen items-center justify-center bg-black"
      >
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-zinc-700 border-t-lime-400" />
      </main>
    );
  }

  const exerciseLabel = `${exerciseCount} exercise${exerciseCount !== 1 ? "s" : ""} selected`;

  return (
    <main className="flex min-h-screen flex-col bg-black px-6 py-8 pb-[max(2rem,env(safe-area-inset-bottom))] text-white">
      <div className="mx-auto flex w-full max-w-[430px] flex-1 flex-col">
        <Link
          href="/workout/session"
          className="btn-base inline-flex items-center gap-1 rounded-lg text-sm text-zinc-400 hover:text-white"
        >
          ← Back
        </Link>

        <div className="flex flex-1 flex-col items-center justify-center text-center">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-zinc-500">
            Current Time
          </p>

          <p className="mt-4 text-6xl font-bold tracking-tight text-white tabular-nums">
            {clock}
          </p>

          <p className="mt-6 max-w-[280px] text-base leading-relaxed text-zinc-400">
            {exerciseLabel}. Start when you&apos;re set — every second counts
            from here.
          </p>

          <button
            type="button"
            onClick={handleStart}
            className="btn-base mt-12 w-full max-w-[320px] rounded-2xl bg-lime-400 py-5 text-2xl font-semibold text-black hover:brightness-110 active:brightness-95"
          >
            Start Workout
          </button>
        </div>
      </div>
    </main>
  );
}
