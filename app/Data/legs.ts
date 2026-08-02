import { MUSCLES } from "./muscles";
import type { ExerciseData } from "./exerciseTypes";

/**
 * Legs exercise database — recovery-engine foundation.
 *
 * Fatigue keys use MUSCLES only. Numeric values preserved from legacy.
 * Legacy remaps (same values):
 *   quads → Quads, glutes → Glutes, hamstrings → Hamstrings, calves → Calves
 *   lowerBack → Lower Back
 *   core: 6 → Abs 4 + Obliques 2; core: 5 → Abs 3 + Obliques 2
 * Section is UI-only: quads | hamstrings | glutes | calves.
 */
export const legs = {
  // =====================
  // QUADS (UI section)
  // =====================

  "barbell-back-squat": {
    name: "Barbell Back Squat",
    bodyPart: "Legs",
    section: "quads",
    trackingType: "weight" as const,
    movement: "squat",
    primaryMuscles: [MUSCLES.QUADS],
    secondaryMuscles: [MUSCLES.GLUTES, MUSCLES.HAMSTRINGS],
    fatigue: {
      [MUSCLES.QUADS]: 20,
      [MUSCLES.GLUTES]: 10,
      [MUSCLES.HAMSTRINGS]: 6,
    },
  },

  "belt-squat": {
    name: "Belt Squat",
    bodyPart: "Legs",
    section: "quads",
    trackingType: "weight",
    movement: "squat",

    primaryMuscles: [
      MUSCLES.QUADS,
    ],

    secondaryMuscles: [
      MUSCLES.GLUTES,
      MUSCLES.HAMSTRINGS,
    ],

    fatigue: {
      [MUSCLES.QUADS]: 19,
      [MUSCLES.GLUTES]: 8,
      [MUSCLES.HAMSTRINGS]: 5,
    },

    image: "/legs/belt-squat.webp",
  },

  "pendulum-squat": {
    name: "Pendulum Squat",
    bodyPart: "Legs",
    section: "quads",
    trackingType: "weight",
    movement: "squat",

    primaryMuscles: [
      MUSCLES.QUADS,
    ],

    secondaryMuscles: [
      MUSCLES.GLUTES,
    ],

    fatigue: {
      [MUSCLES.QUADS]: 20,
      [MUSCLES.GLUTES]: 7,
    },

    image: "/legs/pendulum-squat.webp",
  },

  "single-leg-romanian-deadlift": {
    name: "Single Leg Romanian Deadlift",
    bodyPart: "Legs",
    section: "hamstrings",
    trackingType: "weight",
    movement: "hip-hinge",

    primaryMuscles: [
      MUSCLES.HAMSTRINGS,
    ],

    secondaryMuscles: [
      MUSCLES.GLUTES,
      MUSCLES.LOWER_BACK,
    ],

    fatigue: {
      [MUSCLES.HAMSTRINGS]: 17,
      [MUSCLES.GLUTES]: 9,
      [MUSCLES.LOWER_BACK]: 5,
    },

    image: "/legs/single-leg-romanian-deadlift.webp",
  },

  "leg-press": {
    name: "Leg Press",
    bodyPart: "Legs",
    section: "quads",
    trackingType: "weight" as const,
    movement: "squat",
    primaryMuscles: [MUSCLES.QUADS],
    secondaryMuscles: [MUSCLES.GLUTES, MUSCLES.HAMSTRINGS],
    fatigue: {
      [MUSCLES.QUADS]: 19,
      [MUSCLES.GLUTES]: 8,
      [MUSCLES.HAMSTRINGS]: 5,
    },
  },

  "hack-squat": {
    name: "Hack Squat",
    bodyPart: "Legs",
    section: "quads",
    trackingType: "weight" as const,
    movement: "squat",
    primaryMuscles: [MUSCLES.QUADS],
    secondaryMuscles: [MUSCLES.GLUTES],
    fatigue: {
      [MUSCLES.QUADS]: 19,
      [MUSCLES.GLUTES]: 6,
    },
  },

  "leg-extension": {
    name: "Leg Extension",
    bodyPart: "Legs",
    section: "quads",
    trackingType: "weight" as const,
    movement: "isolation",
    primaryMuscles: [MUSCLES.QUADS],
    secondaryMuscles: [],
    fatigue: {
      [MUSCLES.QUADS]: 18,
    },
  },

  "bulgarian-split-squat": {
    name: "Bulgarian Split Squat",
    bodyPart: "Legs",
    section: "quads",
    trackingType: "weight" as const,
    movement: "lunge",
    primaryMuscles: [MUSCLES.QUADS],
    secondaryMuscles: [MUSCLES.GLUTES, MUSCLES.HAMSTRINGS, MUSCLES.ADDUCTORS],
    // ADDUCTORS listed in secondary metadata only (no fatigue invent).
    fatigue: {
      [MUSCLES.QUADS]: 18,
      [MUSCLES.GLUTES]: 10,
      [MUSCLES.HAMSTRINGS]: 5,
    },
  },

  "front-squat": {
    name: "Front Squat",
    bodyPart: "Legs",
    section: "quads",
    trackingType: "weight" as const,
    movement: "squat",
    primaryMuscles: [MUSCLES.QUADS],
    secondaryMuscles: [
      MUSCLES.GLUTES,
      MUSCLES.RECTUS_ABDOMINIS,
      MUSCLES.OBLIQUES,
    ],
    // Legacy core: 6 → Abs 4 + Obliques 2.
    fatigue: {
      [MUSCLES.QUADS]: 20,
      [MUSCLES.GLUTES]: 8,
      [MUSCLES.RECTUS_ABDOMINIS]: 4,
      [MUSCLES.OBLIQUES]: 2,
    },
  },

  "smith-machine-squat": {
    name: "Smith Machine Squat",
    bodyPart: "Legs",
    section: "quads",
    trackingType: "weight" as const,
    movement: "squat",
    primaryMuscles: [MUSCLES.QUADS],
    secondaryMuscles: [MUSCLES.GLUTES],
    fatigue: {
      [MUSCLES.QUADS]: 18,
      [MUSCLES.GLUTES]: 7,
    },
  },

  "walking-lunge": {
    name: "Walking Lunge",
    bodyPart: "Legs",
    section: "quads",
    trackingType: "weight" as const,
    movement: "lunge",
    primaryMuscles: [MUSCLES.QUADS],
    secondaryMuscles: [MUSCLES.GLUTES, MUSCLES.HAMSTRINGS],
    fatigue: {
      [MUSCLES.QUADS]: 17,
      [MUSCLES.GLUTES]: 9,
      [MUSCLES.HAMSTRINGS]: 5,
    },
  },

  "goblet-squat": {
    name: "Goblet Squat",
    bodyPart: "Legs",
    section: "quads",
    trackingType: "weight" as const,
    movement: "squat",
    primaryMuscles: [MUSCLES.QUADS],
    secondaryMuscles: [
      MUSCLES.GLUTES,
      MUSCLES.RECTUS_ABDOMINIS,
      MUSCLES.OBLIQUES,
    ],
    // Legacy core: 6 → Abs 4 + Obliques 2.
    fatigue: {
      [MUSCLES.QUADS]: 17,
      [MUSCLES.GLUTES]: 7,
      [MUSCLES.RECTUS_ABDOMINIS]: 4,
      [MUSCLES.OBLIQUES]: 2,
    },
  },

  "sissy-squat": {
    name: "Sissy Squat",
    bodyPart: "Legs",
    section: "quads",
    trackingType: "bodyweight" as const,
    movement: "squat",
    primaryMuscles: [MUSCLES.QUADS],
    secondaryMuscles: [],
    fatigue: {
      [MUSCLES.QUADS]: 18,
    },
  },

  // =====================
  // HAMSTRINGS (UI section)
  // =====================

  "romanian-deadlift": {
    name: "Romanian Deadlift",
    bodyPart: "Legs",
    section: "hamstrings",
    trackingType: "weight" as const,
    movement: "hip-hinge",
    primaryMuscles: [MUSCLES.HAMSTRINGS],
    secondaryMuscles: [MUSCLES.GLUTES, MUSCLES.LOWER_BACK],
    fatigue: {
      [MUSCLES.HAMSTRINGS]: 18,
      [MUSCLES.GLUTES]: 10,
      [MUSCLES.LOWER_BACK]: 6,
    },
  },

  "stiff-leg-deadlift": {
    name: "Stiff Leg Deadlift",
    bodyPart: "Legs",
    section: "hamstrings",
    trackingType: "weight" as const,
    movement: "hip-hinge",
    primaryMuscles: [MUSCLES.HAMSTRINGS],
    secondaryMuscles: [MUSCLES.GLUTES, MUSCLES.LOWER_BACK],
    fatigue: {
      [MUSCLES.HAMSTRINGS]: 18,
      [MUSCLES.GLUTES]: 8,
      [MUSCLES.LOWER_BACK]: 7,
    },
  },

  "lying-leg-curl": {
    name: "Lying Leg Curl",
    bodyPart: "Legs",
    section: "hamstrings",
    trackingType: "weight" as const,
    movement: "isolation",
    primaryMuscles: [MUSCLES.HAMSTRINGS],
    secondaryMuscles: [],
    fatigue: {
      [MUSCLES.HAMSTRINGS]: 18,
    },
  },

  "seated-leg-curl": {
    name: "Seated Leg Curl",
    bodyPart: "Legs",
    section: "hamstrings",
    trackingType: "weight" as const,
    movement: "isolation",
    primaryMuscles: [MUSCLES.HAMSTRINGS],
    secondaryMuscles: [],
    fatigue: {
      [MUSCLES.HAMSTRINGS]: 17,
    },
  },

  "single-leg-curl": {
    name: "Single Leg Curl",
    bodyPart: "Legs",
    section: "hamstrings",
    trackingType: "weight" as const,
    movement: "isolation",
    primaryMuscles: [MUSCLES.HAMSTRINGS],
    secondaryMuscles: [],
    fatigue: {
      [MUSCLES.HAMSTRINGS]: 17,
    },
  },

  "good-morning": {
    name: "Good Morning",
    bodyPart: "Legs",
    section: "hamstrings",
    trackingType: "weight" as const,
    movement: "hip-hinge",
    primaryMuscles: [MUSCLES.HAMSTRINGS],
    secondaryMuscles: [MUSCLES.GLUTES, MUSCLES.LOWER_BACK],
    fatigue: {
      [MUSCLES.HAMSTRINGS]: 16,
      [MUSCLES.GLUTES]: 8,
      [MUSCLES.LOWER_BACK]: 8,
    },
  },

  "glute-ham-raise": {
    name: "Glute Ham Raise",
    bodyPart: "Legs",
    section: "hamstrings",
    trackingType: "bodyweight" as const,
    movement: "isolation",
    primaryMuscles: [MUSCLES.HAMSTRINGS],
    secondaryMuscles: [MUSCLES.GLUTES],
    fatigue: {
      [MUSCLES.HAMSTRINGS]: 18,
      [MUSCLES.GLUTES]: 6,
    },
  },

  "nordic-curl": {
    name: "Nordic Curl",
    bodyPart: "Legs",
    section: "hamstrings",
    trackingType: "bodyweight" as const,
    movement: "isolation",
    primaryMuscles: [MUSCLES.HAMSTRINGS],
    secondaryMuscles: [],
    fatigue: {
      [MUSCLES.HAMSTRINGS]: 20,
    },
  },

  "cable-leg-curl": {
    name: "Cable Leg Curl",
    bodyPart: "Legs",
    section: "hamstrings",
    trackingType: "weight" as const,
    movement: "isolation",
    primaryMuscles: [MUSCLES.HAMSTRINGS],
    secondaryMuscles: [],
    fatigue: {
      [MUSCLES.HAMSTRINGS]: 16,
    },
  },

  "band-leg-curl": {
    name: "Band Leg Curl",
    bodyPart: "Legs",
    section: "hamstrings",
    trackingType: "weight" as const,
    movement: "isolation",
    primaryMuscles: [MUSCLES.HAMSTRINGS],
    secondaryMuscles: [],
    fatigue: {
      [MUSCLES.HAMSTRINGS]: 15,
    },
  },

  // =====================
  // GLUTES (UI section)
  // =====================

  "barbell-hip-thrust": {
    name: "Barbell Hip Thrust",
    bodyPart: "Legs",
    section: "glutes",
    trackingType: "weight" as const,
    movement: "isolation",
    primaryMuscles: [MUSCLES.GLUTES],
    secondaryMuscles: [MUSCLES.HAMSTRINGS],
    fatigue: {
      [MUSCLES.GLUTES]: 20,
      [MUSCLES.HAMSTRINGS]: 6,
    },
  },

  "hip-abduction-machine": {
    name: "Hip Abduction Machine",
    bodyPart: "Legs",
    section: "glutes",
    trackingType: "weight",
    movement: "isolation",

    primaryMuscles: [
      MUSCLES.ABDUCTORS,
      MUSCLES.GLUTES,
    ],

    secondaryMuscles: [],

    fatigue: {
      [MUSCLES.ABDUCTORS]: 14,
      [MUSCLES.GLUTES]: 8,
    },

    image: "/legs/hip-abduction-machine.webp",
  },

  "glute-bridge": {
    name: "Glute Bridge",
    bodyPart: "Legs",
    section: "glutes",
    trackingType: "bodyweight" as const,
    movement: "isolation",
    primaryMuscles: [MUSCLES.GLUTES],
    secondaryMuscles: [],
    fatigue: {
      [MUSCLES.GLUTES]: 17,
    },
  },

  "cable-kickback": {
    name: "Cable Kickback",
    bodyPart: "Legs",
    section: "glutes",
    trackingType: "weight" as const,
    movement: "isolation",
    primaryMuscles: [MUSCLES.GLUTES],
    secondaryMuscles: [],
    fatigue: {
      [MUSCLES.GLUTES]: 18,
    },
  },

  "smith-hip-thrust": {
    name: "Smith Hip Thrust",
    bodyPart: "Legs",
    section: "glutes",
    trackingType: "weight" as const,
    movement: "isolation",
    primaryMuscles: [MUSCLES.GLUTES],
    secondaryMuscles: [MUSCLES.HAMSTRINGS],
    // HAMSTRINGS in secondary metadata only (no fatigue invent).
    fatigue: {
      [MUSCLES.GLUTES]: 19,
    },
  },

  "frog-pump": {
    name: "Frog Pump",
    bodyPart: "Legs",
    section: "glutes",
    trackingType: "bodyweight" as const,
    movement: "isolation",
    primaryMuscles: [MUSCLES.GLUTES],
    secondaryMuscles: [],
    fatigue: {
      [MUSCLES.GLUTES]: 16,
    },
  },

  "sumo-deadlift": {
    name: "Sumo Deadlift",
    bodyPart: "Legs",
    section: "glutes",
    trackingType: "weight" as const,
    movement: "hip-hinge",
    primaryMuscles: [MUSCLES.GLUTES],
    secondaryMuscles: [MUSCLES.HAMSTRINGS, MUSCLES.LOWER_BACK],
    fatigue: {
      [MUSCLES.GLUTES]: 18,
      [MUSCLES.HAMSTRINGS]: 8,
      [MUSCLES.LOWER_BACK]: 6,
    },
  },

  "single-leg-hip-thrust": {
    name: "Single Leg Hip Thrust",
    bodyPart: "Legs",
    section: "glutes",
    trackingType: "weight" as const,
    movement: "isolation",
    primaryMuscles: [MUSCLES.GLUTES],
    secondaryMuscles: [MUSCLES.HAMSTRINGS],
    // HAMSTRINGS in secondary metadata only (no fatigue invent).
    fatigue: {
      [MUSCLES.GLUTES]: 18,
    },
  },

  "glute-machine-kickback": {
    name: "Glute Machine Kickback",
    bodyPart: "Legs",
    section: "glutes",
    trackingType: "weight" as const,
    movement: "isolation",
    primaryMuscles: [MUSCLES.GLUTES],
    secondaryMuscles: [],
    fatigue: {
      [MUSCLES.GLUTES]: 17,
    },
  },

  "reverse-lunge": {
    name: "Reverse Lunge",
    bodyPart: "Legs",
    section: "glutes",
    trackingType: "weight" as const,
    movement: "lunge",
    primaryMuscles: [MUSCLES.GLUTES],
    secondaryMuscles: [MUSCLES.QUADS],
    fatigue: {
      [MUSCLES.GLUTES]: 17,
      [MUSCLES.QUADS]: 8,
    },
  },

  "curtsy-lunge": {
    name: "Curtsy Lunge",
    bodyPart: "Legs",
    section: "glutes",
    trackingType: "weight" as const,
    movement: "lunge",
    primaryMuscles: [MUSCLES.GLUTES],
    secondaryMuscles: [MUSCLES.ADDUCTORS, MUSCLES.ABDUCTORS],
    // ADDUCTORS / ABDUCTORS in secondary metadata only (no fatigue invent).
    fatigue: {
      [MUSCLES.GLUTES]: 16,
    },
  },

  // =====================
  // CALVES (UI section)
  // =====================

  "standing-calf-raise": {
    name: "Standing Calf Raise",
    bodyPart: "Legs",
    section: "calves",
    trackingType: "weight" as const,
    movement: "calf-raise",
    primaryMuscles: [MUSCLES.CALVES],
    secondaryMuscles: [],
    fatigue: {
      [MUSCLES.CALVES]: 18,
    },
  },

  "seated-calf-raise": {
    name: "Seated Calf Raise",
    bodyPart: "Legs",
    section: "calves",
    trackingType: "weight" as const,
    movement: "calf-raise",
    primaryMuscles: [MUSCLES.CALVES],
    secondaryMuscles: [],
    fatigue: {
      [MUSCLES.CALVES]: 18,
    },
  },

  "leg-press-calf-raise": {
    name: "Leg Press Calf Raise",
    bodyPart: "Legs",
    section: "calves",
    trackingType: "weight" as const,
    movement: "calf-raise",
    primaryMuscles: [MUSCLES.CALVES],
    secondaryMuscles: [],
    fatigue: {
      [MUSCLES.CALVES]: 17,
    },
  },

  "smith-calf-raise": {
    name: "Smith Calf Raise",
    bodyPart: "Legs",
    section: "calves",
    trackingType: "weight" as const,
    movement: "calf-raise",
    primaryMuscles: [MUSCLES.CALVES],
    secondaryMuscles: [],
    fatigue: {
      [MUSCLES.CALVES]: 17,
    },
  },

  "single-leg-calf-raise": {
    name: "Single Leg Calf Raise",
    bodyPart: "Legs",
    section: "calves",
    trackingType: "bodyweight" as const,
    movement: "calf-raise",
    primaryMuscles: [MUSCLES.CALVES],
    secondaryMuscles: [],
    fatigue: {
      [MUSCLES.CALVES]: 17,
    },
  },

  "donkey-calf-raise": {
    name: "Donkey Calf Raise",
    bodyPart: "Legs",
    section: "calves",
    trackingType: "weight" as const,
    movement: "calf-raise",
    primaryMuscles: [MUSCLES.CALVES],
    secondaryMuscles: [],
    fatigue: {
      [MUSCLES.CALVES]: 18,
    },
  },

  "machine-calf-raise": {
    name: "Machine Calf Raise",
    bodyPart: "Legs",
    section: "calves",
    trackingType: "weight" as const,
    movement: "calf-raise",
    primaryMuscles: [MUSCLES.CALVES],
    secondaryMuscles: [],
    fatigue: {
      [MUSCLES.CALVES]: 17,
    },
  },

  "jump-rope": {
    name: "Jump Rope",
    bodyPart: "Legs",
    section: "calves",
    trackingType: "bodyweight" as const,
    movement: "calf-raise",
    primaryMuscles: [MUSCLES.CALVES],
    secondaryMuscles: [],
    fatigue: {
      [MUSCLES.CALVES]: 14,
    },
  },

  "farmer-walk-on-toes": {
    name: "Farmer Walk On Toes",
    bodyPart: "Legs",
    section: "calves",
    trackingType: "weight" as const,
    movement: "calf-raise",
    primaryMuscles: [MUSCLES.CALVES],
    secondaryMuscles: [],
    fatigue: {
      [MUSCLES.CALVES]: 15,
    },
  },

  "bodyweight-calf-raise": {
    name: "Bodyweight Calf Raise",
    bodyPart: "Legs",
    section: "calves",
    trackingType: "bodyweight" as const,
    movement: "calf-raise",
    primaryMuscles: [MUSCLES.CALVES],
    secondaryMuscles: [],
    fatigue: {
      [MUSCLES.CALVES]: 15,
    },
  },
} as const satisfies Record<string, ExerciseData>;
