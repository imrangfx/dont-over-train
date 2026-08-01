import { MUSCLES } from "./muscles";
import type { ExerciseData } from "./exerciseTypes";

/**
 * Biceps exercise database — recovery-engine foundation.
 *
 * Fatigue keys use MUSCLES only. Numeric values preserved from legacy.
 * Sections are UI-only: long-head | short-head | brachialis.
 * All curls use movement: "isolation".
 */
export const biceps = {
  // =====================
  // LONG HEAD (UI section)
  // =====================

  "incline-dumbbell-curl": {
    name: "Incline Dumbbell Curl",
    bodyPart: "Biceps",
    section: "long-head",
    trackingType: "weight" as const,
    movement: "isolation",
    primaryMuscles: [MUSCLES.LONG_HEAD_BICEPS],
    secondaryMuscles: [
      MUSCLES.SHORT_HEAD_BICEPS,
      MUSCLES.BRACHIALIS,
      MUSCLES.BRACHIORADIALIS,
    ],
    fatigue: {
      [MUSCLES.LONG_HEAD_BICEPS]: 14,
      [MUSCLES.SHORT_HEAD_BICEPS]: 2,
      [MUSCLES.BRACHIALIS]: 2,
      [MUSCLES.BRACHIORADIALIS]: 3,
    },
  },

  "bayesian-cable-curl": {
    name: "Bayesian Cable Curl",
    bodyPart: "Biceps",
    section: "long-head",
    trackingType: "weight" as const,
    movement: "isolation",
    primaryMuscles: [MUSCLES.LONG_HEAD_BICEPS],
    secondaryMuscles: [
      MUSCLES.SHORT_HEAD_BICEPS,
      MUSCLES.BRACHIALIS,
      MUSCLES.BRACHIORADIALIS,
    ],
    fatigue: {
      [MUSCLES.LONG_HEAD_BICEPS]: 15,
      [MUSCLES.SHORT_HEAD_BICEPS]: 2,
      [MUSCLES.BRACHIALIS]: 1,
      [MUSCLES.BRACHIORADIALIS]: 2,
    },
  },

  "close-grip-barbell-curl": {
    name: "Close Grip Barbell Curl",
    bodyPart: "Biceps",
    section: "long-head",
    trackingType: "weight" as const,
    movement: "isolation",
    // Close grip slightly biases brachialis (reflected in secondary load).
    primaryMuscles: [MUSCLES.LONG_HEAD_BICEPS],
    secondaryMuscles: [
      MUSCLES.SHORT_HEAD_BICEPS,
      MUSCLES.BRACHIALIS,
      MUSCLES.BRACHIORADIALIS,
    ],
    fatigue: {
      [MUSCLES.LONG_HEAD_BICEPS]: 14,
      [MUSCLES.SHORT_HEAD_BICEPS]: 2,
      [MUSCLES.BRACHIALIS]: 2,
      [MUSCLES.BRACHIORADIALIS]: 4,
    },
  },

  "standing-dumbbell-curl": {
    name: "Standing Dumbbell Curl",
    bodyPart: "Biceps",
    section: "long-head",
    trackingType: "weight" as const,
    movement: "isolation",
    // Supinated curl loads both biceps heads.
    primaryMuscles: [MUSCLES.LONG_HEAD_BICEPS, MUSCLES.SHORT_HEAD_BICEPS],
    secondaryMuscles: [MUSCLES.BRACHIALIS, MUSCLES.BRACHIORADIALIS],
    fatigue: {
      [MUSCLES.LONG_HEAD_BICEPS]: 12,
      [MUSCLES.SHORT_HEAD_BICEPS]: 3,
      [MUSCLES.BRACHIALIS]: 2,
      [MUSCLES.BRACHIORADIALIS]: 4,
    },
  },

  "alternating-dumbbell-curl": {
    name: "Alternating Dumbbell Curl",
    bodyPart: "Biceps",
    section: "long-head",
    trackingType: "weight" as const,
    movement: "isolation",
    primaryMuscles: [MUSCLES.LONG_HEAD_BICEPS, MUSCLES.SHORT_HEAD_BICEPS],
    secondaryMuscles: [MUSCLES.BRACHIALIS, MUSCLES.BRACHIORADIALIS],
    fatigue: {
      [MUSCLES.LONG_HEAD_BICEPS]: 12,
      [MUSCLES.SHORT_HEAD_BICEPS]: 3,
      [MUSCLES.BRACHIALIS]: 2,
      [MUSCLES.BRACHIORADIALIS]: 4,
    },
  },

  "single-arm-cable-curl": {
    name: "Single Arm Cable Curl",
    bodyPart: "Biceps",
    section: "long-head",
    trackingType: "weight" as const,
    movement: "isolation",
    primaryMuscles: [MUSCLES.LONG_HEAD_BICEPS],
    secondaryMuscles: [
      MUSCLES.SHORT_HEAD_BICEPS,
      MUSCLES.BRACHIALIS,
      MUSCLES.BRACHIORADIALIS,
    ],
    fatigue: {
      [MUSCLES.LONG_HEAD_BICEPS]: 13,
      [MUSCLES.SHORT_HEAD_BICEPS]: 2,
      [MUSCLES.BRACHIALIS]: 2,
      [MUSCLES.BRACHIORADIALIS]: 3,
    },
  },

  "rope-cable-curl": {
    name: "Rope Cable Curl",
    bodyPart: "Biceps",
    section: "long-head",
    trackingType: "weight" as const,
    movement: "isolation",
    primaryMuscles: [MUSCLES.LONG_HEAD_BICEPS],
    secondaryMuscles: [
      MUSCLES.SHORT_HEAD_BICEPS,
      MUSCLES.BRACHIALIS,
      MUSCLES.BRACHIORADIALIS,
    ],
    fatigue: {
      [MUSCLES.LONG_HEAD_BICEPS]: 12,
      [MUSCLES.SHORT_HEAD_BICEPS]: 2,
      [MUSCLES.BRACHIALIS]: 2,
      [MUSCLES.BRACHIORADIALIS]: 3,
    },
  },

  "seated-incline-dumbbell-curl": {
    name: "Seated Incline Dumbbell Curl",
    bodyPart: "Biceps",
    section: "long-head",
    trackingType: "weight" as const,
    movement: "isolation",
    primaryMuscles: [MUSCLES.LONG_HEAD_BICEPS],
    secondaryMuscles: [
      MUSCLES.SHORT_HEAD_BICEPS,
      MUSCLES.BRACHIALIS,
      MUSCLES.BRACHIORADIALIS,
    ],
    fatigue: {
      [MUSCLES.LONG_HEAD_BICEPS]: 15,
      [MUSCLES.SHORT_HEAD_BICEPS]: 2,
      [MUSCLES.BRACHIALIS]: 1,
      [MUSCLES.BRACHIORADIALIS]: 3,
    },
  },

  "ez-bar-close-grip-curl": {
    name: "EZ Bar Close Grip Curl",
    bodyPart: "Biceps",
    section: "long-head",
    trackingType: "weight" as const,
    movement: "isolation",
    primaryMuscles: [MUSCLES.LONG_HEAD_BICEPS],
    secondaryMuscles: [
      MUSCLES.SHORT_HEAD_BICEPS,
      MUSCLES.BRACHIALIS,
      MUSCLES.BRACHIORADIALIS,
    ],
    fatigue: {
      [MUSCLES.LONG_HEAD_BICEPS]: 13,
      [MUSCLES.SHORT_HEAD_BICEPS]: 2,
      [MUSCLES.BRACHIALIS]: 2,
      [MUSCLES.BRACHIORADIALIS]: 4,
    },
  },

  // =====================
  // SHORT HEAD (UI section)
  // =====================

  "preacher-curl": {
    name: "Preacher Curl",
    bodyPart: "Biceps",
    section: "short-head",
    trackingType: "weight" as const,
    movement: "isolation",
    primaryMuscles: [MUSCLES.SHORT_HEAD_BICEPS],
    secondaryMuscles: [
      MUSCLES.LONG_HEAD_BICEPS,
      MUSCLES.BRACHIALIS,
      MUSCLES.BRACHIORADIALIS,
    ],
    fatigue: {
      [MUSCLES.SHORT_HEAD_BICEPS]: 14,
      [MUSCLES.LONG_HEAD_BICEPS]: 2,
      [MUSCLES.BRACHIALIS]: 2,
      [MUSCLES.BRACHIORADIALIS]: 3,
    },
  },

  "spider-curl": {
    name: "Spider Curl",
    bodyPart: "Biceps",
    section: "short-head",
    trackingType: "weight" as const,
    movement: "isolation",
    primaryMuscles: [MUSCLES.SHORT_HEAD_BICEPS],
    secondaryMuscles: [
      MUSCLES.LONG_HEAD_BICEPS,
      MUSCLES.BRACHIALIS,
      MUSCLES.BRACHIORADIALIS,
    ],
    fatigue: {
      [MUSCLES.SHORT_HEAD_BICEPS]: 15,
      [MUSCLES.LONG_HEAD_BICEPS]: 2,
      [MUSCLES.BRACHIALIS]: 1,
      [MUSCLES.BRACHIORADIALIS]: 2,
    },
  },

  "concentration-curl": {
    name: "Concentration Curl",
    bodyPart: "Biceps",
    section: "short-head",
    trackingType: "weight" as const,
    movement: "isolation",
    primaryMuscles: [MUSCLES.SHORT_HEAD_BICEPS],
    secondaryMuscles: [
      MUSCLES.LONG_HEAD_BICEPS,
      MUSCLES.BRACHIALIS,
      MUSCLES.BRACHIORADIALIS,
    ],
    fatigue: {
      [MUSCLES.SHORT_HEAD_BICEPS]: 15,
      [MUSCLES.LONG_HEAD_BICEPS]: 2,
      [MUSCLES.BRACHIALIS]: 1,
      [MUSCLES.BRACHIORADIALIS]: 2,
    },
  },

  "wide-grip-barbell-curl": {
    name: "Wide Grip Barbell Curl",
    bodyPart: "Biceps",
    section: "short-head",
    trackingType: "weight" as const,
    movement: "isolation",
    primaryMuscles: [MUSCLES.SHORT_HEAD_BICEPS],
    secondaryMuscles: [
      MUSCLES.LONG_HEAD_BICEPS,
      MUSCLES.BRACHIALIS,
      MUSCLES.BRACHIORADIALIS,
    ],
    fatigue: {
      [MUSCLES.SHORT_HEAD_BICEPS]: 13,
      [MUSCLES.LONG_HEAD_BICEPS]: 2,
      [MUSCLES.BRACHIALIS]: 2,
      [MUSCLES.BRACHIORADIALIS]: 4,
    },
  },

  "machine-biceps-curl": {
    name: "Machine Biceps Curl",
    bodyPart: "Biceps",
    section: "short-head",
    trackingType: "weight" as const,
    movement: "isolation",
    primaryMuscles: [MUSCLES.SHORT_HEAD_BICEPS],
    secondaryMuscles: [
      MUSCLES.LONG_HEAD_BICEPS,
      MUSCLES.BRACHIALIS,
      MUSCLES.BRACHIORADIALIS,
    ],
    fatigue: {
      [MUSCLES.SHORT_HEAD_BICEPS]: 13,
      [MUSCLES.LONG_HEAD_BICEPS]: 2,
      [MUSCLES.BRACHIALIS]: 2,
      [MUSCLES.BRACHIORADIALIS]: 2,
    },
  },

  "cable-preacher-curl": {
    name: "Cable Preacher Curl",
    bodyPart: "Biceps",
    section: "short-head",
    trackingType: "weight" as const,
    movement: "isolation",
    primaryMuscles: [MUSCLES.SHORT_HEAD_BICEPS],
    secondaryMuscles: [
      MUSCLES.LONG_HEAD_BICEPS,
      MUSCLES.BRACHIALIS,
      MUSCLES.BRACHIORADIALIS,
    ],
    fatigue: {
      [MUSCLES.SHORT_HEAD_BICEPS]: 13,
      [MUSCLES.LONG_HEAD_BICEPS]: 2,
      [MUSCLES.BRACHIALIS]: 2,
      [MUSCLES.BRACHIORADIALIS]: 2,
    },
  },

  "high-cable-curl": {
    name: "High Cable Curl",
    bodyPart: "Biceps",
    section: "short-head",
    trackingType: "weight" as const,
    movement: "isolation",
    primaryMuscles: [MUSCLES.SHORT_HEAD_BICEPS],
    secondaryMuscles: [
      MUSCLES.LONG_HEAD_BICEPS,
      MUSCLES.BRACHIALIS,
      MUSCLES.BRACHIORADIALIS,
    ],
    fatigue: {
      [MUSCLES.SHORT_HEAD_BICEPS]: 14,
      [MUSCLES.LONG_HEAD_BICEPS]: 2,
      [MUSCLES.BRACHIALIS]: 1,
      [MUSCLES.BRACHIORADIALIS]: 2,
    },
  },

  "dumbbell-preacher-curl": {
    name: "Dumbbell Preacher Curl",
    bodyPart: "Biceps",
    section: "short-head",
    trackingType: "weight" as const,
    movement: "isolation",
    primaryMuscles: [MUSCLES.SHORT_HEAD_BICEPS],
    secondaryMuscles: [
      MUSCLES.LONG_HEAD_BICEPS,
      MUSCLES.BRACHIALIS,
      MUSCLES.BRACHIORADIALIS,
    ],
    fatigue: {
      [MUSCLES.SHORT_HEAD_BICEPS]: 13,
      [MUSCLES.LONG_HEAD_BICEPS]: 2,
      [MUSCLES.BRACHIALIS]: 2,
      [MUSCLES.BRACHIORADIALIS]: 2,
    },
  },

  "scott-curl": {
    name: "Scott Curl",
    bodyPart: "Biceps",
    section: "short-head",
    trackingType: "weight" as const,
    movement: "isolation",
    primaryMuscles: [MUSCLES.SHORT_HEAD_BICEPS],
    secondaryMuscles: [
      MUSCLES.LONG_HEAD_BICEPS,
      MUSCLES.BRACHIALIS,
      MUSCLES.BRACHIORADIALIS,
    ],
    fatigue: {
      [MUSCLES.SHORT_HEAD_BICEPS]: 14,
      [MUSCLES.LONG_HEAD_BICEPS]: 2,
      [MUSCLES.BRACHIALIS]: 1,
      [MUSCLES.BRACHIORADIALIS]: 2,
    },
  },

  "seated-dumbbell-curl": {
    name: "Seated Dumbbell Curl",
    bodyPart: "Biceps",
    section: "short-head",
    trackingType: "weight" as const,
    movement: "isolation",
    primaryMuscles: [MUSCLES.SHORT_HEAD_BICEPS, MUSCLES.LONG_HEAD_BICEPS],
    secondaryMuscles: [MUSCLES.BRACHIALIS, MUSCLES.BRACHIORADIALIS],
    fatigue: {
      [MUSCLES.SHORT_HEAD_BICEPS]: 12,
      [MUSCLES.LONG_HEAD_BICEPS]: 3,
      [MUSCLES.BRACHIALIS]: 2,
      [MUSCLES.BRACHIORADIALIS]: 3,
    },
  },

  // =====================
  // BRACHIALIS (UI section)
  // =====================

  "hammer-curl": {
    name: "Hammer Curl",
    bodyPart: "Biceps",
    section: "brachialis",
    trackingType: "weight" as const,
    movement: "isolation",
    primaryMuscles: [MUSCLES.BRACHIALIS, MUSCLES.BRACHIORADIALIS],
    secondaryMuscles: [MUSCLES.LONG_HEAD_BICEPS, MUSCLES.SHORT_HEAD_BICEPS],
    fatigue: {
      [MUSCLES.BRACHIALIS]: 10,
      [MUSCLES.BRACHIORADIALIS]: 6,
      [MUSCLES.LONG_HEAD_BICEPS]: 2,
      [MUSCLES.SHORT_HEAD_BICEPS]: 2,
    },
  },

  "cross-body-hammer-curl": {
    name: "Cross Body Hammer Curl",
    bodyPart: "Biceps",
    section: "brachialis",
    trackingType: "weight" as const,
    movement: "isolation",
    primaryMuscles: [MUSCLES.BRACHIALIS, MUSCLES.BRACHIORADIALIS],
    secondaryMuscles: [MUSCLES.LONG_HEAD_BICEPS, MUSCLES.SHORT_HEAD_BICEPS],
    fatigue: {
      [MUSCLES.BRACHIALIS]: 11,
      [MUSCLES.BRACHIORADIALIS]: 5,
      [MUSCLES.LONG_HEAD_BICEPS]: 2,
      [MUSCLES.SHORT_HEAD_BICEPS]: 2,
    },
  },

  "rope-hammer-curl": {
    name: "Rope Hammer Curl",
    bodyPart: "Biceps",
    section: "brachialis",
    trackingType: "weight" as const,
    movement: "isolation",
    primaryMuscles: [MUSCLES.BRACHIALIS, MUSCLES.BRACHIORADIALIS],
    secondaryMuscles: [MUSCLES.LONG_HEAD_BICEPS, MUSCLES.SHORT_HEAD_BICEPS],
    fatigue: {
      [MUSCLES.BRACHIALIS]: 10,
      [MUSCLES.BRACHIORADIALIS]: 5,
      [MUSCLES.LONG_HEAD_BICEPS]: 2,
      [MUSCLES.SHORT_HEAD_BICEPS]: 2,
    },
  },

  "reverse-ez-curl": {
    name: "Reverse EZ Curl",
    bodyPart: "Biceps",
    section: "brachialis",
    trackingType: "weight" as const,
    movement: "isolation",
    primaryMuscles: [MUSCLES.BRACHIORADIALIS, MUSCLES.BRACHIALIS],
    secondaryMuscles: [MUSCLES.LONG_HEAD_BICEPS, MUSCLES.SHORT_HEAD_BICEPS],
    fatigue: {
      [MUSCLES.BRACHIORADIALIS]: 10,
      [MUSCLES.BRACHIALIS]: 6,
      [MUSCLES.LONG_HEAD_BICEPS]: 1,
      [MUSCLES.SHORT_HEAD_BICEPS]: 1,
    },
  },

  "reverse-barbell-curl": {
    name: "Reverse Barbell Curl",
    bodyPart: "Biceps",
    section: "brachialis",
    trackingType: "weight" as const,
    movement: "isolation",
    primaryMuscles: [MUSCLES.BRACHIORADIALIS, MUSCLES.BRACHIALIS],
    secondaryMuscles: [MUSCLES.LONG_HEAD_BICEPS, MUSCLES.SHORT_HEAD_BICEPS],
    fatigue: {
      [MUSCLES.BRACHIORADIALIS]: 10,
      [MUSCLES.BRACHIALIS]: 6,
      [MUSCLES.LONG_HEAD_BICEPS]: 1,
      [MUSCLES.SHORT_HEAD_BICEPS]: 1,
    },
  },

  "reverse-cable-curl": {
    name: "Reverse Cable Curl",
    bodyPart: "Biceps",
    section: "brachialis",
    trackingType: "weight" as const,
    movement: "isolation",
    primaryMuscles: [MUSCLES.BRACHIORADIALIS, MUSCLES.BRACHIALIS],
    secondaryMuscles: [MUSCLES.LONG_HEAD_BICEPS, MUSCLES.SHORT_HEAD_BICEPS],
    fatigue: {
      [MUSCLES.BRACHIORADIALIS]: 9,
      [MUSCLES.BRACHIALIS]: 6,
      [MUSCLES.LONG_HEAD_BICEPS]: 1,
      [MUSCLES.SHORT_HEAD_BICEPS]: 1,
    },
  },

  "dumbbell-reverse-curl": {
    name: "Dumbbell Reverse Curl",
    bodyPart: "Biceps",
    section: "brachialis",
    trackingType: "weight" as const,
    movement: "isolation",
    primaryMuscles: [MUSCLES.BRACHIORADIALIS, MUSCLES.BRACHIALIS],
    secondaryMuscles: [MUSCLES.LONG_HEAD_BICEPS, MUSCLES.SHORT_HEAD_BICEPS],
    fatigue: {
      [MUSCLES.BRACHIORADIALIS]: 9,
      [MUSCLES.BRACHIALIS]: 6,
      [MUSCLES.LONG_HEAD_BICEPS]: 1,
      [MUSCLES.SHORT_HEAD_BICEPS]: 1,
    },
  },

  "zottman-curl": {
    name: "Zottman Curl",
    bodyPart: "Biceps",
    section: "brachialis",
    trackingType: "weight" as const,
    movement: "isolation",
    primaryMuscles: [MUSCLES.BRACHIALIS, MUSCLES.BRACHIORADIALIS],
    secondaryMuscles: [MUSCLES.LONG_HEAD_BICEPS, MUSCLES.SHORT_HEAD_BICEPS],
    fatigue: {
      [MUSCLES.BRACHIALIS]: 8,
      [MUSCLES.BRACHIORADIALIS]: 8,
      [MUSCLES.LONG_HEAD_BICEPS]: 2,
      [MUSCLES.SHORT_HEAD_BICEPS]: 2,
    },
  },

  "neutral-grip-cable-curl": {
    name: "Neutral Grip Cable Curl",
    bodyPart: "Biceps",
    section: "brachialis",
    trackingType: "weight" as const,
    movement: "isolation",
    primaryMuscles: [MUSCLES.BRACHIALIS, MUSCLES.BRACHIORADIALIS],
    secondaryMuscles: [MUSCLES.LONG_HEAD_BICEPS, MUSCLES.SHORT_HEAD_BICEPS],
    fatigue: {
      [MUSCLES.BRACHIALIS]: 10,
      [MUSCLES.BRACHIORADIALIS]: 5,
      [MUSCLES.LONG_HEAD_BICEPS]: 2,
      [MUSCLES.SHORT_HEAD_BICEPS]: 2,
    },
  },

  "machine-hammer-curl": {
    name: "Machine Hammer Curl",
    bodyPart: "Biceps",
    section: "brachialis",
    trackingType: "weight" as const,
    movement: "isolation",
    primaryMuscles: [MUSCLES.BRACHIALIS, MUSCLES.BRACHIORADIALIS],
    secondaryMuscles: [MUSCLES.LONG_HEAD_BICEPS, MUSCLES.SHORT_HEAD_BICEPS],
    fatigue: {
      [MUSCLES.BRACHIALIS]: 10,
      [MUSCLES.BRACHIORADIALIS]: 5,
      [MUSCLES.LONG_HEAD_BICEPS]: 2,
      [MUSCLES.SHORT_HEAD_BICEPS]: 2,
    },
  },
} as const satisfies Record<string, ExerciseData>;
