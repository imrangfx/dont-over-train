/**
 * Recovery-aware exercise badges for body-part section lists.
 * Presentation only — weighted by catalog fatigue contribution values.
 *
 * Does not modify the Recovery Engine. Uses live recovery % + exercise.fatigue
 * weights, and RECOMMENDATION_RULES thresholds for classification.
 */

import { isMuscleName, type MuscleName } from "@/app/Data/muscles";
import { RECOMMENDATION_RULES } from "@/app/Data/recoveryConfig";
import type { RecommendationLevel } from "@/app/lib/recovery/recoveryTypes";
import type { LiveRecoveryView } from "@/components/recovery/liveRecovery";
import { sanitizeRecoveryPercent } from "@/components/recovery/buildOverallSummary";

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

type MuscleContribution = {
  readonly muscle: MuscleName;
  readonly weight: number;
  readonly recoveryPercent: number;
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

function recoveryPercentForMuscle(
  live: LiveRecoveryView,
  muscle: MuscleName,
): number {
  const status = live.muscles.find((item) => item.muscle === muscle);
  if (status) {
    return sanitizeRecoveryPercent(status.recoveryPercent);
  }
  // Not in live snapshot → treat as fully recovered.
  return 100;
}

/**
 * Fatigue contribution entries (MuscleName → catalog weight > 0).
 */
function readContributions(
  live: LiveRecoveryView,
  exercise: ExerciseMuscleInput,
): MuscleContribution[] {
  const contributions: MuscleContribution[] = [];
  const fatigue = exercise.fatigue ?? {};

  for (const [key, raw] of Object.entries(fatigue)) {
    if (!isMuscleName(key)) continue;
    if (typeof raw !== "number" || !Number.isFinite(raw) || raw <= 0) {
      continue;
    }
    contributions.push({
      muscle: key,
      weight: raw,
      recoveryPercent: recoveryPercentForMuscle(live, key),
    });
  }

  return contributions;
}

/**
 * Σ(recovery × weight) / Σ(weight)
 */
function weightedRecoveryScore(
  contributions: readonly MuscleContribution[],
): number {
  let weightedSum = 0;
  let totalWeight = 0;

  for (const entry of contributions) {
    weightedSum += entry.recoveryPercent * entry.weight;
    totalWeight += entry.weight;
  }

  if (totalWeight <= 0) return 100;
  return sanitizeRecoveryPercent(weightedSum / totalWeight);
}

/**
 * Headline muscle = largest contribution weight (primary fatigue naturally wins).
 * Tie-break: lower recovery (more fatigued) so the reason stays meaningful.
 */
function highestImpactMuscle(
  contributions: readonly MuscleContribution[],
): MuscleContribution {
  return contributions.reduce((best, entry) => {
    if (entry.weight > best.weight) return entry;
    if (entry.weight < best.weight) return best;
    return entry.recoveryPercent < best.recoveryPercent ? entry : best;
  });
}

function levelFromRecoveryPercent(
  recoveryPercent: number,
): RecommendationLevel {
  if (recoveryPercent >= RECOMMENDATION_RULES.SAFE_TO_TRAIN_AT) {
    return "SAFE";
  }
  if (recoveryPercent >= RECOMMENDATION_RULES.CAUTION_AT) {
    return "CAUTION";
  }
  return "AVOID";
}

function badgeIdFromWeightedScore(
  score: number,
): ExerciseRecoveryBadgeId {
  if (score >= RECOMMENDATION_RULES.SAFE_TO_TRAIN_AT) {
    return "recommended";
  }
  if (score >= RECOMMENDATION_RULES.CAUTION_AT) {
    return "train-light";
  }
  return "recovering";
}

function reasonForImpactMuscle(entry: MuscleContribution): string {
  const level = levelFromRecoveryPercent(entry.recoveryPercent);

  // Prefer engine recommendation message level when status exists in live data.
  // Phrasing stays tied to SAFE / CAUTION / AVOID thresholds (not new cutoffs).
  if (level === "AVOID") return `${entry.muscle} recovering`;
  if (level === "CAUTION") return `${entry.muscle} slightly fatigued`;
  return `${entry.muscle} fully recovered`;
}

/**
 * Classify one exercise using fatigue-contribution weighted recovery.
 *
 * Recommended  → weighted ≥ SAFE_TO_TRAIN_AT
 * Train Light  → CAUTION_AT ≤ weighted < SAFE_TO_TRAIN_AT
 * Recovering   → weighted < CAUTION_AT
 */
export function getExerciseRecoveryBadge(
  live: LiveRecoveryView | null,
  exercise: ExerciseMuscleInput,
): ExerciseRecoveryBadge | null {
  if (!live) return null;

  const contributions = readContributions(live, exercise);
  if (contributions.length === 0) return null;

  const score = weightedRecoveryScore(contributions);
  const badgeId = badgeIdFromWeightedScore(score);
  const impact = highestImpactMuscle(contributions);

  return {
    ...BADGE_BY_ID[badgeId],
    reason: reasonForImpactMuscle(impact),
  };
}

/** Sort key: Recommended → Train Light → Recovering (stable within tier). */
export function exerciseRecoveryTierSortKey(
  badge: ExerciseRecoveryBadge | null,
): number {
  if (!badge) return 1;
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
