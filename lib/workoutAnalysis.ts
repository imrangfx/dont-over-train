/**
 * Workout quality ratings and single-focus analysis.
 *
 * Built on real session durations (durationMinutes) plus volume metrics.
 * Add future coaching insights by extending ANALYSIS_RULES — callers only
 * need analyzeWorkout() / rate* helpers; no session architecture changes.
 */

import type { WorkoutHistoryEntry } from "@/lib/workouts";
import { formatDurationMinutes } from "@/lib/workoutSession";

export type QualityRating = "great" | "good" | "average" | "poor";

export type MetricQuality = {
  rating: QualityRating;
  emoji: string;
  label: string;
};

const RATING_META: Record<
  QualityRating,
  { emoji: string; label: string }
> = {
  great: { emoji: "😄", label: "Great" },
  good: { emoji: "🙂", label: "Good" },
  average: { emoji: "😐", label: "Average" },
  poor: { emoji: "☹️", label: "Poor" },
};

function quality(rating: QualityRating): MetricQuality {
  return { rating, ...RATING_META[rating] };
}

export type TimeEfficiencyResult = {
  rating: QualityRating;
  emoji: string;
  label: string;
  /** Sets completed per hour of training. */
  setsPerHour: number;
};

/**
 * Efficiency from duration + volume — not duration alone.
 * Rewards solid work density; penalizes very short/low-volume and
 * extremely long/low-volume sessions.
 */
export function evaluateTimeEfficiency(input: {
  durationMinutes: number;
  exercises: number;
  sets: number;
  reps: number;
  score: number;
}): TimeEfficiencyResult {
  const duration = Math.max(0, Number(input.durationMinutes) || 0);
  const sets = Math.max(0, Number(input.sets) || 0);
  const exercises = Math.max(0, Number(input.exercises) || 0);
  const hours = Math.max(duration / 60, 1 / 60);
  const setsPerHour = sets / hours;

  let rating: QualityRating = "average";

  if (duration === 0 || (sets === 0 && exercises === 0)) {
    rating = "poor";
  } else if (duration < 20 && sets < 8) {
    rating = "poor";
  } else if (duration >= 100 && setsPerHour < 8) {
    // Extremely long with low volume density
    rating = "poor";
  } else if (
    duration >= 45 &&
    duration <= 75 &&
    sets >= 12 &&
    exercises >= 4 &&
    setsPerHour >= 12
  ) {
    rating = "great";
  } else if (
    duration >= 35 &&
    duration <= 90 &&
    sets >= 10 &&
    exercises >= 3 &&
    setsPerHour >= 10
  ) {
    rating = "good";
  } else if (setsPerHour >= 14 && sets >= 10 && duration <= 100) {
    rating = "great";
  } else if (setsPerHour >= 10 && sets >= 8) {
    rating = "good";
  } else if (setsPerHour < 7 || (duration > 120 && sets < 12)) {
    rating = "poor";
  } else {
    rating = "average";
  }

  return { ...quality(rating), setsPerHour: Math.round(setsPerHour * 10) / 10 };
}

/**
 * Aggregate Training Time quality across a history window.
 * Uses average duration + average volume so longer totals alone don't win.
 */
export function rateTrainingTime(
  workouts: Array<{
    durationMinutes?: number;
    exercises?: number;
    sets?: number;
    reps?: number;
    score?: number;
  }>
): MetricQuality {
  if (!workouts.length) return quality("average");

  const avg = {
    durationMinutes:
      workouts.reduce((s, w) => s + (Number(w.durationMinutes) || 0), 0) /
      workouts.length,
    exercises:
      workouts.reduce((s, w) => s + (Number(w.exercises) || 0), 0) /
      workouts.length,
    sets: workouts.reduce((s, w) => s + (Number(w.sets) || 0), 0) / workouts.length,
    reps: workouts.reduce((s, w) => s + (Number(w.reps) || 0), 0) / workouts.length,
    score: workouts.reduce((s, w) => s + (Number(w.score) || 0), 0) / workouts.length,
  };

  return quality(evaluateTimeEfficiency(avg).rating);
}

export function rateExercisesCompleted(
  totalExercises: number,
  workoutCount: number
): MetricQuality {
  if (workoutCount <= 0) return quality("average");

  const perWorkout = totalExercises / workoutCount;

  if (perWorkout >= 6) return quality("great");
  if (perWorkout >= 4) return quality("good");
  if (perWorkout >= 2.5) return quality("average");
  return quality("poor");
}

export function rateWorkoutScore(score: number): MetricQuality {
  const value = Number(score) || 0;

  if (value >= 80) return quality("great");
  if (value >= 60) return quality("good");
  if (value >= 40) return quality("average");
  return quality("poor");
}

export function rateCurrentStreak(days: number): MetricQuality {
  const value = Math.max(0, Number(days) || 0);

  if (value >= 7) return quality("great");
  if (value >= 4) return quality("good");
  if (value >= 2) return quality("average");
  return quality("poor");
}

export type WorkoutAnalysisKind =
  | "time_efficiency"
  | "volume"
  | "sets"
  | "score"
  | "excellent";

export type WorkoutAnalysis = {
  kind: WorkoutAnalysisKind;
  title: string;
  /** Leading glyph for the card heading. */
  emoji: "⚠️" | "✅";
  /** Short lines shown under the title — keep to one focus. */
  lines: string[];
};

type AnalysisContext = {
  workout: WorkoutHistoryEntry;
  recentAverageScore: number | null;
  efficiency: TimeEfficiencyResult;
};

type AnalysisRule = {
  kind: WorkoutAnalysisKind;
  /** Higher = more important (shown first when multiple match). */
  priority: number;
  match: (ctx: AnalysisContext) => boolean;
  build: (ctx: AnalysisContext) => WorkoutAnalysis;
};

/**
 * Ordered coaching rules. Future insights: append a rule with a priority.
 * analyzeWorkout() always returns exactly one result (the highest match).
 */
const ANALYSIS_RULES: AnalysisRule[] = [
  {
    kind: "time_efficiency",
    priority: 100,
    match: ({ efficiency, workout }) =>
      efficiency.rating === "poor" && (workout.durationMinutes || 0) >= 75,
    build: ({ workout, efficiency }) => ({
      kind: "time_efficiency",
      emoji: "⚠️",
      title: "Time Efficiency",
      lines: [
        `You spent ${formatDurationMinutes(workout.durationMinutes || 0)} in the gym.`,
        `Only ${workout.exercises} exercise${workout.exercises === 1 ? "" : "s"} were completed.`,
        efficiency.setsPerHour < 8
          ? "Try reducing long rest periods between sets."
          : "Aim for denser work next session.",
      ],
    }),
  },
  {
    kind: "volume",
    priority: 90,
    match: ({ workout }) => (workout.sets || 0) > 0 && (workout.sets || 0) < 10,
    build: ({ workout }) => ({
      kind: "volume",
      emoji: "⚠️",
      title: "Workout Volume",
      lines: [
        `Only ${workout.sets} set${workout.sets === 1 ? "" : "s"} were completed.`,
        "Try completing 12–16 quality sets next session.",
      ],
    }),
  },
  {
    kind: "sets",
    priority: 85,
    match: ({ workout }) => (workout.sets || 0) >= 10 && (workout.sets || 0) < 12,
    build: ({ workout }) => ({
      kind: "sets",
      emoji: "⚠️",
      title: "Too Few Sets",
      lines: [
        `You finished ${workout.sets} sets.`,
        "Adding 2–4 quality sets next time will push volume into a stronger range.",
      ],
    }),
  },
  {
    kind: "score",
    priority: 80,
    match: ({ workout, recentAverageScore }) => {
      const score = workout.score || 0;
      if (score < 40) return true;
      if (recentAverageScore != null && score < recentAverageScore - 15) return true;
      return false;
    },
    build: ({ workout, recentAverageScore }) => ({
      kind: "score",
      emoji: "⚠️",
      title: "Workout Score",
      lines: [
        recentAverageScore != null && (workout.score || 0) < recentAverageScore - 15
          ? "Today's workout intensity was lower than your recent average."
          : `Today's workout score was ${workout.score}.`,
        "Consider increasing weight or effort next workout.",
      ],
    }),
  },
  {
    kind: "excellent",
    priority: 0,
    match: ({ efficiency, workout }) =>
      (efficiency.rating === "great" || efficiency.rating === "good") &&
      (workout.sets || 0) >= 12 &&
      (workout.score || 0) >= 50,
    build: () => ({
      kind: "excellent",
      emoji: "✅",
      title: "Great Workout",
      lines: [
        "Excellent workout duration and volume.",
        "Keep it up.",
      ],
    }),
  },
];

function recentAverageScore(
  history: WorkoutHistoryEntry[],
  excludeId?: string
): number | null {
  const others = history.filter((w) => w.id !== excludeId).slice(0, 5);
  if (others.length === 0) return null;

  const sum = others.reduce((acc, w) => acc + (Number(w.score) || 0), 0);
  return sum / others.length;
}

/**
 * Returns the single most important improvement (or praise) for a workout.
 * Never stacks multiple warnings — highest-priority matching rule wins.
 */
export function analyzeWorkout(
  workout: WorkoutHistoryEntry,
  history: WorkoutHistoryEntry[] = []
): WorkoutAnalysis {
  const efficiency = evaluateTimeEfficiency({
    durationMinutes: workout.durationMinutes || 0,
    exercises: workout.exercises || 0,
    sets: workout.sets || 0,
    reps: workout.reps || 0,
    score: workout.score || 0,
  });

  const ctx: AnalysisContext = {
    workout,
    recentAverageScore: recentAverageScore(history, workout.id),
    efficiency,
  };

  const matches = ANALYSIS_RULES.filter((rule) => rule.match(ctx)).sort(
    (a, b) => b.priority - a.priority
  );

  if (matches.length > 0) {
    return matches[0].build(ctx);
  }

  // Neutral fallback when nothing strong fires — still one focused tip.
  if (efficiency.rating === "poor") {
    return {
      kind: "time_efficiency",
      emoji: "⚠️",
      title: "Time Efficiency",
      lines: [
        `You spent ${formatDurationMinutes(workout.durationMinutes || 0)} training.`,
        "Tighten rest periods or add a bit more volume next time.",
      ],
    };
  }

  return {
    kind: "excellent",
    emoji: "✅",
    title: "Great Workout",
    lines: [
      "Solid session — duration and volume look balanced.",
      "Keep it up.",
    ],
  };
}
