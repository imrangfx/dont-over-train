/**
 * Exercise tutorial registry — presentation media only.
 *
 * Kept separate from muscle / fatigue catalogs so recovery data stays focused
 * and tutorials can grow to 500+ entries without bloating every Data/*.ts file.
 *
 * Naming:
 * - Keys MUST match exercise object keys (kebab-case slugs) in the catalogs.
 * - Prefer `youtubeId` for production scale.
 * - Use `src` for self-hosted files under `public/exercises/tutorials/`.
 *
 * Lookup order (see getExerciseTutorial):
 * 1. Sidecar entry here
 * 2. Inline `exercise.tutorial` override passed by the caller
 */

import type { ExerciseTutorial } from "./exerciseTypes";

/**
 * Slug → tutorial map. Add entries as videos become available.
 * Example:
 *   "barbell-row": { youtubeId: "dQw4w9WgXcQ" },
 *   "cable-crunch": { src: "/exercises/tutorials/cable-crunch.mp4" },
 */
export const EXERCISE_TUTORIALS: Readonly<
  Partial<Record<string, ExerciseTutorial>>
> = {

  "decline-push-up": {
    youtubeId: "QuaOc1mFcqs",
  },

  "incline-push-up": {
    youtubeId: "Me9bHFAxnCs",
  },

  "incline-dumbbell-press": {
    youtubeId: "IP4oeKh1Sd4",
  },

  "incline-barbell-press": {
    youtubeId: "SrqOu55lrYU",
  },

  "incline-smith-press": {
    youtubeId: "8urE8Z8AMQ4",
  },

  "low-to-high-cable-crossover": {
    youtubeId: "wnFEC_34Bls",
  },

  "incline-hammer-press": {
    youtubeId: "iVfAejapZ5c",
  },

  "incline-machine-press": {
    youtubeId: "VesHgJR14E8",
  },

  "incline-cable-fly": {
    youtubeId: "GwpA8-VcEk8",
  },

  // =========================
  // MID CHEST
  // =========================

  "push-up": {
    youtubeId: "WDIpL0pjun0",
  },

  "wide-push-up": {
    youtubeId: "EsIdzx1J0iA",
  },

  "machine-chest-press": {
    youtubeId: "n8TOta_pfr4",
  },

  "dumbbell-hex-press": {
    youtubeId: "MjOeSCRwAQY",
  },

  "cable-press": {
    youtubeId: "A3RepyBbWVI",
  },

  "dumbbell-bench-press": {
    youtubeId: "YQ2s_Y7g5Qk",
  },

  "barbell-bench-press": {
    youtubeId: "4Y2ZdHCOXok",
  },

  "hammer-strength-press": {
    youtubeId: "0Wa9CfRXUkA",
  },

  "smith-machine-bench-press": {
    youtubeId: "jjYdpy5qECk",
  },

  "dumbbell-chest-fly": {
    youtubeId: "Nhvz9EzdJ4U",
  },

  "pec-deck-fly": {
    youtubeId: "eGjt4lk6g34",
  },
  // =========================
  // LOWER CHEST
  // =========================

  "decline-barbell-press": {
    youtubeId: "FFyGwcLnDYc",
  },

  "decline-dumbbell-press": {
    youtubeId: "J6hT44JbWRE",
  },

  "chest-dips": {
    youtubeId: "",
  },

  "high-to-low-cable-fly": {
    youtubeId: "8Um35Es-ROE",
  },

  "decline-smith-press": {
    youtubeId: "",
  },

  "straight-bar-dips": {
    youtubeId: "",
  },

  "assisted-dips": {
    youtubeId: "",
  },
  // =========================
  // UPPER BACK
  // =========================

  "seal-row": {
    youtubeId: "9ffaage-LjY",
  },

  "trap-3-raise": {
    youtubeId: "AlixeUG_bIU",
  },

  "scapular-pull-up": {
    youtubeId: "pE8PJsWEV7k",
  },

  "dumbbell-shrug": {
    youtubeId: "yqzRYcOMx2Q",
  },

  "barbell-shrug": {
    youtubeId: "zfAHfyTB_Ao",
  },

  "cable-shrug": {
    youtubeId: "YykmcX2b-LY",
  },

  "smith-machine-shrug": {
    youtubeId: "cT5_GyOXIgE",
  },

  "plate-loaded-shrug": {
    youtubeId: "rko8DHiCnaM",
  },

  "high-row": {
    youtubeId: "vGrlowxaKq0",
  },

  "wide-grip-seated-row": {
    youtubeId: "sjJ0z4R3w0M",
  },

  "rear-delt-row": {
    youtubeId: "syG-Xxkol3o",
  },

  "machine-row": {
    youtubeId: "bmWA2yO9Aa0",
  },

  "half-kneeling-cable-row": {
    youtubeId: "",
  },

  "meadows-row": {
    youtubeId: "",
  },

  "one-arm-dumbbell-row": {
    youtubeId: "",
  },

  "v-bar-seated-row": {
    youtubeId: "",
  },

  "single-arm-seated-row": {
    youtubeId: "",
  },

  "single-arm-cable-row": {
    youtubeId: "",
  },

  "barbell-row": {
    youtubeId: "",
  },

  "landmine-t-bar-row": {
    youtubeId: "",
  },

  "chest-supported-t-bar-row": {
    youtubeId: "",
  },

  "chest-supported-dumbbell-row": {
    youtubeId: "",
  },

  "seated-cable-row": {
    youtubeId: "",
  },

};

function hasPlayableTutorial(
  tutorial: ExerciseTutorial | null | undefined,
): tutorial is ExerciseTutorial {
  if (!tutorial) return false;
  const youtubeId = tutorial.youtubeId?.trim();
  const src = tutorial.src?.trim();
  return Boolean(youtubeId || src);
}

/**
 * Resolve the tutorial for an exercise slug.
 * Sidecar registry wins; inline ExerciseData.tutorial is the fallback override.
 */
export function getExerciseTutorial(
  slug: string,
  inlineTutorial?: ExerciseTutorial | null,
): ExerciseTutorial | null {
  const fromRegistry = EXERCISE_TUTORIALS[slug];
  if (hasPlayableTutorial(fromRegistry)) return fromRegistry;
  if (hasPlayableTutorial(inlineTutorial)) return inlineTutorial;
  return null;
}
