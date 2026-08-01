/**
 * Pre-workout Recovery Check — display helpers only.
 *
 * Uses live MuscleStatus / RecommendationResult from the Recovery Engine.
 * Does not recalculate fatigue or decay itself.
 */

import {
  MUSCLES_BY_BODY_PART,
  type MuscleName,
} from "@/app/Data/muscles";
import { RECOMMENDATION_RULES } from "@/app/Data/recoveryConfig";
import { generateRecommendations } from "@/app/lib/recovery/recommendationEngine";
import type {
  MuscleStatus,
  RecommendationResult,
} from "@/app/lib/recovery/recoveryTypes";
import type { LiveRecoveryView } from "@/components/recovery/liveRecovery";
import { sanitizeRecoveryPercent } from "@/components/recovery/buildOverallSummary";

export type RecoveryCheckWarning = {
  readonly muscle: MuscleStatus;
  readonly recommendation: RecommendationResult;
};

const BODY_PART_SLUG_TO_KEY: Record<
  string,
  keyof typeof MUSCLES_BY_BODY_PART
> = {
  chest: "Chest",
  back: "Back",
  shoulders: "Shoulders",
  biceps: "Biceps",
  triceps: "Triceps",
  forearms: "Forearms",
  legs: "Legs",
  abs: "Abs",
};

/** Body-part slug from a workout next path (`/workout/chest/upper-chest` → `chest`). */
export function bodyPartSlugFromWorkoutPath(path: string): string | null {
  const parts = path.replace(/\/$/, "").split("/").filter(Boolean);
  if (parts[0] !== "workout" || !parts[1]) return null;
  return parts[1].toLowerCase();
}

function musclesForBodyPartSlug(
  slug: string,
): readonly MuscleName[] | null {
  const key = BODY_PART_SLUG_TO_KEY[slug.toLowerCase()];
  if (!key) return null;
  return MUSCLES_BY_BODY_PART[key];
}

/**
 * If any live muscle for the selected body part is below SAFE_TO_TRAIN_AT,
 * return the most fatigued one (with its recommendation). Otherwise null.
 */
export function findRecoveryCheckWarning(
  live: LiveRecoveryView,
  bodyPartSlug: string,
): RecoveryCheckWarning | null {
  const partMuscles = musclesForBodyPartSlug(bodyPartSlug);
  if (!partMuscles || partMuscles.length === 0) return null;

  const partSet = new Set<MuscleName>(partMuscles);
  const threshold = RECOMMENDATION_RULES.SAFE_TO_TRAIN_AT;

  const belowSafe = live.muscles
    .filter(
      (status) =>
        partSet.has(status.muscle) &&
        sanitizeRecoveryPercent(status.recoveryPercent) < threshold,
    )
    .sort(
      (a, b) =>
        sanitizeRecoveryPercent(a.recoveryPercent) -
        sanitizeRecoveryPercent(b.recoveryPercent),
    );

  if (belowSafe.length === 0) return null;

  const muscle = belowSafe[0];
  const recommendation: RecommendationResult =
    live.recommendations.find((item) => item.muscle === muscle.muscle) ??
    generateRecommendations([muscle])[0];

  return { muscle, recommendation };
}
