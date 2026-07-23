"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowLeft, CheckCircle2, Circle } from "lucide-react";
import { loadWorkoutHistory, type WorkoutHistoryEntry } from "@/lib/workouts";
import { calculateBodyPartLevel } from "@/lib/bodyPartProgression";
import BottomNav from "@/components/BottomNav";
import LoadingCard from "@/components/ui/LoadingCard";

/** Formats a kg amount without a trailing ".0" for whole numbers (e.g. 2.5 stays "2.5", 20 becomes "20"). */
function formatKg(value: number): string {
  const rounded = Math.round(value * 10) / 10;
  return Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(1);
}

export default function LevelDetailsPage() {
  const [history, setHistory] = useState<WorkoutHistoryEntry[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);

  useEffect(() => {
    let active = true;

    loadWorkoutHistory().then((result) => {
      if (!active) return;
      setHistory(result.history);
      setLoadingHistory(false);
    });

    return () => {
      active = false;
    };
  }, []);

  const bodyPartLevel = calculateBodyPartLevel(history);

  // Presentation-only: derives the "Next Goal" summary from the level
  // checklist that calculateBodyPartLevel() already returns - no new
  // level/threshold math happens here.
  const unmetBodyParts = bodyPartLevel.checklist
    .filter((item) => !item.met)
    .map((item) => ({ ...item, kgNeeded: item.requiredWeight - item.currentWeight }))
    .sort((a, b) => a.kgNeeded - b.kgNeeded);

  const nextGoalMet = !bodyPartLevel.nextLevel || unmetBodyParts.length === 0;
  const topSuggestions = unmetBodyParts.slice(0, 2);

  return (
    <main className="min-h-screen bg-black px-6 py-8 pb-[calc(72px+env(safe-area-inset-bottom)+1.5rem)] text-white animate-[fade-in_200ms_ease-out]">
      <div className="mx-auto max-w-[390px]">
        <Link
          href="/profile"
          className="btn-base inline-flex items-center gap-2 rounded-lg text-zinc-400 hover:text-white"
        >
          <ArrowLeft size={18} aria-hidden="true" />
          ← Profile
        </Link>

        <h1 className="mt-6 text-2xl font-bold">Level Details</h1>

        {loadingHistory ? (
          <div className="mt-6 space-y-4" aria-busy="true">
            <LoadingCard rows={3} />
            <LoadingCard rows={2} />
            <LoadingCard rows={3} />
          </div>
        ) : (
          <>
            {/* Level + progress */}
            <div
              className="card-surface mt-6 overflow-hidden p-5"
              style={{
                background:
                  "linear-gradient(135deg, rgba(17,17,17,1) 0%, rgba(17,17,17,1) 60%, rgba(57,255,20,0.06) 100%)",
              }}
            >
              <span className="text-2xl font-bold" style={{ color: bodyPartLevel.color }}>
                Level {bodyPartLevel.level}
              </span>
              <p className="mt-1 text-sm font-semibold text-zinc-400">{bodyPartLevel.title}</p>

              <div className="mt-4 h-2.5 w-full overflow-hidden rounded-full bg-zinc-800">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${bodyPartLevel.progressPercent}%`,
                    backgroundColor: bodyPartLevel.color,
                  }}
                />
              </div>

              <div className="mt-2 flex items-center justify-between text-xs text-zinc-500">
                <span>{bodyPartLevel.progressPercent}% Complete</span>
                <span>
                  Next Rank: {bodyPartLevel.nextLevel ? bodyPartLevel.nextLevel.title : "Max Level"}
                </span>
              </div>
            </div>

            {/* Next Goal */}
            <div className="card-surface mt-5 p-5">
              {nextGoalMet ? (
                <>
                  <h2 className="flex items-center gap-2 text-sm font-semibold text-lime-400">
                    <span aria-hidden="true">🎉</span> Congratulations!
                  </h2>
                  <p className="mt-2 text-sm leading-relaxed text-zinc-300">
                    You&apos;ve met all requirements for the next level.
                  </p>
                </>
              ) : (
                <>
                  <h2 className="flex items-center gap-2 text-sm font-semibold text-lime-400">
                    <span aria-hidden="true">🎯</span> Next Goal
                  </h2>

                  <p className="mt-2 text-sm leading-relaxed text-zinc-300">
                    You&apos;re only {unmetBodyParts.length} body part
                    {unmetBodyParts.length !== 1 ? "s" : ""} away from reaching{" "}
                    <span className="font-semibold text-white">{bodyPartLevel.nextLevel?.title}</span>.
                  </p>

                  <ul className="mt-3 space-y-1.5">
                    {topSuggestions.map((item) => (
                      <li key={item.bodyPart} className="text-sm text-zinc-400">
                        Increase your <span className="text-white">{item.bodyPart}</span> PR by{" "}
                        <span className="font-semibold text-lime-400">{formatKg(item.kgNeeded)} kg</span>.
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </div>

            {/* Body Part Progress */}
            <div className="card-surface mt-5 p-5">
              <h2 className="text-lg font-semibold">Body Part Progress</h2>

              <div className="mt-4 space-y-2">
                {bodyPartLevel.checklist.map((item) => (
                  <div
                    key={item.bodyPart}
                    className="flex items-center justify-between gap-3 rounded-xl bg-[#191919] px-3 py-2.5"
                  >
                    <div className="flex min-w-0 items-center gap-2.5">
                      {item.met ? (
                        <CheckCircle2
                          size={16}
                          className="shrink-0 text-lime-400"
                          aria-hidden="true"
                        />
                      ) : (
                        <Circle size={16} className="shrink-0 text-zinc-600" aria-hidden="true" />
                      )}
                      <span className="truncate text-sm text-white">{item.bodyPart}</span>
                    </div>

                    <span
                      className={`shrink-0 text-sm font-medium ${item.met ? "text-lime-400" : "text-zinc-500"}`}
                    >
                      {item.currentWeight} / {item.requiredWeight} kg
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>

      <BottomNav />
    </main>
  );
}
