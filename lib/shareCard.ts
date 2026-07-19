import type { LevelProgress, PersonalRecord } from "@/lib/progression";

/**
 * Pure data model for the Workout Share Card. No DOM/canvas access here -
 * ShareCardModal renders this, and can be reused by any future entry point
 * (e.g. an Achievements screen) without duplicating the composition logic.
 */
export type ShareCardData = {
  headline: string;
  exerciseName: string | null;
  weight: number | null;
  deltaWeight: number | null;
  level: LevelProgress;
  currentStreak: number;
};

export function buildPersonalRecordShareCard(
  record: PersonalRecord,
  previousWeight: number | null,
  level: LevelProgress,
  currentStreak: number
): ShareCardData {
  return {
    headline: "🏆 New Personal Record",
    exerciseName: record.exerciseName,
    weight: record.weight,
    deltaWeight: previousWeight != null ? record.weight - previousWeight : null,
    level,
    currentStreak,
  };
}

export function buildLevelShareCard(
  level: LevelProgress,
  highestPR: PersonalRecord | null,
  currentStreak: number
): ShareCardData {
  return {
    headline: "🔥 Progressive Overload",
    exerciseName: highestPR?.exerciseName ?? null,
    weight: highestPR?.weight ?? null,
    deltaWeight: null,
    level,
    currentStreak,
  };
}

export function buildShareSummaryText(data: ShareCardData): string {
  const lines: string[] = [data.headline];

  if (data.exerciseName && data.weight != null) {
    lines.push(data.exerciseName);
    const delta = data.deltaWeight && data.deltaWeight > 0 ? ` (+${data.deltaWeight.toFixed(1)} kg)` : "";
    lines.push(`${data.weight} kg${delta}`);
  }

  lines.push(`Level ${data.level.level} • ${data.level.title}`);

  if (data.currentStreak > 0) {
    lines.push(`🔥 ${data.currentStreak} Day Streak`);
  }

  lines.push("");
  lines.push("Progressive Overload Tracker");
  lines.push("dontovertrain.app");

  return lines.join("\n");
}
