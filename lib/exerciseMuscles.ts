import type { ExerciseData } from "@/app/Data/exercises";
import { exercises } from "@/app/Data/exercises";

/** "upperBack" -> "Upper Back" (fallback when no explicit display map entry). */
function formatMuscleLabel(muscle: string): string {
  return muscle
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (s) => s.toUpperCase())
    .trim();
}
/**
 * Map granular fatigue keys (and head splits) to display muscle groups used
 * in Training Today titles, e.g. "Long Head Triceps" → "Triceps".
 */
const FATIGUE_KEY_TO_DISPLAY: Record<string, string> = {
  upperChest: "Chest",
  midChest: "Chest",
  lowerChest: "Chest",
  chest: "Chest",
  frontDelts: "Front Delts",
  sideDelts: "Side Delts",
  rearDelts: "Rear Delts",
  upperBack: "Upper Back",
  midBack: "Mid Back",
  lowerBack: "Lower Back",
  lats: "Lats",
  traps: "Traps",
  biceps: "Biceps",
  "Long Head Biceps": "Biceps",
  "Short Head Biceps": "Biceps",
  Brachialis: "Biceps",
  Brachioradialis: "Biceps",
  triceps: "Triceps",
  "Lateral Head Triceps": "Triceps",
  "Medial Head Triceps": "Triceps",
  "Long Head Triceps": "Triceps",
  lateralHeadTriceps: "Triceps",
  medialHeadTriceps: "Triceps",
  longHeadTriceps: "Triceps",
  forearms: "Forearms",
  grip: "Forearms",
  quads: "Quads",
  hamstrings: "Hamstrings",
  glutes: "Glutes",
  calves: "Calves",
  upperAbs: "Upper Abs",
  lowerAbs: "Lower Abs",
  core: "Core",
  obliques: "Obliques",
  hipFlexors: "Hip Flexors",
};

export type ExerciseMuscleTargets = {
  primaryMuscles: string[];
  secondaryMuscles: string[];
};

function displayMuscleLabel(fatigueKey: string): string {
  return FATIGUE_KEY_TO_DISPLAY[fatigueKey] ?? formatMuscleLabel(fatigueKey);
}

/**
 * Derive primary/secondary display muscles from fatigue values.
 * Groups head splits (e.g. triceps heads → Triceps), ranks by peak fatigue,
 * treats the top group as primary and the rest as secondary.
 */
export function deriveMuscleTargetsFromFatigue(
  fatigue: Record<string, number>
): ExerciseMuscleTargets {
  const groupPeak = new Map<string, number>();

  for (const [key, value] of Object.entries(fatigue)) {
    const score = Number(value) || 0;
    if (score <= 0) continue;
    const label = displayMuscleLabel(key);
    groupPeak.set(label, Math.max(groupPeak.get(label) ?? 0, score));
  }

  const ranked = [...groupPeak.entries()].sort((a, b) => {
    if (b[1] !== a[1]) return b[1] - a[1];
    return a[0].localeCompare(b[0]);
  });

  if (ranked.length === 0) {
    return { primaryMuscles: [], secondaryMuscles: [] };
  }

  return {
    primaryMuscles: [ranked[0][0]],
    secondaryMuscles: ranked.slice(1).map(([label]) => label),
  };
}

/**
 * Read primaryMuscles / secondaryMuscles from an exercise.
 * Uses explicit lists when present; otherwise derives them from fatigue.
 */
export function getExerciseMuscleTargets(
  exercise: Pick<
    ExerciseData,
    "fatigue" | "primaryMuscles" | "secondaryMuscles"
  >
): ExerciseMuscleTargets {
  const hasExplicitPrimary =
    Array.isArray(exercise.primaryMuscles) &&
    exercise.primaryMuscles.length > 0;
  const hasExplicitSecondary = Array.isArray(exercise.secondaryMuscles);

  if (hasExplicitPrimary) {
    const primaryMuscles = [...exercise.primaryMuscles!];
    const primarySet = new Set(primaryMuscles);
    const secondaryMuscles = (exercise.secondaryMuscles ?? []).filter(
      (muscle) => !primarySet.has(muscle)
    );
    return { primaryMuscles, secondaryMuscles };
  }

  if (hasExplicitSecondary && exercise.secondaryMuscles!.length > 0) {
    // Secondary-only data is incomplete — fall back to fatigue derivation.
    return deriveMuscleTargetsFromFatigue(exercise.fatigue);
  }

  return deriveMuscleTargetsFromFatigue(exercise.fatigue);
}

/**
 * Build the Training Today title from selected exercise slugs.
 * Primaries across all exercises come first, then secondaries; duplicates removed.
 */
export function buildTrainingTodayTitle(
  slugs: Array<string | null | undefined>
): string {
  const primaryOrder: string[] = [];
  const secondaryOrder: string[] = [];
  const seen = new Set<string>();

  for (const slug of slugs) {
    if (!slug) continue;
    const exercise = exercises[slug as keyof typeof exercises];
    if (!exercise) continue;

    const { primaryMuscles, secondaryMuscles } =
      getExerciseMuscleTargets(exercise);

    for (const muscle of primaryMuscles) {
      if (!muscle || seen.has(muscle)) continue;
      seen.add(muscle);
      primaryOrder.push(muscle);
    }

    for (const muscle of secondaryMuscles) {
      if (!muscle || seen.has(muscle)) continue;
      seen.add(muscle);
      secondaryOrder.push(muscle);
    }
  }

  return [...primaryOrder, ...secondaryOrder].join(" + ");
}
