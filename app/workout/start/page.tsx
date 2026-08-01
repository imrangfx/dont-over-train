"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useCallback, useEffect, useState } from "react";
import {
  formatClockTime,
  isWorkoutStarted,
  startWorkoutSession,
} from "@/lib/workoutSession";
import {
  resolveWorkoutNextPath,
  workoutStartBackHref,
} from "@/lib/workoutNavigation";
import { loadWorkoutHistory, normalizeInProgressList } from "@/lib/workouts";
import {
  buildLiveRecoveryView,
  findLatestRecoverySnapshot,
  type LiveRecoveryView,
} from "@/components/recovery/liveRecovery";
import {
  bodyPartSlugFromWorkoutPath,
  findRecoveryCheckWarning,
  type RecoveryCheckWarning,
} from "@/components/recovery/workoutRecoveryCheck";
import RecoveryCheckModal from "@/components/recovery/RecoveryCheckModal";

type PendingStart = "timed" | "untimed";

function StartWorkoutContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [clock, setClock] = useState(() => formatClockTime());
  const [ready, setReady] = useState(false);
  const [liveView, setLiveView] = useState<LiveRecoveryView | null>(null);
  const [warning, setWarning] = useState<RecoveryCheckWarning | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [pendingStart, setPendingStart] = useState<PendingStart | null>(null);

  const nextPath = resolveWorkoutNextPath(searchParams.get("next"), "/home");
  const backHref = workoutStartBackHref(nextPath);

  useEffect(() => {
    let active = true;

    queueMicrotask(() => {
      void (async () => {
        const saved = localStorage.getItem("currentWorkout");
        const parsed = saved ? JSON.parse(saved) : null;
        const inProgress = normalizeInProgressList(parsed);
        const workoutAlreadyUnderway =
          isWorkoutStarted() || inProgress.length > 0;

        // Mid-workout (timed or untimed) — skip Start and open the exercise list.
        if (workoutAlreadyUnderway) {
          router.replace(nextPath);
          return;
        }

        // Load live recovery for the pre-start check (read-only; never writes).
        try {
          const { history } = await loadWorkoutHistory();
          if (!active) return;
          const snapshot = findLatestRecoverySnapshot(history);
          if (snapshot) {
            setLiveView(buildLiveRecoveryView(snapshot, Date.now()));
          }
        } catch {
          // Recovery check is advisory — proceed without blocking start.
        }

        if (!active) return;
        setReady(true);
      })();
    });

    return () => {
      active = false;
    };
  }, [router, nextPath]);

  useEffect(() => {
    const tick = setInterval(() => {
      setClock(formatClockTime());
    }, 1000);

    return () => clearInterval(tick);
  }, []);

  const proceedToWorkout = useCallback(
    (mode: PendingStart) => {
      if (mode === "timed") {
        startWorkoutSession();
      }
      router.replace(nextPath);
    },
    [router, nextPath],
  );

  function attemptStart(mode: PendingStart) {
    const bodyPartSlug = bodyPartSlugFromWorkoutPath(nextPath);
    const check =
      liveView && bodyPartSlug
        ? findRecoveryCheckWarning(liveView, bodyPartSlug)
        : null;

    if (check) {
      setWarning(check);
      setPendingStart(mode);
      setModalOpen(true);
      return;
    }

    proceedToWorkout(mode);
  }

  function handleContinueAnyway() {
    const mode = pendingStart ?? "untimed";
    setModalOpen(false);
    setWarning(null);
    setPendingStart(null);
    proceedToWorkout(mode);
  }

  function handleChooseAnotherMuscle() {
    setModalOpen(false);
    setWarning(null);
    setPendingStart(null);
    router.push(backHref);
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
              onClick={() => attemptStart("timed")}
              className="btn-base w-full rounded-2xl bg-lime-400 py-5 text-2xl font-semibold text-black hover:brightness-110 active:brightness-95"
            >
              Start Workout
            </button>

            <button
              type="button"
              onClick={() => attemptStart("untimed")}
              className="btn-base w-full rounded-2xl border border-[#333] bg-[#111] py-4 text-lg font-semibold text-white hover:bg-[#1a1a1a] active:bg-[#222]"
            >
              Continue Without Timer
            </button>
          </div>
        </div>
      </div>

      {warning ? (
        <RecoveryCheckModal
          open={modalOpen}
          warning={warning}
          onContinue={handleContinueAnyway}
          onChooseAnother={handleChooseAnotherMuscle}
        />
      ) : null}
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
