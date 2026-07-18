"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronRight, Dumbbell } from "lucide-react";
import { loadWorkoutHistory, type WorkoutHistoryEntry } from "@/lib/workouts";
import BottomNav from "@/components/BottomNav";
import EmptyState from "@/components/ui/EmptyState";
import LoadingCard from "@/components/ui/LoadingCard";

export default function HistoryPage() {
  const [history, setHistory] = useState<WorkoutHistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    loadWorkoutHistory().then((result) => {
      if (!active) return;
      setHistory(result.history);
      setError(result.error);
      setLoading(false);
    });

    return () => {
      active = false;
    };
  }, []);

  return (
    <main className="min-h-screen bg-black px-6 py-6 pb-[calc(72px+env(safe-area-inset-bottom)+1.5rem)] text-white animate-[fade-in_200ms_ease-out]">
      <div className="mx-auto w-full max-w-md">

        <div className="mb-8">
          <h1 className="text-4xl font-bold">
            Workout History
          </h1>

          <p className="mt-2 text-zinc-500">
            All your completed workouts
          </p>
        </div>

        {loading ? (
          <div className="space-y-4" aria-busy="true">
            <LoadingCard rows={3} />
            <LoadingCard rows={2} />
            <LoadingCard rows={2} />
          </div>
        ) : error ? (
          <EmptyState
            icon={<Dumbbell size={22} />}
            title="Couldn't load workouts"
            description="Something went wrong while loading your history. Please try again."
          />
        ) : history.length === 0 ? (
          <EmptyState
            icon={<Dumbbell size={22} />}
            title="No workouts yet"
            description="Finish your first workout and it will appear here."
          />
        ) : (
          <div className="space-y-4">
            {history.map((workout) => (
              <article
                key={workout.id}
                className="card-surface p-5 transition hover:border-zinc-700"
              >
                <p className="text-sm text-zinc-500">
                  {workout.date}
                </p>

                <h2 className="mt-3 text-2xl font-bold text-lime-400">
                  {workout.bodyParts?.join(" + ") || "Workout"}
                </h2>

                <p className="mt-2 text-zinc-400">
                  {workout.exercises} Exercises • {workout.durationMinutes} min
                </p>

                <div className="mt-5 flex items-center justify-between gap-3">
                  <span className="rounded-full bg-lime-400/15 px-3 py-1 text-sm text-lime-400">
                    Score {workout.score}
                  </span>

                  <Link
                    href={`/history/${workout.id}`}
                    className="btn-base inline-flex items-center gap-2 rounded-lg text-zinc-300 hover:text-white"
                    aria-label={`View details for ${workout.bodyParts?.join(" + ") || "workout"} on ${workout.date}`}
                  >
                    View Details
                    <ChevronRight size={18} aria-hidden="true" />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>

      <BottomNav />
    </main>
  );
}
