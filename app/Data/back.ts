import { MUSCLES } from "./muscles";
import type { ExerciseData } from "./exerciseTypes";

/**
 * Back exercise database — recovery-engine foundation.
 *
 * Fatigue keys use MUSCLES only (never body-region keys like "Upper Back").
 * Sections are UI-only: upper-back | lats | lower-back.
 *
 * Final Back muscles:
 *   Upper Traps | Middle Traps | Lower Traps | Rhomboids | Lats | Lower Back
 *
 * Fatigue scale (≈3×10 baseline):
 *   Primary 16–18 | Strong secondary 6–10 | Minor 2–5 | Stabilizer 1–3
 *
 * Totals stay ≈ legacy budgets; former mid-scapular fatigue is redistributed into
 * Rhomboids / Middle Traps / Lower Traps.
 */
export const back = {
  // =====================
  // UPPER BACK (UI section)
  // =====================

  "seal-row": {
    name: "Seal Row",
    bodyPart: "Back",
    section: "upper-back",
    trackingType: "weight" as const,
    movement: "horizontal-pull",
    // Chest pad unloads erectors → scapular retraction drives the row.
    primaryMuscles: [MUSCLES.RHOMBOIDS, MUSCLES.MIDDLE_TRAPS],
    secondaryMuscles: [
      MUSCLES.LOWER_TRAPS,
      MUSCLES.LATS,
      MUSCLES.LONG_HEAD_BICEPS,
      MUSCLES.SHORT_HEAD_BICEPS,
      MUSCLES.BRACHIALIS,
      MUSCLES.BRACHIORADIALIS,
    ],
    // Legacy total 30 (MID_BACK 16 + UT 2 → Rhomboids / Mid / Lower Traps).
    fatigue: {
      [MUSCLES.RHOMBOIDS]: 9,
      [MUSCLES.MIDDLE_TRAPS]: 7,
      [MUSCLES.LOWER_TRAPS]: 2,
      [MUSCLES.LATS]: 6,
      [MUSCLES.LONG_HEAD_BICEPS]: 2,
      [MUSCLES.SHORT_HEAD_BICEPS]: 2,
      [MUSCLES.BRACHIALIS]: 1,
      [MUSCLES.BRACHIORADIALIS]: 1,
    },
  },

  "trap-3-raise": {
  name: "Trap-3 Raise",
  bodyPart: "Back",
  section: "upper-back",
  trackingType: "weight",
  movement: "isolation",

  primaryMuscles: [
    MUSCLES.LOWER_TRAPS,
  ],

  secondaryMuscles: [
    MUSCLES.REAR_DELTS,
    MUSCLES.RHOMBOIDS,
  ],

  fatigue: {
    [MUSCLES.LOWER_TRAPS]: 18,
    [MUSCLES.REAR_DELTS]: 5,
    [MUSCLES.RHOMBOIDS]: 4,
  },

  image: "/back/trap-3-raise.webp",
},

"straight-arm-cable-pulldown": {
  name: "Straight Arm Cable Pulldown",
  bodyPart: "Back",
  section: "lats",
  trackingType: "weight",
  movement: "vertical-pull",

  primaryMuscles: [
    MUSCLES.LATS,
  ],

  secondaryMuscles: [
    MUSCLES.LOWER_TRAPS,
  ],

  fatigue: {
    [MUSCLES.LATS]: 18,
    [MUSCLES.LOWER_TRAPS]: 4,
  },

  image: "/back/straight-arm-cable-pulldown.webp",
},

"rope-straight-arm-pulldown": {
  name: "Rope Straight Arm Pulldown",
  bodyPart: "Back",
  section: "lats",
  trackingType: "weight",
  movement: "vertical-pull",

  primaryMuscles: [
    MUSCLES.LATS,
  ],

  secondaryMuscles: [
    MUSCLES.LOWER_TRAPS,
  ],

  fatigue: {
    [MUSCLES.LATS]: 16,
    [MUSCLES.LOWER_TRAPS]: 6,
  },

  image: "/back/rope-straight-arm-pulldown.webp",
},

"scapular-pull-up": {
  name: "Scapular Pull-Up",
  bodyPart: "Back",
  section: "upper-back",
  trackingType: "bodyweight",
  movement: "vertical-pull",

  primaryMuscles: [
    MUSCLES.LOWER_TRAPS,
  ],

  secondaryMuscles: [
    MUSCLES.LATS,
    MUSCLES.RHOMBOIDS,
  ],

  fatigue: {
    [MUSCLES.LOWER_TRAPS]: 15,
    [MUSCLES.LATS]: 6,
    [MUSCLES.RHOMBOIDS]: 4,
  },

  image: "/back/scapular-pull-up.webp",
},

  "dumbbell-shrug": {
    name: "Dumbbell Shrug",
    bodyPart: "Back",
    section: "upper-back",
    trackingType: "weight",
    movement: "shrug",

    primaryMuscles: [
      MUSCLES.UPPER_TRAPS,
    ],

    secondaryMuscles: [
      MUSCLES.MIDDLE_TRAPS,
    ],

    fatigue: {
      [MUSCLES.UPPER_TRAPS]: 16,
      [MUSCLES.MIDDLE_TRAPS]: 4,
    },

    image: "/back/dumbbell-shrug.webp",
  },

  "barbell-shrug": {
    name: "Barbell Shrug",
    bodyPart: "Back",
    section: "upper-back",
    trackingType: "weight",
    movement: "shrug",

    primaryMuscles: [
      MUSCLES.UPPER_TRAPS,
    ],

    secondaryMuscles: [
      MUSCLES.MIDDLE_TRAPS,
    ],

    fatigue: {
      [MUSCLES.UPPER_TRAPS]: 16,
      [MUSCLES.MIDDLE_TRAPS]: 4,
    },

    image: "/back/barbell-shrug.webp",
  },

  "cable-shrug": {
    name: "Cable Shrug",
    bodyPart: "Back",
    section: "upper-back",
    trackingType: "weight",
    movement: "shrug",

    primaryMuscles: [
      MUSCLES.UPPER_TRAPS,
    ],

    secondaryMuscles: [
      MUSCLES.MIDDLE_TRAPS,
    ],

    fatigue: {
      [MUSCLES.UPPER_TRAPS]: 16,
      [MUSCLES.MIDDLE_TRAPS]: 4,
    },

    image: "/back/cable-shrug.webp",
  },

  "smith-machine-shrug": {
    name: "Smith Machine Shrug",
    bodyPart: "Back",
    section: "upper-back",
    trackingType: "weight",
    movement: "shrug",

    primaryMuscles: [
      MUSCLES.UPPER_TRAPS,
    ],

    secondaryMuscles: [
      MUSCLES.MIDDLE_TRAPS,
    ],

    fatigue: {
      [MUSCLES.UPPER_TRAPS]: 16,
      [MUSCLES.MIDDLE_TRAPS]: 4,
    },

    image: "/back/smith-machine-shrug.webp",
  },

  "plate-loaded-shrug": {
    name: "Plate Loaded Shrug",
    bodyPart: "Back",
    section: "upper-back",
    trackingType: "weight",
    movement: "shrug",

    primaryMuscles: [
      MUSCLES.UPPER_TRAPS,
    ],

    secondaryMuscles: [
      MUSCLES.MIDDLE_TRAPS,
    ],

    fatigue: {
      [MUSCLES.UPPER_TRAPS]: 16,
      [MUSCLES.MIDDLE_TRAPS]: 4,
    },

    image: "/back/machine-shrug.webp",
  },

  "high-row": {
    name: "High Row",
    bodyPart: "Back",
    section: "upper-back",
    trackingType: "weight" as const,
    movement: "horizontal-pull",
    // High-elbow path: scapular retractors + rear delts share the load.
    primaryMuscles: [
      MUSCLES.RHOMBOIDS,
      MUSCLES.MIDDLE_TRAPS,
      MUSCLES.REAR_DELTS,
    ],
    secondaryMuscles: [
      MUSCLES.LOWER_TRAPS,
      MUSCLES.LATS,
      MUSCLES.LONG_HEAD_BICEPS,
      MUSCLES.SHORT_HEAD_BICEPS,
      MUSCLES.BRACHIALIS,
    ],
    // Legacy total 35 (MID_BACK 6 + UT 10 → Rhomboids / Mid / Lower Traps).
    fatigue: {
      [MUSCLES.RHOMBOIDS]: 8,
      [MUSCLES.MIDDLE_TRAPS]: 8,
      [MUSCLES.REAR_DELTS]: 8,
      [MUSCLES.LOWER_TRAPS]: 4,
      [MUSCLES.LATS]: 4,
      [MUSCLES.BRACHIALIS]: 3,
      [MUSCLES.LONG_HEAD_BICEPS]: 2,
      [MUSCLES.SHORT_HEAD_BICEPS]: 2,
    },
    image: "/back/high-row.webp",
  },

  "wide-grip-seated-row": {
    name: "Wide Grip Seated Row",
    bodyPart: "Back",
    section: "upper-back",
    trackingType: "weight" as const,
    movement: "horizontal-pull",
    // Wide grip shortens lat moment arm → retraction dominates.
    primaryMuscles: [MUSCLES.RHOMBOIDS, MUSCLES.MIDDLE_TRAPS],
    secondaryMuscles: [
      MUSCLES.LOWER_TRAPS,
      MUSCLES.LATS,
      MUSCLES.LONG_HEAD_BICEPS,
      MUSCLES.SHORT_HEAD_BICEPS,
      MUSCLES.BRACHIALIS,
    ],
    // Legacy total 28 (MID_BACK 12 + UT 6 + RD 2 → Rhomboids / Mid / Lower Traps).
    fatigue: {
      [MUSCLES.RHOMBOIDS]: 8,
      [MUSCLES.MIDDLE_TRAPS]: 7,
      [MUSCLES.LOWER_TRAPS]: 5,
      [MUSCLES.LATS]: 5,
      [MUSCLES.LONG_HEAD_BICEPS]: 1,
      [MUSCLES.SHORT_HEAD_BICEPS]: 1,
      [MUSCLES.BRACHIALIS]: 1,
    },
  },

  "rear-delt-row": {
    name: "Rear Delt Row",
    bodyPart: "Back",
    section: "upper-back",
    trackingType: "weight" as const,
    movement: "horizontal-pull",
    // Elbows high/flared → posterior deltoid is the prime mover (section kept for UI).
    primaryMuscles: [MUSCLES.REAR_DELTS],
    secondaryMuscles: [
      MUSCLES.RHOMBOIDS,
      MUSCLES.MIDDLE_TRAPS,
      MUSCLES.LOWER_TRAPS,
      MUSCLES.LONG_HEAD_BICEPS,
      MUSCLES.SHORT_HEAD_BICEPS,
      MUSCLES.BRACHIALIS,
    ],
    // Legacy total 30 (MID_BACK 8 + UT 4 → Rhomboids / Mid / Lower Traps).
    fatigue: {
      [MUSCLES.REAR_DELTS]: 14,
      [MUSCLES.RHOMBOIDS]: 5,
      [MUSCLES.MIDDLE_TRAPS]: 4,
      [MUSCLES.LOWER_TRAPS]: 3,
      [MUSCLES.LONG_HEAD_BICEPS]: 1,
      [MUSCLES.SHORT_HEAD_BICEPS]: 1,
      [MUSCLES.BRACHIALIS]: 2,
    },
  },

  "machine-row": {
    name: "Machine Row",
    bodyPart: "Back",
    section: "upper-back",
    trackingType: "weight" as const,
    movement: "horizontal-pull",
    // Fixed path + support → clean scapular retraction with lat assistance.
    primaryMuscles: [MUSCLES.RHOMBOIDS, MUSCLES.MIDDLE_TRAPS],
    secondaryMuscles: [
      MUSCLES.LATS,
      MUSCLES.LOWER_TRAPS,
      MUSCLES.LONG_HEAD_BICEPS,
      MUSCLES.SHORT_HEAD_BICEPS,
      MUSCLES.BRACHIALIS,
    ],
    // Legacy total 32 (MID_BACK 16 + UT 3 → Rhomboids / Mid / Lower Traps).
    fatigue: {
      [MUSCLES.RHOMBOIDS]: 10,
      [MUSCLES.MIDDLE_TRAPS]: 7,
      [MUSCLES.LATS]: 7,
      [MUSCLES.LOWER_TRAPS]: 2,
      [MUSCLES.LONG_HEAD_BICEPS]: 2,
      [MUSCLES.SHORT_HEAD_BICEPS]: 2,
      [MUSCLES.BRACHIALIS]: 2,
    },
  },

  "half-kneeling-cable-row": {
    name: "Half Kneeling Cable Row",
    bodyPart: "Back",
    section: "upper-back",
    trackingType: "weight",
    movement: "horizontal-pull",

    primaryMuscles: [
      MUSCLES.LATS,
      MUSCLES.RHOMBOIDS,
    ],

    secondaryMuscles: [
      MUSCLES.MIDDLE_TRAPS,
      MUSCLES.LOWER_TRAPS,
      MUSCLES.REAR_DELTS,
      MUSCLES.OBLIQUES,
      MUSCLES.LONG_HEAD_BICEPS,
      MUSCLES.SHORT_HEAD_BICEPS,
      MUSCLES.BRACHIALIS,
    ],

    fatigue: {
      [MUSCLES.LATS]: 12,
      [MUSCLES.RHOMBOIDS]: 10,
      [MUSCLES.MIDDLE_TRAPS]: 8,
      [MUSCLES.LOWER_TRAPS]: 5,
      [MUSCLES.REAR_DELTS]: 3,
      [MUSCLES.OBLIQUES]: 2,
      [MUSCLES.LONG_HEAD_BICEPS]: 2,
      [MUSCLES.SHORT_HEAD_BICEPS]: 2,
      [MUSCLES.BRACHIALIS]: 2,
    },

    image: "/back/half-kneeling-cable-row.webp",
  },

  "meadows-row": {
    name: "Meadows Row",
    bodyPart: "Back",
    section: "upper-back",
    trackingType: "weight" as const,
    movement: "horizontal-pull",
    // Landmine single-arm: lat + rhomboid drive; braced torso → lower-back stabilizer.
    primaryMuscles: [MUSCLES.LATS, MUSCLES.RHOMBOIDS],
    secondaryMuscles: [
      MUSCLES.MIDDLE_TRAPS,
      MUSCLES.LOWER_TRAPS,
      MUSCLES.LOWER_BACK,
      MUSCLES.LONG_HEAD_BICEPS,
      MUSCLES.SHORT_HEAD_BICEPS,
      MUSCLES.BRACHIALIS,
    ],
    // Legacy total 42 (MID_BACK 14 + UT 4 + RD 5 → Rhomboids / Mid / Lower Traps).
    fatigue: {
      [MUSCLES.LATS]: 8,
      [MUSCLES.RHOMBOIDS]: 10,
      [MUSCLES.MIDDLE_TRAPS]: 7,
      [MUSCLES.LOWER_TRAPS]: 6,
      [MUSCLES.LOWER_BACK]: 4,
      [MUSCLES.LONG_HEAD_BICEPS]: 3,
      [MUSCLES.SHORT_HEAD_BICEPS]: 2,
      [MUSCLES.BRACHIALIS]: 2,
    },
  },

  "one-arm-dumbbell-row": {
    name: "One Arm Dumbbell Row",
    bodyPart: "Back",
    section: "upper-back",
    trackingType: "weight",
    movement: "horizontal-pull",

    primaryMuscles: [
      MUSCLES.LATS,
      MUSCLES.RHOMBOIDS,
    ],

    secondaryMuscles: [
      MUSCLES.MIDDLE_TRAPS,
      MUSCLES.LOWER_TRAPS,
      MUSCLES.LOWER_BACK,
      MUSCLES.REAR_DELTS,
      MUSCLES.LONG_HEAD_BICEPS,
      MUSCLES.SHORT_HEAD_BICEPS,
      MUSCLES.BRACHIALIS,
    ],

    fatigue: {
      [MUSCLES.LATS]: 12,
      [MUSCLES.RHOMBOIDS]: 10,
      [MUSCLES.MIDDLE_TRAPS]: 8,
      [MUSCLES.LOWER_TRAPS]: 6,
      [MUSCLES.LOWER_BACK]: 4,
      [MUSCLES.REAR_DELTS]: 3,
      [MUSCLES.LONG_HEAD_BICEPS]: 3,
      [MUSCLES.SHORT_HEAD_BICEPS]: 2,
      [MUSCLES.BRACHIALIS]: 2,
    },
  },

  "v-bar-seated-row": {
    name: "V Bar Seated Row",
    bodyPart: "Back",
    section: "upper-back",
    trackingType: "weight",
    movement: "horizontal-pull",

    primaryMuscles: [
      MUSCLES.LATS,
      MUSCLES.RHOMBOIDS,
    ],

    secondaryMuscles: [
      MUSCLES.MIDDLE_TRAPS,
      MUSCLES.LOWER_TRAPS,
      MUSCLES.LONG_HEAD_BICEPS,
      MUSCLES.SHORT_HEAD_BICEPS,
      MUSCLES.BRACHIALIS,
    ],

    fatigue: {
      [MUSCLES.LATS]: 12,
      [MUSCLES.RHOMBOIDS]: 10,
      [MUSCLES.MIDDLE_TRAPS]: 8,
      [MUSCLES.LOWER_TRAPS]: 5,
      [MUSCLES.LONG_HEAD_BICEPS]: 3,
      [MUSCLES.SHORT_HEAD_BICEPS]: 3,
      [MUSCLES.BRACHIALIS]: 2,
    },
  },

  "single-arm-seated-row": {
    name: "Single Arm Seated Row",
    bodyPart: "Back",
    section: "upper-back",
    trackingType: "weight",
    movement: "horizontal-pull",

    primaryMuscles: [
      MUSCLES.LATS,
      MUSCLES.RHOMBOIDS,
    ],

    secondaryMuscles: [
      MUSCLES.MIDDLE_TRAPS,
      MUSCLES.LOWER_TRAPS,
      MUSCLES.REAR_DELTS,
      MUSCLES.LONG_HEAD_BICEPS,
      MUSCLES.SHORT_HEAD_BICEPS,
      MUSCLES.BRACHIALIS,
    ],

    fatigue: {
      [MUSCLES.LATS]: 12,
      [MUSCLES.RHOMBOIDS]: 10,
      [MUSCLES.MIDDLE_TRAPS]: 8,
      [MUSCLES.LOWER_TRAPS]: 5,
      [MUSCLES.REAR_DELTS]: 3,
      [MUSCLES.LONG_HEAD_BICEPS]: 3,
      [MUSCLES.SHORT_HEAD_BICEPS]: 2,
      [MUSCLES.BRACHIALIS]: 2,
    },
  },

  "single-arm-cable-row": {
    name: "Single Arm Cable Row",
    bodyPart: "Back",
    section: "upper-back",
    trackingType: "weight",
    movement: "horizontal-pull",

    primaryMuscles: [
      MUSCLES.LATS,
      MUSCLES.RHOMBOIDS,
    ],

    secondaryMuscles: [
      MUSCLES.MIDDLE_TRAPS,
      MUSCLES.LOWER_TRAPS,
      MUSCLES.REAR_DELTS,
      MUSCLES.OBLIQUES,
      MUSCLES.LONG_HEAD_BICEPS,
      MUSCLES.SHORT_HEAD_BICEPS,
      MUSCLES.BRACHIALIS,
    ],

    fatigue: {
      [MUSCLES.LATS]: 12,
      [MUSCLES.RHOMBOIDS]: 10,
      [MUSCLES.MIDDLE_TRAPS]: 8,
      [MUSCLES.LOWER_TRAPS]: 5,
      [MUSCLES.REAR_DELTS]: 3,
      [MUSCLES.OBLIQUES]: 2,
      [MUSCLES.LONG_HEAD_BICEPS]: 2,
      [MUSCLES.SHORT_HEAD_BICEPS]: 2,
      [MUSCLES.BRACHIALIS]: 2,
    },
  },
  // =====================
  // LATS (UI section)
  // =====================

  "pull-up": {
    name: "Pull Up",
    bodyPart: "Back",
    section: "lats",
    trackingType: "bodyweight" as const,
    movement: "vertical-pull",
    // Frontal-plane shoulder adduction → latissimus primary.
    primaryMuscles: [MUSCLES.LATS],
    secondaryMuscles: [
      MUSCLES.LOWER_TRAPS,
      MUSCLES.RHOMBOIDS,
      MUSCLES.LONG_HEAD_BICEPS,
      MUSCLES.SHORT_HEAD_BICEPS,
      MUSCLES.BRACHIALIS,
      MUSCLES.BRACHIORADIALIS,
    ],
    // Legacy total 29 (MID_BACK 2 + UT 1 → Rhomboids / Lower Traps).
    fatigue: {
      [MUSCLES.LATS]: 18,
      [MUSCLES.LOWER_TRAPS]: 5,
      [MUSCLES.RHOMBOIDS]: 2,
      [MUSCLES.LONG_HEAD_BICEPS]: 1,
      [MUSCLES.SHORT_HEAD_BICEPS]: 1,
      [MUSCLES.BRACHIALIS]: 1,
      [MUSCLES.BRACHIORADIALIS]: 1,
    },
  },

  "chin-up": {
    name: "Chin Up",
    bodyPart: "Back",
    section: "lats",
    trackingType: "bodyweight",
    movement: "vertical-pull",

    // Underhand grip shifts more load to the elbow flexors while keeping the lats primary.
    primaryMuscles: [
      MUSCLES.LATS,
      MUSCLES.LONG_HEAD_BICEPS,
    ],

    secondaryMuscles: [
      MUSCLES.SHORT_HEAD_BICEPS,
      MUSCLES.BRACHIALIS,
      MUSCLES.BRACHIORADIALIS,
      MUSCLES.RHOMBOIDS,
      MUSCLES.LOWER_TRAPS,
    ],

    fatigue: {
      [MUSCLES.LATS]: 16,
      [MUSCLES.LONG_HEAD_BICEPS]: 6,
      [MUSCLES.SHORT_HEAD_BICEPS]: 4,
      [MUSCLES.BRACHIALIS]: 3,
      [MUSCLES.BRACHIORADIALIS]: 2,
      [MUSCLES.RHOMBOIDS]: 2,
      [MUSCLES.LOWER_TRAPS]: 2,
    },

    image: "/back/chin-up.webp",
  },

  "lat-pulldown": {
    name: "Lat Pulldown",
    bodyPart: "Back",
    section: "lats",
    trackingType: "weight" as const,
    movement: "vertical-pull",
    // Same vertical-pull pattern as pull-up with a stabilized torso.
    primaryMuscles: [MUSCLES.LATS],
    secondaryMuscles: [
      MUSCLES.LOWER_TRAPS,
      MUSCLES.RHOMBOIDS,
      MUSCLES.LONG_HEAD_BICEPS,
      MUSCLES.SHORT_HEAD_BICEPS,
      MUSCLES.BRACHIALIS,
    ],
    // Legacy total 27 (MID_BACK 2 → Rhomboids).
    fatigue: {
      [MUSCLES.LATS]: 17,
      [MUSCLES.LOWER_TRAPS]: 4,
      [MUSCLES.RHOMBOIDS]: 2,
      [MUSCLES.LONG_HEAD_BICEPS]: 2,
      [MUSCLES.SHORT_HEAD_BICEPS]: 1,
      [MUSCLES.BRACHIALIS]: 1,
    },
  },

  "wide-grip-lat-pulldown": {
    name: "Wide Grip Lat Pulldown",
    bodyPart: "Back",
    section: "lats",
    trackingType: "weight",
    movement: "vertical-pull",

    primaryMuscles: [
      MUSCLES.LATS,
    ],

    secondaryMuscles: [
      MUSCLES.RHOMBOIDS,
      MUSCLES.LOWER_TRAPS,
      MUSCLES.LONG_HEAD_BICEPS,
      MUSCLES.SHORT_HEAD_BICEPS,
      MUSCLES.BRACHIALIS,
      MUSCLES.BRACHIORADIALIS,
    ],

    fatigue: {
      [MUSCLES.LATS]: 16,
      [MUSCLES.RHOMBOIDS]: 3,
      [MUSCLES.LOWER_TRAPS]: 3,
      [MUSCLES.LONG_HEAD_BICEPS]: 3,
      [MUSCLES.SHORT_HEAD_BICEPS]: 2,
      [MUSCLES.BRACHIALIS]: 2,
      [MUSCLES.BRACHIORADIALIS]: 2,
    },

    image: "/back/wide-grip-lat-pulldown.webp",
  },

  "close-grip-pulldown": {
    name: "Close Grip Pulldown",
    bodyPart: "Back",
    section: "lats",
    trackingType: "weight" as const,
    movement: "vertical-pull",
    // Neutral/close grip ↑ elbow-flexion (brachialis) while keeping lat focus.
    primaryMuscles: [MUSCLES.LATS],
    secondaryMuscles: [
      MUSCLES.LOWER_TRAPS,
      MUSCLES.RHOMBOIDS,
      MUSCLES.BRACHIALIS,
      MUSCLES.LONG_HEAD_BICEPS,
      MUSCLES.SHORT_HEAD_BICEPS,
      MUSCLES.BRACHIORADIALIS,
    ],
    // Legacy total 26 (MID_BACK 2 → Rhomboids).
    fatigue: {
      [MUSCLES.LATS]: 16,
      [MUSCLES.LOWER_TRAPS]: 3,
      [MUSCLES.RHOMBOIDS]: 2,
      [MUSCLES.BRACHIALIS]: 2,
      [MUSCLES.LONG_HEAD_BICEPS]: 1,
      [MUSCLES.SHORT_HEAD_BICEPS]: 1,
      [MUSCLES.BRACHIORADIALIS]: 1,
    },
  },

  "single-arm-lat-pulldown": {
    name: "Single Arm Lat Pulldown",
    bodyPart: "Back",
    section: "lats",
    trackingType: "weight" as const,
    movement: "vertical-pull",
    // Unilateral vertical pull; light anti-rotation from obliques.
    primaryMuscles: [MUSCLES.LATS],
    secondaryMuscles: [
      MUSCLES.LOWER_TRAPS,
      MUSCLES.RHOMBOIDS,
      MUSCLES.OBLIQUES,
      MUSCLES.LONG_HEAD_BICEPS,
      MUSCLES.SHORT_HEAD_BICEPS,
      MUSCLES.BRACHIALIS,
    ],
    // Legacy total 25 (MID_BACK 1 → Rhomboids).
    fatigue: {
      [MUSCLES.LATS]: 17,
      [MUSCLES.LOWER_TRAPS]: 3,
      [MUSCLES.RHOMBOIDS]: 1,
      [MUSCLES.OBLIQUES]: 1,
      [MUSCLES.LONG_HEAD_BICEPS]: 1,
      [MUSCLES.SHORT_HEAD_BICEPS]: 1,
      [MUSCLES.BRACHIALIS]: 1,
    },
  },

  // =====================
  // UPPER BACK continued (rows)
  // =====================

  "barbell-row": {
    name: "Barbell Row",
    bodyPart: "Back",
    section: "upper-back",
    trackingType: "weight",
    movement: "horizontal-pull",

    primaryMuscles: [
      MUSCLES.LATS,
      MUSCLES.RHOMBOIDS,
    ],

    secondaryMuscles: [
      MUSCLES.MIDDLE_TRAPS,
      MUSCLES.LOWER_TRAPS,
      MUSCLES.LOWER_BACK,
      MUSCLES.REAR_DELTS,
      MUSCLES.LONG_HEAD_BICEPS,
      MUSCLES.SHORT_HEAD_BICEPS,
      MUSCLES.BRACHIALIS,
    ],

    fatigue: {
      [MUSCLES.LATS]: 12,
      [MUSCLES.RHOMBOIDS]: 10,
      [MUSCLES.MIDDLE_TRAPS]: 8,
      [MUSCLES.LOWER_TRAPS]: 6,
      [MUSCLES.LOWER_BACK]: 6,
      [MUSCLES.REAR_DELTS]: 4,
      [MUSCLES.LONG_HEAD_BICEPS]: 3,
      [MUSCLES.SHORT_HEAD_BICEPS]: 3,
      [MUSCLES.BRACHIALIS]: 2,
    },

    image: "/back/barbell-row.webp",
  },

  "landmine-t-bar-row": {
    name: "Landmine T Bar Row",
    bodyPart: "Back",
    section: "upper-back",
    trackingType: "weight",
    movement: "horizontal-pull",

    primaryMuscles: [
      MUSCLES.LATS,
      MUSCLES.RHOMBOIDS,
    ],

    secondaryMuscles: [
      MUSCLES.MIDDLE_TRAPS,
      MUSCLES.LOWER_TRAPS,
      MUSCLES.LOWER_BACK,
      MUSCLES.REAR_DELTS,
      MUSCLES.LONG_HEAD_BICEPS,
      MUSCLES.SHORT_HEAD_BICEPS,
      MUSCLES.BRACHIALIS,
    ],

    fatigue: {
      [MUSCLES.LATS]: 12,
      [MUSCLES.RHOMBOIDS]: 10,
      [MUSCLES.MIDDLE_TRAPS]: 8,
      [MUSCLES.LOWER_TRAPS]: 6,
      [MUSCLES.LOWER_BACK]: 5,
      [MUSCLES.REAR_DELTS]: 4,
      [MUSCLES.LONG_HEAD_BICEPS]: 3,
      [MUSCLES.SHORT_HEAD_BICEPS]: 3,
      [MUSCLES.BRACHIALIS]: 2,
    },
    image: "/back/t-bar-row.webp",
  },

  "chest-supported-t-bar-row": {
    name: "Chest Supported T-Bar Row",
    bodyPart: "Back",
    section: "upper-back",
    trackingType: "weight",
    movement: "horizontal-pull",

    primaryMuscles: [
      MUSCLES.RHOMBOIDS,
      MUSCLES.MIDDLE_TRAPS,
    ],

    secondaryMuscles: [
      MUSCLES.LATS,
      MUSCLES.LOWER_TRAPS,
      MUSCLES.REAR_DELTS,
      MUSCLES.LONG_HEAD_BICEPS,
      MUSCLES.SHORT_HEAD_BICEPS,
      MUSCLES.BRACHIALIS,
    ],

    fatigue: {
      [MUSCLES.RHOMBOIDS]: 12,
      [MUSCLES.MIDDLE_TRAPS]: 10,
      [MUSCLES.LATS]: 8,
      [MUSCLES.LOWER_TRAPS]: 6,
      [MUSCLES.REAR_DELTS]: 4,
      [MUSCLES.LONG_HEAD_BICEPS]: 3,
      [MUSCLES.SHORT_HEAD_BICEPS]: 3,
      [MUSCLES.BRACHIALIS]: 2,
    },
    image: "/back/chest-supported-t-bar-row.webp",
  },

  "chest-supported-dumbbell-row": {
    name: "Chest Supported Dumbbell Row",
    bodyPart: "Back",
    section: "upper-back",
    trackingType: "weight",
    movement: "horizontal-pull",

    primaryMuscles: [
      MUSCLES.RHOMBOIDS,
      MUSCLES.MIDDLE_TRAPS,
    ],

    secondaryMuscles: [
      MUSCLES.LATS,
      MUSCLES.LOWER_TRAPS,
      MUSCLES.REAR_DELTS,
      MUSCLES.LONG_HEAD_BICEPS,
      MUSCLES.SHORT_HEAD_BICEPS,
      MUSCLES.BRACHIALIS,
    ],

    fatigue: {
      [MUSCLES.RHOMBOIDS]: 12,
      [MUSCLES.MIDDLE_TRAPS]: 10,
      [MUSCLES.LATS]: 8,
      [MUSCLES.LOWER_TRAPS]: 6,
      [MUSCLES.REAR_DELTS]: 4,
      [MUSCLES.LONG_HEAD_BICEPS]: 3,
      [MUSCLES.SHORT_HEAD_BICEPS]: 3,
      [MUSCLES.BRACHIALIS]: 2,
    },

    image: "/back/chest-supported-dumbbell-row.webp",
  },

  "seated-cable-row": {
    name: "Seated Cable Row",
    bodyPart: "Back",
    section: "upper-back",
    trackingType: "weight",
    movement: "horizontal-pull",

    primaryMuscles: [
      MUSCLES.RHOMBOIDS,
      MUSCLES.LATS,
    ],

    secondaryMuscles: [
      MUSCLES.MIDDLE_TRAPS,
      MUSCLES.LOWER_TRAPS,
      MUSCLES.REAR_DELTS,
      MUSCLES.LONG_HEAD_BICEPS,
      MUSCLES.SHORT_HEAD_BICEPS,
      MUSCLES.BRACHIALIS,
    ],

    fatigue: {
      [MUSCLES.RHOMBOIDS]: 12,
      [MUSCLES.LATS]: 10,
      [MUSCLES.MIDDLE_TRAPS]: 8,
      [MUSCLES.LOWER_TRAPS]: 6,
      [MUSCLES.REAR_DELTS]: 4,
      [MUSCLES.LONG_HEAD_BICEPS]: 3,
      [MUSCLES.SHORT_HEAD_BICEPS]: 3,
      [MUSCLES.BRACHIALIS]: 2,
    },
    image: "/back/seated-cable-row.webp",
  },

  // =====================
  // LOWER BACK (UI section)
  // =====================

  deadlift: {
    name: "Deadlift",
    bodyPart: "Back",
    section: "lower-back",
    trackingType: "weight" as const,
    movement: "hip-hinge",
    // Hip extension + isometric spinal extension; traps/lats brace the bar path.
    primaryMuscles: [MUSCLES.LOWER_BACK, MUSCLES.GLUTES, MUSCLES.HAMSTRINGS],
    secondaryMuscles: [
      MUSCLES.UPPER_TRAPS,
      MUSCLES.RHOMBOIDS,
      MUSCLES.MIDDLE_TRAPS,
      MUSCLES.LOWER_TRAPS,
      MUSCLES.LATS,
      MUSCLES.FOREARM_FLEXORS,
    ],
    // Legacy total 60 (MID_BACK 6 → Rhomboids / Mid / Lower Traps).
    fatigue: {
      [MUSCLES.LOWER_BACK]: 18,
      [MUSCLES.GLUTES]: 12,
      [MUSCLES.HAMSTRINGS]: 10,
      [MUSCLES.UPPER_TRAPS]: 8,
      [MUSCLES.RHOMBOIDS]: 3,
      [MUSCLES.MIDDLE_TRAPS]: 2,
      [MUSCLES.LOWER_TRAPS]: 1,
      [MUSCLES.LATS]: 4,
      [MUSCLES.FOREARM_FLEXORS]: 2,
    },
  },

  "romanian-deadlift": {
    name: "Romanian Deadlift",
    bodyPart: "Back",
    section: "lower-back",
    trackingType: "weight" as const,
    movement: "hip-hinge",
    // Soft-knee hinge lengthens hamstrings under load; erectors isometric.
    primaryMuscles: [MUSCLES.HAMSTRINGS, MUSCLES.LOWER_BACK, MUSCLES.GLUTES],
    secondaryMuscles: [
      MUSCLES.RHOMBOIDS,
      MUSCLES.MIDDLE_TRAPS,
      MUSCLES.FOREARM_FLEXORS,
    ],
    // Legacy total 40 (MID_BACK 2 → Rhomboids / Middle Traps).
    fatigue: {
      [MUSCLES.HAMSTRINGS]: 14,
      [MUSCLES.LOWER_BACK]: 14,
      [MUSCLES.GLUTES]: 10,
      [MUSCLES.RHOMBOIDS]: 1,
      [MUSCLES.MIDDLE_TRAPS]: 1,
      [MUSCLES.FOREARM_FLEXORS]: 1,
    },
  },

  "back-extension": {
    name: "Back Extension",
    bodyPart: "Back",
    section: "lower-back",
    trackingType: "bodyweight" as const,
    movement: "isolation",
    // Lumbar extension prime; glutes/hamstrings assist via hip extension.
    primaryMuscles: [MUSCLES.LOWER_BACK],
    secondaryMuscles: [MUSCLES.GLUTES, MUSCLES.HAMSTRINGS],
    // Legacy total 32.
    fatigue: {
      [MUSCLES.LOWER_BACK]: 18,
      [MUSCLES.GLUTES]: 8,
      [MUSCLES.HAMSTRINGS]: 6,
    },
  },

  "good-morning": {
    name: "Good Morning",
    bodyPart: "Back",
    section: "lower-back",
    trackingType: "weight" as const,
    movement: "hip-hinge",
    // Bar on back ↑ spinal moment arm + posterior-chain hinge.
    primaryMuscles: [MUSCLES.LOWER_BACK, MUSCLES.HAMSTRINGS],
    secondaryMuscles: [
      MUSCLES.GLUTES,
      MUSCLES.RHOMBOIDS,
      MUSCLES.MIDDLE_TRAPS,
    ],
    // Legacy total 40 (MID_BACK 2 → Rhomboids / Middle Traps).
    fatigue: {
      [MUSCLES.LOWER_BACK]: 16,
      [MUSCLES.HAMSTRINGS]: 14,
      [MUSCLES.GLUTES]: 10,
      [MUSCLES.RHOMBOIDS]: 1,
      [MUSCLES.MIDDLE_TRAPS]: 1,
    },
  },

  "rack-pull": {
    name: "Rack Pull",
    bodyPart: "Back",
    section: "lower-back",
    trackingType: "weight" as const,
    movement: "hip-hinge",
    // Partial DL: heavy lumbar + isometric upper traps; less hamstring stretch.
    primaryMuscles: [MUSCLES.LOWER_BACK, MUSCLES.UPPER_TRAPS],
    secondaryMuscles: [
      MUSCLES.GLUTES,
      MUSCLES.RHOMBOIDS,
      MUSCLES.MIDDLE_TRAPS,
      MUSCLES.LATS,
      MUSCLES.FOREARM_FLEXORS,
    ],
    // Legacy total 42 (MID_BACK 2 → Rhomboids / Middle Traps).
    fatigue: {
      [MUSCLES.LOWER_BACK]: 16,
      [MUSCLES.UPPER_TRAPS]: 10,
      [MUSCLES.GLUTES]: 8,
      [MUSCLES.LATS]: 4,
      [MUSCLES.RHOMBOIDS]: 1,
      [MUSCLES.MIDDLE_TRAPS]: 1,
      [MUSCLES.FOREARM_FLEXORS]: 2,
    },
  },
} as const satisfies Record<string, ExerciseData>;
