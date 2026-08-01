import { MUSCLES } from "./muscles";
import type { ExerciseData } from "./exerciseTypes";

/**
 * Shoulders exercise database — recovery-engine foundation.
 *
 * Fatigue keys use MUSCLES only. Legacy `upperBack` mapped to Rhomboids
 * (scapular retraction assist on rear-delt work).
 * with the same numeric values (no rebalance).
 * Sections are UI-only: front-delts | side-delts | rear-delts.
 */
export const shoulders = {
  // =====================
  // FRONT DELTS (UI section)
  // =====================

  "barbell-overhead-press": {
    name: "Barbell Overhead Press",
    bodyPart: "Shoulders",
    section: "front-delts",
    trackingType: "weight" as const,
    movement: "vertical-push",
    primaryMuscles: [MUSCLES.FRONT_DELTS],
    secondaryMuscles: [
      MUSCLES.SIDE_DELTS,
      MUSCLES.LATERAL_HEAD_TRICEPS,
      MUSCLES.MEDIAL_HEAD_TRICEPS,
      MUSCLES.LONG_HEAD_TRICEPS,
    ],
    fatigue: {
      [MUSCLES.FRONT_DELTS]: 18,
      [MUSCLES.SIDE_DELTS]: 6,
      [MUSCLES.LATERAL_HEAD_TRICEPS]: 5,
      [MUSCLES.MEDIAL_HEAD_TRICEPS]: 3,
      [MUSCLES.LONG_HEAD_TRICEPS]: 2,
    },
  },

  "dumbbell-overhead-press": {
    name: "Dumbbell Overhead Press",
    bodyPart: "Shoulders",
    section: "front-delts",
    trackingType: "weight" as const,
    movement: "vertical-push",
    primaryMuscles: [MUSCLES.FRONT_DELTS],
    secondaryMuscles: [
      MUSCLES.SIDE_DELTS,
      MUSCLES.LATERAL_HEAD_TRICEPS,
      MUSCLES.MEDIAL_HEAD_TRICEPS,
      MUSCLES.LONG_HEAD_TRICEPS,
    ],
    fatigue: {
      [MUSCLES.FRONT_DELTS]: 17,
      [MUSCLES.SIDE_DELTS]: 7,
      [MUSCLES.LATERAL_HEAD_TRICEPS]: 5,
      [MUSCLES.MEDIAL_HEAD_TRICEPS]: 3,
      [MUSCLES.LONG_HEAD_TRICEPS]: 1,
    },
  },

  "arnold-press": {
    name: "Arnold Press",
    bodyPart: "Shoulders",
    section: "front-delts",
    trackingType: "weight" as const,
    movement: "vertical-push",
    primaryMuscles: [MUSCLES.FRONT_DELTS],
    secondaryMuscles: [
      MUSCLES.SIDE_DELTS,
      MUSCLES.LATERAL_HEAD_TRICEPS,
      MUSCLES.MEDIAL_HEAD_TRICEPS,
      MUSCLES.LONG_HEAD_TRICEPS,
    ],
    fatigue: {
      [MUSCLES.FRONT_DELTS]: 18,
      [MUSCLES.SIDE_DELTS]: 8,
      [MUSCLES.LATERAL_HEAD_TRICEPS]: 4,
      [MUSCLES.MEDIAL_HEAD_TRICEPS]: 3,
      [MUSCLES.LONG_HEAD_TRICEPS]: 1,
    },
  },

  "machine-shoulder-press": {
    name: "Machine Shoulder Press",
    bodyPart: "Shoulders",
    section: "front-delts",
    trackingType: "weight" as const,
    movement: "vertical-push",
    primaryMuscles: [MUSCLES.FRONT_DELTS],
    secondaryMuscles: [
      MUSCLES.SIDE_DELTS,
      MUSCLES.LATERAL_HEAD_TRICEPS,
      MUSCLES.MEDIAL_HEAD_TRICEPS,
      MUSCLES.LONG_HEAD_TRICEPS,
    ],
    fatigue: {
      [MUSCLES.FRONT_DELTS]: 17,
      [MUSCLES.SIDE_DELTS]: 6,
      [MUSCLES.LATERAL_HEAD_TRICEPS]: 4,
      [MUSCLES.MEDIAL_HEAD_TRICEPS]: 3,
      [MUSCLES.LONG_HEAD_TRICEPS]: 1,
    },
  },

  "smith-overhead-press": {
    name: "Smith Overhead Press",
    bodyPart: "Shoulders",
    section: "front-delts",
    trackingType: "weight" as const,
    movement: "vertical-push",
    primaryMuscles: [MUSCLES.FRONT_DELTS],
    secondaryMuscles: [
      MUSCLES.SIDE_DELTS,
      MUSCLES.LATERAL_HEAD_TRICEPS,
      MUSCLES.MEDIAL_HEAD_TRICEPS,
      MUSCLES.LONG_HEAD_TRICEPS,
    ],
    fatigue: {
      [MUSCLES.FRONT_DELTS]: 17,
      [MUSCLES.SIDE_DELTS]: 6,
      [MUSCLES.LATERAL_HEAD_TRICEPS]: 5,
      [MUSCLES.MEDIAL_HEAD_TRICEPS]: 3,
      [MUSCLES.LONG_HEAD_TRICEPS]: 1,
    },
  },

  "landmine-shoulder-press": {
    name: "Landmine Shoulder Press",
    bodyPart: "Shoulders",
    section: "front-delts",
    trackingType: "weight" as const,
    movement: "vertical-push",
    primaryMuscles: [MUSCLES.FRONT_DELTS],
    secondaryMuscles: [
      MUSCLES.SIDE_DELTS,
      MUSCLES.LATERAL_HEAD_TRICEPS,
      MUSCLES.MEDIAL_HEAD_TRICEPS,
      MUSCLES.LONG_HEAD_TRICEPS,
    ],
    fatigue: {
      [MUSCLES.FRONT_DELTS]: 15,
      [MUSCLES.SIDE_DELTS]: 5,
      [MUSCLES.LATERAL_HEAD_TRICEPS]: 3,
      [MUSCLES.MEDIAL_HEAD_TRICEPS]: 2,
      [MUSCLES.LONG_HEAD_TRICEPS]: 2,
    },
  },

  "single-arm-dumbbell-press": {
    name: "Single Arm Dumbbell Press",
    bodyPart: "Shoulders",
    section: "front-delts",
    trackingType: "weight" as const,
    movement: "vertical-push",
    primaryMuscles: [MUSCLES.FRONT_DELTS],
    secondaryMuscles: [
      MUSCLES.SIDE_DELTS,
      MUSCLES.LATERAL_HEAD_TRICEPS,
      MUSCLES.MEDIAL_HEAD_TRICEPS,
      MUSCLES.LONG_HEAD_TRICEPS,
    ],
    fatigue: {
      [MUSCLES.FRONT_DELTS]: 16,
      [MUSCLES.SIDE_DELTS]: 6,
      [MUSCLES.LATERAL_HEAD_TRICEPS]: 4,
      [MUSCLES.MEDIAL_HEAD_TRICEPS]: 3,
      [MUSCLES.LONG_HEAD_TRICEPS]: 1,
    },
  },

  "seated-barbell-press": {
    name: "Seated Barbell Press",
    bodyPart: "Shoulders",
    section: "front-delts",
    trackingType: "weight" as const,
    movement: "vertical-push",
    primaryMuscles: [MUSCLES.FRONT_DELTS],
    secondaryMuscles: [
      MUSCLES.SIDE_DELTS,
      MUSCLES.LATERAL_HEAD_TRICEPS,
      MUSCLES.MEDIAL_HEAD_TRICEPS,
      MUSCLES.LONG_HEAD_TRICEPS,
    ],
    fatigue: {
      [MUSCLES.FRONT_DELTS]: 18,
      [MUSCLES.SIDE_DELTS]: 6,
      [MUSCLES.LATERAL_HEAD_TRICEPS]: 5,
      [MUSCLES.MEDIAL_HEAD_TRICEPS]: 3,
      [MUSCLES.LONG_HEAD_TRICEPS]: 2,
    },
  },

  "seated-dumbbell-press": {
    name: "Seated Dumbbell Press",
    bodyPart: "Shoulders",
    section: "front-delts",
    trackingType: "weight" as const,
    movement: "vertical-push",
    primaryMuscles: [MUSCLES.FRONT_DELTS],
    secondaryMuscles: [
      MUSCLES.SIDE_DELTS,
      MUSCLES.LATERAL_HEAD_TRICEPS,
      MUSCLES.MEDIAL_HEAD_TRICEPS,
      MUSCLES.LONG_HEAD_TRICEPS,
    ],
    fatigue: {
      [MUSCLES.FRONT_DELTS]: 17,
      [MUSCLES.SIDE_DELTS]: 7,
      [MUSCLES.LATERAL_HEAD_TRICEPS]: 5,
      [MUSCLES.MEDIAL_HEAD_TRICEPS]: 3,
      [MUSCLES.LONG_HEAD_TRICEPS]: 1,
    },
  },

  "push-press": {
    name: "Push Press",
    bodyPart: "Shoulders",
    section: "front-delts",
    trackingType: "weight" as const,
    movement: "vertical-push",
    primaryMuscles: [MUSCLES.FRONT_DELTS],
    secondaryMuscles: [
      MUSCLES.SIDE_DELTS,
      MUSCLES.LATERAL_HEAD_TRICEPS,
      MUSCLES.MEDIAL_HEAD_TRICEPS,
      MUSCLES.LONG_HEAD_TRICEPS,
    ],
    fatigue: {
      [MUSCLES.FRONT_DELTS]: 18,
      [MUSCLES.SIDE_DELTS]: 6,
      [MUSCLES.LATERAL_HEAD_TRICEPS]: 5,
      [MUSCLES.MEDIAL_HEAD_TRICEPS]: 3,
      [MUSCLES.LONG_HEAD_TRICEPS]: 2,
    },
  },

  // =====================
  // SIDE DELTS (UI section)
  // =====================

  "dumbbell-lateral-raise": {
    name: "Dumbbell Lateral Raise",
    bodyPart: "Shoulders",
    section: "side-delts",
    trackingType: "weight" as const,
    movement: "isolation",
    primaryMuscles: [MUSCLES.SIDE_DELTS],
    secondaryMuscles: [MUSCLES.FRONT_DELTS],
    fatigue: {
      [MUSCLES.SIDE_DELTS]: 18,
      [MUSCLES.FRONT_DELTS]: 2,
    },
  },

  "cable-lateral-raise": {
    name: "Cable Lateral Raise",
    bodyPart: "Shoulders",
    section: "side-delts",
    trackingType: "weight" as const,
    movement: "isolation",
    primaryMuscles: [MUSCLES.SIDE_DELTS],
    secondaryMuscles: [MUSCLES.FRONT_DELTS],
    fatigue: {
      [MUSCLES.SIDE_DELTS]: 18,
      [MUSCLES.FRONT_DELTS]: 1,
    },
  },

  "machine-lateral-raise": {
    name: "Machine Lateral Raise",
    bodyPart: "Shoulders",
    section: "side-delts",
    trackingType: "weight" as const,
    movement: "isolation",
    primaryMuscles: [MUSCLES.SIDE_DELTS],
    secondaryMuscles: [],
    fatigue: {
      [MUSCLES.SIDE_DELTS]: 17,
    },
  },

  "leaning-cable-lateral-raise": {
    name: "Leaning Cable Lateral Raise",
    bodyPart: "Shoulders",
    section: "side-delts",
    trackingType: "weight" as const,
    movement: "isolation",
    primaryMuscles: [MUSCLES.SIDE_DELTS],
    secondaryMuscles: [],
    fatigue: {
      [MUSCLES.SIDE_DELTS]: 18,
    },
  },

  "single-arm-lateral-raise": {
    name: "Single Arm Lateral Raise",
    bodyPart: "Shoulders",
    section: "side-delts",
    trackingType: "weight" as const,
    movement: "isolation",
    primaryMuscles: [MUSCLES.SIDE_DELTS],
    secondaryMuscles: [],
    fatigue: {
      [MUSCLES.SIDE_DELTS]: 17,
    },
  },

  "seated-lateral-raise": {
    name: "Seated Lateral Raise",
    bodyPart: "Shoulders",
    section: "side-delts",
    trackingType: "weight" as const,
    movement: "isolation",
    primaryMuscles: [MUSCLES.SIDE_DELTS],
    secondaryMuscles: [],
    fatigue: {
      [MUSCLES.SIDE_DELTS]: 17,
    },
  },

  "incline-lateral-raise": {
    name: "Incline Lateral Raise",
    bodyPart: "Shoulders",
    section: "side-delts",
    trackingType: "weight" as const,
    movement: "isolation",
    primaryMuscles: [MUSCLES.SIDE_DELTS],
    secondaryMuscles: [],
    fatigue: {
      [MUSCLES.SIDE_DELTS]: 17,
    },
  },

  "behind-the-back-cable-lateral-raise": {
    name: "Behind The Back Cable Lateral Raise",
    bodyPart: "Shoulders",
    section: "side-delts",
    trackingType: "weight" as const,
    movement: "isolation",
    primaryMuscles: [MUSCLES.SIDE_DELTS],
    secondaryMuscles: [],
    fatigue: {
      [MUSCLES.SIDE_DELTS]: 18,
    },
  },

  "resistance-band-lateral-raise": {
    name: "Resistance Band Lateral Raise",
    bodyPart: "Shoulders",
    section: "side-delts",
    trackingType: "weight" as const,
    movement: "isolation",
    primaryMuscles: [MUSCLES.SIDE_DELTS],
    secondaryMuscles: [],
    fatigue: {
      [MUSCLES.SIDE_DELTS]: 15,
    },
  },

  "partial-lateral-raise": {
    name: "Partial Lateral Raise",
    bodyPart: "Shoulders",
    section: "side-delts",
    trackingType: "weight" as const,
    movement: "isolation",
    primaryMuscles: [MUSCLES.SIDE_DELTS],
    secondaryMuscles: [],
    fatigue: {
      [MUSCLES.SIDE_DELTS]: 16,
    },
  },

  // =====================
  // REAR DELTS (UI section)
  // =====================

  "face-pull": {
    name: "Face Pull",
    bodyPart: "Shoulders",
    section: "rear-delts",
    trackingType: "weight" as const,
    movement: "isolation",
    primaryMuscles: [MUSCLES.REAR_DELTS],
    secondaryMuscles: [MUSCLES.RHOMBOIDS],
    // Legacy upperBack: 7 → Rhomboids (same value; no rebalance).
    fatigue: {
      [MUSCLES.REAR_DELTS]: 16,
      [MUSCLES.RHOMBOIDS]: 7,
    },
  },

  "bent-over-dumbbell-reverse-fly": {
    name: "Bent Over Dumbbell Reverse Fly",
    bodyPart: "Shoulders",
    section: "rear-delts",
    trackingType: "weight" as const,
    movement: "isolation",
    primaryMuscles: [MUSCLES.REAR_DELTS],
    secondaryMuscles: [MUSCLES.RHOMBOIDS],
    // Legacy upperBack: 5 → Rhomboids (same value).
    fatigue: {
      [MUSCLES.REAR_DELTS]: 17,
      [MUSCLES.RHOMBOIDS]: 5,
    },
  },

  "cable-rear-delt-fly": {
    name: "Cable Rear Delt Fly",
    bodyPart: "Shoulders",
    section: "rear-delts",
    trackingType: "weight" as const,
    movement: "isolation",
    primaryMuscles: [MUSCLES.REAR_DELTS],
    secondaryMuscles: [],
    fatigue: {
      [MUSCLES.REAR_DELTS]: 18,
    },
  },

  "reverse-cable-cross": {
    name: "Reverse Cable Cross",
    bodyPart: "Shoulders",
    section: "rear-delts",
    trackingType: "weight" as const,
    movement: "isolation",
    primaryMuscles: [MUSCLES.REAR_DELTS],
    secondaryMuscles: [],
    fatigue: {
      [MUSCLES.REAR_DELTS]: 17,
    },
  },

  "machine-rear-delt-fly": {
    name: "Machine Rear Delt Fly",
    bodyPart: "Shoulders",
    section: "rear-delts",
    trackingType: "weight" as const,
    movement: "isolation",
    primaryMuscles: [MUSCLES.REAR_DELTS],
    secondaryMuscles: [],
    fatigue: {
      [MUSCLES.REAR_DELTS]: 18,
    },
  },

  "incline-rear-delt-raise": {
    name: "Incline Rear Delt Raise",
    bodyPart: "Shoulders",
    section: "rear-delts",
    trackingType: "weight" as const,
    movement: "isolation",
    primaryMuscles: [MUSCLES.REAR_DELTS],
    secondaryMuscles: [],
    fatigue: {
      [MUSCLES.REAR_DELTS]: 17,
    },
  },

  "band-pull-apart": {
    name: "Band Pull Apart",
    bodyPart: "Shoulders",
    section: "rear-delts",
    trackingType: "weight" as const,
    movement: "isolation",
    primaryMuscles: [MUSCLES.REAR_DELTS],
    secondaryMuscles: [MUSCLES.RHOMBOIDS],
    // Legacy upperBack: 5 → Rhomboids (same value).
    fatigue: {
      [MUSCLES.REAR_DELTS]: 15,
      [MUSCLES.RHOMBOIDS]: 5,
    },
  },
} as const satisfies Record<string, ExerciseData>;
