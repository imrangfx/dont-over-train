/**
 * Don't Over Train — Recovery Engine: Recommendation Engine
 *
 * ---------------------------------------------------------------------------
 * PURPOSE
 * ---------------------------------------------------------------------------
 * Third core module of the recovery engine. Interprets already-resolved
 * MuscleStatus snapshots into per-muscle train / caution / avoid guidance
 * using RECOMMENDATION_RULES thresholds.
 *
 * Scope (this module only):
 *   ✓ Map recovery % → RecommendationLevel (SAFE / CAUTION / AVOID)
 *   ✓ Attach a fixed coaching message per level
 *   ✓ Return RecommendationResult[] sorted by urgency
 *
 * Out of scope (other modules):
 *   ✗ Fatigue accumulation
 *   ✗ Time-based decay / recovery %
 *   ✗ Workout history I/O
 *   ✗ React, storage, or network
 *
 * Pure function — no side effects, no input mutation.
 */

import { RECOMMENDATION_RULES } from "@/app/Data/recoveryConfig";
import type {
  MuscleStatus,
  RecommendationLevel,
  RecommendationResult,
} from "@/app/lib/recovery/recoveryTypes";

/** Fixed coaching copy keyed by recommendation level. */
const RECOMMENDATION_MESSAGES = {
  SAFE: "Ready to train.",
  CAUTION: "Train with reduced volume or intensity.",
  AVOID: "Allow more recovery before training.",
} as const satisfies Record<RecommendationLevel, string>;

/** Sort priority: lower = more urgent (AVOID first). */
const LEVEL_SORT_ORDER: Readonly<Record<RecommendationLevel, number>> = {
  AVOID: 0,
  CAUTION: 1,
  SAFE: 2,
};

/**
 * Resolve recommendation level from recovery percentage.
 *
 * - SAFE    → recovery ≥ SAFE_TO_TRAIN_AT
 * - CAUTION → recovery ≥ CAUTION_AT (and below SAFE)
 * - AVOID   → otherwise
 */
function resolveLevel(recoveryPercent: number): RecommendationLevel {
  if (recoveryPercent >= RECOMMENDATION_RULES.SAFE_TO_TRAIN_AT) {
    return "SAFE";
  }
  if (recoveryPercent >= RECOMMENDATION_RULES.CAUTION_AT) {
    return "CAUTION";
  }
  return "AVOID";
}

/** Build one RecommendationResult from a MuscleStatus snapshot. */
function toRecommendation(status: MuscleStatus): RecommendationResult {
  const level = resolveLevel(status.recoveryPercent);

  return {
    muscle: status.muscle,
    level,
    recoveryPercent: status.recoveryPercent,
    statusId: status.statusId,
    message: RECOMMENDATION_MESSAGES[level],
    asOf: status.asOf,
  };
}

/**
 * Compare recommendations: AVOID → CAUTION → SAFE, then recovery ascending
 * within each level (most fatigued first).
 */
function compareRecommendations(
  a: RecommendationResult,
  b: RecommendationResult,
): number {
  const byLevel = LEVEL_SORT_ORDER[a.level] - LEVEL_SORT_ORDER[b.level];
  if (byLevel !== 0) return byLevel;
  return a.recoveryPercent - b.recoveryPercent;
}

/**
 * Generate training recommendations from calculated MuscleStatus values.
 *
 * @param statuses - Immutable recovery snapshots (e.g. from calculateRecovery).
 * @returns One RecommendationResult per muscle, sorted by urgency then fatigue.
 */
export function generateRecommendations(
  statuses: readonly MuscleStatus[],
): readonly RecommendationResult[] {
  return statuses.map(toRecommendation).sort(compareRecommendations);
}
