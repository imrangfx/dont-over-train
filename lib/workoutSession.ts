/**
 * Workout session state — reusable foundation for timed and untimed workouts.
 *
 * Persisted alongside `currentWorkout` (exercise list) under a separate key so
 * session timing can evolve without mutating exercise logging data.
 *
 * Flows:
 * 1. Start Workout → startWorkoutSession() records startedAt and runs a timer
 * 2. Continue Without Timer → logging without a timer; duration entered manually
 *    via setManualWorkoutDuration() before complete
 *
 * Existing callers that use ActiveWorkoutSession helpers remain supported via
 * thin adapters over this model.
 */

const SESSION_KEY = "activeWorkoutSession";
const SUMMARY_KEY = "completedWorkoutSummary";
const CURRENT_WORKOUT_KEY = "currentWorkout";

/**
 * Canonical in-progress workout session.
 * - started / startedAt: timer path
 * - durationMinutes + manualDuration: untimed / manual-entry path (future)
 */
export type WorkoutSession = {
  started: boolean;
  startedAt: number | null;
  durationMinutes: number | null;
  manualDuration: boolean;
};

/** @deprecated Prefer WorkoutSession. Kept for existing timer UI adapters. */
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

export const IDLE_WORKOUT_SESSION: WorkoutSession = {
  started: false,
  startedAt: null,
  durationMinutes: null,
  manualDuration: false,
};

function canUseStorage(): boolean {
  return typeof window !== "undefined";
}

function isValidStartedAt(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

/**
 * Coerce raw storage (new WorkoutSession or legacy `{ startedAt }`) into the
 * canonical session model.
 */
function normalizeWorkoutSession(raw: unknown): WorkoutSession {
  if (!raw || typeof raw !== "object") {
    return { ...IDLE_WORKOUT_SESSION };
  }

  const parsed = raw as Partial<WorkoutSession> & { startedAt?: unknown };

  // Legacy shape: `{ startedAt: number }` only.
  if (
    isValidStartedAt(parsed.startedAt) &&
    typeof parsed.started !== "boolean"
  ) {
    return {
      started: true,
      startedAt: parsed.startedAt,
      durationMinutes: null,
      manualDuration: false,
    };
  }

  const startedAt = isValidStartedAt(parsed.startedAt) ? parsed.startedAt : null;
  const started =
    typeof parsed.started === "boolean" ? parsed.started : startedAt != null;

  return {
    started,
    startedAt: started ? startedAt : null,
    durationMinutes:
      typeof parsed.durationMinutes === "number" &&
      Number.isFinite(parsed.durationMinutes)
        ? parsed.durationMinutes
        : null,
    manualDuration: parsed.manualDuration === true,
  };
}

function writeWorkoutSession(session: WorkoutSession): void {
  if (!canUseStorage()) return;
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

/** Read the persisted workout session (idle defaults when none exists). */
export function getWorkoutSession(): WorkoutSession {
  if (!canUseStorage()) return { ...IDLE_WORKOUT_SESSION };

  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return { ...IDLE_WORKOUT_SESSION };
    return normalizeWorkoutSession(JSON.parse(raw));
  } catch {
    return { ...IDLE_WORKOUT_SESSION };
  }
}

export function isWorkoutStarted(): boolean {
  return getWorkoutSession().started === true;
}

/**
 * Marks the session as started and records startedAt once.
 * Idempotent — if already started, returns the existing session unchanged.
 */
export function startWorkoutSession(now = Date.now()): WorkoutSession {
  const existing = getWorkoutSession();
  if (existing.started && isValidStartedAt(existing.startedAt)) {
    return existing;
  }

  const session: WorkoutSession = {
    started: true,
    startedAt: now,
    durationMinutes: null,
    manualDuration: false,
  };
  writeWorkoutSession(session);
  return session;
}

/** Clears session timing back to the idle foundation state. */
export function resetWorkoutSession(): void {
  if (!canUseStorage()) return;
  localStorage.removeItem(SESSION_KEY);
}

/**
 * Records a manually entered duration for an untimed workout.
 * Minimum 1 minute. Does not start a timer.
 */
export function setManualWorkoutDuration(minutes: number): WorkoutSession {
  const durationMinutes = Math.max(1, Math.round(Number(minutes) || 0));
  const session: WorkoutSession = {
    started: false,
    startedAt: null,
    durationMinutes,
    manualDuration: true,
  };
  writeWorkoutSession(session);
  return session;
}

export type ResolvedWorkoutDuration = {
  durationMinutes: number;
  startedAt: number;
  endedAt: number;
  manualDuration: boolean;
};

/**
 * Resolves final duration for save/complete from the current WorkoutSession.
 * Timed sessions use startedAt → endedAt; manual sessions use durationMinutes.
 */
export function resolveWorkoutDuration(
  session: WorkoutSession = getWorkoutSession(),
  endedAt = Date.now()
): ResolvedWorkoutDuration | null {
  if (session.started && isValidStartedAt(session.startedAt)) {
    return {
      durationMinutes: getSessionDurationMinutes(session.startedAt, endedAt),
      startedAt: session.startedAt,
      endedAt,
      manualDuration: false,
    };
  }

  if (
    session.manualDuration &&
    typeof session.durationMinutes === "number" &&
    Number.isFinite(session.durationMinutes) &&
    session.durationMinutes >= 1
  ) {
    const durationMinutes = Math.max(1, Math.round(session.durationMinutes));
    return {
      durationMinutes,
      startedAt: endedAt - durationMinutes * 60_000,
      endedAt,
      manualDuration: true,
    };
  }

  return null;
}

/** True when the session can be completed (timed or manual duration set). */
export function canCompleteWorkoutSession(
  session: WorkoutSession = getWorkoutSession()
): boolean {
  return resolveWorkoutDuration(session) != null;
}

/**
 * @deprecated Prefer getWorkoutSession(). Adapter for existing timer UI.
 * Returns `{ startedAt }` only when a timed session is active.
 */
export function getActiveWorkoutSession(): ActiveWorkoutSession | null {
  const session = getWorkoutSession();
  if (!session.started || !isValidStartedAt(session.startedAt)) {
    return null;
  }
  return { startedAt: session.startedAt };
}

/** @deprecated Prefer resetWorkoutSession(). */
export function clearWorkoutSession(): void {
  resetWorkoutSession();
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
  const session = getWorkoutSession();
  if (!session.started || !isValidStartedAt(session.startedAt)) return 0;
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

  resetWorkoutSession();
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
