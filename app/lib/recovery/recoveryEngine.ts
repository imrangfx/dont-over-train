/**
 * Don't Over Train — Recovery Engine (public entry point)
 *
 * ---------------------------------------------------------------------------
 * PURPOSE
 * ---------------------------------------------------------------------------
 * Thin orchestration layer for the recovery pipeline. This module does not
 * own business rules — it only wires the existing core modules in order:
 *
 *   1. fatigueCalculator      → accumulate raw muscle fatigue
 *   2. recoveryCalculator     → decay, recovery %, status bands
 *   3. recommendationEngine   → SAFE / CAUTION / AVOID guidance
 *
 * Keep this file small forever. New policy belongs in the specialized
 * modules above (or in recoveryConfig.ts), never here.
 *
 * Pure function — no React, storage, network, async, or input mutation.
 */

import {
  calculateWorkoutFatigue,
  type WorkoutFatigueMap,
} from "@/app/lib/recovery/fatigueCalculator";
import { calculateRecovery } from "@/app/lib/recovery/recoveryCalculator";
import { generateRecommendations } from "@/app/lib/recovery/recommendationEngine";
import type {
  LoggedWorkoutExercise,
  MuscleStatus,
  RecommendationResult,
} from "@/app/lib/recovery/recoveryTypes";

/**
 * Full recovery-engine snapshot for one evaluation instant.
 *
 * Produced by `runRecoveryEngine` — consumers should treat all fields as
 * immutable outputs of a single coordinated pass.
 */
export type RecoveryEngineResult = {
  /** Sparse raw fatigue map after workout accumulation (pre-decay view). */
  readonly fatigue: WorkoutFatigueMap;
  /** Per-muscle status after hourly decay, sorted most-fatigued first. */
  readonly recovery: readonly MuscleStatus[];
  /** Train guidance derived from `recovery`, sorted by urgency. */
  readonly recommendations: readonly RecommendationResult[];
  /** Unix ms of the evaluation instant (`currentTime`). */
  readonly generatedAt: number;
};

/**
 * Run the complete recovery pipeline for a set of logged exercises.
 *
 * Orchestration only — no fatigue math, decay, or recommendation rules live
 * in this function.
 *
 * @param loggedExercises - Exercises performed in the workout (immutable).
 * @param lastUpdatedAt - Unix ms when fatigue was last written / observed.
 * @param currentTime - Evaluation instant (defaults to Date.now()).
 */
export function runRecoveryEngine(
  loggedExercises: readonly LoggedWorkoutExercise[],
  lastUpdatedAt: number,
  currentTime: number = Date.now(),
): RecoveryEngineResult {
  const fatigue = calculateWorkoutFatigue(loggedExercises);
  const recovery = calculateRecovery(fatigue, lastUpdatedAt, currentTime);
  const recommendations = generateRecommendations(recovery);

  return {
    fatigue,
    recovery,
    recommendations,
    generatedAt: currentTime,
  };
}
