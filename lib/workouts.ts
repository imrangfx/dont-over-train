import { supabase } from "@/lib/supabase";

export type WorkoutExercise = {
  name: string;
  bodyPart: string;
  section: string;
  sets: number;
  reps: number;
  weights: (number | "")[];
  fatigueBreakdown: Record<string, number>;
};

/**
 * Shape of one exercise entry in the `currentWorkout` localStorage array
 * while a workout is still in progress (before it's saved as a
 * WorkoutHistoryEntry on the complete page). Written by
 * app/exercise/[slug]/page.tsx, read/mutated by app/workout/session/page.tsx
 * and app/workout/complete/page.tsx.
 */
export type InProgressWorkoutItem = {
  exercise: string;
  slug: string;
  sets: number;
  reps: number;
  setWeights: (number | "")[];
  weight?: number;
  bodyPart: string;
  section?: string;
  sourcePath: string;
  fatigue: number;
  primaryMuscle?: string;
  fatigueBreakdown: Record<string, number>;
};

export type WorkoutHistoryEntry = {
  id: string;
  date: string;
  timestamp: number;
  exercises: number;
  sets: number;
  reps: number;
  durationMinutes: number;
  score: number;
  bodyParts: string[];
  sections: string[];
  exerciseList: WorkoutExercise[];
  fatigueBreakdown: Record<string, number>;
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
  bestWorkoutScore: string;
  averageWorkoutTime: string;
  totalReps: string;
  totalSets: string;
};

const EMPTY_INSIGHTS: WorkoutInsights = {
  mostTrainedMuscle: "-",
  bestWorkoutScore: "-",
  averageWorkoutTime: "-",
  totalReps: "-",
  totalSets: "-",
};

/** Aggregate insights for a (possibly filtered) workout history list. */
export function calculateWorkoutInsights(
  workouts: Array<{
    bodyParts?: string[];
    score?: number;
    durationMinutes?: number;
    reps?: number;
    sets?: number;
  }>
): WorkoutInsights {
  if (!workouts || workouts.length === 0) {
    return EMPTY_INSIGHTS;
  }

  const muscleCounts: Record<string, number> = {};
  let bestScore = 0;
  let totalDuration = 0;
  let totalReps = 0;
  let totalSets = 0;

  for (const workout of workouts) {
    for (const muscle of workout.bodyParts || []) {
      if (!muscle) continue;
      muscleCounts[muscle] = (muscleCounts[muscle] || 0) + 1;
    }

    const score = Number(workout.score) || 0;
    if (score > bestScore) bestScore = score;

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
    bestWorkoutScore: bestScore > 0 ? String(bestScore) : "-",
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
    durationMinutes: row.duration_minutes ?? 0,
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
  const { data, error } = await supabase.auth.getSession();
  if (error) return null;
  return data.session?.user?.id ?? null;
}

/**
 * Detects Supabase/PostgREST errors caused by an expired or invalid session
 * (JWT/refresh token), as opposed to unrelated failures (network, RLS,
 * validation, offline). Used to decide whether a session refresh + retry
 * can recover a failed write, and whether a failure should be reported to
 * the user as "signed out" rather than a generic sync error.
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
    lower.includes("token is expired")
  );
}

/**
 * Makes sure the current session's access token is fresh before a Supabase
 * write. supabase-js already refreshes proactively inside getSession(), but
 * a workout screen can sit open (long set rest, backgrounded tab) long
 * enough that the token is already past its expiry margin by the time we're
 * ready to sync - this closes that gap by refreshing explicitly first.
 * Returns false only when the user is no longer authenticated (missing or
 * invalid refresh token), so callers can fail gracefully instead of firing a
 * write that's guaranteed to hit an expired-JWT error.
 */
export async function ensureFreshSession(): Promise<boolean> {
  const { data, error } = await supabase.auth.getSession();
  if (error || !data.session) return false;

  const expiresAt = data.session.expires_at;
  const expiringSoon =
    typeof expiresAt === "number" && expiresAt * 1000 - Date.now() < 60_000;

  if (!expiringSoon) return true;

  const { data: refreshed, error: refreshError } = await supabase.auth.refreshSession();
  return !refreshError && !!refreshed.session;
}

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
): Promise<{ error: string | null; authExpired?: boolean }> {
  try {
    if (!(await ensureFreshSession())) {
      return { error: "Your session has expired.", authExpired: true };
    }

    // The workouts.user_id -> profiles.id foreign key requires the profile
    // row to exist first. This is normally already created at login, but we
    // guard here too so a save never fails purely due to a missing profile.
    const { error: profileError } = await ensureProfileExists(userId);
    if (profileError) {
      return { error: profileError, authExpired: isAuthSessionError(profileError) };
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

    // Reactive fallback: if the access token expired in the gap between the
    // proactive check above and this request actually reaching the server,
    // refresh once more and retry the exact same write before giving up.
    if (error && isAuthSessionError(error.message)) {
      const refreshed = await ensureFreshSession();
      if (refreshed) {
        ({ error } = await supabase.from("workouts").upsert(payload, { onConflict: "id" }));
      }
    }

    if (error) {
      return { error: error.message, authExpired: isAuthSessionError(error.message) };
    }

    markLastSynced();
    return { error: null };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to sync workout.";
    return { error: message, authExpired: isAuthSessionError(message) };
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
