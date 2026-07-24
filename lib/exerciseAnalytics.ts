import type { WorkoutHistoryEntry } from "@/lib/workouts";
import { toLocalDayKey } from "@/lib/workouts";
import {
  getExerciseCategory,
  type ExerciseCategory,
  type PersonalRecord,
} from "@/lib/progression";

/**
 * Pure Exercise Detail analytics, built entirely from data the app already
 * loads (WorkoutHistoryEntry.exerciseList + PersonalRecord) - no new
 * database tables or types. UI components should call
 * buildExerciseAnalytics() once (ideally memoized) and render the result;
 * no calculation should be duplicated in a component.
 *
 * Session model: one ExerciseSession per completed workout that included
 * this exercise. Multiple exerciseList rows for the same exercise inside
 * one workout are merged. Frequency / days-between metrics further collapse
 * to one count per calendar day so same-day duplicates cannot invent
 * impossible rates (e.g. 28 sessions/week).
 */

const WEEK_MS = 7 * 24 * 60 * 60 * 1000;
const DAY_MS = 24 * 60 * 60 * 1000;
const MIN_SESSIONS_FOR_TRENDS = 2;
/** Matches level-system / in-workout qualifying PR (sets must hit this many reps). */
export const QUALIFYING_PR_MIN_REPS = 8;

export function exerciseHref(exerciseName: string): string {
  return `/exercises/${encodeURIComponent(exerciseName)}`;
}

export type QualifyingPersonalRecord = {
  weight: number;
  reps: number;
};

type ExerciseListItem = WorkoutHistoryEntry["exerciseList"][number];

function numericWeightsOf(item: ExerciseListItem): number[] {
  return (item.weights || []).filter(
    (w): w is number => typeof w === "number" && Number.isFinite(w) && w > 0
  );
}

function itemVolume(item: ExerciseListItem): number {
  const reps = Number(item.reps) || 0;
  return numericWeightsOf(item).reduce((sum, w) => sum + w * reps, 0);
}

/**
 * Highest weight ever lifted for this exercise, counting only sets that hit
 * at least `minReps` reps (default 8). Scans raw exerciseList rows so
 * qualification is not distorted by session merging.
 */
export function getQualifyingPersonalRecord(
  exerciseName: string,
  history: WorkoutHistoryEntry[],
  minReps = QUALIFYING_PR_MIN_REPS
): QualifyingPersonalRecord | null {
  const normalizedName = exerciseName.trim().toLowerCase();
  let best: QualifyingPersonalRecord | null = null;

  for (const workout of history || []) {
    for (const item of workout.exerciseList || []) {
      if (!item?.name || item.name.trim().toLowerCase() !== normalizedName) continue;
      if ((Number(item.reps) || 0) < minReps) continue;

      const weights = numericWeightsOf(item);
      if (weights.length === 0) continue;

      const weight = Math.max(...weights);
      if (!best || weight > best.weight) {
        best = { weight, reps: Number(item.reps) || 0 };
      }
    }
  }

  return best;
}

/**
 * How many completed workout sessions included this exercise (one count per
 * workout, regardless of how many times the exercise appears in that workout).
 */
export function countExercisePerformances(
  exerciseName: string,
  history: WorkoutHistoryEntry[]
): number {
  return extractSessions(exerciseName, history).length;
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
 * textual Milestones list (below) and the chart overlay markers
 * (lib/chartAnalytics.ts) can be derived from the exact same computation.
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

/**
 * Insights tiles intentionally avoid repeating Trend Summary metrics
 * (weekly growth, frequency, best month, consistency).
 */
export type ExerciseInsights = {
  sessionsThisMonth: string;
  averageVolumePerSession: string;
  totalStrengthGain: string;
  daysSinceLastSession: string;
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

function mergeExerciseItems(items: ExerciseListItem[]): {
  weight: number;
  sets: number;
  reps: number;
  volume: number;
} {
  let weight = 0;
  let sets = 0;
  let volume = 0;
  let repsForHeaviest = 0;

  for (const item of items) {
    const weights = numericWeightsOf(item);
    const itemMax = weights.length > 0 ? Math.max(...weights) : 0;
    const itemReps = Number(item.reps) || 0;
    const itemSets = Number(item.sets) || 0;

    sets += itemSets;
    volume += itemVolume(item);

    if (itemMax > weight) {
      weight = itemMax;
      repsForHeaviest = itemReps;
    } else if (itemMax === weight && itemMax > 0 && itemReps > repsForHeaviest) {
      repsForHeaviest = itemReps;
    }
  }

  return { weight, sets, reps: repsForHeaviest, volume };
}

/**
 * One session per workout that included this exercise. Duplicate exerciseList
 * rows inside the same workout are merged (max weight, summed sets/volume).
 */
function extractSessions(exerciseName: string, history: WorkoutHistoryEntry[]): ExerciseSession[] {
  const normalizedName = exerciseName.trim().toLowerCase();
  const sessions: ExerciseSession[] = [];

  for (const workout of history || []) {
    const matches = (workout.exerciseList || []).filter(
      (item) => item?.name && item.name.trim().toLowerCase() === normalizedName
    );
    if (matches.length === 0) continue;

    const merged = mergeExerciseItems(matches);

    sessions.push({
      workoutId: workout.id,
      date: workout.date,
      timestamp: workout.timestamp,
      weight: merged.weight,
      sets: merged.sets,
      reps: merged.reps,
      volume: merged.volume,
    });
  }

  return sessions.sort((a, b) => b.timestamp - a.timestamp);
}

/**
 * Collapse to one representative session per local calendar day (keeps the
 * heaviest / highest-volume entry when multiple workouts share a day).
 * Used only for rate metrics (frequency, days-between, weekly improvement).
 */
export function uniqueSessionsByDay(sessions: ExerciseSession[]): ExerciseSession[] {
  const byDay = new Map<string, ExerciseSession>();

  const chronological = [...sessions].sort((a, b) => a.timestamp - b.timestamp);
  for (const session of chronological) {
    const key = toLocalDayKey(session.timestamp);
    const existing = byDay.get(key);
    if (!existing) {
      byDay.set(key, session);
      continue;
    }

    const preferNew =
      session.weight > existing.weight ||
      (session.weight === existing.weight && session.volume > existing.volume);

    if (preferNew) byDay.set(key, session);
  }

  return [...byDay.values()].sort((a, b) => a.timestamp - b.timestamp);
}

/**
 * Finds the four "key session" milestone events once. Shared by the
 * textual Milestones list here and by the chart milestone overlay in
 * lib/chartAnalytics.ts.
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

  // Biggest increase between consecutive personal records (new running maxes),
  // not between arbitrary consecutive sessions. The first weight is a PR
  // baseline, not an "increase".
  let runningPR = 0;
  let biggestDelta = 0;
  let biggestSession: ExerciseSession | null = null;

  for (const session of chronological) {
    if (session.weight <= 0) continue;
    if (session.weight > runningPR) {
      if (runningPR > 0) {
        const delta = session.weight - runningPR;
        if (delta > biggestDelta) {
          biggestDelta = delta;
          biggestSession = session;
        }
      }
      runningPR = session.weight;
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

/**
 * Sessions per week for this exercise. Counts at most one session per
 * calendar day. Requires at least two distinct training days; short spans
 * are not extrapolated below a 1-week denominator.
 */
export function calculateTrainingFrequency(sessions: ExerciseSession[]): number | null {
  const uniqueDays = uniqueSessionsByDay(sessions);
  if (uniqueDays.length < MIN_SESSIONS_FOR_TRENDS) return null;

  const timestamps = uniqueDays.map((s) => s.timestamp);
  const spanMs = Math.max(...timestamps) - Math.min(...timestamps);
  if (spanMs < DAY_MS) return null;

  const spanWeeks = Math.max(spanMs / WEEK_MS, 1);
  return uniqueDays.length / spanWeeks;
}

/**
 * Average calendar days between consecutive training days for this exercise.
 * Same-day workouts count once, so gaps of 0 are never averaged in.
 */
export function calculateAverageDaysBetweenSessions(sessions: ExerciseSession[]): number | null {
  const uniqueDays = uniqueSessionsByDay(sessions);
  if (uniqueDays.length < MIN_SESSIONS_FOR_TRENDS) return null;

  const gaps: number[] = [];
  for (let i = 1; i < uniqueDays.length; i++) {
    const gapDays =
      (uniqueDays[i].timestamp - uniqueDays[i - 1].timestamp) / DAY_MS;
    if (gapDays > 0) gaps.push(gapDays);
  }

  return average(gaps);
}

/**
 * kg/week change based on one weight sample per training day (max weight
 * that day). Avoids same-day duplicate inflation.
 */
export function calculateWeeklyWeightImprovement(sessions: ExerciseSession[]): number | null {
  const uniqueDays = uniqueSessionsByDay(sessions).filter((s) => s.weight > 0);
  if (uniqueDays.length < MIN_SESSIONS_FOR_TRENDS) return null;

  const first = uniqueDays[0];
  const last = uniqueDays[uniqueDays.length - 1];
  const spanMs = last.timestamp - first.timestamp;
  if (spanMs < DAY_MS) return null;

  const spanWeeks = Math.max(spanMs / WEEK_MS, 1);
  return (last.weight - first.weight) / spanWeeks;
}

/** 0-100: proportion of weeks within the session span that contain at least one session. */
export function calculateConsistencyPercent(sessions: ExerciseSession[]): number | null {
  const uniqueDays = uniqueSessionsByDay(sessions);
  if (uniqueDays.length < MIN_SESSIONS_FOR_TRENDS) return null;

  const timestamps = uniqueDays.map((s) => s.timestamp);
  const spanMs = Math.max(...timestamps) - Math.min(...timestamps);
  if (spanMs < DAY_MS) return null;

  const spanWeeks = Math.max(spanMs / WEEK_MS, 1);
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

function buildInsights(
  chronological: ExerciseSession[],
  currentPR: number | null
): ExerciseInsights {
  const fallback: ExerciseInsights = {
    sessionsThisMonth: "-",
    averageVolumePerSession: "-",
    totalStrengthGain: "-",
    daysSinceLastSession: "-",
  };

  if (chronological.length === 0) return fallback;

  const now = Date.now();
  const nowDate = new Date(now);
  const sessionsThisMonth = chronological.filter((s) => {
    const d = new Date(s.timestamp);
    return d.getFullYear() === nowDate.getFullYear() && d.getMonth() === nowDate.getMonth();
  }).length;

  const avgVolume = average(chronological.map((s) => s.volume).filter((v) => v > 0));

  const firstWeighted = chronological.find((s) => s.weight > 0);
  const gainTarget = currentPR ?? chronological[chronological.length - 1]?.weight ?? null;
  const totalGain =
    firstWeighted && gainTarget != null && gainTarget >= firstWeighted.weight
      ? gainTarget - firstWeighted.weight
      : null;

  const last = chronological[chronological.length - 1];
  const daysSince = Math.max(0, (now - last.timestamp) / DAY_MS);

  return {
    sessionsThisMonth: String(sessionsThisMonth),
    averageVolumePerSession:
      avgVolume != null ? `${Math.round(avgVolume).toLocaleString()} kg` : "-",
    totalStrengthGain:
      totalGain != null && Number.isFinite(totalGain)
        ? `${totalGain > 0 ? "+" : ""}${Math.round(totalGain * 10) / 10} kg`
        : "-",
    daysSinceLastSession:
      chronological.length > 0 ? `${Math.round(daysSince * 10) / 10} days` : "-",
  };
}

/**
 * Builds the full Exercise Detail analytics payload for one exercise from
 * already-loaded workout history + personal records (both loaded exactly
 * once by the page - this function does no I/O).
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

  const qualifying = getQualifyingPersonalRecord(exerciseName, history);
  const matchingRecord = (personalRecords || []).find(
    (record) => record.exerciseName.trim().toLowerCase() === normalizedName
  );

  // Displayed PR = highest qualifying weight (≥8 reps) from history.
  // Fall back to the stored personal record only when history has no
  // qualifying set yet (e.g. legacy data), never invent a value.
  const highestFromSessions = sessions.reduce((max, s) => Math.max(max, s.weight), 0);
  const currentPR =
    qualifying?.weight ??
    matchingRecord?.weight ??
    (highestFromSessions > 0 ? highestFromSessions : null);

  // Absolute highest weight across all sessions, never below the PR.
  const highestWeightCandidates = [highestFromSessions, currentPR ?? 0].filter((w) => w > 0);
  const highestWeight =
    highestWeightCandidates.length > 0 ? Math.max(...highestWeightCandidates) : null;

  const totalSessions = sessions.length;
  const weights = sessions.map((s) => s.weight).filter((w) => w > 0);
  const reps = sessions.map((s) => s.reps).filter((r) => r > 0);
  const sets = sessions.map((s) => s.sets).filter((s) => s > 0);

  const stats: ExerciseStats = {
    currentPR,
    highestWeight,
    averageWeight: average(weights),
    averageReps: average(reps),
    averageSets: average(sets),
    totalSessions,
    totalVolume: sessions.reduce((sum, s) => sum + s.volume, 0),
    firstWorkoutDate: chronological[0]?.date ?? null,
    lastWorkoutDate: sessions[0]?.date ?? null,
  };

  return {
    exerciseName,
    bodyPart,
    category,
    stats,
    sessions,
    milestones: buildMilestones(chronological),
    insights: buildInsights(chronological, currentPR),
    hasEnoughDataForTrends: totalSessions >= MIN_SESSIONS_FOR_TRENDS,
  };
}
