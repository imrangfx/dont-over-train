/**
 * Body-part recommendation badges for Home / quick-start cards.
 *
 * Presentation only — uses LiveRecoveryView from the Recovery Engine
 * (recommendations + muscle recovery %). No fatigue/decay recalculation.
 */

import { MUSCLES_BY_BODY_PART, type MuscleName } from "@/app/Data/muscles";
import { generateRecommendations } from "@/app/lib/recovery/recommendationEngine";
import type { RecommendationLevel } from "@/app/lib/recovery/recoveryTypes";
import type { LiveRecoveryView } from "@/components/recovery/liveRecovery";
import { sanitizeRecoveryPercent } from "@/components/recovery/buildOverallSummary";

export type BodyPartRecommendationBadge = {
  readonly id: "best" | "recommended" | "train-light" | "recovering";
  /** Full badge label including emoji. */
  readonly label: string;
  /** Tailwind classes for badge text / ring (matches prior badge chrome). */
  readonly className: string;
};

type BodyPartRef = {
  readonly name: string;
  readonly slug: string;
};

const LEVEL_RANK: Record<RecommendationLevel, number> = {
  AVOID: 0,
  CAUTION: 1,
  SAFE: 2,
};

const BADGE_BY_WORST: Record<
  RecommendationLevel,
  Omit<BodyPartRecommendationBadge, "id"> & {
    id: BodyPartRecommendationBadge["id"];
  }
> = {
  AVOID: {
    id: "recovering",
    label: "🔴 Recovering",
    className: "text-red-400 ring-red-500/25",
  },
  CAUTION: {
    id: "train-light",
    label: "🟡 Train Light",
    className: "text-yellow-300 ring-yellow-500/25",
  },
  SAFE: {
    id: "recommended",
    label: "🟢 Recommended",
    className: "text-lime-400 ring-lime-500/25",
  },
};

const BEST_CHOICE: BodyPartRecommendationBadge = {
  id: "best",
  label: "⭐ Best Choice",
  className: "text-lime-400 ring-lime-500/25",
};

function musclesForPartName(
  name: string,
): readonly MuscleName[] | null {
  if (Object.prototype.hasOwnProperty.call(MUSCLES_BY_BODY_PART, name)) {
    return MUSCLES_BY_BODY_PART[name as keyof typeof MUSCLES_BY_BODY_PART];
  }
  return null;
}

function levelForMuscle(
  live: LiveRecoveryView,
  muscle: MuscleName,
): RecommendationLevel {
  const existing = live.recommendations.find((item) => item.muscle === muscle);
  if (existing) return existing.level;

  const status = live.muscles.find((item) => item.muscle === muscle);
  if (status) {
    return generateRecommendations([status])[0].level;
  }

  // Not in the live snapshot → treat as fully recovered / SAFE.
  return "SAFE";
}

function averageRecoveryForPart(
  live: LiveRecoveryView,
  muscles: readonly MuscleName[],
): number {
  if (muscles.length === 0) return 100;

  let sum = 0;
  for (const muscle of muscles) {
    const status = live.muscles.find((item) => item.muscle === muscle);
    sum += status
      ? sanitizeRecoveryPercent(status.recoveryPercent)
      : 100;
  }
  return sum / muscles.length;
}

function worstLevel(
  live: LiveRecoveryView,
  muscles: readonly MuscleName[],
): RecommendationLevel {
  let worst: RecommendationLevel = "SAFE";
  for (const muscle of muscles) {
    const level = levelForMuscle(live, muscle);
    if (LEVEL_RANK[level] < LEVEL_RANK[worst]) {
      worst = level;
    }
  }
  return worst;
}

/**
 * Build a slug → badge map for every body part card.
 * Order of `bodyParts` is preserved for Best Choice tie-breaks (first wins).
 */
export function buildBodyPartRecommendationBadges(
  live: LiveRecoveryView | null,
  bodyParts: readonly BodyPartRef[],
): ReadonlyMap<string, BodyPartRecommendationBadge> {
  const result = new Map<string, BodyPartRecommendationBadge>();
  if (!live) return result;

  type PartScore = {
    slug: string;
    worst: RecommendationLevel;
    average: number;
  };

  const scores: PartScore[] = [];

  for (const part of bodyParts) {
    const muscles = musclesForPartName(part.name);
    if (!muscles || muscles.length === 0) continue;

    const worst = worstLevel(live, muscles);
    const average = averageRecoveryForPart(live, muscles);
    scores.push({ slug: part.slug, worst, average });

    result.set(part.slug, BADGE_BY_WORST[worst]);
  }

  const allSafe = scores.filter((score) => score.worst === "SAFE");
  if (allSafe.length === 0) return result;

  let best = allSafe[0];
  for (let i = 1; i < allSafe.length; i += 1) {
    if (allSafe[i].average > best.average) {
      best = allSafe[i];
    }
  }

  result.set(best.slug, BEST_CHOICE);
  return result;
}
