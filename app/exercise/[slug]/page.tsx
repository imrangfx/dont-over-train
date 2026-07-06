"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import {
  useRouter,
  useSearchParams,
  useParams,
} from "next/navigation";
import { chest } from "@/app/Data/chest";
import { back } from "@/app/Data/back";
import { biceps } from "@/app/Data/biceps";
import { triceps } from "@/app/Data/triceps";
import { shoulders } from "@/app/Data/shoulders";
import { legs } from "@/app/Data/legs";
import { abs } from "@/app/Data/abs";
import { forearms } from "@/app/Data/forearms";

export default function ExercisePage() {
  const [sets, setSets] = useState(3);
  const [reps, setReps] = useState(10);
  const [weight, setWeight] = useState<number | "">("");
  const [currentFatigue, setCurrentFatigue] = useState<
    Record<string, number>
  >({});
  const router = useRouter();
  const searchParams = useSearchParams();

  const from = searchParams.get("from") || "/";

  const params = useParams();
  const slug = params.slug as string;

  const BASELINE_SETS = 3;
  const BASELINE_REPS = 10;

  const exercises = {
    ...chest,
    ...back,
    ...biceps,
    ...triceps,
    ...shoulders,
    ...legs,
    ...abs,
    ...forearms,
  };

  useEffect(() => {
    const savedWorkout = JSON.parse(
      localStorage.getItem("currentWorkout") || "[]"
    );

    const fatigue: Record<string, number> = {};

    savedWorkout.forEach((exercise: { fatigueBreakdown: Record<string, number> }) => {
      Object.entries(exercise.fatigueBreakdown).forEach(
        ([muscle, value]) => {
          fatigue[muscle] =
            (fatigue[muscle] || 0) + Number(value);
        }
      );
    });

    setCurrentFatigue(fatigue);
  }, []);

  const exerciseData =
    exercises[slug as keyof typeof exercises];
  if (!exerciseData) {
    return null;
  }
  const exerciseName = exerciseData.name;
  const sortedMuscles = Object.entries(
    exerciseData.fatigue
  ).sort((a, b) => b[1] - a[1]);

  const primaryMuscle = sortedMuscles[0]?.[0];

  const currentMuscleFatigue =
    currentFatigue[primaryMuscle] || 0;

  const baseFatigue = sortedMuscles[0]?.[1] || 10;

  const projectedFatigue = Math.round(
    baseFatigue *
    ((sets * reps) /
      (BASELINE_SETS * BASELINE_REPS))
  );

  const finalFatigue =
    currentMuscleFatigue + projectedFatigue;

  const progress = Math.min(finalFatigue, 100);

  const progressColor =
    finalFatigue < 50
      ? "#39ff14"
      : finalFatigue < 80
        ? "#facc15"
        : "#ef4444";
  return (
    <main className="min-h-screen bg-black text-white px-6 py-4">
      <div className="max-w-md mx-auto">
        <Link
          href={from}
          className="text-zinc-400 text-sm inline-block mb-4"
        >
          ← Back
        </Link>

        <h1 className="heading-font text-3xl font-semibold mb-6 text-[#39ff14]">
          {exerciseName}
        </h1>

        {/* Current Fatigue */}
        <div
          className={`rounded-3xl p-5 mb-5 bg-[#111] border ${finalFatigue >= 80
            ? "border-red-500 animate-danger"
            : "border-[#222]"
            }`}
        >
          <h2 className="text-2xl mb-5">
            Current Fatigue
          </h2>

          <div className="mb-5">
            <div className="flex justify-between mb-2">
              <span>
                {primaryMuscle
                  ?.replace(/([A-Z])/g, " $1")
                  .replace(/^./, (s) => s.toUpperCase())}
              </span>

              <span className="text-lime-400 font-semibold">
                {currentMuscleFatigue}%
              </span>
            </div>

            <div className="w-full h-3 bg-[#222] rounded-full overflow-hidden">
              <div
                className="h-full bg-lime-400 transition-all"
                style={{
                  width: `${Math.min(currentMuscleFatigue, 100)}%`,
                }}
              />
            </div>

            <div className="mt-8">
            </div>

          </div>

          <div>
            <div className="flex justify-between mb-2">
              <span className="text-zinc-400">
                After This Exercise
              </span>

              <span
                className="font-semibold"
                style={{ color: progressColor }}
              >
                {finalFatigue}%
              </span>
            </div>
            <div className="w-full h-3 bg-[#222] rounded-full overflow-hidden">
              <div
                className="h-full transition-all duration-300"
                style={{
                  width: `${progress}%`,
                  backgroundColor: progressColor,
                }}
              />
            </div>

            {finalFatigue >= 80 && (
              <div className="mt-3 rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2">
                <p className="text-center text-sm font-medium text-red-400">
                  ⚠️ High Risk of Overtraining
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Sets & Reps */}
        <div
          className={`rounded-3xl p-5 mb-5 bg-[#111] border ${finalFatigue >= 80
            ? "border-red-500 animate-danger"
            : "border-[#222]"
            }`}
        >
          <h2 className="text-2xl mb-6">
            Sets & Reps
          </h2>

          <div className="flex justify-between">
            {/* Sets */}
            <div>
              <p className="text-zinc-400 mb-3">Sets</p>

              <div className="flex items-center gap-4">
                <button
                  onClick={() =>
                    setSets(Math.max(1, sets - 1))
                  }
                  className="w-12 h-12 rounded-2xl bg-[#222] text-2xl"
                >
                  -
                </button>

                <span className="text-3xl">
                  {sets}
                </span>

                <button
                  onClick={() => setSets(sets + 1)}
                  className="w-12 h-12 rounded-2xl bg-[#222] text-2xl"
                >
                  +
                </button>
              </div>
            </div>

            {/* Reps */}
            <div>
              <p className="text-zinc-400 mb-3">Reps</p>

              <div className="flex items-center gap-4">
                <button
                  onClick={() =>
                    setReps(Math.max(1, reps - 1))
                  }
                  className="w-12 h-12 rounded-2xl bg-[#222] text-2xl"
                >
                  -
                </button>

                <span className="text-3xl">
                  {reps}
                </span>

                <button
                  onClick={() => setReps(reps + 1)}
                  className="w-12 h-12 rounded-2xl bg-[#222] text-2xl"
                >
                  +
                </button>
              </div>
            </div>
          </div>

          <div className="mt-8">
            <p className="text-zinc-400 mb-3">
              Weight (kg)
            </p>

            <input
              type="number"
              min="0"
              step="0.5"
              placeholder="e.g. 60"
              value={weight}
              onChange={(e) =>
                setWeight(
                  e.target.value === ""
                    ? ""
                    : Number(e.target.value)
                )
              }
              className="w-full rounded-2xl border border-[#333] bg-[#1a1a1a] px-5 py-4 text-center text-2xl font-semibold text-white outline-none focus:border-lime-400"
            />
          </div>
        </div>

        <div className="mb-6 rounded-2xl border border-[#222] bg-[#111] px-4 py-4">
          <h3 className="mb-3 text-sm font-semibold text-lime-400">
            💡 Training Tips
          </h3>

          <ul className="space-y-3 text-sm leading-6 text-zinc-400">
            <li>
              • Choose a weight that allows
              <span className="font-medium text-white"> 8–12 reps </span>
              with good form, finishing
              <span className="font-medium text-lime-400">
                {" "}0–2 reps before failure.
              </span>
            </li>

            <li>
              • For most workouts, limit yourself to
              <span className="font-medium text-white">
                {" "}1-2 exercises per muscle area
              </span>
              {" "}(e.g. Upper Chest, Mid Chest, Lower Chest)
              to help reduce unnecessary fatigue.
            </li>
          </ul>
        </div>

        <button
          onClick={() => {
            const savedWorkout = JSON.parse(
              localStorage.getItem("currentWorkout") || "[]"
            );

            const existingWorkout = Array.isArray(savedWorkout)
              ? savedWorkout
              : [savedWorkout];

            const newExercise = {
              exercise: exerciseName,
              slug,
              sets,
              reps,
              weight,
              bodyPart: exerciseData.bodyPart,
              sourcePath: from,
              fatigue: projectedFatigue,
              primaryMuscle,
              fatigueBreakdown: Object.fromEntries(
                Object.entries(exerciseData.fatigue).map(
                  ([muscle, value]) => [
                    muscle,
                    Math.round(
                      Number(value) *
                      ((sets * reps) /
                        (BASELINE_SETS * BASELINE_REPS))
                    ),
                  ]
                )
              ),
            };

            existingWorkout.push(newExercise);

            localStorage.setItem(
              "currentWorkout",
              JSON.stringify(existingWorkout)
            );

            router.push("/workout/session");
          }}

          className="w-full bg-lime-400 text-black font-semibold py-4 rounded-2xl text-xl mb-4 transition-all duration-150 active:scale-[0.97] active:brightness-90"
        >
          Add Exercise
        </button>

        <button
          onClick={() => router.push(from)}
          className="w-full bg-[#111] border border-[#222] text-white py-4 rounded-2xl text-xl transition-all duration-150 active:scale-[0.97] active:bg-[#1a1a1a]"
        >
          Choose Another Exercise
        </button>
      </div>
    </main>
  );
}
