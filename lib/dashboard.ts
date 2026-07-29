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

export type WeekDayStatus = "workout" | "rest" | "future";

export type WeekDayProgress = {
  day: string;
  date: string;
  status: WeekDayStatus;
};

/** Derived weekly recovery signals from Mon–Sun day statuses. */
export type WeeklyRecoveryStatus = {
  workoutDays: number;
  restDays: number;
  hasWarning: boolean;
  isDanger: boolean;
  streakBroken: boolean;
};

export type WeeklyProgress = {
  workoutsThisWeek: number;
  setsThisWeek: number;
  repsThisWeek: number;
  /** Monday (index 0) through Sunday (index 6). */
  days: WeekDayProgress[];
  weekStartLabel: string;
} & WeeklyRecoveryStatus;

const WEEK_DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const;

/**
 * Builds Mon–Sun entries for the current calendar week, tagging each day
 * against workout history: "workout" if trained, "rest" if a past day with
 * no workout, "future" for today/upcoming days still without a workout.
 */
export function buildCurrentWeekProgress(
  history: WorkoutHistoryEntry[],
  now: number = Date.now()
): WeekDayProgress[] {
  const today = new Date(now);
  const mondayOffset = (today.getDay() + 6) % 7;
  const monday = new Date(today.getFullYear(), today.getMonth(), today.getDate() - mondayOffset);
  const todayKey = toLocalDayKey(now);

  const trainedDayKeys = new Set(
    (history || []).map((w) => toLocalDayKey(w.timestamp))
  );

  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    const date = toLocalDayKey(d.getTime());
    const hasWorkout = trainedDayKeys.has(date);

    let status: WeekDayStatus;
    if (hasWorkout) {
      status = "workout";
    } else if (date < todayKey) {
      status = "rest";
    } else {
      status = "future";
    }

    return {
      day: WEEK_DAY_LABELS[i],
      date,
      status,
    };
  });
}

/**
 * Computes weekly recovery status from Mon–Sun day entries.
 * Pure and reusable — does not touch workout history.
 */
export function calculateWeeklyRecoveryStatus(
  days: WeekDayProgress[]
): WeeklyRecoveryStatus {
  const workoutDays = days.filter((d) => d.status === "workout").length;
  const restDays = days.filter((d) => d.status === "rest").length;

  return {
    workoutDays,
    restDays,
    hasWarning: workoutDays === 6,
    isDanger: workoutDays === 7,
    streakBroken: restDays > 2,
  };
}

/** Aggregates the current calendar week (Monday-start) from workout history. */
export function calculateWeeklyProgress(
  history: WorkoutHistoryEntry[],
  now: number = Date.now()
): WeeklyProgress {
  const today = new Date(now);
  const mondayOffset = (today.getDay() + 6) % 7;
  const monday = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate() - mondayOffset
  );

  const thisWeekWorkouts = (history || []).filter((w) => w.timestamp >= monday.getTime());
  const days = buildCurrentWeekProgress(history, now);

  return {
    workoutsThisWeek: thisWeekWorkouts.length,
    setsThisWeek: thisWeekWorkouts.reduce((sum, w) => sum + (w.sets || 0), 0),
    repsThisWeek: thisWeekWorkouts.reduce((sum, w) => sum + (w.reps || 0), 0),
    days,
    weekStartLabel: monday.toLocaleDateString(undefined, { month: "short", day: "numeric" }),
    ...calculateWeeklyRecoveryStatus(days),
  };
}
