/**
 * Recovery-aware exercise badges for body-part section lists.
 * Presentation only — warning badges when attention is needed.
 *
 * Does not modify the Recovery Engine. Uses live muscle recovery % / status
 * bands plus exercise primary/secondary (and fatigue map as fallback).
 */

import { isMuscleName, type MuscleName } from "@/app/Data/muscles";
import {
  RECOMMENDATION_RULES,
  type RecoveryStatusId,
} from "@/app/Data/recoveryConfig";
import type { LiveRecoveryView } from "@/components/recovery/liveRecovery";
import { sanitizeRecoveryPercent } from "@/components/recovery/buildOverallSummary";

export type ExerciseRecoveryBadgeId =
  | "avoid"
  | "not-recommended"
  | "train-light";

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

type MuscleReadiness = {
  readonly muscle: MuscleName;
  readonly recoveryPercent: number;
  readonly statusId: RecoveryStatusId;
  readonly fatigueWeight: number;
};

const BADGE_BY_ID: Record<
  ExerciseRecoveryBadgeId,
  Omit<ExerciseRecoveryBadge, "reason">
> = {
  avoid: {
    id: "avoid",
    label: "🔴 Avoid",
    className: "text-red-400 ring-red-500/25",
    showWarning: true,
  },
  "not-recommended": {
    id: "not-recommended",
    label: "🔴 Not Recommended",
    className: "text-red-400 ring-red-500/25",
    showWarning: true,
  },
  "train-light": {
    id: "train-light",
    label: "🟡 Train Light",
    className: "text-yellow-300 ring-yellow-500/25",
    showWarning: false,
  },
};

/** Warnings first; safe (no badge) last. Stable within tier. */
const TIER_ORDER: Record<ExerciseRecoveryBadgeId, number> = {
  avoid: 0,
  "not-recommended": 1,
  "train-light": 2,
};

const SAFE_TIER = 3;

function isHighDanger(statusId: RecoveryStatusId): boolean {
  return statusId === "HIGH" || statusId === "OVERREACHED";
}

function isSafeToTrain(recoveryPercent: number): boolean {
  return recoveryPercent >= RECOMMENDATION_RULES.SAFE_TO_TRAIN_AT;
}

function recoveryLookup(
  live: LiveRecoveryView,
  muscle: MuscleName,
): Pick<MuscleReadiness, "recoveryPercent" | "statusId"> {
  const status = live.muscles.find((item) => item.muscle === muscle);
  if (status) {
    return {
      recoveryPercent: sanitizeRecoveryPercent(status.recoveryPercent),
      statusId: status.statusId,
    };
  }
  // Not in live snapshot → treat as fully recovered.
  return { recoveryPercent: 100, statusId: "FRESH" };
}

function fatigueWeightFor(
  exercise: ExerciseMuscleInput,
  muscle: MuscleName,
): number {
  const raw = exercise.fatigue?.[muscle];
  if (typeof raw === "number" && Number.isFinite(raw) && raw > 0) {
    return raw;
  }
  return 0;
}

function uniqueMuscles(muscles: readonly MuscleName[]): MuscleName[] {
  const seen = new Set<MuscleName>();
  const result: MuscleName[] = [];
  for (const muscle of muscles) {
    if (seen.has(muscle)) continue;
    seen.add(muscle);
    result.push(muscle);
  }
  return result;
}

/**
 * Fatigue map entries with positive contribution, highest weight first.
 */
function fatigueRankedMuscles(
  exercise: ExerciseMuscleInput,
): { muscle: MuscleName; weight: number }[] {
  const fatigue = exercise.fatigue ?? {};
  const ranked: { muscle: MuscleName; weight: number }[] = [];

  for (const [key, raw] of Object.entries(fatigue)) {
    if (!isMuscleName(key)) continue;
    if (typeof raw !== "number" || !Number.isFinite(raw) || raw <= 0) {
      continue;
    }
    ranked.push({ muscle: key, weight: raw });
  }

  ranked.sort((a, b) => b.weight - a.weight);
  return ranked;
}

function resolvePrimaryMuscles(exercise: ExerciseMuscleInput): MuscleName[] {
  if (exercise.primaryMuscles && exercise.primaryMuscles.length > 0) {
    return uniqueMuscles(exercise.primaryMuscles);
  }

  const ranked = fatigueRankedMuscles(exercise);
  if (ranked.length === 0) return [];
  // Fallback: top fatigue contributor is the primary target.
  return [ranked[0].muscle];
}

function resolveSecondaryMuscles(
  exercise: ExerciseMuscleInput,
  primaries: readonly MuscleName[],
): MuscleName[] {
  const primarySet = new Set(primaries);

  if (exercise.secondaryMuscles && exercise.secondaryMuscles.length > 0) {
    return uniqueMuscles(exercise.secondaryMuscles).filter(
      (muscle) => !primarySet.has(muscle),
    );
  }

  // Fallback: remaining fatigue contributors are support muscles.
  return fatigueRankedMuscles(exercise)
    .map((entry) => entry.muscle)
    .filter((muscle) => !primarySet.has(muscle));
}

function toReadiness(
  live: LiveRecoveryView,
  exercise: ExerciseMuscleInput,
  muscle: MuscleName,
): MuscleReadiness {
  const { recoveryPercent, statusId } = recoveryLookup(live, muscle);
  return {
    muscle,
    recoveryPercent,
    statusId,
    fatigueWeight: fatigueWeightFor(exercise, muscle),
  };
}

/** Worst readiness first (lowest recovery; tie-break higher fatigue weight). */
function pickWorst(candidates: readonly MuscleReadiness[]): MuscleReadiness | null {
  if (candidates.length === 0) return null;
  return candidates.reduce((worst, entry) => {
    if (entry.recoveryPercent < worst.recoveryPercent) return entry;
    if (entry.recoveryPercent > worst.recoveryPercent) return worst;
    return entry.fatigueWeight > worst.fatigueWeight ? entry : worst;
  });
}

/**
 * Classify one exercise for list badges.
 *
 * AVOID            → primary High Fatigue / Overreached
 * NOT RECOMMENDED  → primary below SAFE, but not high-danger
 * TRAIN LIGHT      → primary safe, important secondary still recovering
 * (no badge)       → otherwise
 */
export function getExerciseRecoveryBadge(
  live: LiveRecoveryView | null,
  exercise: ExerciseMuscleInput,
): ExerciseRecoveryBadge | null {
  if (!live) return null;

  const primaries = resolvePrimaryMuscles(exercise);
  if (primaries.length === 0) return null;

  const primaryStates = primaries.map((muscle) =>
    toReadiness(live, exercise, muscle),
  );

  const avoidPrimary = pickWorst(
    primaryStates.filter((entry) => isHighDanger(entry.statusId)),
  );
  if (avoidPrimary) {
    return {
      ...BADGE_BY_ID.avoid,
      reason: `${avoidPrimary.muscle} needs more recovery.`,
    };
  }

  const notRecommendedPrimary = pickWorst(
    primaryStates.filter(
      (entry) =>
        !isSafeToTrain(entry.recoveryPercent) && !isHighDanger(entry.statusId),
    ),
  );
  if (notRecommendedPrimary) {
    return {
      ...BADGE_BY_ID["not-recommended"],
      reason: `${notRecommendedPrimary.muscle} is still recovering.`,
    };
  }

  const allPrimariesSafe = primaryStates.every((entry) =>
    isSafeToTrain(entry.recoveryPercent),
  );
  if (!allPrimariesSafe) return null;

  const secondaries = resolveSecondaryMuscles(exercise, primaries);
  const recoveringSecondary = pickWorst(
    secondaries
      .map((muscle) => toReadiness(live, exercise, muscle))
      .filter((entry) => !isSafeToTrain(entry.recoveryPercent)),
  );
  if (recoveringSecondary) {
    return {
      ...BADGE_BY_ID["train-light"],
      reason: `${recoveringSecondary.muscle} still recovering.`,
    };
  }

  return null;
}

/** Sort key: Avoid → Not Recommended → Train Light → no badge. */
export function exerciseRecoveryTierSortKey(
  badge: ExerciseRecoveryBadge | null,
): number {
  if (!badge) return SAFE_TIER;
  return TIER_ORDER[badge.id];
}

/**
 * Sort exercises by recovery warning tier, preserving original relative order
 * within each group. Does not mutate the input array.
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
