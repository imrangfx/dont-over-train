/**
 * Body-part recommendation badges for Home / quick-start cards.
 *
 * Best Choice is driven by the adaptive workout-split recommender
 * (user history → next logical session), then filtered by recovery.
 * Recovering badges still mark body parts in AVOID.
 *
 * Presentation only — no fatigue/decay recalculation.
 */

import { MUSCLES_BY_BODY_PART, type MuscleName } from "@/app/Data/muscles";
import { generateRecommendations } from "@/app/lib/recovery/recommendationEngine";
import type { RecommendationLevel } from "@/app/lib/recovery/recoveryTypes";
import type { LiveRecoveryView } from "@/components/recovery/liveRecovery";
import { sanitizeRecoveryPercent } from "@/components/recovery/buildOverallSummary";
import type { WorkoutHistoryEntry } from "@/lib/workouts";
import {
  recommendNextSplit,
  type SplitBodyPartSlug,
} from "@/lib/workoutSplitRecommendation";

export type BodyPartRecommendationBadge = {
  readonly id: "best" | "recovering";
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

const RECOVERING: BodyPartRecommendationBadge = {
  id: "recovering",
  label: "🔴 Recovering",
  className: "text-red-400 ring-red-500/25",
};

const BEST_CHOICE: BodyPartRecommendationBadge = {
  id: "best",
  label: "⭐ Best Choice",
  className: "text-lime-400 ring-lime-500/25",
};

function musclesForPartName(name: string): readonly MuscleName[] | null {
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
    sum += status ? sanitizeRecoveryPercent(status.recoveryPercent) : 100;
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

type PartScore = {
  slug: string;
  name: string;
  worst: RecommendationLevel;
  average: number;
};

function scoreParts(
  live: LiveRecoveryView,
  bodyParts: readonly BodyPartRef[],
): PartScore[] {
  const scores: PartScore[] = [];
  for (const part of bodyParts) {
    const muscles = musclesForPartName(part.name);
    if (!muscles || muscles.length === 0) continue;
    scores.push({
      slug: part.slug,
      name: part.name,
      worst: worstLevel(live, muscles),
      average: averageRecoveryForPart(live, muscles),
    });
  }
  return scores;
}

function isTrainable(worst: RecommendationLevel): boolean {
  return worst !== "AVOID";
}

/**
 * Prefer split targets that are trainable; replace recovering targets with
 * the next-best recovered alternatives (keeps the intended 1–2 count).
 */
function applyRecoveryFilter(
  preferred: readonly SplitBodyPartSlug[],
  scores: readonly PartScore[],
  max = 2,
): string[] {
  if (preferred.length === 0) return [];

  const bySlug = new Map(scores.map((score) => [score.slug, score]));
  const chosen: string[] = [];
  const used = new Set<string>();

  for (const slug of preferred) {
    if (chosen.length >= max) break;
    const score = bySlug.get(slug);
    if (!score || !isTrainable(score.worst) || used.has(slug)) continue;
    chosen.push(slug);
    used.add(slug);
  }

  const targetCount = Math.min(max, preferred.length);
  if (chosen.length >= targetCount) return chosen;

  const alternatives = [...scores]
    .filter((score) => isTrainable(score.worst) && !used.has(score.slug))
    .sort((a, b) => {
      const byLevel = LEVEL_RANK[b.worst] - LEVEL_RANK[a.worst];
      if (byLevel !== 0) return byLevel;
      return b.average - a.average;
    });

  for (const alt of alternatives) {
    if (chosen.length >= targetCount) break;
    chosen.push(alt.slug);
    used.add(alt.slug);
  }

  return chosen;
}

/**
 * Build a slug → badge map for body part cards.
 *
 * - Recovering: worst muscle level is AVOID
 * - Best Choice: up to two parts from the adaptive split recommender
 *   (recovery-filtered). Best Choice wins over Recovering on the same card.
 */
export function buildBodyPartRecommendationBadges(
  live: LiveRecoveryView | null,
  bodyParts: readonly BodyPartRef[],
  history: readonly WorkoutHistoryEntry[] = [],
): ReadonlyMap<string, BodyPartRecommendationBadge> {
  const result = new Map<string, BodyPartRecommendationBadge>();
  if (!live) return result;

  const scores = scoreParts(live, bodyParts);

  for (const score of scores) {
    if (score.worst === "AVOID") {
      result.set(score.slug, RECOVERING);
    }
  }

  const split = recommendNextSplit(history);
  const bestSlugs = applyRecoveryFilter(split.recommendedSlugs, scores, 2);

  // No history yet: fall back to highest-average fully SAFE part (prior behavior).
  if (bestSlugs.length === 0 && history.length === 0) {
    const allSafe = scores.filter((score) => score.worst === "SAFE");
    if (allSafe.length > 0) {
      let best = allSafe[0];
      for (let i = 1; i < allSafe.length; i += 1) {
        if (allSafe[i].average > best.average) best = allSafe[i];
      }
      result.set(best.slug, BEST_CHOICE);
    }
    return result;
  }

  for (const slug of bestSlugs) {
    result.set(slug, BEST_CHOICE);
  }

  return result;
}
