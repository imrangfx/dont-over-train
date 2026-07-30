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
import EmptyState from "@/components/ui/EmptyState";
import { Dumbbell } from "lucide-react";
import LoadingScreen from "@/components/ui/LoadingScreen";
import { useMinimumLoadingDelay } from "@/lib/hooks/useMinimumLoadingDelay";
import {
  buildWorkoutSets,
  loadWorkoutHistory,
  workoutSetCount,
  workoutTotalReps,
  type WorkoutHistoryEntry,
  type WorkoutSet,
} from "@/lib/workouts";
import {
  getQualifyingPersonalRecord,
  QUALIFYING_PR_MIN_REPS,
} from "@/lib/exerciseAnalytics";

const PR_MIN_REPS = QUALIFYING_PR_MIN_REPS;

export default function ExercisePage() {
  const [loggedSets, setLoggedSets] = useState<WorkoutSet[]>(() =>
    buildWorkoutSets(3, 10)
  );
  const [currentFatigue, setCurrentFatigue] = useState<
    Record<string, number>
  >({});
  const [history, setHistory] = useState<WorkoutHistoryEntry[]>([]);
  const router = useRouter();
  const searchParams = useSearchParams();

  const from = searchParams.get("from") || "/";

  const params = useParams();
  const slug = params.slug as string;

  const BASELINE_SETS = 3;
  const BASELINE_REPS = 10;

  const sets = workoutSetCount(loggedSets);
  const totalReps = workoutTotalReps(loggedSets);

  function updateSets(newSets: number) {
    setLoggedSets((prev) => {
      if (newSets === prev.length) return prev;
      if (newSets < prev.length) return prev.slice(0, newSets);

      const last = prev[prev.length - 1];
      const defaultReps = last?.reps || 10;
      const defaultWeight = last?.weight ?? "";
      const additions: WorkoutSet[] = Array.from(
        { length: newSets - prev.length },
        () => ({
          weight: defaultWeight,
          reps: defaultReps,
        })
      );
      return [...prev, ...additions];
    });
  }

  function updateSetWeight(index: number, value: number | "") {
    setLoggedSets((prev) => {
      const next = [...prev];
      if (!next[index]) return prev;
      next[index] = { ...next[index], weight: value };
      return next;
    });
  }

  function updateSetReps(index: number, value: number) {
    setLoggedSets((prev) => {
      const next = [...prev];
      if (!next[index]) return prev;
      next[index] = { ...next[index], reps: Math.max(1, value) };
      return next;
    });
  }

  const WEIGHT_STEP = 2.5;

  function adjustSetWeight(index: number, delta: number) {
    setLoggedSets((prev) => {
      const next = [...prev];
      if (!next[index]) return prev;
      const current = next[index].weight;
      const base = current === "" ? 0 : current;
      next[index] = {
        ...next[index],
        weight: Math.max(0, Math.round((base + delta) * 10) / 10),
      };
      return next;
    });
  }

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

    // Deferred to a microtask so this effect never calls setState
    // synchronously in its own body (avoids cascading renders).
    queueMicrotask(() => setCurrentFatigue(fatigue));
  }, []);

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

  const isLoading = useMinimumLoadingDelay();

  if (isLoading) {
    return (
      <LoadingScreen
        title="Before You Lift"
        message="Choose a weight that allows 8–12 reps with good form, finishing 0–2 reps before failure."
      />
    );
  }

  const exerciseData =
    exercises[slug as keyof typeof exercises];
  if (!exerciseData) {
    return (
      <main className="min-h-screen bg-black px-6 py-8 text-white">
        <div className="mx-auto w-full max-w-[430px]">
          <Link
            href={from}
            className="btn-base inline-flex items-center gap-1 rounded-lg text-sm text-zinc-400 hover:text-white"
          >
            ← Back
          </Link>

          <div className="mt-8">
            <EmptyState
              icon={<Dumbbell size={22} />}
              title="Exercise not found"
              description="This exercise may have been removed or the link is invalid."
            />
          </div>
        </div>
      </main>
    );
  }
  const exerciseName = exerciseData.name;
  const requiresWeight =
    "trackingType" in exerciseData
      ? exerciseData.trackingType === "weight"
      : true;
  const qualifyingPR = getQualifyingPersonalRecord(exerciseName, history, PR_MIN_REPS);
  const sortedMuscles = Object.entries(
    exerciseData.fatigue
  ).sort((a, b) => b[1] - a[1]);

  const primaryMuscle = sortedMuscles[0]?.[0];

  const currentMuscleFatigue =
    currentFatigue[primaryMuscle] || 0;

  const baseFatigue = sortedMuscles[0]?.[1] || 10;

  const projectedFatigue = Math.round(
    baseFatigue *
    (totalReps /
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
    <main className="min-h-screen bg-black text-white px-6 py-4 pb-[max(2rem,env(safe-area-inset-bottom))]">
      <div className="mx-auto w-full max-w-[430px]">
        <Link
          href={from}
          className="btn-base inline-flex items-center gap-1 rounded-lg text-zinc-400 text-sm hover:text-white"
        >
          ← Back
        </Link>

        <h1 className="heading-font text-3xl font-semibold mb-6 mt-4 text-[#39ff14]">
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

        {/* Personal Record */}
        <div className="rounded-3xl p-5 mb-5 bg-[#111] border border-[#222]">
          <h2 className="text-sm font-semibold text-zinc-400">
            🏆 Personal Record
          </h2>

          {qualifyingPR ? (
            <p className="mt-2 text-2xl font-semibold text-lime-400">
              {qualifyingPR.weight} kg × {qualifyingPR.reps} reps
            </p>
          ) : (
            <p className="mt-2 text-2xl font-semibold text-zinc-500">
              No Personal Record Yet
            </p>
          )}

          <p className="mt-2 text-xs text-zinc-500">
            Only sets with at least 8 reps count toward your Personal Record.
          </p>
        </div>

        {/* Sets */}
        <div
          className={`rounded-3xl p-5 mb-5 bg-[#111] border ${finalFatigue >= 80
            ? "border-red-500 animate-danger"
            : "border-[#222]"
            }`}
        >
          <h2 className="text-2xl mb-6">
            Sets
          </h2>

          <div>
            <p className="text-zinc-400 mb-3">Number of Sets</p>

            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() =>
                  updateSets(Math.max(1, sets - 1))
                }
                disabled={sets <= 1}
                aria-label="Decrease sets"
                className="btn-base w-12 h-12 rounded-2xl bg-[#222] text-2xl disabled:opacity-40"
              >
                -
              </button>

              <span className="text-3xl" aria-live="polite">
                {sets}
              </span>

              <button
                type="button"
                onClick={() => updateSets(sets + 1)}
                aria-label="Increase sets"
                className="btn-base w-12 h-12 rounded-2xl bg-[#222] text-2xl"
              >
                +
              </button>
            </div>
          </div>

          <div className="mt-8 space-y-3">
            {loggedSets.map((set, index) => (
              <div
                key={index}
                className="rounded-2xl border border-[#333] bg-[#1a1a1a] p-4"
              >
                <p className="mb-4 text-sm font-medium text-zinc-400">
                  Set {index + 1}
                </p>

                <div
                  className={
                    requiresWeight
                      ? "grid grid-cols-2 gap-3"
                      : "grid grid-cols-1 gap-3"
                  }
                >
                  {requiresWeight && (
                    <div>
                      <p className="mb-2 text-xs text-zinc-500">Weight (kg)</p>
                      <div className="relative">
                        <button
                          type="button"
                          onClick={() => adjustSetWeight(index, -WEIGHT_STEP)}
                          disabled={set.weight === "" || set.weight <= 0}
                          aria-label={`Decrease set ${index + 1} weight by 2.5 kilograms`}
                          className="btn-base absolute left-1.5 top-1/2 z-10 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-xl bg-[#262626] text-base font-semibold text-white disabled:opacity-40"
                        >
                          −
                        </button>

                        <input
                          type="number"
                          min="0"
                          step="0.5"
                          placeholder="60"
                          value={set.weight}
                          onChange={(e) =>
                            updateSetWeight(
                              index,
                              e.target.value === ""
                                ? ""
                                : Number(e.target.value)
                            )
                          }
                          aria-label={`Set ${index + 1} weight in kilograms`}
                          className="w-full [appearance:textfield] rounded-2xl border border-[#333] bg-[#111] px-11 py-3 text-center text-xl font-semibold text-white outline-none focus:border-lime-400 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                        />

                        <button
                          type="button"
                          onClick={() => adjustSetWeight(index, WEIGHT_STEP)}
                          aria-label={`Increase set ${index + 1} weight by 2.5 kilograms`}
                          className="btn-base absolute right-1.5 top-1/2 z-10 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-xl bg-[#262626] text-base font-semibold text-white"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  )}

                  <div>
                    <p className="mb-2 text-xs text-zinc-500">Reps</p>
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() =>
                          updateSetReps(index, Math.max(1, set.reps - 1))
                        }
                        disabled={set.reps <= 1}
                        aria-label={`Decrease set ${index + 1} reps`}
                        className="btn-base absolute left-1.5 top-1/2 z-10 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-xl bg-[#262626] text-base font-semibold text-white disabled:opacity-40"
                      >
                        −
                      </button>

                      <input
                        type="number"
                        min="1"
                        step="1"
                        value={set.reps}
                        onChange={(e) =>
                          updateSetReps(
                            index,
                            e.target.value === ""
                              ? 1
                              : Number(e.target.value)
                          )
                        }
                        aria-label={`Set ${index + 1} reps`}
                        className="w-full [appearance:textfield] rounded-2xl border border-[#333] bg-[#111] px-11 py-3 text-center text-xl font-semibold text-white outline-none focus:border-lime-400 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                      />

                      <button
                        type="button"
                        onClick={() => updateSetReps(index, set.reps + 1)}
                        aria-label={`Increase set ${index + 1} reps`}
                        className="btn-base absolute right-1.5 top-1/2 z-10 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-xl bg-[#262626] text-base font-semibold text-white"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <button
          type="button"
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
              sets: loggedSets,
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
                      (totalReps /
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

            // Continue the active workout (session view) — never reopen Start.
            router.replace("/workout/session");
          }}

          className="btn-base w-full bg-lime-400 text-black font-semibold py-4 rounded-2xl text-xl mb-4 active:brightness-90"
        >
          Add Exercise
        </button>

        <button
          type="button"
          onClick={() => router.push(from)}
          className="btn-base w-full bg-[#111] border border-[#222] text-white py-4 rounded-2xl text-xl active:bg-[#1a1a1a]"
        >
          Choose Another Exercise
        </button>
      </div>
    </main>
  );
}
