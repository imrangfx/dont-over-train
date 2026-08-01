import { supabase } from "@/lib/supabase";
import type { ExerciseTrackingType } from "@/app/Data/exercises";
import type { RecoveryEngineResult } from "@/app/lib/recovery";

/**
 * Canonical per-set logging entry.
 *
 * - Weight exercises: `weight` + `reps`
 * - Bodyweight exercises: `reps` only
 * - Duration exercises: `durationSeconds` only
 *
 * Empty weight uses "" while the user is still filling in the logger UI.
 * Older history entries may omit `durationSeconds`; those keep working as-is.
 */
export type WorkoutSet = {
  weight?: number | "";
  reps?: number;
  durationSeconds?: number;
};

/**
 * Persisted history exercise shape.
 * Legacy entries use `sets` (count) + shared `reps` + `weights`.
 * Newer entries also store `loggedSets` so each set keeps its own reps
 * (and optional `durationSeconds` for duration-tracked exercises).
 */
export type WorkoutExercise = {
  name: string;
  bodyPart: string;
  section: string;
  sets: number;
  reps: number;
  weights: (number | "")[];
  /** Canonical per-set load data (preferred when present). */
  loggedSets?: WorkoutSet[];
  fatigueBreakdown: Record<string, number>;
};

/**
 * Shape of one exercise entry in the `currentWorkout` localStorage array
 * while a workout is still in progress (before it's saved as a
 * WorkoutHistoryEntry on the complete page). Written by
 * app/exercise/[slug]/page.tsx, read/mutated by app/workout/session/page.tsx
 * and app/workout/complete/page.tsx.
 *
 * Canonical load data is `sets: WorkoutSet[]`. Optional legacy fields may
 * still appear in older in-progress localStorage payloads and are normalized
 * on read via `normalizeInProgressItem`.
 */
export type InProgressWorkoutItem = {
  exercise: string;
  slug: string;
  /** Per-set load data (new logging foundation). */
  sets: WorkoutSet[];
  bodyPart: string;
  section?: string;
  sourcePath: string;
  fatigue: number;
  primaryMuscle?: string;
  fatigueBreakdown: Record<string, number>;
  /** @deprecated Legacy single weight — normalized into `sets` on read. */
  weight?: number;
  /** @deprecated Legacy shared reps — normalized into `sets` on read. */
  reps?: number;
  /** @deprecated Legacy weight array — normalized into `sets` on read. */
  setWeights?: (number | "")[];
};

/** Loose input accepted by normalize helpers (new or legacy shapes). */
export type ExerciseLoadInput = {
  sets?: number | WorkoutSet[];
  reps?: number;
  weights?: (number | "")[];
  setWeights?: (number | "")[];
  weight?: number;
  loggedSets?: WorkoutSet[];
};

/** Build N weight/bodyweight sets that share the same reps. */
export function buildWorkoutSets(
  count: number,
  reps: number,
  weights?: (number | "")[]
): WorkoutSet[] {
  const n = Math.max(0, Math.floor(count));
  const sharedReps = Number(reps) || 0;
  return Array.from({ length: n }, (_, i) => ({
    weight: weights?.[i] ?? "",
    reps: sharedReps,
  }));
}

/** Build N duration-only sets that share the same duration. */
export function buildDurationWorkoutSets(
  count: number,
  durationSeconds: number
): WorkoutSet[] {
  const n = Math.max(0, Math.floor(count));
  const seconds = Math.max(0, Number(durationSeconds) || 0);
  return Array.from({ length: n }, () => ({
    durationSeconds: seconds,
  }));
}

function coerceWorkoutSet(raw: unknown): WorkoutSet {
  const set = (raw && typeof raw === "object" ? raw : {}) as Partial<WorkoutSet>;

  const hasDuration =
    typeof set.durationSeconds === "number" &&
    !Number.isNaN(set.durationSeconds);
  const weight =
    typeof set.weight === "number" || set.weight === ""
      ? set.weight
      : "";
  const reps = Number(set.reps) || 0;
  const hasMeaningfulWeight = typeof weight === "number" && weight > 0;
  const hasMeaningfulReps = reps > 0;

  // Duration-only payloads stay duration-only (no invented weight/reps).
  if (hasDuration && !hasMeaningfulWeight && !hasMeaningfulReps) {
    return { durationSeconds: set.durationSeconds };
  }

  // Legacy / weight / bodyweight sets — omit durationSeconds when absent.
  const next: WorkoutSet = {
    weight,
    reps,
  };

  if (hasDuration) {
    next.durationSeconds = set.durationSeconds;
  }

  return next;
}

function coerceWorkoutSetList(raw: WorkoutSet[] | undefined): WorkoutSet[] | null {
  if (!Array.isArray(raw) || raw.length === 0) return null;
  if (typeof raw[0] !== "object" || raw[0] == null) return null;

  return raw.map((set) => coerceWorkoutSet(set));
}

/**
 * Normalize legacy (`sets` count + shared `reps` + weights) or already-new
 * (`loggedSets` / `sets: WorkoutSet[]`) payloads into the canonical per-set array.
 */
export function normalizeWorkoutSets(input: ExerciseLoadInput | null | undefined): WorkoutSet[] {
  if (!input) return [];

  const fromLogged = coerceWorkoutSetList(input.loggedSets);
  if (fromLogged) return fromLogged;

  if (Array.isArray(input.sets)) {
    const fromSets = coerceWorkoutSetList(input.sets);
    if (fromSets) return fromSets;
  }

  const count = Number(input.sets) || 0;
  const reps = Number(input.reps) || 0;
  const weights =
    input.setWeights ??
    input.weights ??
    (typeof input.weight === "number" ? [input.weight] : []);

  return buildWorkoutSets(count, reps, weights);
}

export function workoutSetCount(sets: WorkoutSet[]): number {
  return sets.length;
}

/** Sum of per-set reps (equals count × shared reps when all sets match). */
export function workoutTotalReps(sets: WorkoutSet[]): number {
  return sets.reduce((sum, set) => sum + (Number(set.reps) || 0), 0);
}

/**
 * Display / shared-reps value used by the current single-reps UI and by
 * legacy history fields. Prefers the first set's reps.
 */
export function workoutDisplayReps(sets: WorkoutSet[]): number {
  return Number(sets[0]?.reps) || 0;
}

export function workoutWeights(sets: WorkoutSet[]): (number | "")[] {
  return sets.map((set) => set.weight ?? "");
}

/**
 * Display formatting for a duration in seconds.
 * Below 60s: `30s`. At 60+: `1m`, `1m 5s`, `2m`, etc.
 * Does not alter stored values.
 */
export function formatDurationSeconds(totalSeconds: number): string {
  const seconds = Math.floor(Number(totalSeconds));
  if (!Number.isFinite(seconds) || seconds <= 0) return "";

  if (seconds < 60) return `${seconds}s`;

  const minutes = Math.floor(seconds / 60);
  const remainder = seconds % 60;
  if (remainder === 0) return `${minutes}m`;
  return `${minutes}m ${remainder}s`;
}

/**
 * Compact gym-style set summary from WorkoutSet[], driven by trackingType.
 *
 * - weight: `60×10 • 70×8 • 80×6`
 * - bodyweight: `15 • 12 • 10`
 * - duration: `30s • 1m • 1m 30s`
 *
 * Empty / zero values are omitted. Order is preserved; sets are never merged.
 */
export function formatWorkoutSetsSummary(
  sets: WorkoutSet[],
  trackingType: ExerciseTrackingType = "weight"
): string {
  return sets
    .map((set) => formatWorkoutSetSummaryPart(set, trackingType))
    .filter((part): part is string => part != null && part !== "")
    .join(" • ");
}

function formatWorkoutSetSummaryPart(
  set: WorkoutSet,
  trackingType: ExerciseTrackingType
): string | null {
  if (trackingType === "duration") {
    const seconds = Number(set.durationSeconds);
    if (!Number.isFinite(seconds) || seconds <= 0) return null;
    const formatted = formatDurationSeconds(seconds);
    return formatted || null;
  }

  if (trackingType === "bodyweight") {
    const reps = Number(set.reps);
    if (!Number.isFinite(reps) || reps <= 0) return null;
    return String(reps);
  }

  // weight — require both weight and reps; never fall back to reps-only.
  const weight = set.weight;
  const reps = Number(set.reps);
  if (typeof weight !== "number" || !Number.isFinite(weight) || weight <= 0) {
    return null;
  }
  if (!Number.isFinite(reps) || reps <= 0) return null;
  return `${weight}×${reps}`;
}

/** Serialize one set for persistence, preserving optional durationSeconds. */
export function serializeWorkoutSet(set: WorkoutSet): WorkoutSet {
  const hasDuration =
    typeof set.durationSeconds === "number" &&
    !Number.isNaN(set.durationSeconds);
  const hasWeight = typeof set.weight === "number" && set.weight > 0;
  const hasReps = (Number(set.reps) || 0) > 0;

  // Duration exercises store durationSeconds only.
  if (hasDuration && !hasWeight && !hasReps) {
    return { durationSeconds: set.durationSeconds };
  }

  const serialized: WorkoutSet = {
    weight: set.weight ?? "",
    reps: Number(set.reps) || 0,
  };

  if (hasDuration) {
    serialized.durationSeconds = set.durationSeconds;
  }

  return serialized;
}

/** Map canonical sets to persisted history exercise load fields. */
export function toLegacyExerciseFields(sets: WorkoutSet[]): {
  sets: number;
  reps: number;
  weights: (number | "")[];
  loggedSets: WorkoutSet[];
} {
  return {
    sets: workoutSetCount(sets),
    reps: workoutDisplayReps(sets),
    weights: workoutWeights(sets),
    // Preserve each set's own reps / duration (fixes shared-reps collapse on save).
    loggedSets: sets.map((set) => serializeWorkoutSet(set)),
  };
}

/**
 * Coerce a raw `currentWorkout` localStorage entry (new or legacy) into
 * `InProgressWorkoutItem` with canonical `sets: WorkoutSet[]`.
 */
export function normalizeInProgressItem(
  raw: unknown
): InProgressWorkoutItem | null {
  if (!raw || typeof raw !== "object") return null;

  const item = raw as Partial<InProgressWorkoutItem> & ExerciseLoadInput;
  if (typeof item.exercise !== "string" || typeof item.slug !== "string") {
    return null;
  }

  const sets = normalizeWorkoutSets(item);

  return {
    exercise: item.exercise,
    slug: item.slug,
    sets,
    bodyPart: typeof item.bodyPart === "string" ? item.bodyPart : "",
    section: item.section,
    sourcePath: typeof item.sourcePath === "string" ? item.sourcePath : "/",
    fatigue: Number(item.fatigue) || 0,
    primaryMuscle: item.primaryMuscle,
    fatigueBreakdown:
      item.fatigueBreakdown && typeof item.fatigueBreakdown === "object"
        ? item.fatigueBreakdown
        : {},
  };
}

export function normalizeInProgressList(raw: unknown): InProgressWorkoutItem[] {
  const list = Array.isArray(raw) ? raw : raw ? [raw] : [];
  return list
    .map((item) => normalizeInProgressItem(item))
    .filter((item): item is InProgressWorkoutItem => item != null);
}

export type WorkoutHistoryEntry = {
  id: string;
  date: string;
  timestamp: number;
  exercises: number;
  sets: number;
  reps: number;
  /** Real session duration in whole minutes (from workout session timer). */
  durationMinutes: number;
  /** Unix ms when Start Workout was tapped. Optional for older history entries. */
  startedAt?: number;
  /** Unix ms when Finish Workout completed the session. */
  endedAt?: number;
  score: number;
  bodyParts: string[];
  sections: string[];
  exerciseList: WorkoutExercise[];
  fatigueBreakdown: Record<string, number>;
  /** Recovery Engine snapshot at complete time. Optional for older history. */
  recovery?: RecoveryEngineResult;
};

export function toLocalDayKey(ms: number): string {
  const d = new Date(ms);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/**
 * Hours of rest recommended for a muscle at a given cumulative fatigue
 * value (0-100+). Same tiers already used for in-workout recovery
 * guidance (see app/workout/session/page.tsx), extracted here so the Home
 * dashboard's Recovery Score can reuse the identical rule.
 */
export function recoveryHoursForFatigue(value: number): number {
  if (value <= 30) return 24;
  if (value <= 60) return 48;
  if (value <= 80) return 72;
  return 96;
}

function previousLocalDayKey(dayKey: string): string {
  const [y, m, d] = dayKey.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  date.setDate(date.getDate() - 1);
  return toLocalDayKey(date.getTime());
}

/**
 * Consecutive calendar days with at least one workout.
 * Starts from today if present, otherwise yesterday; otherwise 0.
 * Same-day workouts count once.
 */
export function calculateCurrentStreak(
  workouts: Array<{ timestamp?: number; date?: string }>
): number {
  if (!workouts || workouts.length === 0) return 0;

  const uniqueDays = new Set<string>();

  for (const workout of workouts) {
    const ms =
      typeof workout.timestamp === "number" && !Number.isNaN(workout.timestamp)
        ? workout.timestamp
        : workout.date
          ? new Date(workout.date).getTime()
          : NaN;

    if (Number.isNaN(ms)) continue;
    uniqueDays.add(toLocalDayKey(ms));
  }

  if (uniqueDays.size === 0) return 0;

  const todayKey = toLocalDayKey(Date.now());
  const yesterdayKey = previousLocalDayKey(todayKey);

  let cursor: string;
  if (uniqueDays.has(todayKey)) {
    cursor = todayKey;
  } else if (uniqueDays.has(yesterdayKey)) {
    cursor = yesterdayKey;
  } else {
    return 0;
  }

  let streak = 0;
  while (uniqueDays.has(cursor)) {
    streak++;
    cursor = previousLocalDayKey(cursor);
  }

  return streak;
}

export type WorkoutInsights = {
  mostTrainedMuscle: string;
  averageWorkoutTime: string;
  totalReps: string;
  totalSets: string;
};

const EMPTY_INSIGHTS: WorkoutInsights = {
  mostTrainedMuscle: "-",
  averageWorkoutTime: "-",
  totalReps: "-",
  totalSets: "-",
};

/** Aggregate insights for a (possibly filtered) workout history list. */
export function calculateWorkoutInsights(
  workouts: Array<{
    bodyParts?: string[];
    durationMinutes?: number;
    reps?: number;
    sets?: number;
  }>
): WorkoutInsights {
  if (!workouts || workouts.length === 0) {
    return EMPTY_INSIGHTS;
  }

  const muscleCounts: Record<string, number> = {};
  let totalDuration = 0;
  let totalReps = 0;
  let totalSets = 0;

  for (const workout of workouts) {
    for (const muscle of workout.bodyParts || []) {
      if (!muscle) continue;
      muscleCounts[muscle] = (muscleCounts[muscle] || 0) + 1;
    }

    totalDuration += Number(workout.durationMinutes) || 0;
    totalReps += Number(workout.reps) || 0;
    totalSets += Number(workout.sets) || 0;
  }

  let mostTrainedMuscle = "-";
  let topCount = 0;
  for (const [muscle, count] of Object.entries(muscleCounts)) {
    if (count > topCount) {
      topCount = count;
      mostTrainedMuscle = muscle;
    }
  }

  const avgMinutes = Math.round(totalDuration / workouts.length);

  return {
    mostTrainedMuscle,
    averageWorkoutTime: avgMinutes > 0 ? String(avgMinutes) : "-",
    totalReps: totalReps > 0 ? totalReps.toLocaleString() : "-",
    totalSets: totalSets > 0 ? totalSets.toLocaleString() : "-",
  };
}

const LOCAL_KEY = "workoutHistory";
const MIGRATION_LOCK_KEY = "guestMigrationInProgress";
const LAST_SYNCED_KEY = "lastSyncedAt";

export function getLastSyncedAt(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(LAST_SYNCED_KEY);
}

function markLastSynced() {
  if (typeof window === "undefined") return;
  localStorage.setItem(LAST_SYNCED_KEY, new Date().toISOString());
}

function readLocalHistory(): WorkoutHistoryEntry[] {
  try {
    const raw = JSON.parse(localStorage.getItem(LOCAL_KEY) || "[]");
    return Array.isArray(raw) ? raw : [raw];
  } catch {
    return [];
  }
}

/** Raw shape of a `workouts` table row as returned by the Supabase client. */
export type WorkoutRow = {
  id: string;
  workout_date: string;
  total_sets?: number | null;
  total_reps?: number | null;
  duration_minutes?: number | null;
  workout_score?: number | null;
  body_parts?: string[] | string | null;
  fatigue?: Partial<WorkoutHistoryEntry> | null;
};

/**
 * Exported so any caller reading raw `workouts` rows (e.g. lib/profilePublic.ts
 * for a friend's history) can reuse this exact row->entry mapping instead of
 * duplicating it.
 */
export function rowToEntry(row: WorkoutRow): WorkoutHistoryEntry {
  const snapshot = row.fatigue && typeof row.fatigue === "object" ? row.fatigue : {};

  return {
    id: row.id,
    date: new Date(row.workout_date).toLocaleDateString(),
    timestamp: new Date(row.workout_date).getTime(),
    exercises:
      typeof snapshot.exercises === "number"
        ? snapshot.exercises
        : snapshot.exerciseList?.length ?? 0,
    sets: row.total_sets ?? 0,
    reps: row.total_reps ?? 0,
    durationMinutes: row.duration_minutes ?? snapshot.durationMinutes ?? 0,
    startedAt: typeof snapshot.startedAt === "number" ? snapshot.startedAt : undefined,
    endedAt: typeof snapshot.endedAt === "number" ? snapshot.endedAt : undefined,
    score: row.workout_score ?? 0,
    bodyParts: Array.isArray(row.body_parts)
      ? row.body_parts
      : typeof row.body_parts === "string" && row.body_parts.length > 0
        ? row.body_parts.split(",").map((s: string) => s.trim()).filter(Boolean)
        : snapshot.bodyParts || [],
    sections: snapshot.sections || [],
    exerciseList: snapshot.exerciseList || [],
    fatigueBreakdown: snapshot.fatigueBreakdown || {},
  };
}

export async function getCurrentUserId(): Promise<string | null> {
  // Prefer a validated user. getSession() alone can report a user id whose
  // access token is already dead.
  const { data, error } = await supabase.auth.getUser();
  if (!error && data.user?.id) return data.user.id;

  // Access JWT often expires during a long workout. Refresh through the
  // single-flight lock so this never races with ensureFreshSession /
  // personal-records refresh on the complete page.
  const refreshed = await refreshSessionSingleFlight("getCurrentUserId");
  if (refreshed.session?.user?.id) return refreshed.session.user.id;

  // Last resort: local session (offline / Auth briefly unreachable).
  const { data: sessionData } = await supabase.auth.getSession();
  return sessionData.session?.user?.id ?? null;
}

/**
 * Detects Supabase/PostgREST errors caused by an expired or invalid session
 * (JWT/refresh token), as opposed to unrelated failures (network, RLS,
 * validation, offline).
 *
 * NOTE: Keep this narrow. Over-matching (e.g. generic "unauthorized") marks
 * non-auth failures as authExpired and shows the sign-in warning while the
 * user is still signed in.
 */
function isAuthSessionError(message: string | null | undefined): boolean {
  if (!message) return false;
  const lower = message.toLowerCase();
  return (
    lower.includes("jwt") ||
    lower.includes("refresh token") ||
    lower.includes("refresh_token") ||
    lower.includes("session missing") ||
    lower.includes("session not found") ||
    lower.includes("session_not_found") ||
    lower.includes("not authenticated") ||
    lower.includes("invalid token") ||
    lower.includes("token is expired") ||
    lower.includes("invalid claim") ||
    lower.includes("authsessionmissing")
  );
}

function accessTokenMsRemaining(expiresAt: number | undefined): number {
  if (typeof expiresAt !== "number" || !Number.isFinite(expiresAt)) return 0;
  return expiresAt * 1000 - Date.now();
}

type RefreshFlightResult = {
  session: { user?: { id?: string }; expires_at?: number } | null;
  errorMessage: string | null;
};

/**
 * Single-flight refresh lock.
 *
 * ROOT CAUSE (production): Finish Workout runs two parallel async paths —
 * saveWorkoutHistoryEntry and recordWorkoutPersonalRecords — both calling
 * getUser/refreshSession. Supabase refresh tokens rotate; the second caller
 * uses a stale refresh token, Auth returns "Invalid Refresh Token", the
 * client clears the session, and ensureFreshSession() then returns false →
 * authExpired → "Couldn't sync to cloud" while the user still looks signed in.
 *
 * All refresh callers must share this lock so only one /token request runs.
 */
let refreshInFlight: Promise<RefreshFlightResult> | null = null;

function logSyncDiag(
  event: string,
  detail: Record<string, unknown> = {}
): void {
  // Visible in the browser console on Vercel production — do not remove until
  // the intermittent sync warning is confirmed gone.
  console.warn(`[workout-sync] ${event}`, detail);
}

async function refreshSessionSingleFlight(
  reason: string
): Promise<RefreshFlightResult> {
  if (refreshInFlight) {
    logSyncDiag("refresh_join", { reason });
    return refreshInFlight;
  }

  refreshInFlight = (async () => {
    logSyncDiag("refresh_start", { reason });
    try {
      const { data, error } = await supabase.auth.refreshSession();
      if (error) {
        logSyncDiag("refresh_error", { reason, message: error.message });
        const { data: latest } = await supabase.auth.getSession();
        return {
          session: latest.session,
          errorMessage: error.message,
        };
      }
      logSyncDiag("refresh_ok", {
        reason,
        expiresAt: data.session?.expires_at ?? null,
      });
      return { session: data.session, errorMessage: null };
    } catch (err) {
      const message = err instanceof Error ? err.message : "refresh threw";
      logSyncDiag("refresh_throw", { reason, message });
      const { data: latest } = await supabase.auth.getSession();
      return { session: latest.session, errorMessage: message };
    } finally {
      refreshInFlight = null;
    }
  })();

  return refreshInFlight;
}

/**
 * Ensures a usable access token before Supabase writes.
 * Returns false only when there is no recoverable authenticated session.
 */
export async function ensureFreshSession(): Promise<boolean> {
  // Join any refresh already started by getCurrentUserId / PR sync.
  if (refreshInFlight) {
    const joined = await refreshInFlight;
    if (accessTokenMsRemaining(joined.session?.expires_at) > 0) return true;
  }

  const { data, error } = await supabase.auth.getSession();
  const session = !error ? data.session : null;

  if (!session) {
    const recovered = await refreshSessionSingleFlight("ensureFreshSession:no-session");
    const ok = accessTokenMsRemaining(recovered.session?.expires_at) > 0;
    logSyncDiag("ensureFreshSession:no-session", {
      ok,
      refreshError: recovered.errorMessage,
    });
    return ok;
  }

  const msLeft = accessTokenMsRemaining(session.expires_at);

  // Comfortable headroom — current token is fine for the upcoming write.
  if (msLeft > 60_000) {
    logSyncDiag("ensureFreshSession:headroom", { msLeft });
    return true;
  }

  const refreshed = await refreshSessionSingleFlight(
    msLeft > 0 ? "ensureFreshSession:expiring" : "ensureFreshSession:expired"
  );
  if (accessTokenMsRemaining(refreshed.session?.expires_at) > 0) return true;

  // Proactive refresh failed but access token still valid.
  if (msLeft > 0) {
    logSyncDiag("ensureFreshSession:keep-valid-token", {
      msLeft,
      refreshError: refreshed.errorMessage,
    });
    return true;
  }

  logSyncDiag("ensureFreshSession:failed", {
    msLeft,
    refreshError: refreshed.errorMessage,
  });
  return false;
}

/**
 * Force-refresh the session (ignores the "still has headroom" short-circuit).
 * Used after a write returns JWT expired so the retry uses a new access token.
 */
export async function forceRefreshSession(): Promise<boolean> {
  const refreshed = await refreshSessionSingleFlight("forceRefreshSession");
  return accessTokenMsRemaining(refreshed.session?.expires_at) > 0;
}

export type SaveWorkoutResult = {
  error: string | null;
  authExpired?: boolean;
  /** Which branch set authExpired — for production diagnosis. */
  authExpiredPath?:
    | "ensure_fresh_failed"
    | "profile_auth_error"
    | "upsert_auth_error"
    | "catch_auth_error";
};

/**
 * Ensures a public.profiles row exists for this user before anything that
 * depends on the workouts.user_id -> profiles.id foreign key runs (workout
 * inserts, guest migration). Safe to call repeatedly - it upserts by id and
 * only touches the metadata columns that are explicitly provided, so it
 * never clobbers an existing profile with nulls.
 */
export async function ensureProfileExists(
  userId: string,
  meta?: { full_name?: string | null; avatar_url?: string | null }
): Promise<{ error: string | null }> {
  try {
    const payload: Record<string, unknown> = { id: userId };

    if (meta?.full_name !== undefined) payload.full_name = meta.full_name;
    if (meta?.avatar_url !== undefined) payload.avatar_url = meta.avatar_url;

    const { error } = await supabase
      .from("profiles")
      .upsert(payload, { onConflict: "id" });

    return { error: error?.message ?? null };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Failed to create profile." };
  }
}

/**
 * Cloud-only save. Guest/localStorage saving stays inline where it already
 * lives. `authExpired` is set when the failure is due to the user no longer
 * having a valid session (as opposed to e.g. a network/offline error), so
 * callers can show a "sign in again" message instead of a generic one.
 */
export async function saveWorkoutHistoryEntry(
  entry: WorkoutHistoryEntry,
  userId: string
): Promise<SaveWorkoutResult> {
  try {
    if (!(await ensureFreshSession())) {
      logSyncDiag("authExpired", {
        path: "ensure_fresh_failed",
        userId,
        entryId: entry.id,
      });
      return {
        error: "Your session has expired.",
        authExpired: true,
        authExpiredPath: "ensure_fresh_failed",
      };
    }

    // The workouts.user_id -> profiles.id foreign key requires the profile
    // row to exist first. This is normally already created at login, but we
    // guard here too so a save never fails purely due to a missing profile.
    const { error: profileError } = await ensureProfileExists(userId);
    if (profileError) {
      const authExpired = isAuthSessionError(profileError);
      if (authExpired) {
        logSyncDiag("authExpired", {
          path: "profile_auth_error",
          message: profileError,
          userId,
          entryId: entry.id,
        });
      } else {
        logSyncDiag("save_profile_error", {
          message: profileError,
          userId,
          entryId: entry.id,
        });
      }
      return {
        error: profileError,
        authExpired,
        authExpiredPath: authExpired ? "profile_auth_error" : undefined,
      };
    }

    const payload = {
      id: entry.id,
      user_id: userId,
      workout_date: new Date(entry.timestamp || Date.now()).toISOString(),
      body_parts: entry.bodyParts,
      duration_minutes: entry.durationMinutes,
      total_sets: entry.sets,
      total_reps: entry.reps,
      workout_score: entry.score,
      fatigue: entry,
    };

    let { error } = await supabase.from("workouts").upsert(payload, { onConflict: "id" });

    // Reactive fallback: write used a JWT that expired in flight. Force-refresh
    // (single-flight) and retry once.
    if (error && isAuthSessionError(error.message)) {
      logSyncDiag("upsert_jwt_retry", {
        message: error.message,
        userId,
        entryId: entry.id,
      });
      if (await forceRefreshSession()) {
        ({ error } = await supabase.from("workouts").upsert(payload, { onConflict: "id" }));
        logSyncDiag("upsert_jwt_retry_result", {
          ok: !error,
          message: error?.message ?? null,
          entryId: entry.id,
        });
      }
    }

    if (error) {
      const authExpired = isAuthSessionError(error.message);
      if (authExpired) {
        logSyncDiag("authExpired", {
          path: "upsert_auth_error",
          message: error.message,
          userId,
          entryId: entry.id,
        });
      } else {
        logSyncDiag("save_upsert_error", {
          message: error.message,
          userId,
          entryId: entry.id,
        });
      }
      return {
        error: error.message,
        authExpired,
        authExpiredPath: authExpired ? "upsert_auth_error" : undefined,
      };
    }

    markLastSynced();
    logSyncDiag("save_ok", { userId, entryId: entry.id });
    return { error: null };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to sync workout.";
    const authExpired = isAuthSessionError(message);
    if (authExpired) {
      logSyncDiag("authExpired", {
        path: "catch_auth_error",
        message,
        userId,
        entryId: entry.id,
      });
    } else {
      logSyncDiag("save_throw", { message, userId, entryId: entry.id });
    }
    return {
      error: message,
      authExpired,
      authExpiredPath: authExpired ? "catch_auth_error" : undefined,
    };
  }
}

/**
 * Appends a workout to the local guest history store. Used both for guests
 * and as an offline/session-expired fallback for signed-in users so a
 * workout is never lost when cloud sync fails - migrateGuestHistoryToCloud()
 * picks it up and syncs it automatically the next time there's a valid
 * session.
 */
export function saveWorkoutHistoryEntryLocally(entry: WorkoutHistoryEntry): void {
  if (typeof window === "undefined") return;

  const history = readLocalHistory();
  if (history.some((item) => item.id === entry.id)) return;

  localStorage.setItem(LOCAL_KEY, JSON.stringify([entry, ...history]));
}

/**
 * Uploads any locally-stored guest workouts to Supabase after a guest signs
 * in. Safe to call on every session check - it no-ops if there is nothing
 * local to migrate, and upserts by id so re-running never creates duplicates.
 * Local history is only cleared once every entry has synced successfully,
 * so a failed attempt (e.g. offline) can be retried later without data loss.
 */
export async function migrateGuestHistoryToCloud(
  userId: string
): Promise<{ migrated: number; error: string | null }> {
  if (typeof window === "undefined") {
    return { migrated: 0, error: null };
  }

  const localHistory = readLocalHistory();

  if (localHistory.length === 0) {
    return { migrated: 0, error: null };
  }

  if (localStorage.getItem(MIGRATION_LOCK_KEY) === "true") {
    return { migrated: 0, error: null };
  }

  localStorage.setItem(MIGRATION_LOCK_KEY, "true");

  try {
    const { error: profileError } = await ensureProfileExists(userId);
    if (profileError) {
      return { migrated: 0, error: profileError };
    }

    for (const entry of localHistory) {
      const { error } = await saveWorkoutHistoryEntry(entry, userId);
      if (error) {
        return { migrated: 0, error };
      }
    }

    localStorage.removeItem(LOCAL_KEY);
    markLastSynced();
    return { migrated: localHistory.length, error: null };
  } finally {
    localStorage.removeItem(MIGRATION_LOCK_KEY);
  }
}

export async function loadWorkoutHistory(): Promise<{
  history: WorkoutHistoryEntry[];
  error: string | null;
}> {
  const userId = await getCurrentUserId();

  if (!userId) {
    return { history: readLocalHistory(), error: null };
  }

  try {
    const { data, error } = await supabase
      .from("workouts")
      .select("*")
      .eq("user_id", userId)
      .order("workout_date", { ascending: false });

    if (error) {
      return { history: [], error: error.message };
    }

    markLastSynced();
    return { history: (data || []).map(rowToEntry), error: null };
  } catch (err) {
    return {
      history: [],
      error: err instanceof Error ? err.message : "Failed to load workout history.",
    };
  }
}

/** Clears guest localStorage history or deletes all cloud workouts for the signed-in user. */
export async function deleteAllWorkoutHistory(): Promise<{ error: string | null }> {
  const userId = await getCurrentUserId();

  if (!userId) {
    try {
      localStorage.removeItem(LOCAL_KEY);
      return { error: null };
    } catch (err) {
      return {
        error: err instanceof Error ? err.message : "Failed to delete workout history.",
      };
    }
  }

  try {
    const { error } = await supabase.from("workouts").delete().eq("user_id", userId);
    if (error) return { error: error.message };
    return { error: null };
  } catch (err) {
    return {
      error: err instanceof Error ? err.message : "Failed to delete workout history.",
    };
  }
}

export async function loadWorkoutHistoryById(
  id: string
): Promise<{ workout: WorkoutHistoryEntry | null; error: string | null }> {
  const userId = await getCurrentUserId();

  if (!userId) {
    const history = readLocalHistory();
    return { workout: history.find((w) => w.id === id) || null, error: null };
  }

  try {
    const { data, error } = await supabase
      .from("workouts")
      .select("*")
      .eq("id", id)
      .eq("user_id", userId)
      .maybeSingle();

    if (error) {
      return { workout: null, error: error.message };
    }

    return { workout: data ? rowToEntry(data) : null, error: null };
  } catch (err) {
    return {
      workout: null,
      error: err instanceof Error ? err.message : "Failed to load workout.",
    };
  }
}
