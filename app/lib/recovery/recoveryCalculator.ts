/**
 * Don't Over Train — Recovery Engine: Recovery Calculator
 *
 * ---------------------------------------------------------------------------
 * PURPOSE
 * ---------------------------------------------------------------------------
 * Second core module of the recovery engine. Converts a raw muscle fatigue
 * map into per-muscle recovery snapshots: time-decayed fatigue, recovery %,
 * and resolved RECOVERY_STATUS band metadata.
 *
 * Scope (this module only):
 *   ✓ Apply hourly fatigue decay from lastUpdatedAt → now
 *   ✓ Clamp fatigue and recovery %
 *   ✓ Resolve status band (id, label, color)
 *   ✓ Return MuscleStatus[] sorted most-fatigued first
 *
 * Out of scope (other modules):
 *   ✗ Workout history I/O
 *   ✗ Exercise fatigue accumulation (see fatigueCalculator.ts)
 *   ✗ Train / rest recommendations
 *   ✗ React, storage, or network
 *
 * Pure function — no side effects, no input mutation.
 */

import { isMuscleName, type MuscleName } from "@/app/Data/muscles";
import {
  RECOVERY_CONFIG,
  RECOVERY_STATUS,
  type RecoveryStatusBand,
} from "@/app/Data/recoveryConfig";
import type { WorkoutFatigueMap } from "@/app/lib/recovery/fatigueCalculator";
import type { MuscleStatus } from "@/app/lib/recovery/recoveryTypes";

/** Clamp `value` into the inclusive range [min, max]. */
function clamp(value: number, min: number, max: number): number {
  if (!Number.isFinite(value)) return min;
  return Math.min(max, Math.max(min, value));
}

/**
 * Elapsed rest hours between two Unix timestamps.
 * Negative deltas (clock skew / future lastUpdatedAt) become 0.
 */
function calculateElapsedHours(
  lastUpdatedAt: number,
  currentTime: number,
): number {
  const ms = Math.max(0, currentTime - lastUpdatedAt);
  return ms / 1000 / 60 / 60;
}

/**
 * Apply multiplicative hourly decay:
 *   fatigue × (FATIGUE_DECAY_PER_HOUR ^ elapsedHours)
 *
 * Values at or below MIN_VISIBLE_FATIGUE collapse to 0 so near-zero
 * residual stress does not linger in the UI as “almost recovered.”
 */
function applyDecay(fatigue: number, elapsedHours: number): number {
  if (!Number.isFinite(fatigue) || fatigue <= 0) return 0;

  const decayed =
    fatigue *
    RECOVERY_CONFIG.FATIGUE_DECAY_PER_HOUR ** elapsedHours;

  if (decayed < RECOVERY_CONFIG.MIN_VISIBLE_FATIGUE) return 0;

  return clamp(decayed, 0, RECOVERY_CONFIG.MAX_FATIGUE);
}

/** Recovery % = 100 − fatigue, clamped to 0–100. */
function calculateRecoveryPercent(fatigue: number): number {
  return clamp(100 - fatigue, 0, 100);
}

/**
 * First RECOVERY_STATUS band (healthiest → worst) where
 * recoveryPercent >= minimumRecovery.
 *
 * OVERREACHED (minimumRecovery: 0) is always a valid fallback.
 */
function resolveStatus(recoveryPercent: number): RecoveryStatusBand {
  for (const band of RECOVERY_STATUS) {
    if (recoveryPercent >= band.minimumRecovery) {
      return band;
    }
  }
  return RECOVERY_STATUS[RECOVERY_STATUS.length - 1];
}

/**
 * Convert a raw fatigue map into sorted MuscleStatus snapshots.
 *
 * @param fatigue - Sparse map from calculateWorkoutFatigue (or equivalent).
 * @param lastUpdatedAt - Unix ms when `fatigue` was last written / observed.
 * @param currentTime - Evaluation instant (defaults to Date.now()).
 * @returns One MuscleStatus per input muscle, lowest recovery first.
 */
export function calculateRecovery(
  fatigue: WorkoutFatigueMap,
  lastUpdatedAt: number,
  currentTime: number = Date.now(),
): readonly MuscleStatus[] {
  const elapsedHours = calculateElapsedHours(lastUpdatedAt, currentTime);
  const results: MuscleStatus[] = [];

  for (const [key, rawFatigue] of Object.entries(fatigue)) {
    if (!isMuscleName(key)) continue;
    if (typeof rawFatigue !== "number" || !Number.isFinite(rawFatigue)) {
      continue;
    }

    const muscle: MuscleName = key;
    const decayedFatigue = applyDecay(rawFatigue, elapsedHours);
    const recoveryPercent = calculateRecoveryPercent(decayedFatigue);
    const status = resolveStatus(recoveryPercent);

    results.push({
      muscle,
      fatigue: decayedFatigue,
      recoveryPercent,
      statusId: status.id,
      label: status.label,
      color: status.color,
      asOf: currentTime,
    });
  }

  results.sort((a, b) => a.recoveryPercent - b.recoveryPercent);

  return results;
}
