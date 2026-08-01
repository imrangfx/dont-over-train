"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { ArrowLeft, ChevronRight, Dumbbell } from "lucide-react";
import { loadWorkoutHistoryById, formatWorkoutSetsSummary, normalizeWorkoutSets, type WorkoutHistoryEntry, type WorkoutExercise } from "@/lib/workouts";
import { getExerciseTrackingType } from "@/app/Data/exercises";
import {
  bodyPartHistoryTitle,
  projectWorkoutForBodyPart,
} from "@/lib/historyFilter";
import { exerciseHref } from "@/lib/exerciseAnalytics";
import EmptyState from "@/components/ui/EmptyState";
import LoadingCard from "@/components/ui/LoadingCard";
import BottomNav from "@/components/BottomNav";
import RecoverySnapshotSection from "@/components/recovery/RecoverySnapshotSection";

/** Fatigue % → text / bar color classes (0–49 green, 50–79 yellow, 80–100 red). */
function getFatigueColor(value: number): { text: string; bg: string } {
  if (value < 50) {
    return { text: "text-lime-400", bg: "bg-lime-400" };
  }
  if (value < 80) {
    return { text: "text-yellow-400", bg: "bg-yellow-400" };
  }
  return { text: "text-red-500", bg: "bg-red-500" };
}

export default function WorkoutDetailsPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const id = params.id as string;
  const bodyPartSlug = searchParams.get("bodyPart");

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

  const displayedWorkout = useMemo(() => {
    if (!workout) return null;
    if (!bodyPartSlug) return workout;
    return projectWorkoutForBodyPart(workout, bodyPartSlug) ?? workout;
  }, [workout, bodyPartSlug]);

  const historyBackHref = bodyPartSlug
    ? `/history?bodyPart=${encodeURIComponent(bodyPartSlug)}`
    : "/history";

  const historyBackLabel = bodyPartSlug
    ? `← ${bodyPartHistoryTitle(bodyPartSlug)}`
    : "← History";

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
            href={historyBackHref}
            className="btn-base mt-6 inline-flex items-center gap-2 rounded-lg text-zinc-400 hover:text-white"
          >
            <ArrowLeft size={18} aria-hidden="true" />
            {historyBackLabel}
          </Link>
        </div>
      </main>
    );
  }

  if (!workout || !displayedWorkout) {
    return (
      <main className="min-h-screen bg-black px-6 py-8 text-white">
        <div className="mx-auto max-w-[390px]">
          <EmptyState
            icon={<Dumbbell size={22} />}
            title="Workout not found"
            description="This workout may have been deleted or is unavailable."
          />
          <Link
            href={historyBackHref}
            className="btn-base mt-6 inline-flex items-center gap-2 rounded-lg text-zinc-400 hover:text-white"
          >
            <ArrowLeft size={18} aria-hidden="true" />
            {historyBackLabel}
          </Link>
        </div>
      </main>
    );
  }

  return (
    <>
    <main className="min-h-screen bg-black px-6 py-8 pb-[calc(72px+env(safe-area-inset-bottom)+1.5rem)] text-white animate-[fade-in_200ms_ease-out]">
      <div className="mx-auto max-w-[390px]">


        <Link
          href={historyBackHref}
          className="btn-base inline-flex items-center gap-2 rounded-lg text-zinc-400 hover:text-white"
        >
          <ArrowLeft size={18} aria-hidden="true" />
          {historyBackLabel}
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
            {displayedWorkout.date}
          </div>

          <div className="mt-5 text-lg font-semibold text-lime-400">
            {displayedWorkout.bodyParts?.join(" + ") || "Workout"}
          </div>

          <div className="mt-2 text-zinc-400">
            {displayedWorkout.exercises} Exercise
            {displayedWorkout.exercises > 1 ? "s" : ""} •{" "}
            {displayedWorkout.durationMinutes || 0} Minutes
          </div>

        </div>

        {/* Exercises */}

        <div className="mt-8">

          <h2 className="mb-5 text-2xl font-semibold">
            Exercises
          </h2>

          {(displayedWorkout.exerciseList || []).map(
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
                  {formatWorkoutSetsSummary(
                    normalizeWorkoutSets(exercise),
                    getExerciseTrackingType(exercise.name)
                  )}
                </p>

                {exercise.fatigueBreakdown && (
                  <div className="mt-5">

                    <h4 className="mb-3 text-sm font-semibold text-zinc-400">
                      Fatigue Impact
                    </h4>

                    {
                      Object.entries(exercise.fatigueBreakdown)
                        .filter(([, value]) => Number(value) > 0)
                        .map(([muscle, value]) => {
                          const fatigueColor = getFatigueColor(Number(value));

                          return (
                            <div key={muscle} className="mb-3">

                              <div className="mb-1 flex justify-between text-sm">
                                <span>
                                  {String(muscle)
                                    .replace(/([A-Z])/g, " $1")
                                    .replace(/^./, (s: string) => s.toUpperCase())}
                                </span>

                                <span className={fatigueColor.text}>
                                  {value}%
                                </span>
                              </div>

                              <div className="h-2 rounded-full bg-zinc-800">

                                <div
                                  className={`h-2 rounded-full ${fatigueColor.bg}`}
                                  style={{
                                    width: `${Math.min(Number(value), 100)}%`,
                                  }}
                                />

                              </div>

                            </div>
                          );
                        })
                    }

                  </div>
                )}

              </div>

            )
          )}

        </div>

        {/* Fatigue */}

        {Object.keys(displayedWorkout.fatigueBreakdown || {}).length > 0 && (

          <div className="card-surface mt-8 p-6">

            <h2 className="mb-6 text-2xl font-semibold">
              Final Fatigue
            </h2>

            {
              Object.entries(displayedWorkout.fatigueBreakdown)
                .filter(([, value]) => Number(value) > 0)
                .map(([muscle, value]) => {
                  const fatigueColor = getFatigueColor(Number(value));

                  return (
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

                        <span className={fatigueColor.text}>
                          {value}%
                        </span>

                      </div>

                      <div className="h-2 rounded-full bg-zinc-800">

                        <div
                          className={`h-2 rounded-full ${fatigueColor.bg}`}
                          style={{
                            width: `${Math.min(Number(value), 100)}%`,
                          }}
                        />

                      </div>

                    </div>
                  );
                })
            }

          </div>

        )}

        {workout.recovery ? (
          <RecoverySnapshotSection snapshot={workout.recovery} />
        ) : null}

       </div>
    </main>

    <BottomNav />
  </>
);
}
