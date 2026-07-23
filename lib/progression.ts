/**
 * Personal Record tracking + exercise categorization.
 *
 * This module is intentionally pure (no localStorage/Supabase access).
 * The user's overall Level is NOT calculated here anymore - see
 * lib/bodyPartProgression.ts (calculation) and lib/bodyPartLevelsConfig.ts
 * (configuration) for the single source of truth used everywhere in the app.
 */

export type ExerciseCategory =
  | "upperBodyPush"
  | "upperBodyPull"
  | "shoulders"
  | "arms"
  | "legs"
  | "core";

export const CATEGORY_LABELS: Record<ExerciseCategory, string> = {
  upperBodyPush: "Upper Body Push",
  upperBodyPull: "Upper Body Pull",
  shoulders: "Shoulders",
  arms: "Arms",
  legs: "Legs",
  core: "Core",
};

/** bodyPart values from app/Data/*.ts mapped to a progression category. */
const BODY_PART_TO_CATEGORY: Record<string, ExerciseCategory> = {
  Chest: "upperBodyPush",
  Back: "upperBodyPull",
  Shoulders: "shoulders",
  Biceps: "arms",
  Triceps: "arms",
  Forearms: "arms",
  Legs: "legs",
  Abs: "core",
};

export function getExerciseCategory(
  bodyPart: string | null | undefined
): ExerciseCategory {
  if (!bodyPart) return "core";
  return BODY_PART_TO_CATEGORY[bodyPart] ?? "core";
}

export type PersonalRecord = {
  exerciseName: string;
  bodyPart: string;
  category: ExerciseCategory;
  weight: number;
  /** ISO timestamp of when this weight was first lifted. */
  achievedAt: string;
};

/** Highest raw PR weight across every exercise, regardless of category. */
export function getHighestPersonalRecord(
  records: PersonalRecord[]
): PersonalRecord | null {
  if (!records || records.length === 0) return null;
  return records.reduce(
    (best, record) => (record.weight > best.weight ? record : best),
    records[0]
  );
}

/** Most recently achieved PR across every exercise (by achievedAt), regardless of weight. */
export function getMostRecentPersonalRecord(
  records: PersonalRecord[]
): PersonalRecord | null {
  if (!records || records.length === 0) return null;
  return records.reduce((latest, record) => {
    const latestTime = new Date(latest.achievedAt).getTime();
    const recordTime = new Date(record.achievedAt).getTime();
    return recordTime > latestTime ? record : latest;
  }, records[0]);
}

export type PersonalRecordUpdateResult = {
  records: PersonalRecord[];
  brokenRecords: Array<{ record: PersonalRecord; previousWeight: number | null }>;
};

/**
 * Pure merge function: given existing PR records and the exercises performed
 * in a workout, returns the updated record list plus any PRs that were newly
 * broken (a higher weight than ever recorded for that exercise), so callers
 * can persist the result and show toasts/celebrations.
 */
export function updatePersonalRecords(
  existing: PersonalRecord[],
  performed: Array<{ name: string; bodyPart: string; weight: number; achievedAt: string }>
): PersonalRecordUpdateResult {
  const byName = new Map(existing.map((record) => [record.exerciseName, record]));
  const brokenRecords: PersonalRecordUpdateResult["brokenRecords"] = [];

  for (const exercise of performed) {
    if (!exercise.name || !Number.isFinite(exercise.weight) || exercise.weight <= 0) {
      continue;
    }

    const current = byName.get(exercise.name);

    if (!current || exercise.weight > current.weight) {
      const nextRecord: PersonalRecord = {
        exerciseName: exercise.name,
        bodyPart: exercise.bodyPart,
        category: getExerciseCategory(exercise.bodyPart),
        weight: exercise.weight,
        achievedAt: exercise.achievedAt,
      };

      byName.set(exercise.name, nextRecord);
      brokenRecords.push({ record: nextRecord, previousWeight: current?.weight ?? null });
    }
  }

  return { records: Array.from(byName.values()), brokenRecords };
}
