import { exercises } from "@/app/Data/exercises";
import type { WorkoutExercise, WorkoutHistoryEntry } from "@/lib/workouts";

/** Canonical slug → history page title (e.g. shoulders → "Shoulder History"). */
const BODY_PART_HISTORY_TITLES: Record<string, string> = {
  chest: "Chest History",
  back: "Back History",
  shoulders: "Shoulder History",
  biceps: "Biceps History",
  triceps: "Triceps History",
  legs: "Legs History",
  abs: "Abs History",
  forearms: "Forearms History",
};

function normalizeBodyPartKey(value: string): string {
  return value.trim().toLowerCase();
}

/** Display title for a body-part-filtered history view. */
export function bodyPartHistoryTitle(bodyPartSlug: string): string {
  const key = normalizeBodyPartKey(bodyPartSlug);
  if (BODY_PART_HISTORY_TITLES[key]) return BODY_PART_HISTORY_TITLES[key];

  const label = key
    .split(/[-_\s]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");

  return label ? `${label} History` : "Workout History";
}

/** Canonical display name for a body-part slug (e.g. chest → Chest). */
export function bodyPartDisplayName(bodyPartSlug: string): string {
  const key = normalizeBodyPartKey(bodyPartSlug);
  const titled = BODY_PART_HISTORY_TITLES[key]?.replace(/ History$/, "");
  if (titled) {
    // Restore plural "Shoulders" for workout labels while title stays singular.
    if (key === "shoulders") return "Shoulders";
    return titled;
  }
  return key.charAt(0).toUpperCase() + key.slice(1);
}

function resolveExerciseBodyPart(exercise: WorkoutExercise): string {
  if (exercise.bodyPart) return exercise.bodyPart;

  const match = Object.values(exercises).find(
    (entry) => entry.name.toLowerCase() === exercise.name.toLowerCase()
  );
  return match?.bodyPart ?? "";
}

export function exerciseBelongsToBodyPart(
  exercise: WorkoutExercise,
  bodyPartSlug: string
): boolean {
  const target = normalizeBodyPartKey(bodyPartSlug);
  if (!target) return true;
  return normalizeBodyPartKey(resolveExerciseBodyPart(exercise)) === target;
}

/**
 * Display-only projection: keep workout metadata, show only exercises for
 * the selected body part. Does not mutate or persist the original entry.
 */
export function projectWorkoutForBodyPart(
  workout: WorkoutHistoryEntry,
  bodyPartSlug: string
): WorkoutHistoryEntry | null {
  const target = normalizeBodyPartKey(bodyPartSlug);
  if (!target) return workout;

  const exerciseList = (workout.exerciseList || []).filter((exercise) =>
    exerciseBelongsToBodyPart(exercise, target)
  );

  if (exerciseList.length === 0) return null;

  return {
    ...workout,
    exerciseList,
    exercises: exerciseList.length,
    bodyParts: [bodyPartDisplayName(target)],
  };
}

/** Filter history to workouts that include the body part (display-only). */
export function filterHistoryByBodyPart(
  history: WorkoutHistoryEntry[],
  bodyPartSlug: string | null | undefined
): WorkoutHistoryEntry[] {
  const target = bodyPartSlug ? normalizeBodyPartKey(bodyPartSlug) : "";
  if (!target) return history;

  return history
    .map((workout) => projectWorkoutForBodyPart(workout, target))
    .filter((workout): workout is WorkoutHistoryEntry => workout != null);
}
