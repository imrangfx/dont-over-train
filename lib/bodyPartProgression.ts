import type { WorkoutHistoryEntry } from "@/lib/workouts";
import {
  BODY_PART_LEVELS,
  STRENGTH_BODY_PARTS,
  type BodyPartLevelDefinition,
  type BodyPartName,
} from "@/lib/bodyPartLevelsConfig";

/**
 * Body Part Strength Level calculations - a full-body progression system,
 * separate from the single-category Progressive Overload levels in
 * lib/progression.ts. Pure functions only; all thresholds/titles live in
 * lib/bodyPartLevelsConfig.ts.
 *
 * A user reaches a level only once EVERY body part's qualifying PR meets
 * that level's requirement - the weakest body part always determines the
 * overall level, so this reflects balanced full-body strength rather than
 * one strong lift. Because every body part's tracked value is the highest
 * qualifying weight ever recorded across all workout history, and history
 * only grows over time, the resulting level can never decrease.
 */

const DEFAULT_MIN_REPS = 8;

/**
 * Highest weight ever lifted for ANY exercise belonging to `bodyPart`,
 * counting only sets that hit at least `minReps` reps. Scans
 * WorkoutHistoryEntry.exerciseList directly (already tagged with bodyPart,
 * reps, and per-set weights) - no separate exercise database lookup needed.
 */
export function getBodyPartQualifyingPR(
  bodyPart: BodyPartName,
  history: WorkoutHistoryEntry[],
  minReps: number = DEFAULT_MIN_REPS
): number {
  let best = 0;

  for (const workout of history || []) {
    for (const item of workout.exerciseList || []) {
      if (item?.bodyPart !== bodyPart) continue;
      if ((Number(item.reps) || 0) < minReps) continue;

      const numericWeights = (item.weights || []).filter(
        (w): w is number => typeof w === "number" && w > 0
      );
      if (numericWeights.length === 0) continue;

      const maxWeight = Math.max(...numericWeights);
      if (maxWeight > best) best = maxWeight;
    }
  }

  return best;
}

export type BodyPartRequirementStatus = {
  bodyPart: BodyPartName;
  currentWeight: number;
  requiredWeight: number;
  met: boolean;
};

export type BodyPartLevelProgress = {
  level: number;
  title: string;
  /** Accent color for this level, straight from BODY_PART_LEVELS - shared across every screen that displays a level. */
  color: string;
  nextLevel: BodyPartLevelDefinition | null;
  /** 0-100 progress toward the next level. 100 if already at the top level. */
  progressPercent: number;
  /** Every body part's status against the next level's requirements (or the current/top level's, once maxed out). */
  checklist: BodyPartRequirementStatus[];
  bodyPartWeights: Record<BodyPartName, number>;
};

/**
 * Full Body Part Strength Level for a user, derived entirely from workout
 * history. Level = the highest level in BODY_PART_LEVELS for which every
 * body part's qualifying PR meets that level's requirement.
 */
export function calculateBodyPartLevel(
  history: WorkoutHistoryEntry[],
  minReps: number = DEFAULT_MIN_REPS
): BodyPartLevelProgress {
  const bodyPartWeights = {} as Record<BodyPartName, number>;
  for (const bodyPart of STRENGTH_BODY_PARTS) {
    bodyPartWeights[bodyPart] = getBodyPartQualifyingPR(bodyPart, history, minReps);
  }

  let currentLevelDef = BODY_PART_LEVELS[0];
  for (const definition of BODY_PART_LEVELS) {
    const allMet = STRENGTH_BODY_PARTS.every(
      (bodyPart) => bodyPartWeights[bodyPart] >= definition.requirements[bodyPart]
    );
    if (allMet) {
      currentLevelDef = definition;
    } else {
      break;
    }
  }

  const nextLevelDef =
    BODY_PART_LEVELS.find((definition) => definition.level === currentLevelDef.level + 1) ?? null;

  const targetDef = nextLevelDef ?? currentLevelDef;

  const checklist: BodyPartRequirementStatus[] = STRENGTH_BODY_PARTS.map((bodyPart) => ({
    bodyPart,
    currentWeight: bodyPartWeights[bodyPart],
    requiredWeight: targetDef.requirements[bodyPart],
    met: bodyPartWeights[bodyPart] >= targetDef.requirements[bodyPart],
  }));

  let progressPercent = 100;
  if (nextLevelDef) {
    const perBodyPartProgress = STRENGTH_BODY_PARTS.map((bodyPart) => {
      const min = currentLevelDef.requirements[bodyPart];
      const max = nextLevelDef.requirements[bodyPart];
      const span = max - min;
      if (span <= 0) return 100;
      return Math.min(100, Math.max(0, ((bodyPartWeights[bodyPart] - min) / span) * 100));
    });

    progressPercent = Math.round(
      perBodyPartProgress.reduce((sum, value) => sum + value, 0) / perBodyPartProgress.length
    );
  }

  return {
    level: currentLevelDef.level,
    title: currentLevelDef.title,
    color: currentLevelDef.color,
    nextLevel: nextLevelDef,
    progressPercent,
    checklist,
    bodyPartWeights,
  };
}
