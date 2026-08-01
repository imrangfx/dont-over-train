import { RECOVERY_STATUS } from "@/app/Data/recoveryConfig";
import type {
  MuscleStatus,
  RecoverySummary,
} from "@/app/lib/recovery/recoveryTypes";

/**
 * Clean a recovery % for display / UI math.
 * Drops float noise (e.g. 58.000000176 → 58, 92.500000031 → 92.5).
 * At most one decimal place; integers stay whole.
 */
export function sanitizeRecoveryPercent(value: number): number {
  if (!Number.isFinite(value)) return 0;
  const clamped = Math.min(100, Math.max(0, value));
  return Math.round(clamped * 10) / 10;
}

/**
 * Format a recovery percentage for UI labels (no trailing junk decimals).
 * Examples: 58 → "58", 92.5 → "92.5", 91.0000001 → "91"
 */
export function formatRecoveryPercent(value: number): string {
  const cleaned = sanitizeRecoveryPercent(value);
  return Number.isInteger(cleaned) ? String(cleaned) : cleaned.toFixed(1);
}

/**
 * Format a recovery percentage as a whole number for history / snapshot UI.
 * Examples: 58.4 → "58", 92.5 → "93", 61.0000001 → "61"
 */
export function formatRecoveryPercentWhole(value: number): string {
  return String(Math.round(sanitizeRecoveryPercent(value)));
}

/**
 * Fatigue-weighted overall readiness (UI-only; does not alter stored muscle %).
 *
 * Algorithm:
 * 1. For each muscle, fatigue proxy = 100 − recoveryPercent (clamped 0–100).
 * 2. weight_i = fatigue_i² + 1
 *    Squaring gives heavily fatigued muscles more pull than a flat average.
 *    The +1 keeps fully recovered muscles from zeroing out the denominator.
 * 3. overall = Σ(recovery_i × weight_i) / Σ(weight_i)
 * 4. Result is sanitized to one decimal max.
 *
 * Example: one muscle at 40% among several near 95% pulls overall well below
 * a simple mean, reflecting that the athlete is not fully training-ready.
 */
function calculateOverallRecoveryPercent(
  muscles: readonly MuscleStatus[],
): number {
  let weightedSum = 0;
  let totalWeight = 0;

  for (const muscle of muscles) {
    const recovery = sanitizeRecoveryPercent(muscle.recoveryPercent);
    const fatigue = 100 - recovery;
    const weight = fatigue * fatigue + 1;
    weightedSum += recovery * weight;
    totalWeight += weight;
  }

  if (totalWeight <= 0) return 100;
  return sanitizeRecoveryPercent(weightedSum / totalWeight);
}

/**
 * UI-only aggregate from a stored Recovery Engine snapshot.
 * Maps fatigue-weighted overall % onto RECOVERY_STATUS bands.
 * Does not recalculate per-muscle fatigue, decay, or recommendations.
 */
export function buildOverallSummary(
  muscles: readonly MuscleStatus[],
  generatedAt: number,
): RecoverySummary {
  if (muscles.length === 0) {
    const fresh = RECOVERY_STATUS[0];
    return {
      asOf: generatedAt,
      muscles,
      overallRecoveryPercent: 100,
      overallStatusId: fresh.id,
      overallLabel: fresh.label,
      overallColor: fresh.color,
    };
  }

  const overallRecoveryPercent = calculateOverallRecoveryPercent(muscles);

  // RECOVERY_STATUS minimumRecovery bands: 90 / 70 / 50 / 25 / 0
  const band =
    RECOVERY_STATUS.find(
      (entry) => overallRecoveryPercent >= entry.minimumRecovery,
    ) ?? RECOVERY_STATUS[RECOVERY_STATUS.length - 1];

  return {
    asOf: generatedAt,
    muscles,
    overallRecoveryPercent,
    overallStatusId: band.id,
    overallLabel: band.label,
    overallColor: band.color,
  };
}

/**
 * Sort a copy by lowest recovery first (most fatigued first).
 * Does not mutate the stored snapshot. Tie-break by muscle name.
 */
export function sortMusclesByLowestRecovery(
  muscles: readonly MuscleStatus[],
): MuscleStatus[] {
  return [...muscles].sort((a, b) => {
    const diff =
      sanitizeRecoveryPercent(a.recoveryPercent) -
      sanitizeRecoveryPercent(b.recoveryPercent);
    if (diff !== 0) return diff;
    return a.muscle.localeCompare(b.muscle);
  });
}

export function formatLastUpdated(generatedAt: number): string {
  return new Date(generatedAt).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}
