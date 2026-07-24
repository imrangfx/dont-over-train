import { supabase } from "@/lib/supabase";
import {
  getCurrentUserId,
  ensureProfileExists,
  ensureFreshSession,
  forceRefreshSession,
} from "@/lib/workouts";
import {
  updatePersonalRecords,
  type ExerciseCategory,
  type PersonalRecord,
  type PersonalRecordUpdateResult,
} from "@/lib/progression";

const LOCAL_KEY = "personalRecords";

function readLocalRecords(): PersonalRecord[] {
  if (typeof window === "undefined") return [];

  try {
    const raw = JSON.parse(localStorage.getItem(LOCAL_KEY) || "[]");
    return Array.isArray(raw) ? raw : [];
  } catch {
    return [];
  }
}

function writeLocalRecords(records: PersonalRecord[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(LOCAL_KEY, JSON.stringify(records));
}

/** Raw shape of a `personal_records` table row as returned by the Supabase client. */
type PersonalRecordRow = {
  exercise_name: string;
  body_part: string;
  category: string;
  weight: number | string | null;
  achieved_at: string;
};

function rowToRecord(row: PersonalRecordRow): PersonalRecord {
  return {
    exerciseName: row.exercise_name,
    bodyPart: row.body_part,
    category: row.category as ExerciseCategory,
    weight: Number(row.weight) || 0,
    achievedAt: row.achieved_at,
  };
}

/** Guest: localStorage. Signed in: Supabase `personal_records` table. */
export async function loadPersonalRecords(): Promise<{
  records: PersonalRecord[];
  error: string | null;
}> {
  const userId = await getCurrentUserId();

  if (!userId) {
    return { records: readLocalRecords(), error: null };
  }

  try {
    const { data, error } = await supabase
      .from("personal_records")
      .select("*")
      .eq("user_id", userId);

    if (error) return { records: [], error: error.message };
    return { records: (data || []).map(rowToRecord), error: null };
  } catch (err) {
    return {
      records: [],
      error: err instanceof Error ? err.message : "Failed to load personal records.",
    };
  }
}

export type RecordWorkoutPersonalRecordsResult = PersonalRecordUpdateResult & {
  previousRecords: PersonalRecord[];
  error: string | null;
};

/**
 * Given the exercises performed in a just-completed workout (name, bodyPart,
 * the max weight lifted), merges them into stored personal records - guest =
 * localStorage, signed in = Supabase - persists any improvements, and
 * returns which PRs were newly broken plus the before/after record lists so
 * the caller can detect a level-up and show toasts/celebrations.
 */
export async function recordWorkoutPersonalRecords(
  performed: Array<{ name: string; bodyPart: string; weight: number }>
): Promise<RecordWorkoutPersonalRecordsResult> {
  const achievedAt = new Date().toISOString();
  const normalizedPerformed = performed.map((exercise) => ({ ...exercise, achievedAt }));

  const userId = await getCurrentUserId();

  if (!userId) {
    const existing = readLocalRecords();
    const { records, brokenRecords } = updatePersonalRecords(existing, normalizedPerformed);

    if (brokenRecords.length > 0) {
      writeLocalRecords(records);
    }

    return { records, brokenRecords, previousRecords: existing, error: null };
  }

  try {
    const { records: existing, error: loadError } = await loadPersonalRecords();
    if (loadError) {
      return { records: existing, brokenRecords: [], previousRecords: existing, error: loadError };
    }

    const { records, brokenRecords } = updatePersonalRecords(existing, normalizedPerformed);

    if (brokenRecords.length === 0) {
      return { records, brokenRecords, previousRecords: existing, error: null };
    }

    if (!(await ensureFreshSession())) {
      return {
        records: existing,
        brokenRecords: [],
        previousRecords: existing,
        error: "Your session has expired.",
      };
    }

    const { error: profileError } = await ensureProfileExists(userId);
    if (profileError) {
      return { records: existing, brokenRecords: [], previousRecords: existing, error: profileError };
    }

    const rows = brokenRecords.map(({ record }) => ({
      user_id: userId,
      exercise_name: record.exerciseName,
      body_part: record.bodyPart,
      category: record.category,
      weight: record.weight,
      achieved_at: record.achievedAt,
    }));

    let { error } = await supabase
      .from("personal_records")
      .upsert(rows, { onConflict: "user_id,exercise_name" });

    if (error && /jwt|token|unauthorized|not authenticated/i.test(error.message)) {
      if (await forceRefreshSession()) {
        ({ error } = await supabase
          .from("personal_records")
          .upsert(rows, { onConflict: "user_id,exercise_name" }));
      }
    }

    if (error) {
      return { records: existing, brokenRecords: [], previousRecords: existing, error: error.message };
    }

    return { records, brokenRecords, previousRecords: existing, error: null };
  } catch (err) {
    return {
      records: [],
      brokenRecords: [],
      previousRecords: [],
      error: err instanceof Error ? err.message : "Failed to save personal records.",
    };
  }
}
