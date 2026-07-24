"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Share2 } from "lucide-react";
import {
  calculateCurrentStreak,
  getCurrentUserId,
  loadWorkoutHistory,
  saveWorkoutHistoryEntry,
  saveWorkoutHistoryEntryLocally,
  type WorkoutHistoryEntry,
} from "@/lib/workouts";
import { recordWorkoutPersonalRecords } from "@/lib/personalRecords";
import { calculateBodyPartLevel } from "@/lib/bodyPartProgression";
import { buildPersonalRecordShareCard, type ShareCardData } from "@/lib/shareCard";
import { type InProgressWorkoutItem } from "@/lib/workouts";
import {
  clearCompletedWorkoutSummary,
  completeWorkoutSession,
  formatDurationMinutes,
  getActiveWorkoutSession,
  getCompletedWorkoutSummary,
  getSessionDurationMinutes,
} from "@/lib/workoutSession";
import { useToast } from "@/components/ui/Toast";
import LevelUpCelebration from "@/components/LevelUpCelebration";
import ShareCardModal from "@/components/ShareCardModal";

/** Best (highest) weight lifted for a single exercise this session. */
function maxWeightLifted(item: InProgressWorkoutItem): number {
  const weights = Array.isArray(item.setWeights) ? item.setWeights : [];
  const numeric = weights.filter(
    (w: unknown): w is number => typeof w === "number" && w > 0
  );
  if (numeric.length > 0) return Math.max(...numeric);
  return typeof item.weight === "number" ? item.weight : 0;
}

function leaveWorkoutFlow(path = "/home") {
  clearCompletedWorkoutSummary();
  window.location.href = path;
}

export default function CompletePage() {
  const router = useRouter();
  const { toast } = useToast();
  const [workouts, setWorkouts] = useState<InProgressWorkoutItem[]>([]);
  const [isPR, setIsPR] = useState(false);
  const [syncError, setSyncError] = useState<string | null>(null);
  const [levelUp, setLevelUp] = useState<{
    level: number;
    title: string;
    color: string;
  } | null>(null);
  const [shareData, setShareData] = useState<ShareCardData | null>(null);
  const [showShareCard, setShowShareCard] = useState(false);
  const [ready, setReady] = useState(false);
  /** Already-saved session duration — displayed only, never recalculated in the UI. */
  const [durationMinutes, setDurationMinutes] = useState(0);

  useEffect(() => {
    const existingSession = getActiveWorkoutSession();
    const saved = JSON.parse(localStorage.getItem("currentWorkout") || "[]");
    const fromStorage: InProgressWorkoutItem[] = Array.isArray(saved)
      ? saved
      : [saved];

    // Already finished (session cleared) — restore summary draft if present.
    // Never send the user back to Start Workout for a completed session.
    if (!existingSession) {
      const draft = getCompletedWorkoutSummary();
      if (draft && Array.isArray(draft.exercises) && draft.exercises.length > 0) {
        queueMicrotask(() => {
          setWorkouts(draft.exercises as InProgressWorkoutItem[]);
          setDurationMinutes(draft.durationMinutes);
          setReady(true);
        });
        return;
      }

      router.replace("/home");
      return;
    }

    const formatted = fromStorage.filter(Boolean);
    if (formatted.length === 0) {
      router.replace("/home");
      return;
    }

    const endedAt = Date.now();
    const startedAt = existingSession.startedAt;
    const durationMinutes = getSessionDurationMinutes(startedAt, endedAt);

    const totalSetsHistory = formatted.reduce(
      (acc, item) => acc + item.sets,
      0
    );

    const totalRepsHistory = formatted.reduce(
      (acc, item) =>
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

    formatted.forEach((exercise) => {
      if (!exercise.fatigueBreakdown) return;

      Object.entries(exercise.fatigueBreakdown).forEach(
        ([muscle, value]) => {
          fatigueTotals[muscle] =
            (fatigueTotals[muscle] || 0) +
            Number(value);
        }
      );
    });

    const historyEntry: WorkoutHistoryEntry = {
      id: crypto.randomUUID(),

      date: new Date().toLocaleDateString(),

      timestamp: endedAt,

      exercises: formatted.length,

      sets: totalSetsHistory,

      reps: totalRepsHistory,

      durationMinutes,
      startedAt,
      endedAt,

      score,

      bodyParts: Array.from(
        new Set(
          formatted
            .map((item) => item.bodyPart)
            .filter(Boolean)
        )
      ),
      sections: Array.from(
        new Set(
          formatted
            .map((item) => item.section)
            .filter((section): section is string => Boolean(section))
        )
      ),

      exerciseList: formatted.map((item) => ({
        name: item.exercise,
        bodyPart: item.bodyPart,
        section: item.section || "",
        sets: item.sets,
        reps: item.reps,
        weights: item.setWeights || [],
        fatigueBreakdown: item.fatigueBreakdown || {},
      })),
      fatigueBreakdown: fatigueTotals,
    };

    // Mark session completed: stash summary, clear active session + exercises
    // so Back / Start can never reopen this workout.
    completeWorkoutSession({
      exercises: formatted,
      startedAt,
      endedAt,
      durationMinutes,
    });

    queueMicrotask(() => {
      setWorkouts(formatted);
      setDurationMinutes(durationMinutes);
      setReady(true);
    });

    (async () => {
      const userId = await getCurrentUserId();

      if (userId) {
        const result = await saveWorkoutHistoryEntry(historyEntry, userId);
        const { error, authExpired, authExpiredPath } = result;

        // Diagnose every sync outcome on production (browser console).
        console.warn("[workout-sync] complete_page_save", {
          userId,
          entryId: historyEntry.id,
          error,
          authExpired: !!authExpired,
          authExpiredPath: authExpiredPath ?? null,
          willShowSyncWarning: !!(error && authExpired),
        });

        if (error) {
          // Never lose the workout: keep a local copy so it syncs
          // automatically next time there's a valid session (see
          // migrateGuestHistoryToCloud).
          saveWorkoutHistoryEntryLocally(historyEntry);
          // Only warn about signing in when auth is actually gone — not for
          // transient network / server failures while the user is signed in.
          if (authExpired) {
            setSyncError(
              "Workout saved locally. Cloud sync will resume after you sign in again."
            );
          }
        }
        return;
      }

      console.warn("[workout-sync] complete_page_guest", {
        entryId: historyEntry.id,
        reason: "getCurrentUserId returned null",
      });

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
      const performed = formatted.map((item) => ({
        name: item.exercise,
        bodyPart: item.bodyPart,
        weight: maxWeightLifted(item),
      }));

      const result = await recordWorkoutPersonalRecords(performed);
      if (result.error) return;

      // Compare body-part levels before/after this workout. Excluding this
      // workout's id from "previous" (rather than relying on load timing
      // relative to the history save above) keeps the comparison correct
      // no matter which of the two independent async operations finishes first.
      const { history: existingHistory } = await loadWorkoutHistory();
      const previousHistory = existingHistory.filter((entry) => entry.id !== historyEntry.id);
      const newHistory = [historyEntry, ...previousHistory];

      const previousLevel = calculateBodyPartLevel(previousHistory);
      const newLevel = calculateBodyPartLevel(newHistory);

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

      if (result.brokenRecords.length > 0) {
        const topBroken = result.brokenRecords.reduce((best, current) =>
          current.record.weight > best.record.weight ? current : best
        );
        const currentStreak = calculateCurrentStreak(newHistory);

        setShareData(
          buildPersonalRecordShareCard(
            topBroken.record,
            topBroken.previousWeight,
            newLevel,
            currentStreak
          )
        );
      }
    })();

    const previousBest = Number(
      localStorage.getItem("bestWorkoutScore") || 0
    );

    const currentScore = Math.min(
      Math.round(
        formatted.reduce(
          (acc, item) =>
            acc + item.sets,
          0
        ) * 5 +
        formatted.reduce(
          (acc, item) =>
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

      queueMicrotask(() => setIsPR(true));
    }
    // `toast` is a stable useCallback reference (see components/ui/Toast.tsx)
    // so including it here does not cause this mount-only effect to re-run.
  }, [toast, router]);

  if (!ready) {
    return (
      <main
        role="status"
        aria-label="Loading"
        className="flex min-h-screen items-center justify-center bg-black"
      >
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-zinc-700 border-t-lime-400" />
      </main>
    );
  }

  const totalSets = workouts.reduce(
    (acc, item) => acc + item.sets,
    0
  );

  const totalReps = workouts.reduce(
    (acc, item) => acc + item.sets * item.reps,
    0
  );

  const fatigueTotals = workouts.reduce(
    (acc: Record<string, number>, exercise) => {
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
  return (
    <main className="min-h-screen bg-black text-white px-6 py-8 pb-[max(2rem,env(safe-area-inset-bottom))]">
      <div className="mx-auto flex w-full max-w-[430px] flex-col items-center gap-6">

        {/* Check Icon */}
        <div className="flex w-full justify-center">
          <div
            className="flex h-24 w-24 items-center justify-center rounded-full bg-lime-400 text-6xl text-black"
            aria-hidden="true"
          >
            ✓
          </div>
        </div>

        {/* Summary */}
        <div className="w-full rounded-3xl border border-[#222] bg-[#111] p-6">

          <h2 className="text-3xl font-bold text-center mb-6">
            Workout Summary
          </h2>

          <div className="mb-6 grid grid-cols-2 gap-4">

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

            <div className="flex flex-col items-center justify-center text-center">
              <p className="text-5xl font-bold text-lime-400">
                {formatDurationMinutes(durationMinutes)}
              </p>

              <p className="text-zinc-400">
                Workout Duration
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

          {shareData && (
            <button
              type="button"
              onClick={() => setShowShareCard(true)}
              className="btn-base mb-5 flex w-full items-center justify-center gap-2 rounded-2xl border border-lime-400/40 bg-lime-400/10 py-3 font-semibold text-lime-400 hover:bg-lime-400/15"
            >
              <Share2 size={18} aria-hidden="true" />
              Share Achievement
            </button>
          )}

          {syncError && (
            <div className="mb-5 w-full rounded-2xl border border-red-500 bg-red-500/10 p-4 text-center">
              <p className="font-semibold text-red-400">
                Couldn&apos;t sync to cloud
              </p>

              <p className="mt-1 text-zinc-300">
                {syncError}
              </p>
            </div>
          )}

          <div className="flex w-full flex-col gap-3">
            {workouts.map((item, index) => (

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

        {/* View Progress */}
        <button
          type="button"
          onClick={() => leaveWorkoutFlow("/profile")}
          className="btn-base w-full rounded-2xl bg-lime-400 py-5 text-2xl font-semibold text-black hover:brightness-110"
        >
          View Progress
        </button>

        <button
          type="button"
          onClick={() => leaveWorkoutFlow("/home")}
          className="btn-base w-full rounded-2xl border border-[#333] bg-transparent py-4 text-lg text-zinc-400 hover:text-white"
        >
          Back to Home
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

      {showShareCard && shareData && (
        <ShareCardModal data={shareData} onClose={() => setShowShareCard(false)} />
      )}
    </main>
  );
}