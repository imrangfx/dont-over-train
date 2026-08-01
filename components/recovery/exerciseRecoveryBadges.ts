/**
 * Recovery-aware exercise badges for body-part section lists.
 * Presentation only — uses LiveRecoveryView recommendation levels.
 */

import { isMuscleName, type MuscleName } from "@/app/Data/muscles";
import { generateRecommendations } from "@/app/lib/recovery/recommendationEngine";
import type { RecommendationLevel } from "@/app/lib/recovery/recoveryTypes";
import type { LiveRecoveryView } from "@/components/recovery/liveRecovery";

export type ExerciseRecoveryBadgeId =
  | "recommended"
  | "train-light"
  | "recovering";

export type ExerciseRecoveryBadge = {
  readonly id: ExerciseRecoveryBadgeId;
  readonly label: string;
  readonly className: string;
  readonly reason: string;
  readonly showWarning: boolean;
};

type ExerciseMuscleInput = {
  readonly primaryMuscles?: readonly MuscleName[];
  readonly secondaryMuscles?: readonly MuscleName[];
  readonly fatigue?: Readonly<Partial<Record<string, number>>>;
};

const LEVEL_RANK: Record<RecommendationLevel, number> = {
  AVOID: 0,
  CAUTION: 1,
  SAFE: 2,
};

const BADGE: Record<
  RecommendationLevel,
  Omit<ExerciseRecoveryBadge, "reason">
> = {
  AVOID: {
    id: "recovering",
    label: "🔴 Recovering",
    className: "text-red-400 ring-red-500/25",
    showWarning: true,
  },
  CAUTION: {
    id: "train-light",
    label: "🟡 Train Light",
    className: "text-yellow-300 ring-yellow-500/25",
    showWarning: false,
  },
  SAFE: {
    id: "recommended",
    label: "🟢 Recommended",
    className: "text-lime-400 ring-lime-500/25",
    showWarning: false,
  },
};

const TIER_ORDER: Record<ExerciseRecoveryBadgeId, number> = {
  recommended: 0,
  "train-light": 1,
  recovering: 2,
};

function involvedMuscles(exercise: ExerciseMuscleInput): MuscleName[] {
  const fromLists = [
    ...(exercise.primaryMuscles ?? []),
    ...(exercise.secondaryMuscles ?? []),
  ];
  if (fromLists.length > 0) {
    return [...new Set(fromLists)];
  }

  const fromFatigue: MuscleName[] = [];
  for (const key of Object.keys(exercise.fatigue ?? {})) {
    if (isMuscleName(key)) fromFatigue.push(key);
  }
  return fromFatigue;
}

function levelForMuscle(
  live: LiveRecoveryView,
  muscle: MuscleName,
): RecommendationLevel {
  const existing = live.recommendations.find((item) => item.muscle === muscle);
  if (existing) return existing.level;

  const status = live.muscles.find((item) => item.muscle === muscle);
  if (status) {
    return generateRecommendations([status])[0].level;
  }

  return "SAFE";
}

function reasonForMuscle(
  live: LiveRecoveryView,
  muscle: MuscleName,
  level: RecommendationLevel,
): string {
  const status = live.muscles.find((item) => item.muscle === muscle);
  if (status) {
    // Exact engine status label (Fresh, Recovered, High Fatigue, …).
    return `${status.muscle} — ${status.label}`;
  }

  const rec = live.recommendations.find((item) => item.muscle === muscle);
  if (rec) {
    return `${rec.muscle} — ${rec.message}`;
  }

  // Muscle not in snapshot → fully recovered / SAFE phrasing from level.
  if (level === "AVOID") return `${muscle} still recovering`;
  if (level === "CAUTION") return `${muscle} needs more recovery`;
  return `${muscle} fully recovered`;
}

/**
 * Classify one exercise from primary + secondary muscles (worst level wins).
 */
export function getExerciseRecoveryBadge(
  live: LiveRecoveryView | null,
  exercise: ExerciseMuscleInput,
): ExerciseRecoveryBadge | null {
  if (!live) return null;

  const muscles = involvedMuscles(exercise);
  if (muscles.length === 0) return null;

  let worst: RecommendationLevel = "SAFE";
  let worstMuscle: MuscleName = muscles[0];

  for (const muscle of muscles) {
    const level = levelForMuscle(live, muscle);
    if (LEVEL_RANK[level] < LEVEL_RANK[worst]) {
      worst = level;
      worstMuscle = muscle;
    }
  }

  const base = BADGE[worst];
  return {
    ...base,
    reason: reasonForMuscle(live, worstMuscle, worst),
  };
}

/** Sort key: Recommended → Train Light → Recovering (stable within tier). */
export function exerciseRecoveryTierSortKey(
  badge: ExerciseRecoveryBadge | null,
): number {
  if (!badge) return 1; // neutral middle if unknown
  return TIER_ORDER[badge.id];
}

/**
 * Sort exercises by recovery tier, preserving original relative order within
 * each group. Does not mutate the input array.
 */
export function sortExercisesByRecoveryTier<T>(
  entries: readonly T[],
  getBadge: (entry: T) => ExerciseRecoveryBadge | null,
): T[] {
  return entries
    .map((entry, index) => ({
      entry,
      index,
      tier: exerciseRecoveryTierSortKey(getBadge(entry)),
    }))
    .sort((a, b) => a.tier - b.tier || a.index - b.index)
    .map((item) => item.entry);
}
