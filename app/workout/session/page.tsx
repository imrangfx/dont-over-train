"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { chest } from "@/app/Data/chest";
import { back } from "@/app/Data/back";
import { biceps } from "@/app/Data/biceps";
import { triceps } from "@/app/Data/triceps";
import { shoulders } from "@/app/Data/shoulders";
import { legs } from "@/app/Data/legs";
import { abs } from "@/app/Data/abs";
import {
  loadWorkoutHistory,
  normalizeInProgressList,
  recoveryHoursForFatigue,
  formatWorkoutSetsSummary,
  workoutDisplayReps,
  workoutSetCount,
  type InProgressWorkoutItem,
  type WorkoutHistoryEntry,
} from "@/lib/workouts";
import { getExerciseTrackingType } from "@/app/Data/exercises";
import {
  getActiveWorkoutSession,
  getLiveElapsedMs,
  clearWorkoutSession,
  isWorkoutStarted,
  setManualWorkoutDuration,
  type ActiveWorkoutSession,
} from "@/lib/workoutSession";
import ManualDurationModal from "@/components/ui/ManualDurationModal";
import WorkoutSessionTimerDisplay from "@/components/WorkoutSessionTimerDisplay";
import {
  buildLiveRecoveryView,
  findLatestRecoverySnapshot,
} from "@/components/recovery/liveRecovery";
import { buildSessionForecast } from "@/components/recovery/sessionForecast";
import SessionForecastCard from "@/components/recovery/SessionForecastCard";

export default function SessionPage() {
  const router = useRouter();
  const [workout, setWorkout] = useState<InProgressWorkoutItem[]>([]);
  const muscleFatigue: Record<string, number> = {};
  const [loaded, setLoaded] = useState(false);
  const [session, setSession] = useState<ActiveWorkoutSession | null>(null);
  const [elapsedMs, setElapsedMs] = useState(0);
  const [manualDurationOpen, setManualDurationOpen] = useState(false);
  const [history, setHistory] = useState<WorkoutHistoryEntry[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem("currentWorkout");
    const parsed = saved ? JSON.parse(saved) : null;
    const list = normalizeInProgressList(parsed);
    const active = getActiveWorkoutSession();

    // Deferred to a microtask so this effect never calls setState
    // synchronously in its own body (avoids cascading renders).
    queueMicrotask(() => {
      // Finished workouts clear currentWorkout — leave the flow entirely.
      if (list.length === 0) {
        if (active) clearWorkoutSession();
        router.replace("/home");
        return;
      }

      setWorkout(list);
      setSession(active);
      setLoaded(true);
    });
  }, [router]);

  useEffect(() => {
    let active = true;
    loadWorkoutHistory().then((result) => {
      if (!active) return;
      setHistory(result.history);
    });
    return () => {
      active = false;
    };
  }, []);

  // Live timer — always derived from persisted sessionStartTime in storage.
  useEffect(() => {
    if (!session) return;

    const tick = () => {
      const active = getActiveWorkoutSession();
      if (!active) {
        setSession(null);
        return;
      }
      setElapsedMs(getLiveElapsedMs());
    };

    queueMicrotask(tick);
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [session]);

  const displayElapsedMs = session ? elapsedMs : 0;

  const liveRecovery = useMemo(() => {
    const snapshot = findLatestRecoverySnapshot(history);
    if (!snapshot) return null;
    return buildLiveRecoveryView(snapshot, Date.now());
  }, [history]);

  const sessionForecast = useMemo(
    () => buildSessionForecast(liveRecovery, workout, Date.now()),
    [liveRecovery, workout],
  );

  workout.forEach((item) => {
    const exercises = {
      ...chest,
      ...back,
      ...biceps,
      ...triceps,
      ...shoulders,
      ...legs,
      ...abs,
    };
    const exerciseData =
      exercises[
      item.slug as keyof typeof exercises
      ];

    if (!exerciseData) return;

    Object.entries(
      exerciseData.fatigue
    ).forEach(([muscle, value]) => {
      const adjustedValue = Math.round(
        value *
        ((workoutSetCount(item.sets) * workoutDisplayReps(item.sets)) /
          (3 * 10))
      );

      muscleFatigue[muscle] =
        (muscleFatigue[muscle] || 0) +
        adjustedValue;
    });
  });
  const hasHighFatigue = Object.values(
    muscleFatigue
  ).some((value) => value >= 70);

  const recoveryRecommendations = Object.entries(
    muscleFatigue
  )
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);
  if (!loaded) return null;

  if (workout.length === 0) {
    return (
      <main className="min-h-screen bg-black text-white flex items-center justify-center">
        <p>No workout selected.</p>
      </main>
    );
  }

  const workoutTitle = [
    ...new Set(workout.map((exercise) => exercise.bodyPart)),
  ].join(" + ");

  const lastBodyPart =
    workout[workout.length - 1]?.bodyPart || "Chest";

  return (
    <main className="min-h-screen bg-black text-white px-6 py-4 pb-[max(2rem,env(safe-area-inset-bottom))]">
      <div className="mx-auto w-full max-w-[430px]">

        <Link
          href={`/workout/${workout[0]?.bodyPart?.toLowerCase() || "chest"}`}
          className="btn-base inline-flex items-center gap-1 rounded-lg text-zinc-400 text-sm hover:text-white"
        >
          ← Back
        </Link>

        <div className="mt-3 mb-5 flex items-start justify-between gap-3">
          <div>
            <h1 className="text-4xl font-bold mb-1">
              Today&apos;s Workout
            </h1>

            <p className="text-zinc-400">
              {workout.length} Exercise
              {workout.length !== 1 ? "s" : ""}
            </p>
          </div>

          {session && (
            <WorkoutSessionTimerDisplay elapsedMs={displayElapsedMs} />
          )}
        </div>

        {/* Currently Training */}
        <div className="border border-lime-400 rounded-3xl p-5 mb-5 bg-[#111]">
          <p className="text-zinc-400 mb-2">
            Training Today
          </p>

          <h2 className="text-4xl text-lime-400 font-semibold">
            {workoutTitle}
          </h2>
        </div>

        {/* Selected Exercises */}
        <div className="rounded-3xl p-5 mb-5 bg-[#111] border border-[#222]">
          <h2 className="text-2xl mb-5">
            Selected Exercises
          </h2>

          {workout.map((exercise, index) => (
            <div
              key={index}
              className="bg-[#1a1a1a] rounded-2xl p-4 flex items-start gap-4 mb-3"
            >
              <div className="w-8 h-8 rounded-full bg-lime-400 flex items-center justify-center text-black font-bold">
                {index + 1}
              </div>

              <div className="flex justify-between w-full">
                <div>
                  <h3 className="text-xl font-medium">
                    {exercise.exercise}
                  </h3>

                  <p className="mt-1 text-sm text-zinc-400">
                    {formatWorkoutSetsSummary(
                      exercise.sets,
                      getExerciseTrackingType(exercise.slug)
                    )}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    const updated = workout.filter((_, i) => i !== index);

                    setWorkout(updated);

                    localStorage.setItem(
                      "currentWorkout",
                      JSON.stringify(updated)
                    );

                    if (updated.length === 0) {
                      clearWorkoutSession();
                      setSession(null);
                      router.push(workout[index].sourcePath);
                    }
                  }}
                  aria-label={`Remove ${exercise.exercise} from this workout`}
                  className="btn-base rounded-xl px-3 py-2 text-sm font-medium text-red-400 transition-all duration-150 hover:bg-red-500/10 hover:text-red-300 active:scale-95 active:bg-red-500/20"
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Muscle Fatigue */}
        <div className="rounded-3xl p-5 mb-5 bg-[#111] border border-[#222]">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl">
              Muscle Fatigue
            </h2>

            <span className="text-xs text-zinc-500">
              Live
            </span>
          </div>

          {Object.entries(muscleFatigue)
            .sort((a, b) => b[1] - a[1])
            .map(([name, value]) => (
              <div key={name} className="mb-5">
                <div className="flex justify-between mb-2">
                  <span>{name
                    .replace(/([A-Z])/g, " $1")
                    .replace(/^./, (s) => s.toUpperCase())}</span>

                  <span
                    className={
                      value <= 30
                        ? "text-lime-400"
                        : value <= 60
                          ? "text-yellow-400"
                          : value <= 80
                            ? "text-orange-400"
                            : "text-red-500"
                    }
                  >
                    {Math.min(value, 100)}%
                  </span>
                </div>

                <div className="w-full h-3 bg-[#222] rounded-full overflow-hidden">
                  <div
                    className={`h-full ${value <= 30
                      ? "bg-lime-400"
                      : value <= 60
                        ? "bg-yellow-400"
                        : value <= 80
                          ? "bg-orange-400"
                          : "bg-red-500"
                      }`}
                    style={{ width: `${Math.min(value, 100)}%` }}
                  />
                </div>
              </div>
            ))}
        </div>

        {sessionForecast ? (
          <SessionForecastCard forecast={sessionForecast} />
        ) : null}

        {hasHighFatigue && (
          <div className="rounded-3xl border border-yellow-500 bg-yellow-500/10 p-4 mb-5">
            <p className="font-semibold text-yellow-400">
              ⚠ High Fatigue Detected
            </p>

            <p className="mt-2 text-sm text-zinc-400">
              One or more muscle groups are highly fatigued.
              Consider training another muscle group or ending
              the workout.
            </p>
          </div>
        )}
        <div className="rounded-3xl bg-[#111] border border-[#222] p-5 mb-5">
          <p className="text-zinc-400 text-sm mb-4">
            Recovery Recommendation
          </p>

          {recoveryRecommendations.map(
            ([muscle, value]) => (
              <div
                key={muscle}
                className="flex justify-between mb-3"
              >
                <span>
                  {muscle
                    .replace(/([A-Z])/g, " $1")
                    .replace(/^./, (s) =>
                      s.toUpperCase()
                    )}
                </span>

                <span className="text-lime-400">
                  {recoveryHoursForFatigue(value)}h
                </span>
              </div>
            )
          )}
        </div>

        {/* Buttons */}
        <button
          type="button"
          onClick={() =>
            router.push(
              `/workout/${lastBodyPart.toLowerCase()}`
            )
          }
          className="btn-base w-full bg-lime-400 text-black font-semibold py-4 rounded-2xl text-xl mb-4 active:brightness-90"
        >
          + Add Another {lastBodyPart} Exercise
        </button>

        <button
          type="button"
          onClick={() => router.push("/")}
          className="btn-base w-full bg-[#111] border border-[#222] text-white py-4 rounded-2xl text-xl mb-4"
        >
          Choose Another Body Part
        </button>

        <button
          type="button"
          onClick={() => {
            if (isWorkoutStarted()) {
              router.replace("/workout/complete");
              return;
            }
            setManualDurationOpen(true);
          }}
          className="btn-base w-full border border-lime-400 text-lime-400 py-4 rounded-2xl text-xl"
        >
          Finish Workout
        </button>

      </div>

      <ManualDurationModal
        open={manualDurationOpen}
        onClose={() => setManualDurationOpen(false)}
        onConfirm={(durationMinutes) => {
          setManualWorkoutDuration(durationMinutes);
          setManualDurationOpen(false);
          router.replace("/workout/complete");
        }}
      />
    </main>
  );
}