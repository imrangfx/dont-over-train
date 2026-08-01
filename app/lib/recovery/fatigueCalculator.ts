/**
 * Don't Over Train — Recovery Engine: Fatigue Calculator
 *
 * ---------------------------------------------------------------------------
 * PURPOSE
 * ---------------------------------------------------------------------------
 * First core module of the recovery engine. Accumulates raw muscle fatigue
 * from a list of logged workout exercises using the exercise catalog baselines
 * (or log-time fatigueBreakdown when present) and primary/secondary role
 * multipliers, scaled by logged set count.
 *
 * Scope (this module only):
 *   ✓ Look up each logged exercise in the catalog
 *   ✓ Prefer non-empty `fatigueBreakdown` over catalog `fatigue`
 *   ✓ Scale by logged set count (volume)
 *   ✓ Apply FATIGUE_SOURCE multipliers to each fatigue entry
 *   ✓ Sum contributions across the workout
 *   ✓ Clamp each muscle to RECOVERY_CONFIG.MAX_FATIGUE
 *
 * Out of scope (handled by later modules):
 *   ✗ Time-based recovery decay
 *   ✗ Recovery percentage
 *   ✗ Status bands / colors
 *   ✗ Train / rest recommendations
 *   ✗ Per-rep intensity scaling beyond set count
 *
 * Pure function — no React, storage, network, or input mutation.
 */

import { exercises } from "@/app/Data/exercises";
import type { ExerciseData } from "@/app/Data/exerciseTypes";
import {
  isMuscleName,
  type MuscleName,
} from "@/app/Data/muscles";
import {
  FATIGUE_SOURCE,
  RECOVERY_CONFIG,
} from "@/app/Data/recoveryConfig";
import type { LoggedWorkoutExercise } from "@/app/lib/recovery/recoveryTypes";

/** Sparse fatigue map: only muscles that received load in the workout. */
export type WorkoutFatigueMap = Readonly<Partial<Record<MuscleName, number>>>;

/**
 * Resolve the role multiplier for a muscle on a given exercise.
 *
 * Primary movers take the full dose; secondary movers take the reduced dose.
 * If a fatigue-map muscle is listed in neither array (incomplete catalog data),
 * return 0 so incorrect fatigue is never applied silently.
 */
function roleMultiplier(
  muscle: MuscleName,
  primaryMuscles: readonly MuscleName[],
  secondaryMuscles: readonly MuscleName[],
): number {
  if (primaryMuscles.includes(muscle)) {
    return FATIGUE_SOURCE.PRIMARY_MULTIPLIER;
  }
  if (secondaryMuscles.includes(muscle)) {
    return FATIGUE_SOURCE.SECONDARY_MULTIPLIER;
  }
  return 0;
}

/** Look up a catalog exercise by slug. Returns undefined when unknown. */
function findCatalogExercise(slug: string): ExerciseData | undefined {
  if (Object.prototype.hasOwnProperty.call(exercises, slug)) {
    return exercises[slug as keyof typeof exercises];
  }
  return undefined;
}

/** Upper-bound clamp to the global fatigue ceiling. */
function clampFatigue(value: number): number {
  if (!Number.isFinite(value) || value <= 0) return 0;
  return Math.min(value, RECOVERY_CONFIG.MAX_FATIGUE);
}

/** True when the log-time breakdown has at least one entry. */
function hasFatigueBreakdown(
  breakdown: LoggedWorkoutExercise["fatigueBreakdown"],
): boolean {
  return Object.keys(breakdown).length > 0;
}

/**
 * Set-count volume factor. Empty `sets` (legacy payloads) counts as 1 so
 * historical entries still contribute baseline fatigue.
 */
function volumeFactor(logged: LoggedWorkoutExercise): number {
  return logged.sets.length > 0 ? logged.sets.length : 1;
}

/**
 * Accumulate raw muscle fatigue for one workout from logged exercises.
 *
 * For each logged entry:
 * 1. Resolve the exercise in the catalog (skip if missing).
 * 2. Prefer non-empty `fatigueBreakdown`; otherwise use catalog `fatigue`.
 * 3. Read catalog `primaryMuscles` / `secondaryMuscles` for role multipliers.
 * 4. For every valid MuscleName fatigue entry: raw × role × set count.
 * 5. After all exercises, clamp each muscle to MAX_FATIGUE.
 *
 * @param loggedExercises - Immutable list of exercises performed in the workout.
 * @returns Readonly sparse map of MuscleName → accumulated fatigue.
 */
export function calculateWorkoutFatigue(
  loggedExercises: readonly LoggedWorkoutExercise[],
): WorkoutFatigueMap {
  const totals: Partial<Record<MuscleName, number>> = {};

  for (const logged of loggedExercises) {
    const catalog = findCatalogExercise(logged.slug);
    if (!catalog) continue;

    const primaryMuscles: readonly MuscleName[] = catalog.primaryMuscles ?? [];
    const secondaryMuscles: readonly MuscleName[] =
      catalog.secondaryMuscles ?? [];

    const source: Readonly<Partial<Record<string, number>>> =
      hasFatigueBreakdown(logged.fatigueBreakdown)
        ? logged.fatigueBreakdown
        : catalog.fatigue;

    const setsFactor = volumeFactor(logged);

    for (const [key, rawValue] of Object.entries(source)) {
      if (!isMuscleName(key)) continue;
      if (typeof rawValue !== "number" || !Number.isFinite(rawValue)) continue;

      const multiplier = roleMultiplier(
        key,
        primaryMuscles,
        secondaryMuscles,
      );
      if (multiplier === 0) continue;

      const applied = rawValue * multiplier * setsFactor;
      totals[key] = (totals[key] ?? 0) + applied;
    }
  }

  const clamped: Partial<Record<MuscleName, number>> = {};
  for (const [muscle, value] of Object.entries(totals) as [
    MuscleName,
    number,
  ][]) {
    const next = clampFatigue(value);
    if (next > 0) {
      clamped[muscle] = next;
    }
  }

  return clamped;
}
