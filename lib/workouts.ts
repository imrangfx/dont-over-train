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
    bodyParts: row.body_parts
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

/** Cloud-only save. Guest/localStorage saving stays inline where it already lives. */
export async function saveWorkoutHistoryEntry(
  entry: WorkoutHistoryEntry,
  userId: string
): Promise<{ error: string | null }> {
  try {
    const { error } = await supabase.from("workouts").upsert(
      {
        id: entry.id,
        user_id: userId,
        workout_date: new Date(entry.timestamp || Date.now()).toISOString(),
        body_parts: entry.bodyParts.join(", "),
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
