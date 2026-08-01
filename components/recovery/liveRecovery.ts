/**
 * Display-only live recovery from a stored RecoveryEngineResult.
 *
 * Re-runs calculateRecovery / generateRecommendations with the saved fatigue
 * map and generatedAt as the decay anchor, evaluated at `now`.
 *
 * Never writes back to workout history — the stored snapshot is unchanged.
 */

import { calculateRecovery } from "@/app/lib/recovery/recoveryCalculator";
import { generateRecommendations } from "@/app/lib/recovery/recommendationEngine";
import type { RecoveryEngineResult } from "@/app/lib/recovery";
import type {
  MuscleStatus,
  RecommendationResult,
  RecoverySummary,
} from "@/app/lib/recovery/recoveryTypes";
import type { WorkoutHistoryEntry } from "@/lib/workouts";
import {
  buildOverallSummary,
  sortMusclesByLowestRecovery,
} from "@/components/recovery/buildOverallSummary";

export type LiveRecoveryView = {
  /** Decayed muscle statuses for display (not the stored snapshot). */
  readonly muscles: readonly MuscleStatus[];
  /** Recommendations derived from the live MuscleStatus[]. */
  readonly recommendations: readonly RecommendationResult[];
  /** Fatigue-weighted overall from live muscles. */
  readonly summary: RecoverySummary;
  /** Evaluation instant used for decay (Date.now() at open). */
  readonly evaluatedAt: number;
};

/**
 * Newest history entry that still has a Recovery Engine snapshot.
 * Assumes history is ordered newest-first.
 */
export function findLatestRecoverySnapshot(
  history: readonly WorkoutHistoryEntry[],
): RecoveryEngineResult | null {
  for (const entry of history) {
    if (entry.recovery != null) {
      return entry.recovery;
    }
  }
  return null;
}

/**
 * Apply hourly decay from snapshot.generatedAt → now and rebuild UI inputs.
 *
 * @param snapshot - Immutable stored RecoveryEngineResult (read-only).
 * @param now - Evaluation time (defaults to Date.now()).
 */
export function buildLiveRecoveryView(
  snapshot: RecoveryEngineResult,
  now: number = Date.now(),
): LiveRecoveryView {
  const liveMuscles = calculateRecovery(
    snapshot.fatigue,
    snapshot.generatedAt,
    now,
  );

  const recommendations = generateRecommendations(liveMuscles);
  const muscles = sortMusclesByLowestRecovery(liveMuscles);

  // Last Updated stays anchored to the stored snapshot time (decay start).
  const summary = buildOverallSummary(muscles, snapshot.generatedAt);

  return {
    muscles,
    recommendations,
    summary,
    evaluatedAt: now,
  };
}
