import type { ExerciseMovement, MuscleName } from "./muscles";

/** How an exercise is logged in the workout logger. */
export type ExerciseTrackingType = "weight" | "bodyweight" | "duration";

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
};
