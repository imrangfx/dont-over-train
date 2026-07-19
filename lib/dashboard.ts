/**
 * Pure calculation helpers for the Home "Fitness Dashboard".
 *
 * Everything here is derived entirely from real workout history and
 * personal records that already exist elsewhere in the app (no new
 * database tables, no fabricated data). Kept separate from UI so these
 * calculations stay memoizable, testable, and reusable by future screens.
 */
import { recoveryHoursForFatigue, toLocalDayKey, type WorkoutHistoryEntry } from "@/lib/workouts";

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

export type MuscleRecoveryStatus = {
  muscle: string;
  fatigue: number;
  recoveryHoursNeeded: number;
  recoveryPercent: number;
};

export type RecoveryStatusLabel = "Fresh" | "Recovering" | "Fatigued";

export type RecoverySummary = {
  /** False when there isn't enough workout history to estimate recovery yet. */
  hasData: boolean;
  overallRecoveryPercent: number;
  status: RecoveryStatusLabel;
  hoursSinceLastWorkout: number | null;
  mostFatiguedMuscle: MuscleRecoveryStatus | null;
  muscles: MuscleRecoveryStatus[];
};

const FRESH_THRESHOLD = 85;
const RECOVERING_THRESHOLD = 50;

/**
 * Estimates how recovered the user's body is right now, based on the
 * fatigue produced by their most recent workout and how much time has
 * passed since. Reuses the same fatigue -> recovery-hours tiers already
 * used for in-workout recovery guidance, just applied over elapsed time
 * instead of instantaneous load.
 */
export function calculateRecoveryScore(
  history: WorkoutHistoryEntry[],
  now: number = Date.now()
): RecoverySummary {
  if (!history || history.length === 0) {
    return {
      hasData: false,
      overallRecoveryPercent: 100,
      status: "Fresh",
      hoursSinceLastWorkout: null,
      mostFatiguedMuscle: null,
      muscles: [],
    };
  }

  const last = history[0];
  const hoursElapsed = Math.max(0, (now - last.timestamp) / (1000 * 60 * 60));
  const entries = Object.entries(last.fatigueBreakdown || {}).filter(
    ([, value]) => Number(value) > 0
  );

  if (entries.length === 0) {
    return {
      hasData: true,
      overallRecoveryPercent: 100,
      status: "Fresh",
      hoursSinceLastWorkout: hoursElapsed,
      mostFatiguedMuscle: null,
      muscles: [],
    };
  }

  const muscles: MuscleRecoveryStatus[] = entries.map(([muscle, rawValue]) => {
    const fatigue = Math.min(Number(rawValue), 100);
    const recoveryHoursNeeded = recoveryHoursForFatigue(fatigue);
    const recoveryPercent = Math.round(
      Math.min(100, (hoursElapsed / recoveryHoursNeeded) * 100)
    );
    return { muscle, fatigue, recoveryHoursNeeded, recoveryPercent };
  });

  const overallRecoveryPercent = Math.round(
    muscles.reduce((sum, m) => sum + m.recoveryPercent, 0) / muscles.length
  );

  const mostFatiguedMuscle = muscles.reduce((worst, m) =>
    m.recoveryPercent < worst.recoveryPercent ? m : worst
  );

  const status: RecoveryStatusLabel =
    overallRecoveryPercent >= FRESH_THRESHOLD
      ? "Fresh"
      : overallRecoveryPercent >= RECOVERING_THRESHOLD
        ? "Recovering"
        : "Fatigued";

  return {
    hasData: true,
    overallRecoveryPercent,
    status,
    hoursSinceLastWorkout: hoursElapsed,
    mostFatiguedMuscle: mostFatiguedMuscle.recoveryPercent < 100 ? mostFatiguedMuscle : null,
    muscles,
  };
}

export type TodaysRecommendation = {
  headline: string;
  detail: string;
  ctaLabel: string;
  ctaHref: string;
};

/**
 * Finds which of the app's known body parts has gone longest without being
 * trained (never-trained parts win first), using only the `bodyParts` field
 * already stored on every workout history entry.
 */
function findLeastRecentlyTrainedBodyPart(
  history: WorkoutHistoryEntry[],
  knownBodyParts: string[],
  now: number
): { bodyPart: string; daysAgo: number | null } | null {
  if (!knownBodyParts || knownBodyParts.length === 0) return null;

  const lastTrainedAt = new Map<string, number>();
  for (const workout of history) {
    for (const bp of workout.bodyParts || []) {
      const existing = lastTrainedAt.get(bp);
      if (existing == null || workout.timestamp > existing) {
        lastTrainedAt.set(bp, workout.timestamp);
      }
    }
  }

  let best: { bodyPart: string; timestamp: number } | null = null;
  for (const bodyPart of knownBodyParts) {
    const timestamp = lastTrainedAt.get(bodyPart) ?? Number.NEGATIVE_INFINITY;
    if (!best || timestamp < best.timestamp) {
      best = { bodyPart, timestamp };
    }
  }

  if (!best) return null;

  const daysAgo = Number.isFinite(best.timestamp)
    ? Math.floor((now - best.timestamp) / (24 * 60 * 60 * 1000))
    : null;

  return { bodyPart: best.bodyPart, daysAgo };
}

/**
 * Rule-based (no AI) recommendation for what to do today, derived from
 * recovery status and, when the user is fully recovered, which known body
 * part has been neglected the longest.
 */
export function getTodaysRecommendation(
  history: WorkoutHistoryEntry[],
  recovery: RecoverySummary,
  knownBodyParts: string[],
  now: number = Date.now()
): TodaysRecommendation {
  if (!history || history.length === 0) {
    return {
      headline: "Start Your Fitness Journey",
      detail:
        "Pick a muscle group below to log your first workout and unlock personalized recommendations.",
      ctaLabel: "Choose a Muscle Group",
      ctaHref: "#quick-start",
    };
  }

  if (recovery.hasData && recovery.status === "Fatigued" && recovery.mostFatiguedMuscle) {
    const label = formatMuscleLabel(recovery.mostFatiguedMuscle.muscle);
    return {
      headline: "Active Recovery Day",
      detail: `${label} is still recovering (${recovery.mostFatiguedMuscle.recoveryPercent}% ready). Train a different muscle group or take it easy today.`,
      ctaLabel: "Browse Muscle Groups",
      ctaHref: "#quick-start",
    };
  }

  const leastRecent = findLeastRecentlyTrainedBodyPart(history, knownBodyParts, now);

  if (leastRecent) {
    const detail =
      leastRecent.daysAgo == null
        ? `You haven't trained ${leastRecent.bodyPart} yet - balance out your training by starting there.`
        : leastRecent.daysAgo === 0
          ? `Keep the momentum going with another ${leastRecent.bodyPart} session.`
          : `It's been ${leastRecent.daysAgo} day${leastRecent.daysAgo === 1 ? "" : "s"} since you trained ${leastRecent.bodyPart}.`;

    return {
      headline: `Train ${leastRecent.bodyPart} Today`,
      detail,
      ctaLabel: `Start ${leastRecent.bodyPart} Workout`,
      ctaHref: `/workout/${leastRecent.bodyPart.toLowerCase()}`,
    };
  }

  return {
    headline: "You're Ready to Train",
    detail: "Your body is recovered. Pick any muscle group below to get started.",
    ctaLabel: "Browse Muscle Groups",
    ctaHref: "#quick-start",
  };
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
