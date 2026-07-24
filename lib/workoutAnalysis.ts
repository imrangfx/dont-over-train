/**
 * Workout quality ratings and single-focus analysis.
 *
 * Rating helpers power Profile statistic cards. analyzeWorkout() returns
 * exactly one prioritized insight for the Workout Analysis card, always from
 * the same filtered workout list as Workout Insights (averages / trends).
 */

import type { WorkoutHistoryEntry } from "@/lib/workouts";
import { formatDurationMinutes } from "@/lib/workoutSession";

export type QualityRating = "great" | "good" | "average" | "poor";

export type MetricQuality = {
  rating: QualityRating;
  /** @deprecated Prefer Lucide icons in UI — kept for analysis copy compatibility. */
  emoji: string;
  label: string;
};

const RATING_META: Record<
  QualityRating,
  { emoji: string; label: string }
> = {
  great: { emoji: "", label: "Excellent" },
  good: { emoji: "", label: "Good" },
  average: { emoji: "", label: "Average" },
  poor: { emoji: "", label: "Poor" },
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

/** Rates total workout count in the current filter window from real history. */
export function rateTotalWorkouts(workoutCount: number): MetricQuality {
  const value = Math.max(0, Number(workoutCount) || 0);

  if (value <= 0) return quality("poor");
  if (value >= 12) return quality("great");
  if (value >= 6) return quality("good");
  if (value >= 3) return quality("average");
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
  | "duration"
  | "volume"
  | "exercise_selection"
  | "recovery"
  | "personal_record"
  | "excellent";

export type WorkoutAnalysis = {
  kind: WorkoutAnalysisKind;
  title: string;
  /** Leading glyph for the card heading — UI consumes this as-is. */
  emoji: "⚠️" | "✅";
  /** Short lines shown under the title — keep to one focus. */
  lines: string[];
};

/** Ideal productive session window (minutes). Outside this = duration insight. */
const DURATION_MIN_IDEAL = 35;
const DURATION_MAX_IDEAL = 75;
/** "Significantly" outside the ideal window (average duration). */
const DURATION_TOO_SHORT = 30;
const DURATION_TOO_LONG = 90;

/** Average sets below this triggers volume coaching. */
const VOLUME_MIN_SETS = 12;

/** Average peak fatigue at or above this triggers recovery coaching. */
const FATIGUE_HIGH_THRESHOLD = 70;

/**
 * Sibling sections per body part — used to detect narrow exercise selection.
 * Keys match `bodyPart` on workout exercises; values are section ids from Data/.
 */
const BODY_PART_SECTIONS: Record<string, string[]> = {
  Chest: ["upper-chest", "mid-chest", "lower-chest"],
  Back: ["upper-back", "mid-back", "lats", "lower-back"],
  Shoulders: ["front-delts", "side-delts", "rear-delts"],
  Biceps: ["long-head", "short-head", "brachialis"],
  Triceps: ["long-head", "lateral-head", "medial-head"],
  Legs: ["quads", "hamstrings", "glutes", "calves"],
  Abs: ["upper-abs", "lower-abs", "obliques"],
};

function formatSectionLabel(section: string): string {
  return section
    .split(/[-_\s]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(" ");
}

function formatMuscleLabel(muscle: string): string {
  return muscle
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (s) => s.toUpperCase())
    .trim();
}

function round1(value: number): number {
  return Math.round(value * 10) / 10;
}

function maxWeightInExercise(weights: (number | "")[] | undefined): number {
  if (!Array.isArray(weights)) return 0;
  const numeric = weights.filter(
    (w): w is number => typeof w === "number" && w > 0
  );
  return numeric.length > 0 ? Math.max(...numeric) : 0;
}

function averageOf(
  workouts: WorkoutHistoryEntry[],
  pick: (workout: WorkoutHistoryEntry) => number
): number {
  if (workouts.length === 0) return 0;
  const sum = workouts.reduce((acc, workout) => acc + pick(workout), 0);
  return sum / workouts.length;
}

/**
 * Best PR improvement that occurred inside the filtered period
 * (comparing each session to earlier sessions in the same period).
 */
function findBestBrokenPRInPeriod(
  workouts: WorkoutHistoryEntry[]
): { exerciseName: string; weight: number; previousWeight: number; delta: number } | null {
  const chronological = [...workouts].sort(
    (a, b) => (a.timestamp || 0) - (b.timestamp || 0)
  );

  const bestByExercise = new Map<string, number>();
  let best: {
    exerciseName: string;
    weight: number;
    previousWeight: number;
    delta: number;
  } | null = null;

  for (const workout of chronological) {
    for (const item of workout.exerciseList || []) {
      const currentMax = maxWeightInExercise(item.weights);
      if (currentMax <= 0) continue;

      const priorMax = bestByExercise.get(item.name) ?? 0;
      if (currentMax > priorMax) {
        const delta = round1(currentMax - priorMax);
        if (priorMax > 0 && (!best || delta > best.delta)) {
          best = {
            exerciseName: item.name,
            weight: currentMax,
            previousWeight: priorMax,
            delta,
          };
        }
        bestByExercise.set(item.name, currentMax);
      }
    }
  }

  return best;
}

/**
 * Across the filtered period, if a trained body part only ever used one
 * of its sibling sections, flag that narrow selection trend.
 */
function findNarrowExerciseSelectionInPeriod(
  workouts: WorkoutHistoryEntry[]
): { trainedLabel: string; suggestionLabel: string } | null {
  const byBodyPart = new Map<string, Set<string>>();

  for (const workout of workouts) {
    for (const item of workout.exerciseList || []) {
      const bodyPart = item.bodyPart;
      const section = (item.section || "").toLowerCase().trim();
      if (!bodyPart || !section) continue;

      if (!byBodyPart.has(bodyPart)) byBodyPart.set(bodyPart, new Set());
      byBodyPart.get(bodyPart)!.add(section);
    }

    for (const raw of workout.sections || []) {
      const section = raw.toLowerCase().trim();
      if (!section) continue;
      for (const [bodyPart, siblings] of Object.entries(BODY_PART_SECTIONS)) {
        if (siblings.includes(section)) {
          if (!byBodyPart.has(bodyPart)) byBodyPart.set(bodyPart, new Set());
          byBodyPart.get(bodyPart)!.add(section);
        }
      }
    }
  }

  for (const [bodyPart, trained] of byBodyPart) {
    const siblings = BODY_PART_SECTIONS[bodyPart];
    if (!siblings || siblings.length < 2) continue;
    if (trained.size !== 1) continue;

    const trainedSection = [...trained][0];
    const suggestion = siblings.find((section) => !trained.has(section)) ?? null;
    if (!suggestion) continue;

    return {
      trainedLabel: formatSectionLabel(trainedSection),
      suggestionLabel: formatSectionLabel(suggestion),
    };
  }

  return null;
}

/** Highest average peak fatigue muscle across the filtered period. */
function findHighestAverageFatigue(
  workouts: WorkoutHistoryEntry[]
): { muscle: string; value: number } | null {
  const totals = new Map<string, { sum: number; count: number }>();

  for (const workout of workouts) {
    const peakByMuscle = new Map<string, number>();

    const sources: Record<string, number>[] = [workout.fatigueBreakdown || {}];
    for (const item of workout.exerciseList || []) {
      if (item.fatigueBreakdown) sources.push(item.fatigueBreakdown);
    }

    for (const breakdown of sources) {
      for (const [muscle, raw] of Object.entries(breakdown)) {
        const value = Number(raw) || 0;
        peakByMuscle.set(muscle, Math.max(peakByMuscle.get(muscle) ?? 0, value));
      }
    }

    for (const [muscle, value] of peakByMuscle) {
      const entry = totals.get(muscle) ?? { sum: 0, count: 0 };
      entry.sum += value;
      entry.count += 1;
      totals.set(muscle, entry);
    }
  }

  let top: { muscle: string; value: number } | null = null;
  for (const [muscle, { sum, count }] of totals) {
    if (count === 0) continue;
    const avg = sum / count;
    if (!top || avg > top.value) {
      top = { muscle, value: avg };
    }
  }

  return top;
}

/**
 * Single most important period insight for the same filtered workout set
 * used by Workout Insights. Never analyzes only the latest workout —
 * always averages / trends across the provided list.
 *
 * Priority: duration → volume → selection → recovery → achievement.
 */
export function analyzeWorkout(
  filteredWorkouts: WorkoutHistoryEntry[]
): WorkoutAnalysis | null {
  if (!filteredWorkouts.length) return null;

  const count = filteredWorkouts.length;
  const avgDuration = averageOf(
    filteredWorkouts,
    (workout) => Math.max(0, Number(workout.durationMinutes) || 0)
  );
  const avgSets = averageOf(
    filteredWorkouts,
    (workout) => Math.max(0, Number(workout.sets) || 0)
  );

  const periodLabel =
    count === 1 ? "this period" : `these ${count} workouts`;

  // ── Priority #1 — Workout Duration (average) ────────────────────────────
  if (avgDuration > 0 && avgDuration < DURATION_TOO_SHORT) {
    return {
      kind: "duration",
      emoji: "⚠️",
      title: "Workout Duration",
      lines: [
        `Your average workout lasted only ${formatDurationMinutes(avgDuration)} across ${periodLabel}.`,
        `Most productive workouts typically last ${DURATION_MIN_IDEAL}–${DURATION_MAX_IDEAL} minutes.`,
      ],
    };
  }

  if (avgDuration > DURATION_TOO_LONG) {
    return {
      kind: "duration",
      emoji: "⚠️",
      title: "Workout Duration",
      lines: [
        `Your average workout lasted ${formatDurationMinutes(avgDuration)} across ${periodLabel}.`,
        "Very long workouts often reduce training quality.",
      ],
    };
  }

  // ── Priority #2 — Workout Volume (average sets) ─────────────────────────
  if (avgSets > 0 && avgSets < VOLUME_MIN_SETS) {
    const setsDisplay = Number.isInteger(round1(avgSets))
      ? String(Math.round(avgSets))
      : String(round1(avgSets));

    return {
      kind: "volume",
      emoji: "⚠️",
      title: "Workout Volume",
      lines: [
        `You averaged only ${setsDisplay} sets per workout across ${periodLabel}.`,
        "Try completing 12–16 quality sets next session.",
      ],
    };
  }

  // ── Priority #3 — Exercise Selection (period trend) ─────────────────────
  const narrowSelection = findNarrowExerciseSelectionInPeriod(filteredWorkouts);
  if (narrowSelection) {
    return {
      kind: "exercise_selection",
      emoji: "⚠️",
      title: "Exercise Selection",
      lines: [
        `Across ${periodLabel}, you trained only ${narrowSelection.trainedLabel}.`,
        `Consider adding one ${narrowSelection.suggestionLabel} exercise for a more balanced workout.`,
      ],
    };
  }

  // ── Priority #4 — Recovery / Fatigue (period average) ───────────────────
  const peakFatigue = findHighestAverageFatigue(filteredWorkouts);
  if (peakFatigue && peakFatigue.value >= FATIGUE_HIGH_THRESHOLD) {
    const muscleLabel = formatMuscleLabel(peakFatigue.muscle);
    return {
      kind: "recovery",
      emoji: "⚠️",
      title: "Recovery",
      lines: [
        `${muscleLabel} averaged ${Math.min(Math.round(peakFatigue.value), 100)}% fatigue across ${periodLabel}.`,
        `Avoid stacking more ${muscleLabel} volume until recovery improves.`,
      ],
    };
  }

  // ── Priority #5 — Positive Achievement (within period) ──────────────────
  const brokenPR = findBestBrokenPRInPeriod(filteredWorkouts);
  if (brokenPR && brokenPR.previousWeight > 0) {
    return {
      kind: "personal_record",
      emoji: "✅",
      title: "New Personal Record",
      lines: [
        `Across ${periodLabel}, you beat your previous PR by ${brokenPR.delta} kg.`,
        `${brokenPR.exerciseName} reached ${brokenPR.weight} kg.`,
      ],
    };
  }

  return {
    kind: "excellent",
    emoji: "✅",
    title: "Excellent Workout",
    lines: [
      `Great balance of duration and volume across ${periodLabel}.`,
      "Keep it up.",
    ],
  };
}
