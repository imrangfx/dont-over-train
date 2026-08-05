import { MUSCLES } from "./muscles";
import type { ExerciseData } from "./exerciseTypes";

/**
 * Abs exercise database — recovery-engine foundation.
 *
 * Fatigue keys use MUSCLES only. Numeric values preserved from legacy.
 * Legacy remaps (same values unless noted):
 *   upperAbs / lowerAbs → Abs (RECTUS_ABDOMINIS); summed when both present
 *   obliques → Obliques
 *   lowerBack → folded into RECTUS_ABDOMINIS or OBLIQUES (only allowed abs muscles)
 *   Legacy hipFlexors / grip entries dropped (not in MUSCLES); remaining values kept as-is.
 * Section is UI-only: upper-abs | lower-abs | obliques | core.
 */
export const abs = {
  // =====================
  // UPPER ABS (UI section)
  // =====================

  "cable-crunch": {
    name: "Cable Crunch",
    bodyPart: "Abs",
    section: "upper-abs",
    trackingType: "weight" as const,
    movement: "core-flexion",
    primaryMuscles: [MUSCLES.RECTUS_ABDOMINIS],
    secondaryMuscles: [],
    fatigue: {
      [MUSCLES.RECTUS_ABDOMINIS]: 18,
    },
  },

  "machine-crunch": {
    name: "Machine Crunch",
    bodyPart: "Abs",
    section: "upper-abs",
    trackingType: "weight" as const,
    movement: "core-flexion",
    primaryMuscles: [MUSCLES.RECTUS_ABDOMINIS],
    secondaryMuscles: [],
    fatigue: {
      [MUSCLES.RECTUS_ABDOMINIS]: 17,
    },
  },

  "decline-sit-up": {
    name: "Decline Sit Up",
    bodyPart: "Abs",
    section: "upper-abs",
    trackingType: "bodyweight" as const,
    movement: "core-flexion",
    primaryMuscles: [MUSCLES.RECTUS_ABDOMINIS],
    secondaryMuscles: [],
    fatigue: {
      [MUSCLES.RECTUS_ABDOMINIS]: 18,
    },
  },

  "stability-ball-crunch": {
    name: "Stability Ball Crunch",
    bodyPart: "Abs",
    section: "upper-abs",
    trackingType: "bodyweight" as const,
    movement: "core-flexion",
    primaryMuscles: [MUSCLES.RECTUS_ABDOMINIS],
    secondaryMuscles: [],
    fatigue: {
      [MUSCLES.RECTUS_ABDOMINIS]: 17,
    },
  },

  "weighted-crunch": {
    name: "Weighted Crunch",
    bodyPart: "Abs",
    section: "upper-abs",
    trackingType: "weight" as const,
    movement: "core-flexion",
    primaryMuscles: [MUSCLES.RECTUS_ABDOMINIS],
    secondaryMuscles: [],
    fatigue: {
      [MUSCLES.RECTUS_ABDOMINIS]: 18,
    },
  },

  crunch: {
    name: "Crunch",
    bodyPart: "Abs",
    section: "upper-abs",
    trackingType: "bodyweight" as const,
    movement: "core-flexion",
    primaryMuscles: [MUSCLES.RECTUS_ABDOMINIS],
    secondaryMuscles: [],
    fatigue: {
      [MUSCLES.RECTUS_ABDOMINIS]: 16,
    },
  },

  "ab-mat-sit-up": {
    name: "Ab Mat Sit Up",
    bodyPart: "Abs",
    section: "upper-abs",
    trackingType: "bodyweight" as const,
    movement: "core-flexion",
    primaryMuscles: [MUSCLES.RECTUS_ABDOMINIS],
    secondaryMuscles: [],
    fatigue: {
      [MUSCLES.RECTUS_ABDOMINIS]: 17,
    },
  },

  "kneeling-rope-crunch": {
    name: "Kneeling Rope Crunch",
    bodyPart: "Abs",
    section: "upper-abs",
    trackingType: "weight" as const,
    movement: "core-flexion",
    primaryMuscles: [MUSCLES.RECTUS_ABDOMINIS],
    secondaryMuscles: [],
    fatigue: {
      [MUSCLES.RECTUS_ABDOMINIS]: 18,
    },
  },

  "medicine-ball-crunch": {
    name: "Medicine Ball Crunch",
    bodyPart: "Abs",
    section: "upper-abs",
    trackingType: "weight" as const,
    movement: "core-flexion",
    primaryMuscles: [MUSCLES.RECTUS_ABDOMINIS],
    secondaryMuscles: [],
    fatigue: {
      [MUSCLES.RECTUS_ABDOMINIS]: 17,
    },
  },

  // =====================
  // LOWER ABS (UI section)
  // =====================

  "hanging-leg-raise": {
    name: "Hanging Leg Raise",
    bodyPart: "Abs",
    section: "lower-abs",
    trackingType: "bodyweight" as const,
    movement: "core-flexion",
    primaryMuscles: [MUSCLES.RECTUS_ABDOMINIS],
    secondaryMuscles: [],
    fatigue: {
      [MUSCLES.RECTUS_ABDOMINIS]: 18,
    },
  },

  "captains-chair-leg-raise": {
    name: "Captain's Chair Leg Raise",
    bodyPart: "Abs",
    section: "lower-abs",
    trackingType: "bodyweight" as const,
    movement: "core-flexion",
    primaryMuscles: [MUSCLES.RECTUS_ABDOMINIS],
    secondaryMuscles: [],
    fatigue: {
      [MUSCLES.RECTUS_ABDOMINIS]: 17,
    },
  },

  "reverse-crunch": {
    name: "Reverse Crunch",
    bodyPart: "Abs",
    section: "lower-abs",
    trackingType: "bodyweight" as const,
    movement: "core-flexion",
    primaryMuscles: [MUSCLES.RECTUS_ABDOMINIS],
    secondaryMuscles: [],
    fatigue: {
      [MUSCLES.RECTUS_ABDOMINIS]: 17,
    },
  },

  "lying-leg-raise": {
    name: "Lying Leg Raise",
    bodyPart: "Abs",
    section: "lower-abs",
    trackingType: "bodyweight" as const,
    movement: "core-flexion",
    primaryMuscles: [MUSCLES.RECTUS_ABDOMINIS],
    secondaryMuscles: [],
    fatigue: {
      [MUSCLES.RECTUS_ABDOMINIS]: 17,
    },
  },

  "garhammer-raise": {
    name: "Garhammer Raise",
    bodyPart: "Abs",
    section: "lower-abs",
    trackingType: "bodyweight" as const,
    movement: "core-flexion",
    primaryMuscles: [MUSCLES.RECTUS_ABDOMINIS],
    secondaryMuscles: [],
    fatigue: {
      [MUSCLES.RECTUS_ABDOMINIS]: 18,
    },
  },

  "flutter-kicks": {
    name: "Flutter Kicks",
    bodyPart: "Abs",
    section: "lower-abs",
    trackingType: "bodyweight" as const,
    movement: "core-flexion",
    primaryMuscles: [MUSCLES.RECTUS_ABDOMINIS],
    secondaryMuscles: [],
    fatigue: {
      [MUSCLES.RECTUS_ABDOMINIS]: 16,
    },
  },

  "scissor-kicks": {
    name: "Scissor Kicks",
    bodyPart: "Abs",
    section: "lower-abs",
    trackingType: "bodyweight" as const,
    movement: "core-flexion",
    primaryMuscles: [MUSCLES.RECTUS_ABDOMINIS],
    secondaryMuscles: [],
    fatigue: {
      [MUSCLES.RECTUS_ABDOMINIS]: 16,
    },
  },

  "toes-to-bar": {
    name: "Toes To Bar",
    bodyPart: "Abs",
    section: "lower-abs",
    trackingType: "bodyweight" as const,
    movement: "core-flexion",
    primaryMuscles: [MUSCLES.RECTUS_ABDOMINIS],
    secondaryMuscles: [],
    fatigue: {
      [MUSCLES.RECTUS_ABDOMINIS]: 19,
    },
  },

  "bench-leg-raise": {
    name: "Bench Leg Raise",
    bodyPart: "Abs",
    section: "lower-abs",
    trackingType: "bodyweight" as const,
    movement: "core-flexion",
    primaryMuscles: [MUSCLES.RECTUS_ABDOMINIS],
    secondaryMuscles: [],
    fatigue: {
      [MUSCLES.RECTUS_ABDOMINIS]: 17,
    },
  },

  "frog-crunch": {
    name: "Frog Crunch",
    bodyPart: "Abs",
    section: "lower-abs",
    trackingType: "bodyweight" as const,
    movement: "core-flexion",
    primaryMuscles: [MUSCLES.RECTUS_ABDOMINIS],
    secondaryMuscles: [],
    fatigue: {
      [MUSCLES.RECTUS_ABDOMINIS]: 16,
    },
  },

  // =====================
  // OBLIQUES (UI section)
  // =====================

  "russian-twist": {
    name: "Russian Twist",
    bodyPart: "Abs",
    section: "obliques",
    trackingType: "bodyweight" as const,
    movement: "core-rotation",
    primaryMuscles: [MUSCLES.OBLIQUES],
    secondaryMuscles: [MUSCLES.RECTUS_ABDOMINIS],
    fatigue: {
      [MUSCLES.OBLIQUES]: 18,
      [MUSCLES.RECTUS_ABDOMINIS]: 6,
    },
  },

  "cable-woodchopper": {
    name: "Cable Woodchopper",
    bodyPart: "Abs",
    section: "obliques",
    trackingType: "weight" as const,
    movement: "core-rotation",
    primaryMuscles: [MUSCLES.OBLIQUES],
    secondaryMuscles: [MUSCLES.RECTUS_ABDOMINIS],
    fatigue: {
      [MUSCLES.OBLIQUES]: 19,
      [MUSCLES.RECTUS_ABDOMINIS]: 5,
    },
  },

  "landmine-rotation": {
    name: "Landmine Rotation",
    bodyPart: "Abs",
    section: "obliques",
    trackingType: "weight" as const,
    movement: "core-rotation",
    primaryMuscles: [MUSCLES.OBLIQUES],
    secondaryMuscles: [MUSCLES.RECTUS_ABDOMINIS],
    fatigue: {
      [MUSCLES.OBLIQUES]: 18,
      [MUSCLES.RECTUS_ABDOMINIS]: 4,
    },
  },

  "dumbbell-side-bend": {
    name: "Dumbbell Side Bend",
    bodyPart: "Abs",
    section: "obliques",
    trackingType: "weight" as const,
    movement: "core-stability",
    primaryMuscles: [MUSCLES.OBLIQUES],
    secondaryMuscles: [],
    fatigue: {
      [MUSCLES.OBLIQUES]: 17,
    },
  },

  "oblique-crunch": {
    name: "Oblique Crunch",
    bodyPart: "Abs",
    section: "obliques",
    trackingType: "bodyweight" as const,
    movement: "core-rotation",
    primaryMuscles: [MUSCLES.OBLIQUES],
    secondaryMuscles: [MUSCLES.RECTUS_ABDOMINIS],
    fatigue: {
      [MUSCLES.OBLIQUES]: 17,
      [MUSCLES.RECTUS_ABDOMINIS]: 4,
    },
  },

  "cross-body-mountain-climber": {
    name: "Cross Body Mountain Climber",
    bodyPart: "Abs",
    section: "obliques",
    trackingType: "bodyweight" as const,
    movement: "core-rotation",
    primaryMuscles: [MUSCLES.OBLIQUES],
    secondaryMuscles: [MUSCLES.RECTUS_ABDOMINIS],
    fatigue: {
      [MUSCLES.OBLIQUES]: 16,
      [MUSCLES.RECTUS_ABDOMINIS]: 5,
    },
  },

  "windshield-wiper": {
    name: "Windshield Wiper",
    bodyPart: "Abs",
    section: "obliques",
    trackingType: "bodyweight" as const,
    movement: "core-rotation",
    primaryMuscles: [MUSCLES.OBLIQUES],
    secondaryMuscles: [MUSCLES.RECTUS_ABDOMINIS],
    fatigue: {
      [MUSCLES.OBLIQUES]: 19,
      [MUSCLES.RECTUS_ABDOMINIS]: 7,
    },
  },

  "standing-cable-twist": {
    name: "Standing Cable Twist",
    bodyPart: "Abs",
    section: "obliques",
    trackingType: "weight" as const,
    movement: "core-rotation",
    primaryMuscles: [MUSCLES.OBLIQUES],
    secondaryMuscles: [],
    fatigue: {
      [MUSCLES.OBLIQUES]: 17,
    },
  },

  "bicycle-crunch": {
    name: "Bicycle Crunch",
    bodyPart: "Abs",
    section: "obliques",
    trackingType: "bodyweight" as const,
    movement: "core-rotation",
    primaryMuscles: [MUSCLES.OBLIQUES],
    secondaryMuscles: [MUSCLES.RECTUS_ABDOMINIS],
    fatigue: {
      [MUSCLES.OBLIQUES]: 17,
      [MUSCLES.RECTUS_ABDOMINIS]: 5,
    },
  },

  // =====================
  // CORE (UI section)
  // =====================

  plank: {
    name: "Plank",
    bodyPart: "Abs",
    section: "core",
    trackingType: "duration" as const,
    movement: "core-stability",
    primaryMuscles: [MUSCLES.RECTUS_ABDOMINIS],
    secondaryMuscles: [MUSCLES.OBLIQUES],
    // Legacy upperAbs 10 + lowerAbs 8 → RECTUS 18; lowerBack 6 folded into RECTUS (total 32).
    fatigue: {
      [MUSCLES.RECTUS_ABDOMINIS]: 24,
      [MUSCLES.OBLIQUES]: 8,
    },
  },

  "ab-wheel-rollout": {
  name: "Ab Wheel Rollout",
  bodyPart: "Abs",
  section: "core",
  trackingType: "bodyweight" as const,
  movement: "core-stability",

  primaryMuscles: [
    MUSCLES.RECTUS_ABDOMINIS,
  ],

  secondaryMuscles: [
    MUSCLES.OBLIQUES,
  ],

  fatigue: {
    [MUSCLES.RECTUS_ABDOMINIS]: 20,
    [MUSCLES.OBLIQUES]: 6,
  },
},

"dragon-flag": {
  name: "Dragon Flag",
  bodyPart: "Abs",
  section: "core",
  trackingType: "bodyweight" as const,
  movement: "core-stability",

  primaryMuscles: [
    MUSCLES.RECTUS_ABDOMINIS,
  ],

  secondaryMuscles: [
    MUSCLES.OBLIQUES,
  ],

  fatigue: {
    [MUSCLES.RECTUS_ABDOMINIS]: 22,
    [MUSCLES.OBLIQUES]: 6,
  },
},

"hollow-body-hold": {
  name: "Hollow Body Hold",
  bodyPart: "Abs",
  section: "core",
  trackingType: "duration" as const,
  movement: "core-stability",

  primaryMuscles: [
    MUSCLES.RECTUS_ABDOMINIS,
  ],

  secondaryMuscles: [
    MUSCLES.OBLIQUES,
  ],

  fatigue: {
    [MUSCLES.RECTUS_ABDOMINIS]: 18,
    [MUSCLES.OBLIQUES]: 6,
  },
},

"pallof-press": {
  name: "Pallof Press",
  bodyPart: "Abs",
  section: "core",
  trackingType: "weight" as const,
  movement: "core-stability",

  primaryMuscles: [
    MUSCLES.OBLIQUES,
  ],

  secondaryMuscles: [
    MUSCLES.RECTUS_ABDOMINIS,
  ],

  fatigue: {
    [MUSCLES.OBLIQUES]: 18,
    [MUSCLES.RECTUS_ABDOMINIS]: 6,
  },
},

  "side-plank": {
    name: "Side Plank",
    bodyPart: "Abs",
    section: "core",
    trackingType: "duration" as const,
    movement: "core-stability",
    primaryMuscles: [MUSCLES.OBLIQUES],
    secondaryMuscles: [
      MUSCLES.RECTUS_ABDOMINIS,
    ],
    // Legacy upperAbs 4 + lowerBack 4 → RECTUS 8; OBLIQUES stays 16 (total 24).
    // RECTUS in fatigue for value preservation; not listed in secondary per rules.
    fatigue: {
      [MUSCLES.OBLIQUES]: 16,
      [MUSCLES.RECTUS_ABDOMINIS]: 8,
    },
  },
} as const satisfies Record<string, ExerciseData>;
