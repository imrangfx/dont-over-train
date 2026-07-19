import { supabase } from "@/lib/supabase";
import {
  calculateCurrentStreak,
  calculateWorkoutInsights,
  type WorkoutInsights,
} from "@/lib/workouts";
import {
  calculateOverallLevel,
  calculateOverallStrength,
  getHighestPersonalRecord,
  type LevelProgress,
  type PersonalRecord,
} from "@/lib/progression";
import { rowToPublicProfile, type PublicProfile } from "@/lib/friends";

/**
 * Read-only public profile data, built entirely from the existing
 * Progressive Overload primitives (lib/workouts.ts, lib/progression.ts) -
 * no level/streak/PR logic is duplicated here, only re-applied to a
 * friend's rows instead of the signed-in user's own rows.
 */

function rowToPersonalRecord(row: {
  exercise_name: string;
  body_part: string;
  category: string;
  weight: number | string;
  achieved_at: string;
}): PersonalRecord {
  return {
    exerciseName: row.exercise_name,
    bodyPart: row.body_part,
    category: row.category as PersonalRecord["category"],
    weight: Number(row.weight) || 0,
    achievedAt: row.achieved_at,
  };
}

export type PublicStrengthSummary = {
  level: LevelProgress;
  highestPR: PersonalRecord | null;
  currentStreak: number;
  totalWorkouts: number;
  lastWorkoutDate: string | null;
};

/**
 * Batched summary (level/streak/highest PR) for many users at once - used by
 * friend list rows and (confirmed-friend) search results. Callers should
 * only pass ids the viewer is actually friends with (or their own id): RLS
 * on personal_records/workouts already enforces this server-side, but
 * passing a non-friend id here just wastes a round trip and yields a
 * default "Level 1" from an empty record set, which would misrepresent a
 * stranger's real progress if it were displayed.
 */
export async function loadPublicStrengthSummaries(
  userIds: string[]
): Promise<{ summaries: Map<string, PublicStrengthSummary>; error: string | null }> {
  const uniqueIds = Array.from(new Set(userIds));
  if (uniqueIds.length === 0) return { summaries: new Map(), error: null };

  try {
    const [recordsRes, workoutsRes] = await Promise.all([
      supabase.from("personal_records").select("*").in("user_id", uniqueIds),
      supabase.from("workouts").select("user_id, workout_date").in("user_id", uniqueIds),
    ]);

    if (recordsRes.error) return { summaries: new Map(), error: recordsRes.error.message };
    if (workoutsRes.error) return { summaries: new Map(), error: workoutsRes.error.message };

    const recordsByUser = new Map<string, PersonalRecord[]>();
    for (const row of recordsRes.data || []) {
      const list = recordsByUser.get(row.user_id) ?? [];
      list.push(rowToPersonalRecord(row));
      recordsByUser.set(row.user_id, list);
    }

    const workoutsByUser = new Map<string, number[]>();
    for (const row of workoutsRes.data || []) {
      const list = workoutsByUser.get(row.user_id) ?? [];
      list.push(new Date(row.workout_date).getTime());
      workoutsByUser.set(row.user_id, list);
    }

    const summaries = new Map<string, PublicStrengthSummary>();

    for (const userId of uniqueIds) {
      const records = recordsByUser.get(userId) ?? [];
      const timestamps = (workoutsByUser.get(userId) ?? []).sort((a, b) => b - a);

      summaries.set(userId, {
        level: calculateOverallLevel(records),
        highestPR: getHighestPersonalRecord(records),
        currentStreak: calculateCurrentStreak(timestamps.map((timestamp) => ({ timestamp }))),
        totalWorkouts: timestamps.length,
        lastWorkoutDate: timestamps[0] ? new Date(timestamps[0]).toLocaleDateString() : null,
      });
    }

    return { summaries, error: null };
  } catch (err) {
    return {
      summaries: new Map(),
      error: err instanceof Error ? err.message : "Couldn't load strength data.",
    };
  }
}

export type PublicFriendProfile = {
  profile: PublicProfile;
  /** False when the viewer isn't a confirmed friend (or the profile owner) - in that case every stat field below is null/empty rather than a misleading default. */
  canViewStats: boolean;
  level: LevelProgress | null;
  overallStrength: number | null;
  highestPR: PersonalRecord | null;
  currentStreak: number | null;
  totalWorkouts: number | null;
  lastWorkoutDate: string | null;
  recentPersonalRecords: PersonalRecord[];
  insights: WorkoutInsights | null;
};

/**
 * Full read-only profile for a single user - used by /friends/[id].
 * `canViewStats` must be computed by the caller from the viewer's actual
 * relationship to `userId` (self or confirmed friend). When false, this
 * skips querying personal_records/workouts entirely - RLS would return no
 * rows for a non-friend anyway, so there's no point spending the round trip.
 */
export async function loadPublicFriendProfile(
  userId: string,
  canViewStats: boolean
): Promise<{ profile: PublicFriendProfile | null; error: string | null }> {
  try {
    const profileRes = await supabase
      .from("profiles")
      .select("id, full_name, avatar_url, username")
      .eq("id", userId)
      .maybeSingle();

    if (profileRes.error) return { profile: null, error: profileRes.error.message };
    if (!profileRes.data) return { profile: null, error: null };

    if (!canViewStats) {
      return {
        profile: {
          profile: rowToPublicProfile(profileRes.data),
          canViewStats: false,
          level: null,
          overallStrength: null,
          highestPR: null,
          currentStreak: null,
          totalWorkouts: null,
          lastWorkoutDate: null,
          recentPersonalRecords: [],
          insights: null,
        },
        error: null,
      };
    }

    const [recordsRes, workoutsRes] = await Promise.all([
      supabase.from("personal_records").select("*").eq("user_id", userId),
      supabase
        .from("workouts")
        .select("workout_date, duration_minutes, total_sets, total_reps, workout_score, body_parts")
        .eq("user_id", userId)
        .order("workout_date", { ascending: false }),
    ]);

    if (recordsRes.error) return { profile: null, error: recordsRes.error.message };
    if (workoutsRes.error) return { profile: null, error: workoutsRes.error.message };

    const records = (recordsRes.data || []).map(rowToPersonalRecord);
    const workoutRows = workoutsRes.data || [];

    const workoutsForStreak = workoutRows.map((row) => ({
      timestamp: new Date(row.workout_date).getTime(),
    }));

    const workoutsForInsights = workoutRows.map((row) => ({
      bodyParts: Array.isArray(row.body_parts) ? row.body_parts : [],
      score: row.workout_score ?? 0,
      durationMinutes: row.duration_minutes ?? 0,
      reps: row.total_reps ?? 0,
      sets: row.total_sets ?? 0,
    }));

    const recentPersonalRecords = [...records]
      .sort((a, b) => new Date(b.achievedAt).getTime() - new Date(a.achievedAt).getTime())
      .slice(0, 5);

    return {
      profile: {
        profile: rowToPublicProfile(profileRes.data),
        canViewStats: true,
        level: calculateOverallLevel(records),
        overallStrength: Math.round(calculateOverallStrength(records).score),
        highestPR: getHighestPersonalRecord(records),
        currentStreak: calculateCurrentStreak(workoutsForStreak),
        totalWorkouts: workoutRows.length,
        lastWorkoutDate: workoutRows[0]
          ? new Date(workoutRows[0].workout_date).toLocaleDateString()
          : null,
        recentPersonalRecords,
        insights: calculateWorkoutInsights(workoutsForInsights),
      },
      error: null,
    };
  } catch (err) {
    return {
      profile: null,
      error: err instanceof Error ? err.message : "Couldn't load profile.",
    };
  }
}
