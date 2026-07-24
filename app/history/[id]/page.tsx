"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { ArrowLeft, ChevronRight, Dumbbell } from "lucide-react";
import { loadWorkoutHistoryById, type WorkoutHistoryEntry, type WorkoutExercise } from "@/lib/workouts";
import { exerciseHref } from "@/lib/exerciseAnalytics";
import EmptyState from "@/components/ui/EmptyState";
import LoadingCard from "@/components/ui/LoadingCard";

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
      <main className="min-h-screen bg-black px-6 py-8 text-white">
        <div className="mx-auto max-w-[390px] space-y-4">
          <LoadingCard rows={2} />
          <LoadingCard rows={4} />
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen bg-black px-6 py-8 text-white">
        <div className="mx-auto max-w-[390px]">
          <EmptyState
            icon={<Dumbbell size={22} />}
            title="Couldn't load workout"
            description="Something went wrong while loading this workout. Please go back and try again."
          />
          <Link
            href="/history"
            className="btn-base mt-6 inline-flex items-center gap-2 rounded-lg text-zinc-400 hover:text-white"
          >
            <ArrowLeft size={18} aria-hidden="true" />
            ← History
          </Link>
        </div>
      </main>
    );
  }

  if (!workout) {
    return (
      <main className="min-h-screen bg-black px-6 py-8 text-white">
        <div className="mx-auto max-w-[390px]">
          <EmptyState
            icon={<Dumbbell size={22} />}
            title="Workout not found"
            description="This workout may have been deleted or is unavailable."
          />
          <Link
            href="/history"
            className="btn-base mt-6 inline-flex items-center gap-2 rounded-lg text-zinc-400 hover:text-white"
          >
            <ArrowLeft size={18} aria-hidden="true" />
            ← History
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black px-6 py-8 text-white animate-[fade-in_200ms_ease-out]">
      <div className="mx-auto max-w-[390px]">

        <Link
          href="/history"
          className="btn-base inline-flex items-center gap-2 rounded-lg text-zinc-400 hover:text-white"
        >
          <ArrowLeft size={18} aria-hidden="true" />
          ← History
        </Link>

        <h1 className="mt-8 text-4xl font-bold">
          Workout Details
        </h1>

        {/* Summary */}

        <div className="card-surface mt-8 p-6">

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

        </div>

        {/* Exercises */}

        <div className="mt-8">

          <h2 className="mb-5 text-2xl font-semibold">
            Exercises
          </h2>

          {(workout.exerciseList || []).map(
            (exercise: WorkoutExercise, index: number) => (

              <div
                key={index}
                className="card-surface mb-5 p-5"
              >

                <Link
                  href={exerciseHref(exercise.name)}
                  className="btn-base -m-1 flex items-center justify-between gap-2 rounded-lg p-1 text-xl font-semibold hover:text-lime-400"
                >
                  {exercise.name}
                  <ChevronRight size={18} className="text-zinc-500" aria-hidden="true" />
                </Link>

                <p className="mt-2 text-zinc-400">
                  {exercise.sets} Sets • {exercise.reps} Reps
                </p>

                <div className="mt-4 space-y-2">

                  {(exercise.weights || []).map(
                    (weight: number | "", i: number) => (

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
                        .map(([muscle, value]) => (

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

          <div className="card-surface mt-8 p-6">

            <h2 className="mb-6 text-2xl font-semibold">
              Final Fatigue
            </h2>

            {
              Object.entries(workout.fatigueBreakdown)
                .filter(([, value]) => Number(value) > 0)
                .map(([muscle, value]) => (

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