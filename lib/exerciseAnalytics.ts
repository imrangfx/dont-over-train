import type { WorkoutHistoryEntry } from "@/lib/workouts";
import {
  calculateCategoryLevel,
  getExerciseCategory,
  type ExerciseCategory,
  type LevelProgress,
  type PersonalRecord,
} from "@/lib/progression";

/**
 * Pure Exercise Detail analytics, built entirely from data the app already
 * loads (WorkoutHistoryEntry.exerciseList + PersonalRecord) - no new
 * database tables or types, no changes to the Progressive Overload /
 * Personal Record modules this reads from. UI components should call
 * buildExerciseAnalytics() once (ideally memoized) and render the result;
 * no calculation should be duplicated in a component.
 */

const WEEK_MS = 7 * 24 * 60 * 60 * 1000;
const MIN_SESSIONS_FOR_TRENDS = 2;

export function exerciseHref(exerciseName: string): string {
  return `/exercises/${encodeURIComponent(exerciseName)}`;
}

export type ExerciseSession = {
  workoutId: string;
  date: string;
  timestamp: number;
  weight: number;
  sets: number;
  reps: number;
  volume: number;
};

export type ExerciseMilestone = {
  label: string;
  value: string;
  date?: string;
};

export type MilestoneEventType = "firstWorkout" | "firstPR" | "biggestJump" | "highestVolume";

/**
 * A milestone tied to a specific session (timestamp + value), so both the
 * textual Milestones list (below) and the chart overlay markers (Sprint 2,
 * lib/chartAnalytics.ts) can be derived from the exact same computation
 * instead of re-scanning session history twice.
 */
export type MilestoneEvent = {
  type: MilestoneEventType;
  label: string;
  icon: string;
  session: ExerciseSession;
  detail: string;
};

export type MilestoneEvents = {
  firstWorkout: MilestoneEvent | null;
  firstPR: MilestoneEvent | null;
  biggestJump: MilestoneEvent | null;
  highestVolume: MilestoneEvent | null;
};

export type ExerciseInsights = {
  averageWeeklyImprovement: string;
  averageTrainingFrequency: string;
  bestPerformingMonth: string;
  estimatedConsistency: string;
};

export type ExerciseStats = {
  currentPR: number | null;
  highestWeight: number | null;
  averageWeight: number | null;
  averageReps: number | null;
  averageSets: number | null;
  totalSessions: number;
  totalVolume: number;
  firstWorkoutDate: string | null;
  lastWorkoutDate: string | null;
};

export type ExerciseAnalytics = {
  exerciseName: string;
  bodyPart: string | null;
  category: ExerciseCategory;
  categoryLevel: LevelProgress | null;
  stats: ExerciseStats;
  /** Newest first - use for the Recent Sessions list. */
  sessions: ExerciseSession[];
  milestones: ExerciseMilestone[];
  insights: ExerciseInsights;
  hasEnoughDataForTrends: boolean;
};

function average(values: number[]): number | null {
  if (values.length === 0) return null;
  return values.reduce((sum, v) => sum + v, 0) / values.length;
}

function extractSessions(exerciseName: string, history: WorkoutHistoryEntry[]): ExerciseSession[] {
  const normalizedName = exerciseName.trim().toLowerCase();
  const sessions: ExerciseSession[] = [];

  for (const workout of history || []) {
    for (const item of workout.exerciseList || []) {
      if (!item?.name || item.name.trim().toLowerCase() !== normalizedName) continue;

      const numericWeights = (item.weights || []).filter(
        (w): w is number => typeof w === "number" && w > 0
      );
      const weight = numericWeights.length > 0 ? Math.max(...numericWeights) : 0;
      const reps = Number(item.reps) || 0;
      const volume = numericWeights.reduce((sum, w) => sum + w * reps, 0);

      sessions.push({
        workoutId: workout.id,
        date: workout.date,
        timestamp: workout.timestamp,
        weight,
        sets: Number(item.sets) || 0,
        reps,
        volume,
      });
    }
  }

  return sessions.sort((a, b) => b.timestamp - a.timestamp);
}

/**
 * Finds the four "key session" milestone events once. Shared by the
 * textual Milestones list here and by the chart milestone overlay in
 * lib/chartAnalytics.ts, so the detection logic (first performed, first
 * PR, biggest single jump, highest volume session) exists in exactly one
 * place.
 */
export function findMilestoneEvents(chronological: ExerciseSession[]): MilestoneEvents {
  if (chronological.length === 0) {
    return { firstWorkout: null, firstPR: null, biggestJump: null, highestVolume: null };
  }

  const firstWorkout: MilestoneEvent = {
    type: "firstWorkout",
    label: "First Workout",
    icon: "🏋️",
    session: chronological[0],
    detail: chronological[0].date,
  };

  const firstWithWeight = chronological.find((s) => s.weight > 0);
  const firstPR: MilestoneEvent | null = firstWithWeight
    ? {
        type: "firstPR",
        label: "First PR",
        icon: "🏆",
        session: firstWithWeight,
        detail: `${firstWithWeight.weight} kg`,
      }
    : null;

  let biggestDelta = 0;
  let biggestSession: ExerciseSession | null = null;

  for (let i = 1; i < chronological.length; i++) {
    const delta = chronological[i].weight - chronological[i - 1].weight;
    if (delta > biggestDelta) {
      biggestDelta = delta;
      biggestSession = chronological[i];
    }
  }

  const biggestJump: MilestoneEvent | null =
    biggestSession && biggestDelta > 0
      ? {
          type: "biggestJump",
          label: "Biggest PR Jump",
          icon: "🏆",
          session: biggestSession,
          detail: `+${biggestDelta.toFixed(1)} kg`,
        }
      : null;

  const highestVolumeSession = chronological.reduce(
    (best, s) => (s.volume > best.volume ? s : best),
    chronological[0]
  );

  const highestVolume: MilestoneEvent | null =
    highestVolumeSession.volume > 0
      ? {
          type: "highestVolume",
          label: "Highest Volume",
          icon: "🏆",
          session: highestVolumeSession,
          detail: `${Math.round(highestVolumeSession.volume).toLocaleString()} kg`,
        }
      : null;

  return { firstWorkout, firstPR, biggestJump, highestVolume };
}

/** Longest run of consecutive sessions (chronological) that never dropped below the previous weight. */
export function calculateLongestImprovementStreak(chronological: ExerciseSession[]): number {
  let currentStreak = 1;
  let longestStreak = chronological.length > 0 ? 1 : 0;

  for (let i = 1; i < chronological.length; i++) {
    const prev = chronological[i - 1];
    const curr = chronological[i];

    if (curr.weight > 0 && curr.weight >= prev.weight) {
      currentStreak++;
      longestStreak = Math.max(longestStreak, currentStreak);
    } else {
      currentStreak = 1;
    }
  }

  return longestStreak;
}

/** Sessions per week across the given (already-filtered, if desired) session list. */
export function calculateTrainingFrequency(sessions: ExerciseSession[]): number | null {
  if (sessions.length < MIN_SESSIONS_FOR_TRENDS) return null;

  const timestamps = sessions.map((s) => s.timestamp);
  const spanMs = Math.max(Math.max(...timestamps) - Math.min(...timestamps), 1);
  const spanWeeks = Math.max(spanMs / WEEK_MS, 1 / 7);

  return sessions.length / spanWeeks;
}

/** Average calendar days between consecutive sessions (chronological order assumed by caller not required - sorted internally). */
export function calculateAverageDaysBetweenSessions(sessions: ExerciseSession[]): number | null {
  if (sessions.length < MIN_SESSIONS_FOR_TRENDS) return null;

  const sorted = [...sessions].sort((a, b) => a.timestamp - b.timestamp);
  const gaps: number[] = [];

  for (let i = 1; i < sorted.length; i++) {
    gaps.push((sorted[i].timestamp - sorted[i - 1].timestamp) / (24 * 60 * 60 * 1000));
  }

  return average(gaps);
}

/** 0-100: proportion of weeks within the session span that contain at least one session. */
export function calculateConsistencyPercent(sessions: ExerciseSession[]): number | null {
  if (sessions.length < MIN_SESSIONS_FOR_TRENDS) return null;

  const timestamps = sessions.map((s) => s.timestamp);
  const spanMs = Math.max(Math.max(...timestamps) - Math.min(...timestamps), 1);
  const spanWeeks = Math.max(spanMs / WEEK_MS, 1 / 7);

  const distinctWeeks = new Set(timestamps.map((t) => Math.floor(t / WEEK_MS)));
  const totalWeeksSpanned = Math.max(Math.ceil(spanWeeks), 1);

  return Math.min(100, Math.round((distinctWeeks.size / totalWeeksSpanned) * 100));
}

/** The calendar month (e.g. "July 2026") with the highest summed session volume. */
export function calculateBestMonthByVolume(
  sessions: ExerciseSession[]
): { label: string; volume: number } | null {
  if (sessions.length === 0) return null;

  const volumeByMonth = new Map<string, number>();
  for (const session of sessions) {
    const key = new Date(session.timestamp).toLocaleDateString(undefined, {
      month: "long",
      year: "numeric",
    });
    volumeByMonth.set(key, (volumeByMonth.get(key) ?? 0) + session.volume);
  }

  let bestMonth: { label: string; volume: number } | null = null;
  for (const [label, volume] of volumeByMonth) {
    if (!bestMonth || volume > bestMonth.volume) {
      bestMonth = { label, volume };
    }
  }

  return bestMonth && bestMonth.volume > 0 ? bestMonth : null;
}

function buildMilestones(chronological: ExerciseSession[]): ExerciseMilestone[] {
  if (chronological.length === 0) return [];

  const events = findMilestoneEvents(chronological);
  const milestones: ExerciseMilestone[] = [];

  if (events.firstWorkout) {
    milestones.push({ label: "First Time Performed", value: events.firstWorkout.session.date });
  }

  if (events.firstPR) {
    milestones.push({
      label: "First PR",
      value: events.firstPR.detail,
      date: events.firstPR.session.date,
    });
  }

  if (events.biggestJump) {
    milestones.push({
      label: "Biggest PR Increase",
      value: events.biggestJump.detail,
      date: events.biggestJump.session.date,
    });
  }

  if (chronological.length >= MIN_SESSIONS_FOR_TRENDS) {
    const longestStreak = calculateLongestImprovementStreak(chronological);
    milestones.push({
      label: "Longest Improvement Streak",
      value: `${longestStreak} Session${longestStreak === 1 ? "" : "s"}`,
    });
  }

  if (events.highestVolume) {
    milestones.push({
      label: "Highest Volume Session",
      value: events.highestVolume.detail,
      date: events.highestVolume.session.date,
    });
  }

  return milestones;
}

function buildInsights(chronological: ExerciseSession[]): ExerciseInsights {
  const fallback: ExerciseInsights = {
    averageWeeklyImprovement: "-",
    averageTrainingFrequency: "-",
    bestPerformingMonth: "-",
    estimatedConsistency: "-",
  };

  if (chronological.length < MIN_SESSIONS_FOR_TRENDS) return fallback;

  const first = chronological[0];
  const last = chronological[chronological.length - 1];
  const spanMs = Math.max(last.timestamp - first.timestamp, 1);
  const spanWeeks = Math.max(spanMs / WEEK_MS, 1 / 7);

  const weeklyImprovement = (last.weight - first.weight) / spanWeeks;
  const frequency = calculateTrainingFrequency(chronological);
  const bestMonth = calculateBestMonthByVolume(chronological);
  const consistency = calculateConsistencyPercent(chronological);

  return {
    averageWeeklyImprovement:
      Math.abs(weeklyImprovement) < 0.05
        ? "No change"
        : `${weeklyImprovement > 0 ? "+" : ""}${weeklyImprovement.toFixed(1)} kg/week`,
    averageTrainingFrequency: frequency != null ? `${frequency.toFixed(1)} sessions/week` : "-",
    bestPerformingMonth: bestMonth?.label ?? "-",
    estimatedConsistency: consistency != null ? `${consistency}% Consistent` : "-",
  };
}

/**
 * Builds the full Exercise Detail analytics payload for one exercise from
 * already-loaded workout history + personal records (both loaded exactly
 * once by the page via the existing loadWorkoutHistory()/loadPersonalRecords()
 * helpers - this function does no I/O).
 */
export function buildExerciseAnalytics(
  exerciseName: string,
  history: WorkoutHistoryEntry[],
  personalRecords: PersonalRecord[]
): ExerciseAnalytics {
  const sessions = extractSessions(exerciseName, history);
  const chronological = [...sessions].sort((a, b) => a.timestamp - b.timestamp);

  const normalizedName = exerciseName.trim().toLowerCase();
  const bodyPart =
    history
      .flatMap((w) => w.exerciseList || [])
      .find((item) => item?.name?.trim().toLowerCase() === normalizedName)?.bodyPart ?? null;

  const category = getExerciseCategory(bodyPart);

  const matchingRecord = (personalRecords || []).find(
    (record) => record.exerciseName.trim().toLowerCase() === normalizedName
  );

  const highestFromSessions = sessions.reduce((max, s) => Math.max(max, s.weight), 0);
  const currentPR = matchingRecord?.weight ?? (highestFromSessions > 0 ? highestFromSessions : null);
  const categoryLevel = currentPR != null ? calculateCategoryLevel(category, currentPR) : null;

  const totalSessions = sessions.length;

  const stats: ExerciseStats = {
    currentPR,
    highestWeight: highestFromSessions > 0 ? highestFromSessions : currentPR,
    averageWeight: average(sessions.map((s) => s.weight).filter((w) => w > 0)),
    averageReps: average(sessions.map((s) => s.reps)),
    averageSets: average(sessions.map((s) => s.sets)),
    totalSessions,
    totalVolume: sessions.reduce((sum, s) => sum + s.volume, 0),
    firstWorkoutDate: chronological[0]?.date ?? null,
    lastWorkoutDate: sessions[0]?.date ?? null,
  };

  return {
    exerciseName,
    bodyPart,
    category,
    categoryLevel,
    stats,
    sessions,
    milestones: buildMilestones(chronological),
    insights: buildInsights(chronological),
    hasEnoughDataForTrends: totalSessions >= MIN_SESSIONS_FOR_TRENDS,
  };
}
