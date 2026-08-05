/**
 * Exercise tutorial registry — presentation media only.
 *
 * Kept separate from muscle / fatigue catalogs so recovery data stays focused
 * and tutorials can grow to 500+ entries without bloating every Data/*.ts file.
 *
 * Naming:
 * - Keys MUST match exercise object keys (kebab-case slugs) in the catalogs.
 * - Prefer `youtubeId` for production scale.
 * - Use `src` for self-hosted files under `public/exercises/tutorials/`.
 *
 * Lookup order (see getExerciseTutorial):
 * 1. Sidecar entry here
 * 2. Inline `exercise.tutorial` override passed by the caller
 */

import type { ExerciseTutorial } from "./exerciseTypes";

/**
 * Slug → tutorial map. Add entries as videos become available.
 * Example:
 *   "barbell-row": { youtubeId: "dQw4w9WgXcQ" },
 *   "cable-crunch": { src: "/exercises/tutorials/cable-crunch.mp4" },
 */
export const EXERCISE_TUTORIALS: Readonly<
  Partial<Record<string, ExerciseTutorial>>
> = {
  // Intentionally empty until videos are sourced.
  // Populate by slug as tutorials are published.
};

function hasPlayableTutorial(
  tutorial: ExerciseTutorial | null | undefined,
): tutorial is ExerciseTutorial {
  if (!tutorial) return false;
  const youtubeId = tutorial.youtubeId?.trim();
  const src = tutorial.src?.trim();
  return Boolean(youtubeId || src);
}

/**
 * Resolve the tutorial for an exercise slug.
 * Sidecar registry wins; inline ExerciseData.tutorial is the fallback override.
 */
export function getExerciseTutorial(
  slug: string,
  inlineTutorial?: ExerciseTutorial | null,
): ExerciseTutorial | null {
  const fromRegistry = EXERCISE_TUTORIALS[slug];
  if (hasPlayableTutorial(fromRegistry)) return fromRegistry;
  if (hasPlayableTutorial(inlineTutorial)) return inlineTutorial;
  return null;
}
