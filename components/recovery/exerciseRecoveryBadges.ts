/**
 * Recovery-aware exercise badges for body-part section lists.
 * Presentation only — uses LiveRecoveryView recommendation levels.
 *
 * Primary muscles drive Recommended / Recovering.
 * Secondary muscles may only downgrade to Train Light (never Recovering alone).
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

const BADGE_BY_ID: Record<
  ExerciseRecoveryBadgeId,
  Omit<ExerciseRecoveryBadge, "reason">
> = {
  recovering: {
    id: "recovering",
    label: "🔴 Recovering",
    className: "text-red-400 ring-red-500/25",
    showWarning: true,
  },
  "train-light": {
    id: "train-light",
    label: "🟡 Train Light",
    className: "text-yellow-300 ring-yellow-500/25",
    showWarning: false,
  },
  recommended: {
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

function fatigueMuscles(exercise: ExerciseMuscleInput): MuscleName[] {
  const fromFatigue: MuscleName[] = [];
  for (const key of Object.keys(exercise.fatigue ?? {})) {
    if (isMuscleName(key)) fromFatigue.push(key);
  }
  return fromFatigue;
}

/**
 * Prefer catalog primary/secondary lists.
 * If primary is missing, treat fatigue-map muscles as primary (no silent empty).
 */
function resolvePrimarySecondary(exercise: ExerciseMuscleInput): {
  primary: MuscleName[];
  secondary: MuscleName[];
} {
  const primary = [...(exercise.primaryMuscles ?? [])];
  const secondary = [...(exercise.secondaryMuscles ?? [])];
  if (primary.length > 0) {
    return { primary, secondary };
  }
  return { primary: fatigueMuscles(exercise), secondary: [] };
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

function worstLevel(
  live: LiveRecoveryView,
  muscles: readonly MuscleName[],
): { level: RecommendationLevel; muscle: MuscleName | null } {
  if (muscles.length === 0) {
    return { level: "SAFE", muscle: null };
  }

  let worst: RecommendationLevel = "SAFE";
  let worstMuscle: MuscleName = muscles[0];

  for (const muscle of muscles) {
    const level = levelForMuscle(live, muscle);
    if (LEVEL_RANK[level] < LEVEL_RANK[worst]) {
      worst = level;
      worstMuscle = muscle;
    }
  }

  return { level: worst, muscle: worstMuscle };
}

/**
 * Reason from PRIMARY when possible.
 * Secondary is mentioned only when it alone causes Train Light.
 */
function reasonForMuscle(
  muscle: MuscleName,
  level: RecommendationLevel,
): string {
  if (level === "AVOID") return `${muscle} still recovering`;
  if (level === "CAUTION") return `${muscle} needs more recovery`;
  return `${muscle} fully recovered`;
}

/**
 * Classify one exercise:
 * 1. All PRIMARY SAFE → Recommended (unless Rule 2)
 * 2. PRIMARY SAFE + secondary CAUTION/AVOID → Train Light (never Recovering)
 * 3. Any PRIMARY AVOID → Recovering
 * 4. Any PRIMARY CAUTION (no AVOID) → Train Light
 */
export function getExerciseRecoveryBadge(
  live: LiveRecoveryView | null,
  exercise: ExerciseMuscleInput,
): ExerciseRecoveryBadge | null {
  if (!live) return null;

  const { primary, secondary } = resolvePrimarySecondary(exercise);
  if (primary.length === 0) return null;

  const primaryWorst = worstLevel(live, primary);
  const secondaryWorst = worstLevel(live, secondary);

  // Rule 3 — primary AVOID wins Recovering.
  if (primaryWorst.level === "AVOID" && primaryWorst.muscle) {
    return {
      ...BADGE_BY_ID.recovering,
      reason: reasonForMuscle(primaryWorst.muscle, "AVOID"),
    };
  }

  // Rule 4 — primary CAUTION → Train Light.
  if (primaryWorst.level === "CAUTION" && primaryWorst.muscle) {
    return {
      ...BADGE_BY_ID["train-light"],
      reason: reasonForMuscle(primaryWorst.muscle, "CAUTION"),
    };
  }

  // Rule 1 + 2 — all primary SAFE.
  // Secondary CAUTION/AVOID only downgrades to Train Light.
  if (
    secondaryWorst.level === "AVOID" ||
    secondaryWorst.level === "CAUTION"
  ) {
    if (secondaryWorst.muscle) {
      return {
        ...BADGE_BY_ID["train-light"],
        reason: reasonForMuscle(
          secondaryWorst.muscle,
          secondaryWorst.level,
        ),
      };
    }
  }

  // Rule 1 — every primary SAFE (and secondary not forcing Train Light).
  const reasonMuscle = primaryWorst.muscle ?? primary[0];
  return {
    ...BADGE_BY_ID.recommended,
    reason: reasonForMuscle(reasonMuscle, "SAFE"),
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
