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

export default function SessionPage() {
  const router = useRouter();
  const [workout, setWorkout] = useState<any[]>([]);
  const muscleFatigue: Record<string, number> = {};
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("currentWorkout");

    if (saved) {
      const parsed = JSON.parse(saved);

      setWorkout(
        Array.isArray(parsed)
          ? parsed
          : [parsed]
      );
    }
    setLoaded(true);
  }, []);

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
    <main className="min-h-screen bg-black text-white px-6 py-4">
      <div className="max-w-md mx-auto">

        <Link
          href={`/workout/${workout[0]?.bodyPart?.toLowerCase() || "chest"}`}
          className="text-zinc-400 text-sm inline-block mb-3"
        >
          ← Back
        </Link>

        <h1 className="text-4xl font-bold mb-1">
          Today's Workout
        </h1>

        <p className="text-zinc-400 mb-5">
          {workout.length} Exercise
          {workout.length !== 1 ? "s" : ""}
        </p>

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
                ✓
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
                  onClick={() => {
                    const updated = workout.filter((_, i) => i !== index);

                    setWorkout(updated);

                    localStorage.setItem(
                      "currentWorkout",
                      JSON.stringify(updated)
                    );

                    if (updated.length === 0) {
                      router.push(workout[index].sourcePath);
                    }
                  }}
                  className="
  rounded-xl
  px-3
  py-2
  text-sm
  font-medium
  text-red-400
  transition-all
  duration-150
  hover:bg-red-500/10
  hover:text-red-300
  active:scale-95
  active:bg-red-500/20
"
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
                  {value <= 30
                    ? "24h"
                    : value <= 60
                      ? "48h"
                      : value <= 80
                        ? "72h"
                        : "96h"}
                </span>
              </div>
            )
          )}
        </div>

        {/* Buttons */}
        <button
          onClick={() =>
            router.push(
              `/workout/${lastBodyPart.toLowerCase()}`
            )
          }
          className="w-full bg-lime-400 text-black font-semibold py-4 rounded-2xl text-xl mb-4 transition-all duration-150 active:scale-[0.97] active:brightness-90"
        >
          + Add Another {lastBodyPart} Exercise
        </button>

        <button
          onClick={() => router.push("/")}
          className="w-full bg-[#111] border border-[#222] text-white py-4 rounded-2xl text-xl mb-4 transition-all duration-150 active:scale-[0.97]"
        >
          Choose Another Body Part
        </button>

        <button
          onClick={() => router.push("/workout/complete")}
          className="w-full border border-lime-400 text-lime-400 py-4 rounded-2xl text-xl"
        >
          Finish Workout
        </button>

      </div>
    </main >
  );
}