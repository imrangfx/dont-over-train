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

function toLocalDayKey(ms: number): string {
  const d = new Date(ms);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
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

const LOCAL_KEY = "workoutHistory";
const MIGRATION_LOCK_KEY = "guestMigrationInProgress";

function readLocalHistory(): WorkoutHistoryEntry[] {
  try {
    const raw = JSON.parse(localStorage.getItem(LOCAL_KEY) || "[]");
    return Array.isArray(raw) ? raw : [raw];
  } catch {
    return [];
  }
}

function rowToEntry(row: any): WorkoutHistoryEntry {
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

/** Cloud-only save. Guest/localStorage saving stays inline where it already lives. */
export async function saveWorkoutHistoryEntry(
  entry: WorkoutHistoryEntry,
  userId: string
): Promise<{ error: string | null }> {
  try {
    // The workouts.user_id -> profiles.id foreign key requires the profile
    // row to exist first. This is normally already created at login, but we
    // guard here too so a save never fails purely due to a missing profile.
    const { error: profileError } = await ensureProfileExists(userId);
    if (profileError) {
      return { error: profileError };
    }

    const { error } = await supabase.from("workouts").upsert(
      {
        id: entry.id,
        user_id: userId,
        workout_date: new Date(entry.timestamp || Date.now()).toISOString(),
        body_parts: entry.bodyParts,
        duration_minutes: entry.durationMinutes,
        total_sets: entry.sets,
        total_reps: entry.reps,
        workout_score: entry.score,
        fatigue: entry,
      },
      { onConflict: "id" }
    );

    return { error: error?.message ?? null };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Failed to sync workout." };
  }
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

    return { history: (data || []).map(rowToEntry), error: null };
  } catch (err) {
    return {
      history: [],
      error: err instanceof Error ? err.message : "Failed to load workout history.",
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
