"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { loadWorkoutHistoryById, type WorkoutHistoryEntry } from "@/lib/workouts";

export default function WorkoutDetailsPage() {
  const params = useParams();
  const id = params.id as string;

  const [workout, setWorkout] = useState<WorkoutHistoryEntry | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    loadWorkoutHistoryById(id).then((result) => {
      if (!active) return;
      setWorkout(result.workout);
      setError(result.error);
      setLoading(false);
    });

    return () => {
      active = false;
    };
  }, [id]);

  if (loading) {
    return (
      <main className="min-h-screen bg-black flex items-center justify-center text-white">
        Loading workout...
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen bg-black flex items-center justify-center text-red-400">
        {error}
      </main>
    );
  }

  if (!workout) {
    return (
      <main className="min-h-screen bg-black flex items-center justify-center text-white">
        Workout not found
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black px-6 py-8 text-white">
      <div className="mx-auto max-w-[390px]">

        <Link
          href="/history"
          className="inline-flex items-center gap-2 text-zinc-400 hover:text-white"
        >
          <ArrowLeft size={18} />
          Back
        </Link>

        <h1 className="mt-8 text-4xl font-bold">
          Workout Details
        </h1>

        {/* Summary */}

        <div className="mt-8 rounded-3xl border border-zinc-800 bg-[#111] p-6">

          <div className="text-sm text-zinc-500">
            Date
          </div>

          <div className="mt-2 text-2xl font-bold">
            {workout.date}
          </div>

          <div className="mt-5 text-lg font-semibold text-lime-400">
            {workout.bodyParts?.join(" + ") || "Workout"}
          </div>

          <div className="mt-2 text-zinc-400">
            {workout.exercises} Exercise
            {workout.exercises > 1 ? "s" : ""} •{" "}
            {workout.durationMinutes || 0} Minutes
          </div>

          <div className="mt-5 inline-flex rounded-full bg-lime-400/15 px-3 py-1 text-lime-400">
            Workout Score {workout.score}
          </div>

        </div>

        {/* Exercises */}

        <div className="mt-8">

          <h2 className="mb-5 text-2xl font-semibold">
            Exercises
          </h2>

          {(workout.exerciseList || []).map(
            (exercise: any, index: number) => (

              <div
                key={index}
                className="mb-5 rounded-2xl border border-zinc-800 bg-[#111] p-5"
              >

                <h3 className="text-xl font-semibold">
                  {exercise.name}
                </h3>

                <p className="mt-2 text-zinc-400">
                  {exercise.sets} Sets • {exercise.reps} Reps
                </p>

                <div className="mt-4 space-y-2">

                  {(exercise.weights || []).map(
                    (weight: number, i: number) => (

                      <div
                        key={i}
                        className="flex items-center justify-between rounded-xl bg-zinc-900 px-4 py-3"
                      >

                        <span className="text-zinc-400">
                          Set {i + 1}
                        </span>

                        <span className="font-medium">
                          {weight} kg
                        </span>

                      </div>

                    )
                  )}

                </div>
                {exercise.fatigueBreakdown && (
                  <div className="mt-5">

                    <h4 className="mb-3 text-sm font-semibold text-zinc-400">
                      Fatigue Impact
                    </h4>

                    {
                      Object.entries(exercise.fatigueBreakdown)
                        .filter(([, value]) => Number(value) > 0)
                        .map(([muscle, value]: any) => (

                          <div key={muscle} className="mb-3">

                            <div className="mb-1 flex justify-between text-sm">
                              <span>
                                {String(muscle)
                                  .replace(/([A-Z])/g, " $1")
                                  .replace(/^./, (s: string) => s.toUpperCase())}
                              </span>

                              <span className="text-lime-400">
                                {value}%
                              </span>
                            </div>

                            <div className="h-2 rounded-full bg-zinc-800">

                              <div
                                className="h-2 rounded-full bg-lime-400"
                                style={{
                                  width: `${Math.min(Number(value), 100)}%`,
                                }}
                              />

                            </div>

                          </div>

                        ))
                    }

                  </div>
                )}

              </div>

            )
          )}

        </div>

        {/* Fatigue */}

        {Object.keys(workout.fatigueBreakdown || {}).length > 0 && (

          <div className="mt-8 rounded-3xl border border-zinc-800 bg-[#111] p-6">

            <h2 className="mb-6 text-2xl font-semibold">
              Final Fatigue
            </h2>

            {
              Object.entries(workout.fatigueBreakdown)
                .filter(([, value]) => Number(value) > 0)
                .map(([muscle, value]: any) => (

                  <div
                    key={muscle}
                    className="mb-5"
                  >

                    <div className="mb-2 flex justify-between">

                      <span>
                        {String(muscle)
                          .replace(/([A-Z])/g, " $1")
                          .replace(/^./, (s: string) => s.toUpperCase())}
                      </span>

                      <span className="text-lime-400">
                        {value}%
                      </span>

                    </div>

                    <div className="h-2 rounded-full bg-zinc-800">

                      <div
                        className="h-2 rounded-full bg-lime-400"
                        style={{
                          width: `${Math.min(Number(value), 100)}%`,
                        }}
                      />

                    </div>

                  </div>

                ))
            }

          </div>

        )}
      </div>
    </main>
  );
}