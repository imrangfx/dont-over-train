/**
 * Pure calculation helpers for the Home "Fitness Dashboard".
 *
 * Everything here is derived entirely from real workout history and
 * personal records that already exist elsewhere in the app (no new
 * database tables, no fabricated data). Kept separate from UI so these
 * calculations stay memoizable, testable, and reusable by future screens.
 *
 * Recovery/recommendation logic lives in lib/recoveryIntelligence.ts - see
 * that module for the full per-body-part Recovery Intelligence engine.
 */
import { toLocalDayKey, type WorkoutHistoryEntry } from "@/lib/workouts";

/** "Chest" / "upperBack" -> "Chest" / "Upper Back". */
export function formatMuscleLabel(muscle: string): string {
  return muscle
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (s) => s.toUpperCase())
    .trim();
}

export function getGreeting(now: number = Date.now()): string {
  const hour = new Date(now).getHours();
  if (hour < 5) return "Good Night";
  if (hour < 12) return "Good Morning";
  if (hour < 17) return "Good Afternoon";
  if (hour < 21) return "Good Evening";
  return "Good Night";
}

export type WeeklyProgress = {
  workoutsThisWeek: number;
  setsThisWeek: number;
  repsThisWeek: number;
  /** Monday (index 0) through Sunday (index 6). */
  daysTrained: boolean[];
  todayIndex: number;
  weekStartLabel: string;
};

/** Aggregates the current calendar week (Monday-start) from workout history. */
export function calculateWeeklyProgress(
  history: WorkoutHistoryEntry[],
  now: number = Date.now()
): WeeklyProgress {
  const today = new Date(now);
  const mondayOffset = (today.getDay() + 6) % 7;
  const monday = new Date(today.getFullYear(), today.getMonth(), today.getDate() - mondayOffset);

  const dayKeys = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return toLocalDayKey(d.getTime());
  });

  const thisWeekWorkouts = (history || []).filter((w) => w.timestamp >= monday.getTime());
  const trainedDayKeys = new Set(thisWeekWorkouts.map((w) => toLocalDayKey(w.timestamp)));

  return {
    workoutsThisWeek: thisWeekWorkouts.length,
    setsThisWeek: thisWeekWorkouts.reduce((sum, w) => sum + (w.sets || 0), 0),
    repsThisWeek: thisWeekWorkouts.reduce((sum, w) => sum + (w.reps || 0), 0),
    daysTrained: dayKeys.map((key) => trainedDayKeys.has(key)),
    todayIndex: mondayOffset,
    weekStartLabel: monday.toLocaleDateString(undefined, { month: "short", day: "numeric" }),
  };
}
