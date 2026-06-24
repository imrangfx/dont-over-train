"use client";

import { useEffect, useState } from "react";

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

        <h1 className="text-4xl font-bold mb-6">
          Workout History
        </h1>

        {history.length === 0 ? (
          <div className="bg-[#111] rounded-3xl p-6 text-center">
            <p className="text-zinc-400">
              No workouts saved yet
            </p>
          </div>
        ) : (
          history.map((workout, index) => (
            <div
              key={index}
              className="bg-[#111] border border-[#222] rounded-3xl p-5 mb-4"
            >
              <p className="text-zinc-500 text-sm mb-2">
                {workout.date}
              </p>

              <h2 className="text-2xl font-semibold text-lime-400">
                Score: {workout.score}
              </h2>

              <p className="text-zinc-400 mt-2">
                {workout.exercises} Exercises
              </p>

              <p className="text-zinc-400">
                {workout.sets} Sets
              </p>

              <p className="text-zinc-400">
                {workout.reps} Reps
              </p>
            </div>
          ))
        )}
      </div>
    </main>
  );
}