import { MUSCLES } from "./muscles";
import type { ExerciseData } from "./exerciseTypes";

/**
 * Forearms exercise database — recovery-engine foundation.
 *
 * Fatigue keys use MUSCLES only. Numeric values preserved from legacy.
 * Legacy remaps (same values):
 *   forearms → Forearm Flexors or Forearm Extensors (by movement)
 *   biceps → Brachialis (rope climb) or Brachioradialis→Brachialis pair (reverse curls)
 *   traps → Upper Traps
 *   lats → Lats
 * Section is UI-only: forearms.
 */
export const forearms = {
  // =====================
  // FOREARMS (UI section)
  // =====================

  "wrist-curl": {
    name: "Wrist Curl",
    bodyPart: "Forearms",
    section: "forearms",
    trackingType: "weight" as const,
    movement: "wrist-flexion",
    primaryMuscles: [MUSCLES.FOREARM_FLEXORS],
    secondaryMuscles: [],
    fatigue: {
      [MUSCLES.FOREARM_FLEXORS]: 18,
    },
  },

  "reverse-wrist-curl": {
    name: "Reverse Wrist Curl",
    bodyPart: "Forearms",
    section: "forearms",
    trackingType: "weight" as const,
    movement: "wrist-extension",
    primaryMuscles: [MUSCLES.FOREARM_EXTENSORS],
    secondaryMuscles: [],
    // Legacy forearms → Forearm Extensors (same value).
    fatigue: {
      [MUSCLES.FOREARM_EXTENSORS]: 17,
    },
  },

  "behind-the-back-wrist-curl": {
    name: "Behind The Back Wrist Curl",
    bodyPart: "Forearms",
    section: "forearms",
    trackingType: "weight" as const,
    movement: "wrist-flexion",
    primaryMuscles: [MUSCLES.FOREARM_FLEXORS],
    secondaryMuscles: [],
    fatigue: {
      [MUSCLES.FOREARM_FLEXORS]: 17,
    },
  },

  "cable-wrist-curl": {
    name: "Cable Wrist Curl",
    bodyPart: "Forearms",
    section: "forearms",
    trackingType: "weight" as const,
    movement: "wrist-flexion",
    primaryMuscles: [MUSCLES.FOREARM_FLEXORS],
    secondaryMuscles: [],
    fatigue: {
      [MUSCLES.FOREARM_FLEXORS]: 17,
    },
  },

  "reverse-ez-curl": {
    name: "Reverse EZ Curl",
    bodyPart: "Forearms",
    section: "forearms",
    trackingType: "weight" as const,
    movement: "wrist-extension",
    primaryMuscles: [MUSCLES.BRACHIORADIALIS],
    secondaryMuscles: [MUSCLES.BRACHIALIS, MUSCLES.FOREARM_EXTENSORS],
    // Legacy forearms → Brachioradialis, biceps → Brachialis (same values).
    // FOREARM_EXTENSORS listed in secondary metadata only (no fatigue invent).
    fatigue: {
      [MUSCLES.BRACHIORADIALIS]: 16,
      [MUSCLES.BRACHIALIS]: 6,
    },
  },

  "reverse-barbell-curl": {
    name: "Reverse Barbell Curl",
    bodyPart: "Forearms",
    section: "forearms",
    trackingType: "weight" as const,
    movement: "wrist-extension",
    primaryMuscles: [MUSCLES.BRACHIORADIALIS],
    secondaryMuscles: [MUSCLES.BRACHIALIS, MUSCLES.FOREARM_EXTENSORS],
    fatigue: {
      [MUSCLES.BRACHIORADIALIS]: 16,
      [MUSCLES.BRACHIALIS]: 6,
    },
  },

  "reverse-cable-curl": {
    name: "Reverse Cable Curl",
    bodyPart: "Forearms",
    section: "forearms",
    trackingType: "weight" as const,
    movement: "wrist-extension",
    primaryMuscles: [MUSCLES.BRACHIORADIALIS],
    secondaryMuscles: [MUSCLES.BRACHIALIS, MUSCLES.FOREARM_EXTENSORS],
    fatigue: {
      [MUSCLES.BRACHIORADIALIS]: 16,
      [MUSCLES.BRACHIALIS]: 5,
    },
  },

  "dumbbell-reverse-curl": {
    name: "Dumbbell Reverse Curl",
    bodyPart: "Forearms",
    section: "forearms",
    trackingType: "weight" as const,
    movement: "wrist-extension",
    primaryMuscles: [MUSCLES.BRACHIORADIALIS],
    secondaryMuscles: [MUSCLES.BRACHIALIS, MUSCLES.FOREARM_EXTENSORS],
    fatigue: {
      [MUSCLES.BRACHIORADIALIS]: 16,
      [MUSCLES.BRACHIALIS]: 5,
    },
  },

  "farmers-carry": {
    name: "Farmer's Carry",
    bodyPart: "Forearms",
    section: "forearms",
    trackingType: "weight" as const,
    movement: "carry",
    primaryMuscles: [MUSCLES.FOREARM_FLEXORS],
    secondaryMuscles: [MUSCLES.UPPER_TRAPS],
    // Legacy traps → Upper Traps (same value).
    fatigue: {
      [MUSCLES.FOREARM_FLEXORS]: 18,
      [MUSCLES.UPPER_TRAPS]: 5,
    },
  },

  "plate-pinch": {
    name: "Plate Pinch",
    bodyPart: "Forearms",
    section: "forearms",
    trackingType: "weight" as const,
    movement: "grip",
    primaryMuscles: [MUSCLES.FOREARM_FLEXORS],
    secondaryMuscles: [],
    fatigue: {
      [MUSCLES.FOREARM_FLEXORS]: 17,
    },
  },

  "dead-hang": {
    name: "Dead Hang",
    bodyPart: "Forearms",
    section: "forearms",
    trackingType: "duration" as const,
    movement: "grip",
    primaryMuscles: [MUSCLES.FOREARM_FLEXORS],
    secondaryMuscles: [MUSCLES.LATS],
    fatigue: {
      [MUSCLES.FOREARM_FLEXORS]: 17,
      [MUSCLES.LATS]: 3,
    },
  },

  "gripper-squeeze": {
    name: "Gripper Squeeze",
    bodyPart: "Forearms",
    section: "forearms",
    trackingType: "bodyweight" as const,
    movement: "grip",
    primaryMuscles: [MUSCLES.FOREARM_FLEXORS],
    secondaryMuscles: [],
    fatigue: {
      [MUSCLES.FOREARM_FLEXORS]: 16,
    },
  },

  "rope-climb": {
    name: "Rope Climb",
    bodyPart: "Forearms",
    section: "forearms",
    trackingType: "bodyweight" as const,
    movement: "vertical-pull",
    primaryMuscles: [MUSCLES.FOREARM_FLEXORS],
    secondaryMuscles: [MUSCLES.LATS, MUSCLES.BRACHIALIS],
    // Legacy biceps → Brachialis (same value).
    fatigue: {
      [MUSCLES.FOREARM_FLEXORS]: 19,
      [MUSCLES.BRACHIALIS]: 8,
      [MUSCLES.LATS]: 8,
    },
  },

  "fat-grip-dumbbell-hold": {
    name: "Fat Grip Dumbbell Hold",
    bodyPart: "Forearms",
    section: "forearms",
    trackingType: "duration" as const,
    movement: "grip",
    primaryMuscles: [MUSCLES.FOREARM_FLEXORS],
    secondaryMuscles: [],
    fatigue: {
      [MUSCLES.FOREARM_FLEXORS]: 18,
    },
  },
} as const satisfies Record<string, ExerciseData>;
