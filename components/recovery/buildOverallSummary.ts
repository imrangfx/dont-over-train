import { RECOVERY_STATUS } from "@/app/Data/recoveryConfig";
import type {
  MuscleStatus,
  RecoverySummary,
} from "@/app/lib/recovery/recoveryTypes";

/**
 * Build a RecoverySummary view-model from per-muscle statuses.
 *
 * The Recovery Engine stores MuscleStatus[] on the history entry; overall
 * aggregates are derived here for the dashboard (average recovery %, band
 * resolved from RECOVERY_STATUS — no invented colors).
 */
export function buildOverallSummary(
  muscles: readonly MuscleStatus[],
  asOf: number,
): RecoverySummary {
  if (muscles.length === 0) {
    const fresh = RECOVERY_STATUS[0];
    return {
      asOf,
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

  const band =
    RECOVERY_STATUS.find(
      (entry) => overallRecoveryPercent >= entry.minimumRecovery,
    ) ?? RECOVERY_STATUS[RECOVERY_STATUS.length - 1];

  return {
    asOf,
    muscles,
    overallRecoveryPercent,
    overallStatusId: band.id,
    overallLabel: band.label,
    overallColor: band.color,
  };
}
