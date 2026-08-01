import { MUSCLES } from "./muscles";
import type { ExerciseData } from "./exerciseTypes";

/**
 * Back exercise database — recovery-engine foundation.
 *
 * Fatigue keys use MUSCLES only (never body-region keys like "Upper Back").
 * Sections are UI-only: upper-back | lats | mid-back | lower-back.
 *
 * Fatigue scale (≈3×10 baseline):
 *   Primary 16–18 | Strong secondary 6–10 | Minor 2–5 | Stabilizer 1–3
 *
 * Totals are calibrated to stay ≈ legacy fatigue budgets (± a few points)
 * while redistributing invalid region keys into real muscles.
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
    // Chest pad unloads erectors → scapular retraction (mid-back) is the driver.
    primaryMuscles: [MUSCLES.MID_BACK],
    secondaryMuscles: [
      MUSCLES.LATS,
      MUSCLES.UPPER_TRAPS,
      MUSCLES.LONG_HEAD_BICEPS,
      MUSCLES.SHORT_HEAD_BICEPS,
      MUSCLES.BRACHIALIS,
      MUSCLES.BRACHIORADIALIS,
    ],
    // Legacy total 30 (upperBack 18 → Mid Back + small Upper Traps share).
    fatigue: {
      [MUSCLES.MID_BACK]: 16,
      [MUSCLES.LATS]: 6,
      [MUSCLES.UPPER_TRAPS]: 2,
      [MUSCLES.LONG_HEAD_BICEPS]: 2,
      [MUSCLES.SHORT_HEAD_BICEPS]: 2,
      [MUSCLES.BRACHIALIS]: 1,
      [MUSCLES.BRACHIORADIALIS]: 1,
    },
  },

  "high-row": {
    name: "High Row",
    bodyPart: "Back",
    section: "upper-back",
    trackingType: "weight" as const,
    movement: "horizontal-pull",
    // High-elbow path: upper traps + rear delts share the scapular load.
    primaryMuscles: [MUSCLES.UPPER_TRAPS, MUSCLES.REAR_DELTS],
    secondaryMuscles: [
      MUSCLES.MID_BACK,
      MUSCLES.LATS,
      MUSCLES.LONG_HEAD_BICEPS,
      MUSCLES.SHORT_HEAD_BICEPS,
      MUSCLES.BRACHIALIS,
    ],
    // Legacy total 35 (upperBack 17 + rearDelts 8 + lats 5 + biceps 5).
    fatigue: {
      [MUSCLES.UPPER_TRAPS]: 10,
      [MUSCLES.REAR_DELTS]: 10,
      [MUSCLES.MID_BACK]: 6,
      [MUSCLES.LATS]: 4,
      [MUSCLES.LONG_HEAD_BICEPS]: 2,
      [MUSCLES.SHORT_HEAD_BICEPS]: 2,
      [MUSCLES.BRACHIALIS]: 1,
    },
  },

  "wide-grip-seated-row": {
    name: "Wide Grip Seated Row",
    bodyPart: "Back",
    section: "upper-back",
    trackingType: "weight" as const,
    movement: "horizontal-pull",
    // Wide grip shortens lat moment arm → mid-back / trap retraction dominates.
    primaryMuscles: [MUSCLES.MID_BACK, MUSCLES.UPPER_TRAPS],
    secondaryMuscles: [
      MUSCLES.LATS,
      MUSCLES.REAR_DELTS,
      MUSCLES.LONG_HEAD_BICEPS,
      MUSCLES.SHORT_HEAD_BICEPS,
      MUSCLES.BRACHIALIS,
    ],
    // Legacy total 28 (upperBack 17 + lats 6 + biceps 5).
    fatigue: {
      [MUSCLES.MID_BACK]: 12,
      [MUSCLES.UPPER_TRAPS]: 6,
      [MUSCLES.LATS]: 5,
      [MUSCLES.REAR_DELTS]: 2,
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
      MUSCLES.MID_BACK,
      MUSCLES.UPPER_TRAPS,
      MUSCLES.LONG_HEAD_BICEPS,
      MUSCLES.SHORT_HEAD_BICEPS,
      MUSCLES.BRACHIALIS,
    ],
    // Legacy total 30 (upperBack 16 + rearDelts 10 + biceps 4).
    // Reassigned former upperBack mass toward Rear Delts (biomechanically correct).
    fatigue: {
      [MUSCLES.REAR_DELTS]: 14,
      [MUSCLES.MID_BACK]: 8,
      [MUSCLES.UPPER_TRAPS]: 4,
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
    // Fixed path + support → mid-back retraction with lat assistance.
    primaryMuscles: [MUSCLES.MID_BACK],
    secondaryMuscles: [
      MUSCLES.LATS,
      MUSCLES.UPPER_TRAPS,
      MUSCLES.LONG_HEAD_BICEPS,
      MUSCLES.SHORT_HEAD_BICEPS,
      MUSCLES.BRACHIALIS,
    ],
    // Legacy total 32.
    fatigue: {
      [MUSCLES.MID_BACK]: 16,
      [MUSCLES.LATS]: 7,
      [MUSCLES.UPPER_TRAPS]: 3,
      [MUSCLES.LONG_HEAD_BICEPS]: 2,
      [MUSCLES.SHORT_HEAD_BICEPS]: 2,
      [MUSCLES.BRACHIALIS]: 2,
    },
  },

  "meadows-row": {
    name: "Meadows Row",
    bodyPart: "Back",
    section: "upper-back",
    trackingType: "weight" as const,
    movement: "horizontal-pull",
    // Landmine single-arm: mid-back + lat; braced torso → lower-back stabilizer.
    primaryMuscles: [MUSCLES.MID_BACK, MUSCLES.LATS],
    secondaryMuscles: [
      MUSCLES.REAR_DELTS,
      MUSCLES.UPPER_TRAPS,
      MUSCLES.LOWER_BACK,
      MUSCLES.LONG_HEAD_BICEPS,
      MUSCLES.SHORT_HEAD_BICEPS,
      MUSCLES.BRACHIALIS,
    ],
    // Legacy total 42.
    fatigue: {
      [MUSCLES.MID_BACK]: 14,
      [MUSCLES.LATS]: 8,
      [MUSCLES.REAR_DELTS]: 5,
      [MUSCLES.UPPER_TRAPS]: 4,
      [MUSCLES.LOWER_BACK]: 4,
      [MUSCLES.LONG_HEAD_BICEPS]: 3,
      [MUSCLES.SHORT_HEAD_BICEPS]: 2,
      [MUSCLES.BRACHIALIS]: 2,
    },
  },

  // =====================
  // LATS (UI section)
  // =====================

  "wide-grip-pull-up": {
    name: "Wide Grip Pull Up",
    bodyPart: "Back",
    section: "lats",
    trackingType: "bodyweight" as const,
    movement: "vertical-pull",
    // Frontal-plane shoulder adduction → latissimus primary.
    // Lower traps depress scapulae (replaces generic "upperBack").
    primaryMuscles: [MUSCLES.LATS],
    secondaryMuscles: [
      MUSCLES.LOWER_TRAPS,
      MUSCLES.MID_BACK,
      MUSCLES.UPPER_TRAPS,
      MUSCLES.LONG_HEAD_BICEPS,
      MUSCLES.SHORT_HEAD_BICEPS,
      MUSCLES.BRACHIALIS,
      MUSCLES.BRACHIORADIALIS,
    ],
    // Legacy total 29.
    fatigue: {
      [MUSCLES.LATS]: 18,
      [MUSCLES.LOWER_TRAPS]: 4,
      [MUSCLES.MID_BACK]: 2,
      [MUSCLES.UPPER_TRAPS]: 1,
      [MUSCLES.LONG_HEAD_BICEPS]: 1,
      [MUSCLES.SHORT_HEAD_BICEPS]: 1,
      [MUSCLES.BRACHIALIS]: 1,
      [MUSCLES.BRACHIORADIALIS]: 1,
    },
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
      MUSCLES.MID_BACK,
      MUSCLES.LONG_HEAD_BICEPS,
      MUSCLES.SHORT_HEAD_BICEPS,
      MUSCLES.BRACHIALIS,
    ],
    // Legacy total 27.
    fatigue: {
      [MUSCLES.LATS]: 17,
      [MUSCLES.LOWER_TRAPS]: 4,
      [MUSCLES.MID_BACK]: 2,
      [MUSCLES.LONG_HEAD_BICEPS]: 2,
      [MUSCLES.SHORT_HEAD_BICEPS]: 1,
      [MUSCLES.BRACHIALIS]: 1,
    },
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
      MUSCLES.MID_BACK,
      MUSCLES.BRACHIALIS,
      MUSCLES.LONG_HEAD_BICEPS,
      MUSCLES.SHORT_HEAD_BICEPS,
      MUSCLES.BRACHIORADIALIS,
    ],
    // Legacy total 26.
    fatigue: {
      [MUSCLES.LATS]: 16,
      [MUSCLES.LOWER_TRAPS]: 3,
      [MUSCLES.MID_BACK]: 2,
      [MUSCLES.BRACHIALIS]: 2,
      [MUSCLES.LONG_HEAD_BICEPS]: 1,
      [MUSCLES.SHORT_HEAD_BICEPS]: 1,
      [MUSCLES.BRACHIORADIALIS]: 1,
    },
  },

  "straight-arm-pulldown": {
    name: "Straight Arm Pulldown",
    bodyPart: "Back",
    section: "lats",
    trackingType: "weight" as const,
    movement: "isolation",
    // Locked elbows → shoulder extension isolates the lats.
    primaryMuscles: [MUSCLES.LATS],
    secondaryMuscles: [MUSCLES.LOWER_TRAPS, MUSCLES.REAR_DELTS],
    // Legacy total 20 (lats 18 + upperBack 2 → Lower Traps).
    fatigue: {
      [MUSCLES.LATS]: 18,
      [MUSCLES.LOWER_TRAPS]: 2,
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
      MUSCLES.MID_BACK,
      MUSCLES.OBLIQUES,
      MUSCLES.LONG_HEAD_BICEPS,
      MUSCLES.SHORT_HEAD_BICEPS,
      MUSCLES.BRACHIALIS,
    ],
    // Legacy total 25 (biceps 4 split across heads).
    fatigue: {
      [MUSCLES.LATS]: 17,
      [MUSCLES.LOWER_TRAPS]: 3,
      [MUSCLES.MID_BACK]: 1,
      [MUSCLES.OBLIQUES]: 1,
      [MUSCLES.LONG_HEAD_BICEPS]: 1,
      [MUSCLES.SHORT_HEAD_BICEPS]: 1,
      [MUSCLES.BRACHIALIS]: 1,
    },
  },

  // =====================
  // MID BACK (UI section)
  // =====================

  "barbell-row": {
    name: "Barbell Row",
    bodyPart: "Back",
    section: "mid-back",
    trackingType: "weight" as const,
    movement: "horizontal-pull",
    // Hinged torso: mid-back + lats pull; erectors stabilize isometrically.
    // Legacy double-counted upperBack+midBack — consolidated into Mid Back + Upper Traps.
    primaryMuscles: [MUSCLES.MID_BACK, MUSCLES.LATS],
    secondaryMuscles: [
      MUSCLES.LOWER_BACK,
      MUSCLES.UPPER_TRAPS,
      MUSCLES.REAR_DELTS,
      MUSCLES.LONG_HEAD_BICEPS,
      MUSCLES.SHORT_HEAD_BICEPS,
      MUSCLES.BRACHIALIS,
      MUSCLES.BRACHIORADIALIS,
    ],
    // Legacy total 57.
    fatigue: {
      [MUSCLES.MID_BACK]: 18,
      [MUSCLES.LATS]: 10,
      [MUSCLES.LOWER_BACK]: 8,
      [MUSCLES.UPPER_TRAPS]: 10,
      [MUSCLES.REAR_DELTS]: 3,
      [MUSCLES.LONG_HEAD_BICEPS]: 3,
      [MUSCLES.SHORT_HEAD_BICEPS]: 2,
      [MUSCLES.BRACHIALIS]: 2,
      [MUSCLES.BRACHIORADIALIS]: 1,
    },
  },

  "t-bar-row": {
    name: "T Bar Row",
    bodyPart: "Back",
    section: "mid-back",
    trackingType: "weight" as const,
    movement: "horizontal-pull",
    // Mid-back biased row; less free axial load than a strict barbell row.
    primaryMuscles: [MUSCLES.MID_BACK],
    secondaryMuscles: [
      MUSCLES.LATS,
      MUSCLES.UPPER_TRAPS,
      MUSCLES.LOWER_BACK,
      MUSCLES.LONG_HEAD_BICEPS,
      MUSCLES.SHORT_HEAD_BICEPS,
      MUSCLES.BRACHIALIS,
    ],
    // Legacy total 54 (midBack 18 + upperBack 15 + lats 8 + lowerBack 6 + biceps 7).
    fatigue: {
      [MUSCLES.MID_BACK]: 18,
      [MUSCLES.UPPER_TRAPS]: 12,
      [MUSCLES.LATS]: 8,
      [MUSCLES.LOWER_BACK]: 6,
      [MUSCLES.LONG_HEAD_BICEPS]: 4,
      [MUSCLES.SHORT_HEAD_BICEPS]: 3,
      [MUSCLES.BRACHIALIS]: 3,
    },
  },

  "chest-supported-row": {
    name: "Chest Supported Row",
    bodyPart: "Back",
    section: "mid-back",
    trackingType: "weight" as const,
    movement: "horizontal-pull",
    // Pad removes erector demand → clean mid-back prescription.
    primaryMuscles: [MUSCLES.MID_BACK],
    secondaryMuscles: [
      MUSCLES.UPPER_TRAPS,
      MUSCLES.LATS,
      MUSCLES.REAR_DELTS,
      MUSCLES.LONG_HEAD_BICEPS,
      MUSCLES.SHORT_HEAD_BICEPS,
      MUSCLES.BRACHIALIS,
    ],
    // Legacy total 46 (midBack 18 + upperBack 15 + lats 7 + biceps 6).
    fatigue: {
      [MUSCLES.MID_BACK]: 18,
      [MUSCLES.UPPER_TRAPS]: 12,
      [MUSCLES.LATS]: 7,
      [MUSCLES.REAR_DELTS]: 3,
      [MUSCLES.LONG_HEAD_BICEPS]: 2,
      [MUSCLES.SHORT_HEAD_BICEPS]: 2,
      [MUSCLES.BRACHIALIS]: 2,
    },
  },

  "seated-cable-row": {
    name: "Seated Cable Row",
    bodyPart: "Back",
    section: "mid-back",
    trackingType: "weight" as const,
    movement: "horizontal-pull",
    // Constant tension; mid-back + lat share by elbow path.
    primaryMuscles: [MUSCLES.MID_BACK, MUSCLES.LATS],
    secondaryMuscles: [
      MUSCLES.UPPER_TRAPS,
      MUSCLES.REAR_DELTS,
      MUSCLES.LONG_HEAD_BICEPS,
      MUSCLES.SHORT_HEAD_BICEPS,
      MUSCLES.BRACHIALIS,
    ],
    // Legacy total 45.
    fatigue: {
      [MUSCLES.MID_BACK]: 17,
      [MUSCLES.UPPER_TRAPS]: 10,
      [MUSCLES.LATS]: 8,
      [MUSCLES.REAR_DELTS]: 2,
      [MUSCLES.LONG_HEAD_BICEPS]: 3,
      [MUSCLES.SHORT_HEAD_BICEPS]: 3,
      [MUSCLES.BRACHIALIS]: 2,
    },
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
      MUSCLES.MID_BACK,
      MUSCLES.LATS,
      MUSCLES.FOREARM_FLEXORS,
    ],
    // Legacy total 60 (lowerBack was 20 → capped to primary band at 18).
    fatigue: {
      [MUSCLES.LOWER_BACK]: 18,
      [MUSCLES.GLUTES]: 12,
      [MUSCLES.HAMSTRINGS]: 10,
      [MUSCLES.UPPER_TRAPS]: 8,
      [MUSCLES.MID_BACK]: 6,
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
    secondaryMuscles: [MUSCLES.MID_BACK, MUSCLES.FOREARM_FLEXORS],
    // Legacy total 40.
    fatigue: {
      [MUSCLES.HAMSTRINGS]: 14,
      [MUSCLES.LOWER_BACK]: 14,
      [MUSCLES.GLUTES]: 10,
      [MUSCLES.MID_BACK]: 2,
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
    secondaryMuscles: [MUSCLES.GLUTES, MUSCLES.MID_BACK],
    // Legacy total 40.
    fatigue: {
      [MUSCLES.LOWER_BACK]: 16,
      [MUSCLES.HAMSTRINGS]: 14,
      [MUSCLES.GLUTES]: 10,
      [MUSCLES.MID_BACK]: 2,
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
      MUSCLES.MID_BACK,
      MUSCLES.LATS,
      MUSCLES.FOREARM_FLEXORS,
    ],
    // Legacy total 42 (upperBack 10 → Upper Traps).
    fatigue: {
      [MUSCLES.LOWER_BACK]: 16,
      [MUSCLES.UPPER_TRAPS]: 10,
      [MUSCLES.GLUTES]: 8,
      [MUSCLES.LATS]: 4,
      [MUSCLES.MID_BACK]: 2,
      [MUSCLES.FOREARM_FLEXORS]: 2,
    },
  },
} as const satisfies Record<string, ExerciseData>;
