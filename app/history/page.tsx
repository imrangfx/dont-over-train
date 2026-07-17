"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ChevronRight } from "lucide-react";

export default function HistoryPage() {
  const [history, setHistory] = useState<any[]>([]);

  useEffect(() => {
    const saved = JSON.parse(
      localStorage.getItem("workoutHistory") || "[]"
    );

    setHistory(saved);
  }, []);

  return (
    <main className="min-h-screen bg-black text-white px-6 py-6">
      <div className="max-w-md mx-auto">

        <div className="mb-8">

          <Link
            href="/profile"
            className="inline-flex items-center gap-2 text-zinc-400 hover:text-white"
          >
            <ArrowLeft size={18} />
            Back
          </Link>

          <h1 className="mt-6 text-4xl font-bold">
            Workout History
          </h1>

          <p className="mt-2 text-zinc-500">
            All your completed workouts
          </p>

        </div>

        {history.length === 0 ? (
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
    </main>
  );
}