"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { chest } from "@/app/Data/chest";
import { back } from "@/app/Data/back";
import { biceps } from "@/app/Data/biceps";
import { triceps } from "@/app/Data/triceps";
import { shoulders } from "@/app/Data/shoulders";
import { legs } from "@/app/Data/legs";
import { abs } from "@/app/Data/abs";
import { recoveryHoursForFatigue, type InProgressWorkoutItem } from "@/lib/workouts";
import {
  formatElapsedClock,
  getActiveWorkoutSession,
  getLiveElapsedMs,
  clearWorkoutSession,
  type ActiveWorkoutSession,
} from "@/lib/workoutSession";

export default function SessionPage() {
  const router = useRouter();
  const [workout, setWorkout] = useState<InProgressWorkoutItem[]>([]);
  const muscleFatigue: Record<string, number> = {};
  const [loaded, setLoaded] = useState(false);
  const [session, setSession] = useState<ActiveWorkoutSession | null>(null);
  const [elapsedMs, setElapsedMs] = useState(0);

  useEffect(() => {
    const saved = localStorage.getItem("currentWorkout");
    const parsed = saved ? JSON.parse(saved) : null;
    const list: InProgressWorkoutItem[] = parsed
      ? Array.isArray(parsed)
        ? parsed
        : [parsed]
      : [];
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
        ((item.sets * item.reps) /
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
            <div
              className="shrink-0 rounded-2xl border border-lime-400/40 bg-lime-400/10 px-3 py-2 text-right"
              aria-live="polite"
              aria-label="Workout timer"
            >
              <p className="text-[10px] font-semibold uppercase tracking-wide text-lime-400/80">
                Time
              </p>
              <p className="font-mono text-lg font-semibold tabular-nums text-lime-400">
                {formatElapsedClock(displayElapsedMs)}
              </p>
            </div>
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

                  <p className="text-zinc-400">
                    {exercise.sets} sets × {exercise.reps} reps
                  </p>
                  {exercise.setWeights?.some((w: number | "") => w !== "") ? (
                    <p className="text-sm text-zinc-500 mt-1">
                      Weights:{" "}
                      {exercise.setWeights
                        .map((w: number | "") => (w === "" ? "-" : `${w}kg`))
                        .join(" • ")}
                    </p>
                  ) : exercise.weight ? (
                    <p className="text-sm text-zinc-500 mt-1">
                      Weight: {exercise.weight}kg
                    </p>
                  ) : null}
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

        {session ? (
          <button
            type="button"
            onClick={() => router.replace("/workout/complete")}
            className="btn-base w-full border border-lime-400 text-lime-400 py-4 rounded-2xl text-xl"
          >
            Finish Workout
          </button>
        ) : (
          <button
            type="button"
            onClick={() => router.replace("/workout/start")}
            className="btn-base w-full border border-lime-400 bg-lime-400/10 text-lime-400 py-4 rounded-2xl text-xl font-semibold"
          >
            Start Workout
          </button>
        )}

      </div>
    </main>
  );
}