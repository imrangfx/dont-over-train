import { MUSCLES } from "./muscles";
import type { ExerciseData } from "./exerciseTypes";

/**
 * Triceps exercise database — recovery-engine foundation.
 *
 * Fatigue keys use MUSCLES only. Numeric values preserved from legacy.
 * Legacy region keys: chest → Middle Chest, forearms → Forearm Flexors,
 * camelCase triceps heads → spaced MUSCLES constants (same values).
 * Sections are UI-only: long-head | lateral-head | medial-head.
 */
export const triceps = {
  // =====================
  // LONG HEAD (UI section)
  // =====================

  "overhead-cable-extension": {
    name: "Overhead Cable Extension",
    bodyPart: "Triceps",
    section: "long-head",
    trackingType: "weight" as const,
    movement: "isolation",
    primaryMuscles: [MUSCLES.LONG_HEAD_TRICEPS],
    secondaryMuscles: [],
    fatigue: {
      [MUSCLES.LONG_HEAD_TRICEPS]: 18,
    },
  },

  "overhead-rope-extension": {
    name: "Overhead Rope Extension",
    bodyPart: "Triceps",
    section: "long-head",
    trackingType: "weight" as const,
    movement: "isolation",
    primaryMuscles: [MUSCLES.LONG_HEAD_TRICEPS],
    secondaryMuscles: [],
    fatigue: {
      [MUSCLES.LONG_HEAD_TRICEPS]: 18,
    },
  },

  "dumbbell-overhead-extension": {
    name: "Dumbbell Overhead Extension",
    bodyPart: "Triceps",
    section: "long-head",
    trackingType: "weight" as const,
    movement: "isolation",
    primaryMuscles: [MUSCLES.LONG_HEAD_TRICEPS],
    secondaryMuscles: [],
    fatigue: {
      [MUSCLES.LONG_HEAD_TRICEPS]: 18,
    },
  },

  "ez-bar-overhead-extension": {
    name: "EZ Bar Overhead Extension",
    bodyPart: "Triceps",
    section: "long-head",
    trackingType: "weight" as const,
    movement: "isolation",
    primaryMuscles: [MUSCLES.LONG_HEAD_TRICEPS],
    secondaryMuscles: [],
    fatigue: {
      [MUSCLES.LONG_HEAD_TRICEPS]: 17,
    },
  },

  "single-arm-overhead-cable-extension": {
    name: "Single Arm Overhead Cable Extension",
    bodyPart: "Triceps",
    section: "long-head",
    trackingType: "weight" as const,
    movement: "isolation",
    primaryMuscles: [MUSCLES.LONG_HEAD_TRICEPS],
    secondaryMuscles: [],
    fatigue: {
      [MUSCLES.LONG_HEAD_TRICEPS]: 17,
    },
  },

  "incline-dumbbell-extension": {
    name: "Incline Dumbbell Extension",
    bodyPart: "Triceps",
    section: "long-head",
    trackingType: "weight" as const,
    movement: "isolation",
    primaryMuscles: [MUSCLES.LONG_HEAD_TRICEPS],
    secondaryMuscles: [],
    fatigue: {
      [MUSCLES.LONG_HEAD_TRICEPS]: 17,
    },
  },

  "incline-skull-crusher": {
    name: "Incline Skull Crusher",
    bodyPart: "Triceps",
    section: "long-head",
    trackingType: "weight" as const,
    movement: "isolation",
    primaryMuscles: [MUSCLES.LONG_HEAD_TRICEPS],
    secondaryMuscles: [
      MUSCLES.MEDIAL_HEAD_TRICEPS,
      MUSCLES.LATERAL_HEAD_TRICEPS,
    ],
    // Legacy camelCase heads → MUSCLES (same values).
    fatigue: {
      [MUSCLES.LONG_HEAD_TRICEPS]: 18,
      [MUSCLES.MEDIAL_HEAD_TRICEPS]: 10,
      [MUSCLES.LATERAL_HEAD_TRICEPS]: 10,
    },
  },

  "pjr-pullover": {
    name: "PJR Pullover",
    bodyPart: "Triceps",
    section: "long-head",
    trackingType: "weight" as const,
    movement: "isolation",
    primaryMuscles: [MUSCLES.LONG_HEAD_TRICEPS],
    secondaryMuscles: [],
    fatigue: {
      [MUSCLES.LONG_HEAD_TRICEPS]: 16,
    },
  },

  "seated-overhead-dumbbell-extension": {
    name: "Seated Overhead Dumbbell Extension",
    bodyPart: "Triceps",
    section: "long-head",
    trackingType: "weight" as const,
    movement: "isolation",
    primaryMuscles: [MUSCLES.LONG_HEAD_TRICEPS],
    secondaryMuscles: [],
    fatigue: {
      [MUSCLES.LONG_HEAD_TRICEPS]: 17,
    },
  },

  "lying-overhead-cable-extension": {
    name: "Lying Overhead Cable Extension",
    bodyPart: "Triceps",
    section: "long-head",
    trackingType: "weight" as const,
    movement: "isolation",
    primaryMuscles: [MUSCLES.LONG_HEAD_TRICEPS],
    secondaryMuscles: [],
    fatigue: {
      [MUSCLES.LONG_HEAD_TRICEPS]: 17,
    },
  },

  "cross-body-cable-extension": {
    name: "Cross Body Cable Extension",
    bodyPart: "Triceps",
    section: "long-head",
    trackingType: "weight" as const,
    movement: "isolation",
    primaryMuscles: [MUSCLES.LONG_HEAD_TRICEPS],
    secondaryMuscles: [],
    fatigue: {
      [MUSCLES.LONG_HEAD_TRICEPS]: 16,
    },
  },

  // =====================
  // LATERAL HEAD (UI section)
  // =====================

  "rope-pushdown": {
    name: "Rope Pushdown",
    bodyPart: "Triceps",
    section: "lateral-head",
    trackingType: "weight" as const,
    movement: "isolation",
    primaryMuscles: [MUSCLES.LATERAL_HEAD_TRICEPS],
    secondaryMuscles: [],
    fatigue: {
      [MUSCLES.LATERAL_HEAD_TRICEPS]: 18,
    },
  },

  "straight-bar-pushdown": {
    name: "Straight Bar Pushdown",
    bodyPart: "Triceps",
    section: "lateral-head",
    trackingType: "weight" as const,
    movement: "isolation",
    primaryMuscles: [MUSCLES.LATERAL_HEAD_TRICEPS],
    secondaryMuscles: [],
    fatigue: {
      [MUSCLES.LATERAL_HEAD_TRICEPS]: 18,
    },
  },

  "v-bar-pushdown": {
    name: "V Bar Pushdown",
    bodyPart: "Triceps",
    section: "lateral-head",
    trackingType: "weight" as const,
    movement: "isolation",
    primaryMuscles: [MUSCLES.LATERAL_HEAD_TRICEPS],
    secondaryMuscles: [],
    fatigue: {
      [MUSCLES.LATERAL_HEAD_TRICEPS]: 18,
    },
  },

  "single-arm-pushdown": {
    name: "Single Arm Pushdown",
    bodyPart: "Triceps",
    section: "lateral-head",
    trackingType: "weight" as const,
    movement: "isolation",
    primaryMuscles: [MUSCLES.LATERAL_HEAD_TRICEPS],
    secondaryMuscles: [],
    fatigue: {
      [MUSCLES.LATERAL_HEAD_TRICEPS]: 17,
    },
  },

  "machine-triceps-extension": {
    name: "Machine Triceps Extension",
    bodyPart: "Triceps",
    section: "lateral-head",
    trackingType: "weight" as const,
    movement: "isolation",
    primaryMuscles: [MUSCLES.LATERAL_HEAD_TRICEPS],
    secondaryMuscles: [],
    fatigue: {
      [MUSCLES.LATERAL_HEAD_TRICEPS]: 17,
    },
  },

  "bench-dips": {
    name: "Bench Dips",
    bodyPart: "Triceps",
    section: "lateral-head",
    trackingType: "bodyweight" as const,
    movement: "vertical-push",
    primaryMuscles: [MUSCLES.LATERAL_HEAD_TRICEPS],
    secondaryMuscles: [MUSCLES.LONG_HEAD_TRICEPS, MUSCLES.FRONT_DELTS],
    fatigue: {
      [MUSCLES.LATERAL_HEAD_TRICEPS]: 14,
      [MUSCLES.LONG_HEAD_TRICEPS]: 3,
      [MUSCLES.FRONT_DELTS]: 2,
    },
  },

  "assisted-dips": {
    name: "Assisted Dips",
    bodyPart: "Triceps",
    section: "lateral-head",
    trackingType: "bodyweight" as const,
    movement: "vertical-push",
    primaryMuscles: [MUSCLES.LATERAL_HEAD_TRICEPS],
    secondaryMuscles: [MUSCLES.LONG_HEAD_TRICEPS, MUSCLES.MIDDLE_CHEST],
    // Legacy chest → Middle Chest (same value).
    fatigue: {
      [MUSCLES.LATERAL_HEAD_TRICEPS]: 14,
      [MUSCLES.LONG_HEAD_TRICEPS]: 3,
      [MUSCLES.MIDDLE_CHEST]: 2,
    },
  },

  "parallel-bar-dips": {
    name: "Parallel Bar Dips",
    bodyPart: "Triceps",
    section: "lateral-head",
    trackingType: "bodyweight" as const,
    movement: "vertical-push",
    primaryMuscles: [MUSCLES.LATERAL_HEAD_TRICEPS],
    secondaryMuscles: [
      MUSCLES.LONG_HEAD_TRICEPS,
      MUSCLES.MIDDLE_CHEST,
      MUSCLES.FRONT_DELTS,
    ],
    fatigue: {
      [MUSCLES.LATERAL_HEAD_TRICEPS]: 13,
      [MUSCLES.LONG_HEAD_TRICEPS]: 5,
      [MUSCLES.MIDDLE_CHEST]: 4,
      [MUSCLES.FRONT_DELTS]: 3,
    },
  },

  "close-grip-push-up": {
    name: "Close Grip Push Up",
    bodyPart: "Triceps",
    section: "lateral-head",
    trackingType: "bodyweight" as const,
    movement: "horizontal-push",
    primaryMuscles: [MUSCLES.LATERAL_HEAD_TRICEPS],
    secondaryMuscles: [
      MUSCLES.MEDIAL_HEAD_TRICEPS,
      MUSCLES.MIDDLE_CHEST,
      MUSCLES.FRONT_DELTS,
    ],
    fatigue: {
      [MUSCLES.LATERAL_HEAD_TRICEPS]: 12,
      [MUSCLES.MEDIAL_HEAD_TRICEPS]: 4,
      [MUSCLES.MIDDLE_CHEST]: 4,
      [MUSCLES.FRONT_DELTS]: 3,
    },
  },

  "decline-close-grip-push-up": {
    name: "Decline Close Grip Push Up",
    bodyPart: "Triceps",
    section: "lateral-head",
    trackingType: "bodyweight" as const,
    movement: "horizontal-push",
    primaryMuscles: [MUSCLES.LATERAL_HEAD_TRICEPS],
    secondaryMuscles: [
      MUSCLES.MEDIAL_HEAD_TRICEPS,
      MUSCLES.MIDDLE_CHEST,
      MUSCLES.FRONT_DELTS,
    ],
    fatigue: {
      [MUSCLES.LATERAL_HEAD_TRICEPS]: 12,
      [MUSCLES.MEDIAL_HEAD_TRICEPS]: 4,
      [MUSCLES.MIDDLE_CHEST]: 3,
      [MUSCLES.FRONT_DELTS]: 4,
    },
  },

  // =====================
  // MEDIAL HEAD (UI section)
  // =====================

  "reverse-grip-pushdown": {
    name: "Reverse Grip Pushdown",
    bodyPart: "Triceps",
    section: "medial-head",
    trackingType: "weight" as const,
    movement: "isolation",
    primaryMuscles: [MUSCLES.MEDIAL_HEAD_TRICEPS],
    secondaryMuscles: [MUSCLES.FOREARM_FLEXORS],
    // Legacy forearms → Forearm Flexors (same value).
    fatigue: {
      [MUSCLES.MEDIAL_HEAD_TRICEPS]: 17,
      [MUSCLES.FOREARM_FLEXORS]: 3,
    },
  },

  "reverse-grip-cable-extension": {
    name: "Reverse Grip Cable Extension",
    bodyPart: "Triceps",
    section: "medial-head",
    trackingType: "weight" as const,
    movement: "isolation",
    primaryMuscles: [MUSCLES.MEDIAL_HEAD_TRICEPS],
    secondaryMuscles: [MUSCLES.FOREARM_FLEXORS],
    fatigue: {
      [MUSCLES.MEDIAL_HEAD_TRICEPS]: 17,
      [MUSCLES.FOREARM_FLEXORS]: 3,
    },
  },

  "skull-crusher": {
    name: "Skull Crusher",
    bodyPart: "Triceps",
    section: "medial-head",
    trackingType: "weight" as const,
    movement: "isolation",
    // Slight long-head contribution kept as secondary (legacy values).
    primaryMuscles: [MUSCLES.MEDIAL_HEAD_TRICEPS],
    secondaryMuscles: [MUSCLES.LONG_HEAD_TRICEPS],
    fatigue: {
      [MUSCLES.MEDIAL_HEAD_TRICEPS]: 12,
      [MUSCLES.LONG_HEAD_TRICEPS]: 6,
    },
  },

  "ez-bar-skull-crusher": {
    name: "EZ Bar Skull Crusher",
    bodyPart: "Triceps",
    section: "medial-head",
    trackingType: "weight" as const,
    movement: "isolation",
    primaryMuscles: [MUSCLES.MEDIAL_HEAD_TRICEPS],
    secondaryMuscles: [MUSCLES.LONG_HEAD_TRICEPS],
    fatigue: {
      [MUSCLES.MEDIAL_HEAD_TRICEPS]: 12,
      [MUSCLES.LONG_HEAD_TRICEPS]: 6,
    },
  },

  "lying-ez-extension": {
    name: "Lying EZ Extension",
    bodyPart: "Triceps",
    section: "medial-head",
    trackingType: "weight" as const,
    movement: "isolation",
    primaryMuscles: [MUSCLES.MEDIAL_HEAD_TRICEPS],
    secondaryMuscles: [MUSCLES.LONG_HEAD_TRICEPS],
    fatigue: {
      [MUSCLES.MEDIAL_HEAD_TRICEPS]: 11,
      [MUSCLES.LONG_HEAD_TRICEPS]: 6,
    },
  },

  "dumbbell-skull-crusher": {
    name: "Dumbbell Skull Crusher",
    bodyPart: "Triceps",
    section: "medial-head",
    trackingType: "weight" as const,
    movement: "isolation",
    primaryMuscles: [MUSCLES.MEDIAL_HEAD_TRICEPS],
    secondaryMuscles: [MUSCLES.LONG_HEAD_TRICEPS],
    fatigue: {
      [MUSCLES.MEDIAL_HEAD_TRICEPS]: 11,
      [MUSCLES.LONG_HEAD_TRICEPS]: 6,
    },
  },

  "jm-press": {
    name: "JM Press",
    bodyPart: "Triceps",
    section: "medial-head",
    trackingType: "weight" as const,
    movement: "horizontal-push",
    primaryMuscles: [MUSCLES.MEDIAL_HEAD_TRICEPS],
    secondaryMuscles: [
      MUSCLES.LONG_HEAD_TRICEPS,
      MUSCLES.LATERAL_HEAD_TRICEPS,
      MUSCLES.FRONT_DELTS,
      MUSCLES.MIDDLE_CHEST,
    ],
    fatigue: {
      [MUSCLES.MEDIAL_HEAD_TRICEPS]: 12,
      [MUSCLES.LONG_HEAD_TRICEPS]: 4,
      [MUSCLES.LATERAL_HEAD_TRICEPS]: 2,
      [MUSCLES.FRONT_DELTS]: 3,
      [MUSCLES.MIDDLE_CHEST]: 2,
    },
  },

  "close-grip-bench-press": {
    name: "Close Grip Bench Press",
    bodyPart: "Triceps",
    section: "medial-head",
    trackingType: "weight" as const,
    movement: "horizontal-push",
    primaryMuscles: [MUSCLES.MEDIAL_HEAD_TRICEPS, MUSCLES.LATERAL_HEAD_TRICEPS],
    secondaryMuscles: [
      MUSCLES.LONG_HEAD_TRICEPS,
      MUSCLES.MIDDLE_CHEST,
      MUSCLES.FRONT_DELTS,
    ],
    fatigue: {
      [MUSCLES.MEDIAL_HEAD_TRICEPS]: 10,
      [MUSCLES.LATERAL_HEAD_TRICEPS]: 5,
      [MUSCLES.LONG_HEAD_TRICEPS]: 3,
      [MUSCLES.MIDDLE_CHEST]: 5,
      [MUSCLES.FRONT_DELTS]: 4,
    },
  },

  "smith-close-grip-bench-press": {
    name: "Smith Close Grip Bench Press",
    bodyPart: "Triceps",
    section: "medial-head",
    trackingType: "weight" as const,
    movement: "horizontal-push",
    primaryMuscles: [MUSCLES.MEDIAL_HEAD_TRICEPS, MUSCLES.LATERAL_HEAD_TRICEPS],
    secondaryMuscles: [
      MUSCLES.LONG_HEAD_TRICEPS,
      MUSCLES.MIDDLE_CHEST,
      MUSCLES.FRONT_DELTS,
    ],
    fatigue: {
      [MUSCLES.MEDIAL_HEAD_TRICEPS]: 10,
      [MUSCLES.LATERAL_HEAD_TRICEPS]: 4,
      [MUSCLES.LONG_HEAD_TRICEPS]: 3,
      [MUSCLES.MIDDLE_CHEST]: 4,
      [MUSCLES.FRONT_DELTS]: 3,
    },
  },
} as const satisfies Record<string, ExerciseData>;
