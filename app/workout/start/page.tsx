"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import {
  formatClockTime,
  isWorkoutStarted,
  startWorkoutSession,
} from "@/lib/workoutSession";
import {
  resolveWorkoutNextPath,
  workoutStartBackHref,
} from "@/lib/workoutNavigation";

function StartWorkoutContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [clock, setClock] = useState(() => formatClockTime());
  const [ready, setReady] = useState(false);

  const nextPath = resolveWorkoutNextPath(searchParams.get("next"), "/home");
  const backHref = workoutStartBackHref(nextPath);

  useEffect(() => {
    queueMicrotask(() => {
      // Timer already running (e.g. adding another section mid-workout) —
      // skip Start and go straight to the selected exercise list.
      if (isWorkoutStarted()) {
        router.replace(nextPath);
        return;
      }

      setReady(true);
    });
  }, [router, nextPath]);

  useEffect(() => {
    const tick = setInterval(() => {
      setClock(formatClockTime());
    }, 1000);

    return () => clearInterval(tick);
  }, []);

  function handleStartWorkout() {
    startWorkoutSession();
    router.replace(nextPath);
  }

  function handleContinueWithoutTimer() {
    router.replace(nextPath);
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

  return (
    <main className="flex min-h-screen flex-col bg-black px-6 py-8 pb-[max(2rem,env(safe-area-inset-bottom))] text-white">
      <div className="mx-auto flex w-full max-w-[430px] flex-1 flex-col">
        <Link
          href={backHref}
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

          <div className="mt-12 flex w-full max-w-[320px] flex-col gap-3">
            <button
              type="button"
              onClick={handleStartWorkout}
              className="btn-base w-full rounded-2xl bg-lime-400 py-5 text-2xl font-semibold text-black hover:brightness-110 active:brightness-95"
            >
              Start Workout
            </button>

            <button
              type="button"
              onClick={handleContinueWithoutTimer}
              className="btn-base w-full rounded-2xl border border-[#333] bg-[#111] py-4 text-lg font-semibold text-white hover:bg-[#1a1a1a] active:bg-[#222]"
            >
              Continue Without Timer
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}

export default function StartWorkoutPage() {
  return (
    <Suspense
      fallback={
        <main
          role="status"
          aria-label="Loading"
          className="flex min-h-screen items-center justify-center bg-black"
        >
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-zinc-700 border-t-lime-400" />
        </main>
      }
    >
      <StartWorkoutContent />
    </Suspense>
  );
}
