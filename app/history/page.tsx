"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { loadWorkoutHistory, type WorkoutHistoryEntry } from "@/lib/workouts";
import BottomNav from "@/components/BottomNav";

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
    <main className="min-h-screen bg-black px-6 py-6 pb-[calc(72px+env(safe-area-inset-bottom)+1.5rem)] text-white">
      <div className="max-w-md mx-auto">

        <div className="mb-8">

          <h1 className="text-4xl font-bold">
            Workout History
          </h1>

          <p className="mt-2 text-zinc-500">
            All your completed workouts
          </p>

        </div>

        {loading ? (
          <div className="rounded-3xl border border-zinc-800 bg-[#111] p-10 text-center">
            <p className="text-zinc-500">
              Loading workouts...
            </p>
          </div>
        ) : error ? (
          <div className="rounded-3xl border border-red-500 bg-red-500/5 p-10 text-center">
            <h2 className="text-xl font-semibold text-red-400">
              Couldn't load workouts
            </h2>
            <p className="mt-3 text-zinc-500">
              {error}
            </p>
          </div>
        ) : history.length === 0 ? (
          <div className="rounded-3xl border border-zinc-800 bg-[#111] p-10 text-center">

            <h2 className="text-xl font-semibold">
              No workouts yet
            </h2>

            <p className="mt-3 text-zinc-500">
              Finish your first workout and it will appear here.
            </p>

          </div>
        ) : (
          history.map((workout) => (

            <div
              key={workout.id}
              className="mb-5 rounded-3xl border border-zinc-800 bg-[#111] p-5"
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

              <div className="mt-5 flex items-center justify-between">

                <span className="rounded-full bg-lime-400/15 px-3 py-1 text-sm text-lime-400">
                  Score {workout.score}
                </span>

                <Link
                  href={`/history/${workout.id}`}
                  className="flex items-center gap-2 text-zinc-300 hover:text-white"
                >
                  View Details

                  <ChevronRight size={18} />

                </Link>

              </div>

            </div>

          ))
        )}
      </div>

      <BottomNav />
    </main>
  );
}