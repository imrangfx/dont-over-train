"use client";

import { useEffect, useState } from "react";
import { getCurrentUserId, saveWorkoutHistoryEntry } from "@/lib/workouts";
import { recordWorkoutPersonalRecords } from "@/lib/personalRecords";
import { calculateOverallLevel } from "@/lib/progression";
import { useToast } from "@/components/ui/Toast";
import LevelUpCelebration from "@/components/LevelUpCelebration";

/** Best (highest) weight lifted for a single exercise this session. */
function maxWeightLifted(item: any): number {
  const weights = Array.isArray(item.setWeights) ? item.setWeights : [];
  const numeric = weights.filter(
    (w: unknown): w is number => typeof w === "number" && w > 0
  );
  if (numeric.length > 0) return Math.max(...numeric);
  return typeof item.weight === "number" ? item.weight : 0;
}

export default function CompletePage() {
  const { toast } = useToast();
  const [workouts, setWorkouts] = useState<any[]>([]);
  const [isPR, setIsPR] = useState(false);
  const [syncError, setSyncError] = useState<string | null>(null);
  const [levelUp, setLevelUp] = useState<{
    level: number;
    title: string;
    color: string;
  } | null>(null);

  useEffect(() => {
    const saved = JSON.parse(
      localStorage.getItem("currentWorkout") || "[]"
    );

    const formatted = Array.isArray(saved)
      ? saved
      : [saved];

    setWorkouts(formatted);

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

    const fatigueTotals: Record<string, number> = {};

    formatted.forEach((exercise: any) => {
      if (!exercise.fatigueBreakdown) return;

      Object.entries(exercise.fatigueBreakdown).forEach(
        ([muscle, value]) => {
          fatigueTotals[muscle] =
            (fatigueTotals[muscle] || 0) +
            Number(value);
        }
      );
    });

    const historyEntry = {
      id: crypto.randomUUID(),

      date: new Date().toLocaleDateString(),

      timestamp: Date.now(),

      exercises: formatted.length,

      sets: totalSetsHistory,

      reps: totalRepsHistory,

      durationMinutes: formatted.length * 8, // পরে dynamic করবো

      score,

      bodyParts: Array.from(
        new Set(
          formatted
            .map((item: any) => item.bodyPart)
            .filter(Boolean)
        )
      ),
      sections: Array.from(
        new Set(
          formatted
            .map((item: any) => item.section)
            .filter(Boolean)
        )
      ),

      exerciseList: formatted.map((item: any) => ({
        name: item.exercise,
        bodyPart: item.bodyPart,
        section: item.section,
        sets: item.sets,
        reps: item.reps,
        weights: item.setWeights || [],
        fatigueBreakdown: item.fatigueBreakdown || {},
      })),
      fatigueBreakdown: fatigueTotals,
    };

    (async () => {
      const userId = await getCurrentUserId();

      if (userId) {
        const { error } = await saveWorkoutHistoryEntry(historyEntry, userId);
        if (error) setSyncError(error);
        return;
      }

      // Guest mode - unchanged. Local workout history is only ever read
      // here, on the guest path, so a logged-in user's save never touches
      // guest localStorage data.
      const history = JSON.parse(
        localStorage.getItem("workoutHistory") || "[]"
      );

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
    })();

    // Progressive Overload tracking: independent of the history save above -
    // runs for both guests (localStorage) and signed-in users (Supabase).
    (async () => {
      const performed = formatted.map((item: any) => ({
        name: item.exercise,
        bodyPart: item.bodyPart,
        weight: maxWeightLifted(item),
      }));

      const result = await recordWorkoutPersonalRecords(performed);
      if (result.error) return;

      const previousLevel = calculateOverallLevel(result.previousRecords);
      const newLevel = calculateOverallLevel(result.records);

      result.brokenRecords.forEach(({ record, previousWeight }) => {
        const delta =
          previousWeight != null
            ? ` (+${(record.weight - previousWeight).toFixed(1)} kg)`
            : "";
        toast(`🏆 New Personal Record! ${record.exerciseName} — ${record.weight} kg${delta}`);
      });

      if (newLevel.level > previousLevel.level) {
        setLevelUp({ level: newLevel.level, title: newLevel.title, color: newLevel.color });
      } else if (
        result.brokenRecords.length > 0 &&
        newLevel.progressPercent > previousLevel.progressPercent
      ) {
        toast(
          newLevel.nextLevel
            ? `📈 Progress increased! Getting closer to ${newLevel.nextLevel.title}.`
            : "📈 Progress increased!"
        );
      }
    })();

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

  const fatigueTotals = workouts.reduce(
    (acc: Record<string, number>, exercise: any) => {
      const fatigue = exercise.fatigueBreakdown || {};
  
      Object.entries(fatigue).forEach(([muscle, value]) => {
        acc[muscle] = (acc[muscle] || 0) + Number(value);
      });
  
      return acc;
    },
    {}
  );


  const fatigueArray = Object.entries(
    fatigueTotals
  ).map(([name, value]) => ({
    name: name
      .replace(/([A-Z])/g, " $1")
      .replace(/^./, (s) => s.toUpperCase()),
    value: Math.min(Number(value), 100),
  }));
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
      <div className="mx-auto flex w-full max-w-[520px] flex-col items-center gap-6">

        {/* Check Icon */}
        <div className="flex w-full justify-center">
          <div className="flex h-24 w-24 items-center justify-center rounded-full bg-lime-400 text-6xl text-black">
            ✓
          </div>
        </div>

        {/* Summary */}
        <div className="w-full rounded-3xl border border-[#222] bg-[#111] p-6">

          <h2 className="text-3xl font-bold text-center mb-6">
            Workout Summary
          </h2>

          <div className="mb-6 grid grid-cols-3 gap-4">

            <div className="flex flex-col items-center justify-center text-center">
              <p className="text-5xl font-bold text-lime-400">
                {workouts.length}
              </p>

              <p className="text-zinc-400">
                Exercises
              </p>
            </div>

            <div className="flex flex-col items-center justify-center text-center">
              <p className="text-5xl font-bold text-lime-400">
                {totalSets}
              </p>

              <p className="text-zinc-400">
                Total Sets
              </p>
            </div>

            <div className="flex flex-col items-center justify-center text-center">
              <p className="text-5xl font-bold text-lime-400">
                {totalReps}
              </p>

              <p className="text-zinc-400">
                Total Reps
              </p>
            </div>

          </div>

          {isPR && (
            <div className="mb-5 w-full rounded-2xl border border-yellow-500 bg-yellow-500/10 p-4 text-center">
              <p className="font-semibold text-yellow-400">
                🏆 Personal Record
              </p>

              <p className="mt-1 text-zinc-300">
                Highest Workout Score Yet
              </p>
            </div>
          )}

          {syncError && (
            <div className="mb-5 w-full rounded-2xl border border-red-500 bg-red-500/10 p-4 text-center">
              <p className="font-semibold text-red-400">
                Couldn't sync to cloud
              </p>

              <p className="mt-1 text-zinc-300">
                {syncError}
              </p>
            </div>
          )}

          <div className="flex w-full flex-col gap-3">
            {workouts.map((item: any, index: number) => (

              <div
                key={index}
                className="w-full rounded-2xl bg-[#1a1a1a] p-4"
              >
                <h3 className="mb-1 text-2xl">
                  {item.exercise}
                </h3>

                <p className="text-zinc-400">
                  {item.sets} sets × {item.reps} reps
                </p>

                {item.setWeights?.some((w: number | "") => w !== "") ? (
                  <p className="mt-1 text-sm text-zinc-500">
                    Weights:{" "}
                    {item.setWeights
                      .map((w: number | "") => (w === "" ? "-" : `${w}kg`))
                      .join(" • ")}
                  </p>
                ) : item.weight ? (
                  <p className="mt-1 text-sm text-zinc-500">
                    Weight: {item.weight}kg
                  </p>
                ) : null}
              </div>

            ))}
          </div>

        </div>

        {/* Final Fatigue */}
        <div className="w-full rounded-3xl border border-[#222] bg-[#111] p-6">

          <h2 className="mb-6 text-3xl">
            Final Fatigue Status
          </h2>

          <div className="flex flex-col gap-6">
            {fatigueArray.map((muscle) => (

              <div key={muscle.name} className="w-full">

                <div className="mb-2 flex justify-between">

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

                <div className="h-3 w-full overflow-hidden rounded-full bg-[#222]">

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

        </div>

        {/* Download Button */}
        <button
          onClick={downloadSummary}
          className="w-full rounded-2xl border border-lime-400 py-4 text-xl text-lime-400"
        >
          Download Summary
        </button>

        {/* Start New Workout */}
        <button
          onClick={() => {
            localStorage.removeItem("currentWorkout");
            window.location.href = "/home";
          }}
          className="w-full rounded-2xl bg-lime-400 py-5 text-2xl font-semibold text-black"
        >
          Start New Workout
        </button>

      </div>

      {levelUp && (
        <LevelUpCelebration
          level={levelUp.level}
          title={levelUp.title}
          color={levelUp.color}
          onClose={() => setLevelUp(null)}
        />
      )}
    </main>
  );
}