import { RECOVERY_STATUS } from "@/app/Data/recoveryConfig";
import type {
  MuscleStatus,
  RecoverySummary,
} from "@/app/lib/recovery/recoveryTypes";

/**
 * UI-only aggregate from a stored Recovery Engine snapshot.
 *
 * Averages recovery.recovery[].recoveryPercent and maps the result onto
 * RECOVERY_STATUS bands (Fresh / Recovered / …). Does not recalculate
 * fatigue, decay, or recommendations.
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

  const overallRecoveryPercent = Math.round(
    muscles.reduce((sum, muscle) => sum + muscle.recoveryPercent, 0) /
      muscles.length,
  );

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

/** Sort a copy by lowest recovery first (does not mutate the snapshot). */
export function sortMusclesByLowestRecovery(
  muscles: readonly MuscleStatus[],
): MuscleStatus[] {
  return [...muscles].sort(
    (a, b) => a.recoveryPercent - b.recoveryPercent,
  );
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
