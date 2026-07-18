/**
 * Progressive Overload progression engine.
 *
 * This module is intentionally pure (no localStorage/Supabase access) so the
 * level/category configuration can be reused by future features
 * (Achievements, Challenges, Badges, AI Coach) without duplicating logic.
 * All numeric thresholds live in config objects here - never hardcoded in UI.
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

export type LevelNumber = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;

export type LevelDefinition = {
  level: LevelNumber;
  title: string;
  color: string;
};

/** The 8 Progressive Overload levels. Shared across every category. */
export const LEVELS: LevelDefinition[] = [
  { level: 1, title: "Rookie", color: "#9CA3AF" },
  { level: 2, title: "Beginner", color: "#60A5FA" },
  { level: 3, title: "Active", color: "#34D399" },
  { level: 4, title: "Dedicated", color: "#39FF14" },
  { level: 5, title: "Athlete", color: "#FBBF24" },
  { level: 6, title: "Elite", color: "#FB923C" },
  { level: 7, title: "Champion", color: "#F87171" },
  { level: 8, title: "Legend", color: "#C084FC" },
];

export function getLevelDefinition(level: LevelNumber): LevelDefinition {
  return LEVELS.find((l) => l.level === level) ?? LEVELS[0];
}

export function getNextLevel(level: LevelNumber): LevelDefinition | null {
  return LEVELS.find((l) => l.level === level + 1) ?? null;
}

type CategoryThreshold = { level: LevelNumber; min: number };

/**
 * Minimum PR weight (kg) required to reach each level, per exercise
 * category. Different exercises have very different expected weight
 * ranges, so each category is judged against its own curve rather than a
 * single global scale. Tune these freely - nothing in the UI hardcodes them.
 */
export const CATEGORY_THRESHOLDS: Record<ExerciseCategory, CategoryThreshold[]> = {
  upperBodyPush: [
    { level: 1, min: 0 },
    { level: 2, min: 10 },
    { level: 3, min: 20 },
    { level: 4, min: 30 },
    { level: 5, min: 40 },
    { level: 6, min: 50 },
    { level: 7, min: 60 },
    { level: 8, min: 80 },
  ],
  upperBodyPull: [
    { level: 1, min: 0 },
    { level: 2, min: 15 },
    { level: 3, min: 30 },
    { level: 4, min: 45 },
    { level: 5, min: 60 },
    { level: 6, min: 75 },
    { level: 7, min: 90 },
    { level: 8, min: 110 },
  ],
  shoulders: [
    { level: 1, min: 0 },
    { level: 2, min: 7.5 },
    { level: 3, min: 15 },
    { level: 4, min: 22.5 },
    { level: 5, min: 30 },
    { level: 6, min: 40 },
    { level: 7, min: 50 },
    { level: 8, min: 65 },
  ],
  arms: [
    { level: 1, min: 0 },
    { level: 2, min: 5 },
    { level: 3, min: 10 },
    { level: 4, min: 15 },
    { level: 5, min: 20 },
    { level: 6, min: 25 },
    { level: 7, min: 30 },
    { level: 8, min: 40 },
  ],
  legs: [
    { level: 1, min: 0 },
    { level: 2, min: 30 },
    { level: 3, min: 60 },
    { level: 4, min: 90 },
    { level: 5, min: 120 },
    { level: 6, min: 150 },
    { level: 7, min: 180 },
    { level: 8, min: 220 },
  ],
  core: [
    { level: 1, min: 0 },
    { level: 2, min: 5 },
    { level: 3, min: 10 },
    { level: 4, min: 15 },
    { level: 5, min: 20 },
    { level: 6, min: 25 },
    { level: 7, min: 30 },
    { level: 8, min: 40 },
  ],
};

export type LevelProgress = {
  level: LevelNumber;
  title: string;
  color: string;
  /** 0-100 progress toward the next level. 100 if already at the top level. */
  progressPercent: number;
  nextLevel: LevelDefinition | null;
  currentThresholdMin: number;
  nextThresholdMin: number | null;
};

/** Calculates level + progress for a single weight value within a category. */
export function calculateLevel(
  category: ExerciseCategory,
  weight: number
): LevelProgress {
  const thresholds = CATEGORY_THRESHOLDS[category];
  const safeWeight = Number.isFinite(weight) && weight > 0 ? weight : 0;

  let current: CategoryThreshold = thresholds[0];
  for (const threshold of thresholds) {
    if (safeWeight >= threshold.min) {
      current = threshold;
    } else {
      break;
    }
  }

  const currentIndex = thresholds.findIndex((t) => t.level === current.level);
  const next = thresholds[currentIndex + 1] ?? null;
  const def = getLevelDefinition(current.level);

  let progressPercent = 100;
  if (next) {
    const span = next.min - current.min;
    progressPercent =
      span > 0
        ? Math.min(100, Math.max(0, Math.round(((safeWeight - current.min) / span) * 100)))
        : 100;
  }

  return {
    level: current.level,
    title: def.title,
    color: def.color,
    progressPercent,
    nextLevel: next ? getLevelDefinition(next.level) : null,
    currentThresholdMin: current.min,
    nextThresholdMin: next?.min ?? null,
  };
}

export type PersonalRecord = {
  exerciseName: string;
  bodyPart: string;
  category: ExerciseCategory;
  weight: number;
  /** ISO timestamp of when this weight was first lifted. */
  achievedAt: string;
};

/**
 * The user's overall level = the highest level reached by any single
 * category's PR. Because a category's level is derived purely from its
 * all-time-highest PR weight, and PRs never decrease, the overall level
 * can never regress either.
 */
export function calculateOverallLevel(records: PersonalRecord[]): LevelProgress {
  if (!records || records.length === 0) {
    return calculateLevel("upperBodyPush", 0);
  }

  let best: LevelProgress | null = null;

  for (const record of records) {
    const progress = calculateLevel(record.category, record.weight);
    if (
      !best ||
      progress.level > best.level ||
      (progress.level === best.level && progress.progressPercent > best.progressPercent)
    ) {
      best = progress;
    }
  }

  return best ?? calculateLevel("upperBodyPush", 0);
}

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
