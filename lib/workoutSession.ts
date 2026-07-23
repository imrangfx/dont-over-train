/**
 * Active workout session timing — single source of truth for the in-progress
 * timer. Persisted separately from `currentWorkout` (exercise list) so timing
 * can start/stop without mutating exercise data.
 *
 * Lifecycle:
 * 1. Start Workout → startWorkoutSession() writes startedAt once
 * 2. Live timer always reads startedAt from storage (survives refresh)
 * 3. Finish → clear active session + stash a one-shot summary draft
 * 4. Leaving summary → clear draft; never recreate a session automatically
 */

const SESSION_KEY = "activeWorkoutSession";
const SUMMARY_KEY = "completedWorkoutSummary";
const CURRENT_WORKOUT_KEY = "currentWorkout";

export type ActiveWorkoutSession = {
  /** Unix ms when the user tapped Start Workout (sessionStartTime). */
  startedAt: number;
};

/** Snapshot kept only for the Workout Summary screen after the active session ends. */
export type CompletedWorkoutSummary = {
  exercises: unknown[];
  startedAt: number;
  endedAt: number;
  durationMinutes: number;
};

function canUseStorage(): boolean {
  return typeof window !== "undefined";
}

export function getActiveWorkoutSession(): ActiveWorkoutSession | null {
  if (!canUseStorage()) return null;

  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw) as Partial<ActiveWorkoutSession>;
    if (typeof parsed.startedAt !== "number" || !Number.isFinite(parsed.startedAt)) {
      return null;
    }

    return { startedAt: parsed.startedAt };
  } catch {
    return null;
  }
}

/**
 * Creates a session with the current timestamp. No-ops if one already exists
 * so Start Workout is idempotent (only once per workout).
 */
export function startWorkoutSession(now = Date.now()): ActiveWorkoutSession {
  const existing = getActiveWorkoutSession();
  if (existing) return existing;

  const session: ActiveWorkoutSession = { startedAt: now };
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  return session;
}

export function clearWorkoutSession(): void {
  if (!canUseStorage()) return;
  localStorage.removeItem(SESSION_KEY);
}

/** Clears the in-progress exercise list. Safe to call after a workout is saved. */
export function clearCurrentWorkoutExercises(): void {
  if (!canUseStorage()) return;
  localStorage.removeItem(CURRENT_WORKOUT_KEY);
}

/**
 * Elapsed ms from the persisted sessionStartTime.
 * Always re-reads storage so the timer never depends on React UI state.
 */
export function getLiveElapsedMs(now = Date.now()): number {
  const session = getActiveWorkoutSession();
  if (!session) return 0;
  return Math.max(0, now - session.startedAt);
}

export function getSessionElapsedMs(
  session: ActiveWorkoutSession | null,
  now = Date.now()
): number {
  if (!session) return 0;
  return Math.max(0, now - session.startedAt);
}

/** Whole minutes for history storage. Minimum 1 once a session has started. */
export function getSessionDurationMinutes(
  startedAt: number,
  endedAt: number
): number {
  const ms = Math.max(0, endedAt - startedAt);
  return Math.max(1, Math.round(ms / 60_000));
}

/**
 * Marks the active session complete: persists a summary draft for the
 * complete screen, then clears the active session and in-progress exercises
 * so Start Workout can never reopen for this workout.
 */
export function completeWorkoutSession(summary: CompletedWorkoutSummary): void {
  if (!canUseStorage()) return;

  try {
    sessionStorage.setItem(SUMMARY_KEY, JSON.stringify(summary));
  } catch {
    // sessionStorage may be unavailable; summary still lives in React state.
  }

  clearWorkoutSession();
  clearCurrentWorkoutExercises();
}

export function getCompletedWorkoutSummary(): CompletedWorkoutSummary | null {
  if (!canUseStorage()) return null;

  try {
    const raw = sessionStorage.getItem(SUMMARY_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw) as Partial<CompletedWorkoutSummary>;
    if (!Array.isArray(parsed.exercises)) return null;
    if (typeof parsed.startedAt !== "number") return null;
    if (typeof parsed.endedAt !== "number") return null;
    if (typeof parsed.durationMinutes !== "number") return null;

    return {
      exercises: parsed.exercises,
      startedAt: parsed.startedAt,
      endedAt: parsed.endedAt,
      durationMinutes: parsed.durationMinutes,
    };
  } catch {
    return null;
  }
}

export function clearCompletedWorkoutSummary(): void {
  if (!canUseStorage()) return;
  try {
    sessionStorage.removeItem(SUMMARY_KEY);
  } catch {
    // ignore
  }
}

/** Live timer display: HH:MM:SS */
export function formatElapsedClock(ms: number): string {
  const totalSeconds = Math.floor(Math.max(0, ms) / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return [
    String(hours).padStart(2, "0"),
    String(minutes).padStart(2, "0"),
    String(seconds).padStart(2, "0"),
  ].join(":");
}

/** Compact duration for Profile / analysis copy: `52h 18m`, `58m`, `2h 14m`. */
export function formatDurationMinutes(totalMinutes: number): string {
  const minutes = Math.max(0, Math.round(totalMinutes));
  if (minutes < 60) return `${minutes}m`;

  const hours = Math.floor(minutes / 60);
  const remaining = minutes % 60;
  if (remaining === 0) return `${hours}h`;
  return `${hours}h ${remaining}m`;
}

/** Clock time for the Start Workout page: `11:03 AM`. */
export function formatClockTime(date = new Date()): string {
  return date.toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
  });
}
