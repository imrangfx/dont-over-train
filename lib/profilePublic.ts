import { supabase } from "@/lib/supabase";
import {
  calculateCurrentStreak,
  calculateWorkoutInsights,
  rowToEntry,
  type WorkoutHistoryEntry,
  type WorkoutInsights,
} from "@/lib/workouts";
import { getHighestPersonalRecord, type PersonalRecord } from "@/lib/progression";
import { calculateBodyPartLevel } from "@/lib/bodyPartProgression";
import type { BodyPartLevelProgress } from "@/lib/bodyPartProgression";
import { rowToPublicProfile, type PublicProfile } from "@/lib/friends";

/**
 * Read-only public profile data, built entirely from the existing
 * Progressive Overload primitives (lib/workouts.ts, lib/bodyPartProgression.ts) -
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
  level: BodyPartLevelProgress;
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
      // fatigue holds the full per-exercise snapshot (bodyPart/reps/weights)
      // that the body-part level system needs - see rowToEntry in lib/workouts.ts.
      supabase.from("workouts").select("id, user_id, workout_date, fatigue").in("user_id", uniqueIds),
    ]);

    if (recordsRes.error) return { summaries: new Map(), error: recordsRes.error.message };
    if (workoutsRes.error) return { summaries: new Map(), error: workoutsRes.error.message };

    const recordsByUser = new Map<string, PersonalRecord[]>();
    for (const row of recordsRes.data || []) {
      const list = recordsByUser.get(row.user_id) ?? [];
      list.push(rowToPersonalRecord(row));
      recordsByUser.set(row.user_id, list);
    }

    const historyByUser = new Map<string, WorkoutHistoryEntry[]>();
    for (const row of workoutsRes.data || []) {
      const list = historyByUser.get(row.user_id) ?? [];
      list.push(rowToEntry(row));
      historyByUser.set(row.user_id, list);
    }

    const summaries = new Map<string, PublicStrengthSummary>();

    for (const userId of uniqueIds) {
      const records = recordsByUser.get(userId) ?? [];
      const entries = (historyByUser.get(userId) ?? []).sort((a, b) => b.timestamp - a.timestamp);

      summaries.set(userId, {
        level: calculateBodyPartLevel(entries),
        highestPR: getHighestPersonalRecord(records),
        currentStreak: calculateCurrentStreak(entries),
        totalWorkouts: entries.length,
        lastWorkoutDate: entries[0]?.date ?? null,
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
  level: BodyPartLevelProgress | null;
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
        .select("id, workout_date, duration_minutes, total_sets, total_reps, workout_score, body_parts, fatigue")
        .eq("user_id", userId)
        .order("workout_date", { ascending: false }),
    ]);

    if (recordsRes.error) return { profile: null, error: recordsRes.error.message };
    if (workoutsRes.error) return { profile: null, error: workoutsRes.error.message };

    const records = (recordsRes.data || []).map(rowToPersonalRecord);
    const entries = (workoutsRes.data || []).map(rowToEntry);

    const recentPersonalRecords = [...records]
      .sort((a, b) => new Date(b.achievedAt).getTime() - new Date(a.achievedAt).getTime())
      .slice(0, 5);

    return {
      profile: {
        profile: rowToPublicProfile(profileRes.data),
        canViewStats: true,
        level: calculateBodyPartLevel(entries),
        highestPR: getHighestPersonalRecord(records),
        currentStreak: calculateCurrentStreak(entries),
        totalWorkouts: entries.length,
        lastWorkoutDate: entries[0]?.date ?? null,
        recentPersonalRecords,
        insights: calculateWorkoutInsights(entries),
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
