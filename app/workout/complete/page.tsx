"use client";

import { useEffect, useState } from "react";
export default function CompletePage() {
  const [workouts, setWorkouts] = useState<any[]>([]);
  const [isPR, setIsPR] = useState(false);

  useEffect(() => {
    const saved = JSON.parse(
      localStorage.getItem("currentWorkout") || "[]"
    );

    const formatted = Array.isArray(saved)
      ? saved
      : [saved];

    setWorkouts(formatted);
    const history = JSON.parse(
      localStorage.getItem("workoutHistory") || "[]"
    );

    const totalSetsHistory = formatted.reduce(
      (acc: number, item: any) => acc + item.sets,
      0
    );

    const totalRepsHistory = formatted.reduce(
      (acc: number, item: any) =>
        acc + item.sets * item.reps,
      0
    );

    const score = Math.min(
      Math.round(
        totalSetsHistory * 5 +
        totalRepsHistory * 0.2 +
        formatted.length * 10
      ),
      100
    );

    const historyEntry = {
      date: new Date().toLocaleDateString(),
      exercises: formatted.length,
      sets: totalSetsHistory,
      reps: totalRepsHistory,
      score,
    };

    const alreadySaved =
      history.length > 0 &&
      history[history.length - 1].date === historyEntry.date &&
      history[history.length - 1].score === historyEntry.score;

    if (!alreadySaved) {
      localStorage.setItem(
        "workoutHistory",
        JSON.stringify([
          historyEntry,
          ...history,
        ])
      );
    }
    const previousBest = Number(
      localStorage.getItem("bestWorkoutScore") || 0
    );

    const currentScore = Math.min(
      Math.round(
        formatted.reduce(
          (acc: number, item: any) =>
            acc + item.sets,
          0
        ) * 5 +
        formatted.reduce(
          (acc: number, item: any) =>
            acc + item.sets * item.reps,
          0
        ) * 0.2 +
        formatted.length * 10
      ),
      100
    );

    if (currentScore > previousBest) {
      localStorage.setItem(
        "bestWorkoutScore",
        String(currentScore)
      );

      setIsPR(true);
    }
  }, []);

  const totalSets = workouts.reduce(
    (acc: number, item: any) => acc + item.sets,
    0
  );

  const totalReps = workouts.reduce(
    (acc: number, item: any) => acc + item.sets * item.reps,
    0
  );
  const workoutScore = Math.min(
    Math.round(
      totalSets * 5 +
      totalReps * 0.2 +
      workouts.length * 10
    ),
    100
  );
  const fatigueTotals: Record<string, number> = {};

  workouts.forEach((exercise) => {
    if (!exercise.fatigueBreakdown) return;

    Object.entries(exercise.fatigueBreakdown).forEach(
      ([muscle, value]) => {
        fatigueTotals[muscle] =
          (fatigueTotals[muscle] || 0) +
          Number(value);
      }
    );
  });

  const fatigueArray = Object.entries(
    fatigueTotals
  ).map(([name, value]) => ({
    name: name
      .replace(/([A-Z])/g, " $1")
      .replace(/^./, (s) => s.toUpperCase()),
    value: Math.min(Number(value), 100),
  }));
  const mostFatiguedMuscle =
    fatigueArray.sort(
      (a, b) => b.value - a.value
    )[0];
  const downloadSummary = () => {

    const summary = `
DON'T OVER TRAIN
Workout Report
----------------

Date: May 27, 2026

Exercises:
${workouts
        .map(
          (item: any) =>
            `- ${item.exercise}: ${item.sets} x ${item.reps}`
        )
        .join("\n")}

Total Sets: ${totalSets}
Total Reps: ${totalReps}
Body Parts Trained: 1

Fatigue:
${fatigueArray
        .map((muscle) => {
          const status =
            muscle.value <= 30
              ? "Low"
              : muscle.value <= 60
                ? "Moderate"
                : muscle.value <= 80
                  ? "High"
                  : "Very High";

          return `${muscle.name} -> ${status}`;
        })
        .join("\n")}
`;

    const blob = new Blob([summary], {
      type: "text/plain",
    });

    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "workout-summary.txt";
    a.click();

    URL.revokeObjectURL(url);
  };

  return (
    <main className="min-h-screen bg-black text-white px-6 py-8">
      <div className="max-w-md mx-auto">

        {/* Check Icon */}
        <div className="flex justify-center mb-6">
          <div className="w-24 h-24 rounded-full bg-lime-400 flex items-center justify-center text-black text-6xl">
            ✓
          </div>
        </div>

        {/* Summary */}
        <div className="bg-[#111] border border-[#222] rounded-3xl p-6 mb-6">

          <h2 className="text-3xl mb-6">
            Workout Summary
          </h2>

          <div className="flex justify-between text-center mb-6">

            <div>
              <p className="text-5xl text-lime-400 font-bold">
                {workouts.length}
              </p>

              <p className="text-zinc-400">
                Exercises
              </p>
            </div>

            <div>
              <p className="text-5xl text-lime-400 font-bold">
                {totalSets}
              </p>

              <p className="text-zinc-400">
                Total Sets
              </p>
            </div>

            <div>
              <p className="text-5xl text-lime-400 font-bold">
                {totalReps}
              </p>

              <p className="text-zinc-400">
                Total Reps
              </p>
            </div>

          </div>
          <div className="bg-[#1a1a1a] rounded-2xl p-5 mb-5 text-center">
            <p className="text-zinc-400 text-sm mb-2">
              Workout Score
            </p>
            <h3 className="text-5xl font-bold text-lime-400">
              {workoutScore}
            </h3>

            <p className="text-zinc-400 mt-2">
              Based on volume, reps and exercise count
            </p>
          </div>
          {isPR && (
            <div className="bg-yellow-500/10 border border-yellow-500 rounded-2xl p-4 mb-5 text-center">
              <p className="text-yellow-400 font-semibold">
                🏆 Personal Record
              </p>

              <p className="text-zinc-300 mt-1">
                Highest Workout Score Yet
              </p>
            </div>
          )}
          <div className="bg-[#1a1a1a] rounded-2xl p-5 mb-5">
            <p className="text-zinc-400 text-sm mb-2">
              Most Fatigued Muscle
            </p>

            <h3 className="text-2xl font-semibold text-lime-400">
              {mostFatiguedMuscle?.name || "N/A"}
            </h3>

            <p className="text-zinc-400 mt-2">
              Highest fatigue accumulation today.
            </p>
          </div>

          {workouts.map((item: any, index: number) => (

            <div
              key={index}
              className="bg-[#1a1a1a] rounded-2xl p-4 mb-3"
            >
              <h3 className="text-2xl mb-1">
                {item.exercise}
              </h3>

              <p className="text-zinc-400">
                {item.sets} sets × {item.reps} reps
              </p>

              {item.setWeights?.some((w: number | "") => w !== "") ? (
                <p className="text-sm text-zinc-500 mt-1">
                  Weights:{" "}
                  {item.setWeights
                    .map((w: number | "") => (w === "" ? "-" : `${w}kg`))
                    .join(" • ")}
                </p>
              ) : item.weight ? (
                <p className="text-sm text-zinc-500 mt-1">
                  Weight: {item.weight}kg
                </p>
              ) : null}
            </div>

          ))}

        </div>

        {/* Final Fatigue */}
        <div className="bg-[#111] border border-[#222] rounded-3xl p-6 mb-8">

          <h2 className="text-3xl mb-6">
            Final Fatigue Status
          </h2>

          {fatigueArray.map((muscle) => (

            <div key={muscle.name} className="mb-6">

              <div className="flex justify-between mb-2">

                <span className="text-xl">
                  {muscle.name}
                </span>

                <span
                  className={
                    muscle.value <= 30
                      ? "text-lime-400"
                      : muscle.value <= 60
                        ? "text-yellow-400"
                        : muscle.value <= 80
                          ? "text-orange-400"
                          : "text-red-500"
                  }
                >
                  {muscle.value <= 30
                    ? "Low"
                    : muscle.value <= 60
                      ? "Moderate"
                      : muscle.value <= 80
                        ? "High"
                        : "Very High"}
                </span>

              </div>

              <div className="w-full h-3 bg-[#222] rounded-full overflow-hidden">

                <div
                  className={`h-full ${muscle.value <= 30
                    ? "bg-lime-400"
                    : muscle.value <= 60
                      ? "bg-yellow-400"
                      : muscle.value <= 80
                        ? "bg-orange-400"
                        : "bg-red-500"
                    }`}
                  style={{ width: `${muscle.value}%` }}
                />

              </div>

            </div>

          ))}

        </div>

        {/* Download Button */}
        <button
          onClick={downloadSummary}
          className="w-full border border-lime-400 text-lime-400 py-4 rounded-2xl text-xl mb-4"
        >
          Download Summary
        </button>

        {/* Start New Workout */}
        <button
          onClick={() => {

            const history = JSON.parse(
              localStorage.getItem("workoutHistory") || "[]"
            );

            history.unshift({
              date: new Date().toLocaleDateString(),
              score: workoutScore,
              exercises: workouts.length,
              sets: totalSets,
              reps: totalReps,
              mostFatigued:
                mostFatiguedMuscle?.name || "N/A",
            });

            localStorage.setItem(
              "workoutHistory",
              JSON.stringify(history.slice(0, 10))
            );

            localStorage.removeItem("currentWorkout");

            window.location.href = "/";
          }}
          className="w-full bg-lime-400 text-black py-5 rounded-2xl text-2xl font-semibold"
        >
          Start New Workout
        </button>

      </div>
    </main >
  );
}