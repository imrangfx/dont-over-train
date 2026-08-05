/**
 * Presentation helpers for the Recovery page dashboard.
 * Groups / buckets existing MuscleStatus + RecommendationResult only.
 * Does not recalculate fatigue, decay, or recommendation levels.
 */

import { MUSCLES_BY_BODY_PART, type MuscleName } from "@/app/Data/muscles";
import type { RecoveryStatusId } from "@/app/Data/recoveryConfig";
import type {
  MuscleStatus,
  RecommendationLevel,
  RecommendationResult,
  RecoverySummary,
} from "@/app/lib/recovery/recoveryTypes";
import { sanitizeRecoveryPercent } from "@/components/recovery/buildOverallSummary";

/** UI buckets for the quick-summary strip (maps existing status bands). */
export type RecoverySummaryBucket = "recover" | "moderate" | "ready";

export type RecoveryQuickCounts = {
  readonly recover: number;
  readonly moderate: number;
  readonly ready: number;
  readonly total: number;
};

export type BodyPartRecoveryGroup = {
  readonly bodyPart: string;
  readonly muscles: readonly MuscleStatus[];
  /** Worst band among members (most fatigued). */
  readonly worstStatusId: RecoveryStatusId;
  readonly worstLabel: string;
  readonly worstColor: string;
};

const STATUS_RANK: Record<RecoveryStatusId, number> = {
  FRESH: 4,
  RECOVERED: 3,
  MODERATE: 2,
  HIGH: 1,
  OVERREACHED: 0,
};

export function bucketForStatusId(statusId: RecoveryStatusId): RecoverySummaryBucket {
  if (statusId === "HIGH" || statusId === "OVERREACHED") return "recover";
  if (statusId === "MODERATE") return "moderate";
  return "ready";
}

export function countRecoveryBuckets(
  muscles: readonly MuscleStatus[],
): RecoveryQuickCounts {
  let recover = 0;
  let moderate = 0;
  let ready = 0;

  for (const muscle of muscles) {
    const bucket = bucketForStatusId(muscle.statusId);
    if (bucket === "recover") recover += 1;
    else if (bucket === "moderate") moderate += 1;
    else ready += 1;
  }

  return {
    recover,
    moderate,
    ready,
    total: muscles.length,
  };
}

export function groupRecommendationsByLevel(
  recommendations: readonly RecommendationResult[],
): Record<RecommendationLevel, RecommendationResult[]> {
  const groups: Record<RecommendationLevel, RecommendationResult[]> = {
    AVOID: [],
    CAUTION: [],
    SAFE: [],
  };

  for (const item of recommendations) {
    groups[item.level].push(item);
  }

  return groups;
}

export function buildBodyPartRecoveryGroups(
  muscles: readonly MuscleStatus[],
): BodyPartRecoveryGroup[] {
  const byName = new Map<MuscleName, MuscleStatus>();
  for (const status of muscles) {
    byName.set(status.muscle, status);
  }

  const groups: BodyPartRecoveryGroup[] = [];

  for (const [bodyPart, partMuscles] of Object.entries(MUSCLES_BY_BODY_PART)) {
    const members: MuscleStatus[] = [];
    for (const muscle of partMuscles) {
      const status = byName.get(muscle);
      if (status) members.push(status);
    }
    if (members.length === 0) continue;

    members.sort(
      (a, b) =>
        sanitizeRecoveryPercent(a.recoveryPercent) -
        sanitizeRecoveryPercent(b.recoveryPercent),
    );

    const worst = members.reduce((current, next) =>
      STATUS_RANK[next.statusId] < STATUS_RANK[current.statusId] ? next : current,
    );

    groups.push({
      bodyPart,
      muscles: members,
      worstStatusId: worst.statusId,
      worstLabel: worst.label,
      worstColor: worst.color,
    });
  }

  // Most fatigued body parts first for scanability.
  groups.sort(
    (a, b) => STATUS_RANK[a.worstStatusId] - STATUS_RANK[b.worstStatusId],
  );

  return groups;
}

/** Short coaching copy from overall status — presentation only. */
export function overallRecoveryAdvice(summary: RecoverySummary): string {
  switch (summary.overallStatusId) {
    case "OVERREACHED":
      return "Your body needs more time to recover. Focus on rest and active recovery.";
    case "HIGH":
      return "Fatigue is still elevated. Keep training light or prioritize recovery today.";
    case "MODERATE":
      return "You're partially recovered. Train carefully and avoid pushing hard on fatigued muscles.";
    case "RECOVERED":
      return "Most systems are ready. You can train, but ease into volume if anything still feels heavy.";
    case "FRESH":
    default:
      return "You're recovered and ready to train. Hit your priority muscles with full intensity.";
  }
}

/** Compact “Today, 9:17 PM” / “6 Aug, 9:17 PM” for the recovery hero. */
export function formatRecoveryUpdatedAt(asOf: number, now = Date.now()): string {
  const date = new Date(asOf);
  if (Number.isNaN(date.getTime())) return "—";

  const time = date.toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
  });

  const startToday = new Date(now);
  startToday.setHours(0, 0, 0, 0);
  const startAsOf = new Date(asOf);
  startAsOf.setHours(0, 0, 0, 0);
  const dayDiff = Math.round(
    (startToday.getTime() - startAsOf.getTime()) / (24 * 60 * 60 * 1000),
  );

  if (dayDiff === 0) return `Today, ${time}`;
  if (dayDiff === 1) return `Yesterday, ${time}`;

  const day = date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
  });
  return `${day}, ${time}`;
}
