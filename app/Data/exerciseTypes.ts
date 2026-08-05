import type { ExerciseMovement, MuscleName } from "./muscles";

/** How an exercise is logged in the workout logger. */
export type ExerciseTrackingType = "weight" | "bodyweight" | "duration";

/**
 * Optional form cue for an exercise.
 *
 * Prefer `youtubeId` at scale (500+) — no binary assets in the repo.
 * Use `src` for self-hosted / CDN mp4|webm when needed.
 * At least one of `youtubeId` or `src` must be set for the tutorial UI to show.
 */
export type ExerciseTutorial = {
  /** YouTube video id (not a full URL). */
  readonly youtubeId?: string;
  /**
   * Self-hosted path under `/public` (e.g. `/exercises/tutorials/barbell-row.mp4`)
   * or an absolute https URL to a video file.
   */
  readonly src?: string;
};

/**
 * Shared shape for every exercise in the database.
 *
 * Migration note: `movement`, `primaryMuscles`, and `secondaryMuscles` are
 * populated on newly refactored files (e.g. back.ts). They remain optional at
 * the shared type level until every Data/*.ts file is migrated so TypeScript
 * stays compatible mid-refactor.
 *
 * `fatigue` keys MUST be MuscleName values from muscles.ts once a file is
 * migrated. Older files may still use legacy keys until their turn.
 *
 * Tutorials: prefer the sidecar map in `exerciseTutorials.ts`. The optional
 * `tutorial` field here is an override when co-locating a one-off is clearer.
 */
export type ExerciseData = {
  name: string;
  bodyPart: string;
  /** UI navigation section only — never treat as a recovery muscle. */
  section: string;
  trackingType: ExerciseTrackingType;
  /** Biomechanical movement pattern (recovery engine input). */
  movement?: ExerciseMovement;
  /**
   * Per-muscle fatigue baselines (assumes ~3×10).
   * Prefer MuscleName keys from MUSCLES after migration.
   */
  fatigue: Partial<Record<MuscleName, number>> & Record<string, number>;
  /** Muscles the movement is prescribed to load most. */
  primaryMuscles?: MuscleName[];
  /** Assisting / synergist muscles (not the prescription focus). */
  secondaryMuscles?: MuscleName[];
  image?: string;
  /** Optional form tutorial (prefer sidecar registry for bulk entries). */
  tutorial?: ExerciseTutorial;
};
