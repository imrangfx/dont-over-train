/**
 * Today's Recommendation — pick one body part from existing badge helpers.
 * Presentation only; no Recovery Engine changes.
 */

import { MUSCLES_BY_BODY_PART, type MuscleName } from "@/app/Data/muscles";
import type { LiveRecoveryView } from "@/components/recovery/liveRecovery";
import {
  buildBodyPartRecommendationBadges,
  type BodyPartRecommendationBadge,
} from "@/components/recovery/bodyPartRecommendationBadges";
import { sanitizeRecoveryPercent } from "@/components/recovery/buildOverallSummary";

type BodyPartRef = {
  readonly name: string;
  readonly slug: string;
};

export type TodaysWorkoutRecommendation = {
  readonly kind: "workout";
  readonly bodyPartName: string;
  readonly bodyPartSlug: string;
  readonly badge: BodyPartRecommendationBadge;
  readonly reasons: readonly string[];
};

export type TodaysRecoveryDay = {
  readonly kind: "recovery-day";
  readonly reasons: readonly string[];
};

export type TodaysRecommendation =
  | TodaysWorkoutRecommendation
  | TodaysRecoveryDay;

const PICK_PRIORITY: Record<BodyPartRecommendationBadge["id"], number> = {
  best: 0,
  recommended: 1,
  "train-light": 2,
  recovering: 3,
};

function musclesForPartName(name: string): readonly MuscleName[] | null {
  if (Object.prototype.hasOwnProperty.call(MUSCLES_BY_BODY_PART, name)) {
    return MUSCLES_BY_BODY_PART[name as keyof typeof MUSCLES_BY_BODY_PART];
  }
  return null;
}

function averageRecoveryForPart(
  live: LiveRecoveryView,
  muscles: readonly MuscleName[],
): number {
  if (muscles.length === 0) return 100;
  let sum = 0;
  for (const muscle of muscles) {
    const status = live.muscles.find((item) => item.muscle === muscle);
    sum += status ? sanitizeRecoveryPercent(status.recoveryPercent) : 100;
  }
  return sum / muscles.length;
}

/**
 * Reasons from engine status labels / recommendation messages only.
 * Format: "{Muscle} — {Status label}" (e.g. "Upper Chest — High Fatigue").
 */
function buildReasons(
  live: LiveRecoveryView,
  selected: BodyPartRef | null,
  max = 3,
): string[] {
  const reasons: string[] = [];
  const used = new Set<string>();

  const pushStatus = (muscle: MuscleName) => {
    if (reasons.length >= max || used.has(muscle)) return;
    const status = live.muscles.find((item) => item.muscle === muscle);
    if (!status) return;
    used.add(muscle);
    reasons.push(`${status.muscle} — ${status.label}`);
  };

  if (selected) {
    const muscles = musclesForPartName(selected.name) ?? [];
    // Prefer this body part's muscles, highest recovery first (positive reasons).
    const statuses = muscles
      .map((muscle) => live.muscles.find((item) => item.muscle === muscle))
      .filter((item): item is NonNullable<typeof item> => item != null)
      .sort(
        (a, b) =>
          sanitizeRecoveryPercent(b.recoveryPercent) -
          sanitizeRecoveryPercent(a.recoveryPercent),
      );

    for (const status of statuses) {
      pushStatus(status.muscle);
      if (reasons.length >= max) break;
    }
  }

  // Fill with most fatigued muscles elsewhere (real status labels).
  if (reasons.length < max) {
    for (const status of live.muscles) {
      if (reasons.length >= max) break;
      pushStatus(status.muscle);
    }
  }

  // Last resort: recommendation messages already produced by the engine.
  if (reasons.length < 2) {
    for (const rec of live.recommendations) {
      if (reasons.length >= max) break;
      if (used.has(rec.muscle)) continue;
      used.add(rec.muscle);
      reasons.push(`${rec.muscle} — ${rec.message}`);
    }
  }

  return reasons.slice(0, max);
}

/**
 * Pick exactly one Today's Recommendation from the same badge map used on cards.
 */
export function selectTodaysRecommendation(
  live: LiveRecoveryView | null,
  bodyParts: readonly BodyPartRef[],
): TodaysRecommendation | null {
  if (!live || bodyParts.length === 0) return null;

  const badges = buildBodyPartRecommendationBadges(live, bodyParts);

  type Candidate = {
    part: BodyPartRef;
    badge: BodyPartRecommendationBadge;
    average: number;
  };

  const candidates: Candidate[] = [];

  for (const part of bodyParts) {
    const badge = badges.get(part.slug);
    if (!badge) continue;
    const muscles = musclesForPartName(part.name) ?? [];
    candidates.push({
      part,
      badge,
      average: averageRecoveryForPart(live, muscles),
    });
  }

  if (candidates.length === 0) return null;

  const trainable = candidates.filter(
    (item) => item.badge.id !== "recovering",
  );

  if (trainable.length === 0) {
    return {
      kind: "recovery-day",
      reasons: buildReasons(live, null, 3),
    };
  }

  trainable.sort((a, b) => {
    const byPriority =
      PICK_PRIORITY[a.badge.id] - PICK_PRIORITY[b.badge.id];
    if (byPriority !== 0) return byPriority;
    return b.average - a.average;
  });

  const winner = trainable[0];

  return {
    kind: "workout",
    bodyPartName: winner.part.name,
    bodyPartSlug: winner.part.slug,
    badge: winner.badge,
    reasons: buildReasons(live, winner.part, 3),
  };
}
