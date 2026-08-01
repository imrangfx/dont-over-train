/**
 * Single source of truth for every recoverable muscle in Don't Over Train.
 *
 * Rules:
 * - Fatigue maps, primaryMuscles, and secondaryMuscles MUST use these values only.
 * - Body regions (Back, Chest, Shoulders, Biceps, Triceps, Forearms, Legs, Upper Back)
 *   are NOT muscles and must never appear as fatigue keys.
 * - UI sections (e.g. "upper-back") are navigation only — not recovery muscles.
 */

export const MUSCLES = {
  // Chest
  UPPER_CHEST: "Upper Chest",
  MIDDLE_CHEST: "Middle Chest",
  LOWER_CHEST: "Lower Chest",

  // Back
  LATS: "Lats",
  UPPER_TRAPS: "Upper Traps",
  MIDDLE_TRAPS: "Middle Traps",
  LOWER_TRAPS: "Lower Traps",
  RHOMBOIDS: "Rhomboids",
  LOWER_BACK: "Lower Back",

  // Shoulders
  FRONT_DELTS: "Front Delts",
  SIDE_DELTS: "Side Delts",
  REAR_DELTS: "Rear Delts",

  // Biceps / elbow flexors
  LONG_HEAD_BICEPS: "Long Head Biceps",
  SHORT_HEAD_BICEPS: "Short Head Biceps",
  BRACHIALIS: "Brachialis",
  BRACHIORADIALIS: "Brachioradialis",

  // Triceps
  LONG_HEAD_TRICEPS: "Long Head Triceps",
  LATERAL_HEAD_TRICEPS: "Lateral Head Triceps",
  MEDIAL_HEAD_TRICEPS: "Medial Head Triceps",

  // Forearms
  FOREARM_FLEXORS: "Forearm Flexors",
  FOREARM_EXTENSORS: "Forearm Extensors",

  // Legs
  QUADS: "Quads",
  HAMSTRINGS: "Hamstrings",
  GLUTES: "Glutes",
  CALVES: "Calves",
  ADDUCTORS: "Adductors",
  ABDUCTORS: "Abductors",

  // Core
  RECTUS_ABDOMINIS: "Abs",
  OBLIQUES: "Obliques",
} as const;

/** Canonical display name for any muscle in the dictionary. */
export type MuscleName = (typeof MUSCLES)[keyof typeof MUSCLES];

/** Canonical dictionary key (e.g. "LATS"). */
export type MuscleId = keyof typeof MUSCLES;

/** Movement patterns used by the recovery / exercise engine. */
export type ExerciseMovement =
  | "horizontal-pull"
  | "vertical-pull"
  | "horizontal-push"
  | "vertical-push"
  | "hip-hinge"
  | "squat"
  | "lunge"
  | "carry"
  | "isolation"
  | "shrug"
  | "calf-raise"
  | "core-flexion"
  | "core-rotation"
  | "core-stability";

/** Fatigue map keyed only by muscles from MUSCLES. */
export type MuscleFatigueMap = Partial<Record<MuscleName, number>>;

/** All muscle display names (useful for validation / migrations). */
export const MUSCLE_NAMES: readonly MuscleName[] = Object.values(MUSCLES);

/** Fast lookup: display name → whether it is a valid muscle. */
export const MUSCLE_NAME_SET: ReadonlySet<string> = new Set(MUSCLE_NAMES);

export function isMuscleName(value: string): value is MuscleName {
  return MUSCLE_NAME_SET.has(value);
}

/** Body-part → muscles that typically belong under that recovery region. */
export const MUSCLES_BY_BODY_PART = {
  Chest: [MUSCLES.UPPER_CHEST, MUSCLES.MIDDLE_CHEST, MUSCLES.LOWER_CHEST],
  Back: [
    MUSCLES.UPPER_TRAPS,
    MUSCLES.MIDDLE_TRAPS,
    MUSCLES.LOWER_TRAPS,
    MUSCLES.RHOMBOIDS,
    MUSCLES.LATS,
    MUSCLES.LOWER_BACK,
  ],
  Shoulders: [MUSCLES.FRONT_DELTS, MUSCLES.SIDE_DELTS, MUSCLES.REAR_DELTS],
  Biceps: [
    MUSCLES.LONG_HEAD_BICEPS,
    MUSCLES.SHORT_HEAD_BICEPS,
    MUSCLES.BRACHIALIS,
    MUSCLES.BRACHIORADIALIS,
  ],
  Triceps: [
    MUSCLES.LONG_HEAD_TRICEPS,
    MUSCLES.LATERAL_HEAD_TRICEPS,
    MUSCLES.MEDIAL_HEAD_TRICEPS,
  ],
  Forearms: [MUSCLES.FOREARM_FLEXORS, MUSCLES.FOREARM_EXTENSORS],
  Legs: [
    MUSCLES.QUADS,
    MUSCLES.HAMSTRINGS,
    MUSCLES.GLUTES,
    MUSCLES.CALVES,
    MUSCLES.ADDUCTORS,
    MUSCLES.ABDUCTORS,
  ],
  Abs: [
    MUSCLES.RECTUS_ABDOMINIS,
    MUSCLES.OBLIQUES,
  ],
} as const satisfies Record<string, readonly MuscleName[]>;
