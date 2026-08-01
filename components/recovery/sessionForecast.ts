/**
 * Live Session Fatigue Forecast — display-only projection.
 *
 * Uses fatigueCalculator + calculateRecovery + recommendation rules.
 * Never writes to history / Supabase.
 */

import { RECOMMENDATION_RULES, RECOVERY_CONFIG, RECOVERY_STATUS } from "@/app/Data/recoveryConfig";
import { isMuscleName, type MuscleName } from "@/app/Data/muscles";
import { calculateWorkoutFatigue } from "@/app/lib/recovery/fatigueCalculator";
import { calculateRecovery } from "@/app/lib/recovery/recoveryCalculator";
import type {
  LoggedWorkoutExercise,
  RecoverySummary,
} from "@/app/lib/recovery/recoveryTypes";
import type { InProgressWorkoutItem } from "@/lib/workouts";
import type { LiveRecoveryView } from "@/components/recovery/liveRecovery";
import {
  buildOverallSummary,
  formatRecoveryPercentWhole,
  sanitizeRecoveryPercent,
} from "@/components/recovery/buildOverallSummary";

export type ImpactedMuscleForecast = {
  readonly muscle: MuscleName;
  readonly currentFatigue: number;
  readonly projectedFatigue: number;
  readonly currentRecoveryPercent: number;
  readonly projectedRecoveryPercent: number;
  readonly color: string;
};

export type SessionForecast = {
  readonly currentOverall: RecoverySummary;
  readonly projectedOverall: RecoverySummary;
  readonly impacted: readonly ImpactedMuscleForecast[];
  readonly outlook: string;
  readonly highRecoveryCost: boolean;
};

/** Map in-progress session items → LoggedWorkoutExercise for fatigueCalculator. */
export function sessionItemsToLoggedExercises(
  items: readonly InProgressWorkoutItem[],
): LoggedWorkoutExercise[] {
  return items.map((item) => ({
    slug: item.slug,
    name: item.exercise,
    bodyPart: item.bodyPart,
    section: item.section,
    sets: item.sets,
    // Empty breakdown so the calculator uses catalog fatigue × set count
    // (in-progress fatigueBreakdown is already volume-adjusted).
    fatigueBreakdown: {},
  }));
}

function clampFatigue(value: number): number {
  if (!Number.isFinite(value) || value <= 0) return 0;
  return Math.min(value, RECOVERY_CONFIG.MAX_FATIGUE);
}

function fatigueMapFromLive(
  live: LiveRecoveryView | null,
): Partial<Record<MuscleName, number>> {
  const map: Partial<Record<MuscleName, number>> = {};
  if (!live) return map;
  for (const status of live.muscles) {
    map[status.muscle] = status.fatigue;
  }
  return map;
}

function mergeFatigueMaps(
  current: Partial<Record<MuscleName, number>>,
  session: Partial<Record<MuscleName, number>>,
): Partial<Record<MuscleName, number>> {
  const merged: Partial<Record<MuscleName, number>> = { ...current };
  for (const [key, value] of Object.entries(session)) {
    if (!isMuscleName(key)) continue;
    if (typeof value !== "number" || !Number.isFinite(value)) continue;
    merged[key] = clampFatigue((merged[key] ?? 0) + value);
  }
  return merged;
}

function statusColorForRecovery(recoveryPercent: number): string {
  const band =
    RECOVERY_STATUS.find(
      (entry) => recoveryPercent >= entry.minimumRecovery,
    ) ?? RECOVERY_STATUS[RECOVERY_STATUS.length - 1];
  return band.color;
}

function outlookFromOverall(summary: RecoverySummary): string {
  switch (summary.overallStatusId) {
    case "FRESH":
    case "RECOVERED":
      return "Recovery should be complete tomorrow.";
    case "MODERATE":
      return "Moderate fatigue expected.";
    case "HIGH":
    case "OVERREACHED":
      return "High fatigue expected.";
    default:
      return summary.overallLabel;
  }
}

/**
 * Build a session forecast from live recovery + in-progress exercises.
 * Returns null when there are no exercises to forecast.
 */
export function buildSessionForecast(
  live: LiveRecoveryView | null,
  sessionItems: readonly InProgressWorkoutItem[],
  now: number = Date.now(),
): SessionForecast | null {
  if (sessionItems.length === 0) return null;

  const currentMuscles = live?.muscles ?? [];
  const currentOverall = buildOverallSummary(
    currentMuscles,
    live?.evaluatedAt ?? now,
  );

  const sessionFatigue = calculateWorkoutFatigue(
    sessionItemsToLoggedExercises(sessionItems),
  );

  const merged = mergeFatigueMaps(
    fatigueMapFromLive(live),
    sessionFatigue,
  );

  // lastUpdatedAt === now → no additional decay; map fatigue → recovery %.
  const projectedMuscles = calculateRecovery(merged, now, now);
  const projectedOverall = buildOverallSummary(projectedMuscles, now);

  const currentByMuscle = new Map(
    currentMuscles.map((status) => [status.muscle, status]),
  );
  const projectedByMuscle = new Map(
    projectedMuscles.map((status) => [status.muscle, status]),
  );

  const allMuscles = new Set<MuscleName>([
    ...currentByMuscle.keys(),
    ...projectedByMuscle.keys(),
  ]);

  const impacted: ImpactedMuscleForecast[] = [];

  for (const muscle of allMuscles) {
    const current = currentByMuscle.get(muscle);
    const projected = projectedByMuscle.get(muscle);
    const currentFatigue = current?.fatigue ?? 0;
    const projectedFatigue = projected?.fatigue ?? 0;
    const delta = projectedFatigue - currentFatigue;
    if (delta <= 0) continue;

    const projectedRecovery =
      projected?.recoveryPercent ??
      sanitizeRecoveryPercent(100 - projectedFatigue);

    impacted.push({
      muscle,
      currentFatigue,
      projectedFatigue,
      currentRecoveryPercent:
        current?.recoveryPercent ??
        sanitizeRecoveryPercent(100 - currentFatigue),
      projectedRecoveryPercent: projectedRecovery,
      color: statusColorForRecovery(projectedRecovery),
    });
  }

  impacted.sort(
    (a, b) =>
      b.projectedFatigue -
      b.currentFatigue -
      (a.projectedFatigue - a.currentFatigue),
  );

  const topImpacted = impacted.slice(0, 5);

  const highRecoveryCost =
    sanitizeRecoveryPercent(projectedOverall.overallRecoveryPercent) <
    RECOMMENDATION_RULES.CAUTION_AT;

  return {
    currentOverall,
    projectedOverall,
    impacted: topImpacted,
    outlook: outlookFromOverall(projectedOverall),
    highRecoveryCost,
  };
}

export { formatRecoveryPercentWhole };
