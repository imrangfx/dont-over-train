"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import {
  calculateCurrentStreak,
  calculateWorkoutInsights,
  loadWorkoutHistory,
} from "@/lib/workouts";
import { loadPersonalRecords } from "@/lib/personalRecords";
import {
  calculateOverallLevel,
  getHighestPersonalRecord,
  type PersonalRecord,
} from "@/lib/progression";
import { getFriendCount } from "@/lib/friendService";
import { buildLevelShareCard } from "@/lib/shareCard";
import {
  CircleUserRound,
  Trophy,
  Dumbbell,
  Flame,
  Clock3,
  UserPlus,
  Timer,
  BicepsFlexed,
  ClipboardList,
  Activity,
  Users,
  ChevronRight,
  Share2,
} from "lucide-react";
import BottomNav from "@/components/BottomNav";
import LoadingCard from "@/components/ui/LoadingCard";
import { useToast } from "@/components/ui/Toast";
import ShareCardModal from "@/components/ShareCardModal";

export default function ProfilePage() {
  const { toast } = useToast();
  const [history, setHistory] = useState<any[]>([]);
  const [filter, setFilter] = useState("all");
  const [showFilter, setShowFilter] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [avatarError, setAvatarError] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [personalRecords, setPersonalRecords] = useState<PersonalRecord[]>([]);
  const [loadingRecords, setLoadingRecords] = useState(true);
  const [friendCount, setFriendCount] = useState(0);
  const [showShareCard, setShowShareCard] = useState(false);

  const handleGoogleSignIn = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: window.location.origin,
      },
    });

    if (error) {
      console.error(error);
      toast(error.message || "Couldn't start Google sign-in.", "error");
    }
  };

  useEffect(() => {
    let active = true;

    async function loadUser() {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!active) return;
      setUser(session?.user ?? null);
      setAvatarError(false);
    }

    loadUser();

    // Keep auth state in sync with actual sign-in/sign-out events, instead
    // of relying solely on a one-time check at mount. This ensures the
    // guest-only "Backup your workouts" button and the logged-in header
    // never go stale relative to the real Supabase session.
    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (!active) return;
        setUser(session?.user ?? null);
        setAvatarError(false);
      }
    );

    return () => {
      active = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    let active = true;

    loadWorkoutHistory().then((result) => {
      if (!active) return;
      setHistory(result.history);
      setLoadingHistory(false);
    });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    let active = true;

    loadPersonalRecords().then((result) => {
      if (!active) return;
      setPersonalRecords(result.records);
      setLoadingRecords(false);
    });

    return () => {
      active = false;
    };
  }, [user]);

  useEffect(() => {
    let active = true;

    getFriendCount().then((result) => {
      if (!active) return;
      setFriendCount(result.count);
    });

    return () => {
      active = false;
    };
  }, [user]);

  const filteredHistory = history.filter((workout) => {
    if (filter === "all") return true;

    const workoutDate = new Date(workout.date);
    const today = new Date();

    workoutDate.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);

    const diffDays = Math.floor(
      (today.getTime() - workoutDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    switch (filter) {
      case "today":
        return diffDays === 0;

      case "7d":
        return diffDays <= 7;

      case "14d":
        return diffDays <= 14;

      case "30d":
        return diffDays <= 30;

      case "6m":
        return diffDays <= 183;

      case "1y":
        return diffDays <= 365;

      default:
        return true;
    }
  });
  const totalWorkouts = filteredHistory.length;

  const totalExercises = filteredHistory.reduce(
    (sum, w) => sum + (w.exercises || 0),
    0
  );

  const trainingMinutes = filteredHistory.reduce(
    (sum, w) => sum + (w.durationMinutes || 0),
    0
  );

  const trainingHours = Math.floor(trainingMinutes / 60);
  const remainingMinutes = trainingMinutes % 60;

  const lastWorkout =
    filteredHistory.length > 0
      ? filteredHistory[0]
      : null;

  const currentStreak = calculateCurrentStreak(history);
  const insights = calculateWorkoutInsights(filteredHistory);

  const overallLevel = calculateOverallLevel(personalRecords);
  const highestPR = getHighestPersonalRecord(personalRecords);

  const googleAvatarUrl =
    user?.user_metadata?.avatar_url || user?.user_metadata?.picture || null;

  const googleFullName =
    user?.user_metadata?.full_name || user?.user_metadata?.name || null;

  function getDisplayName(fullName: string | null) {
    if (!fullName) return "User";

    const ignored = ["md", "md.", "mohammad", "muhammad"];

    const parts = fullName.trim().split(/\s+/);

    return (
      parts.find((part) => !ignored.includes(part.toLowerCase())) ||
      parts[0]
    );
  }

  const displayName = getDisplayName(googleFullName);

  const hasInsightData = filteredHistory.length > 0;

  return (
    <main className="min-h-screen bg-black px-6 py-8 pb-[calc(72px+env(safe-area-inset-bottom)+1.5rem)] text-white animate-[fade-in_200ms_ease-out]">

      <div className="mx-auto max-w-[390px]">

        {/* Header */}

        <div className="mt-2 flex items-center justify-between gap-4">

          <div className="flex items-center gap-3 flex-1 min-w-0">

            <div className="flex h-16 w-16 items-center justify-center rounded-full border border-zinc-800 bg-zinc-900 overflow-hidden">
              {googleAvatarUrl && !avatarError ? (
                <img
                  src={googleAvatarUrl}
                  alt="Profile"
                  className="h-full w-full object-cover"
                  onError={() => setAvatarError(true)}
                />
              ) : (
                <CircleUserRound
                  size={42}
                  className="text-[#39ff14]"
                />
              )}
            </div>

            <div className="min-w-0 flex-1">

              <h1 className="text-2xl font-bold leading-tight">
                {user ? displayName : "Guest User"}
              </h1>

              <p className="mt-1 text-sm text-lime-400 truncate">
                {user?.email || "Guest"}
              </p>

            </div>

          </div>

          {/* Filter */}

          <div className="relative">

            <button
              type="button"
              onClick={() => setShowFilter(!showFilter)}
              aria-haspopup="listbox"
              aria-expanded={showFilter}
              aria-label="Filter workout history"
              className="btn-base inline-flex w-[7.5rem] shrink-0 items-center justify-between rounded-full border border-zinc-800 bg-[#111] px-3 py-1.5 text-sm text-zinc-300 hover:border-lime-400"
            >

              <span className="truncate">
                {{
                  "today": "Today",
                  "7d": "7D",
                  "14d": "14D",
                  "30d": "30D",
                  "6m": "6M",
                  "1y": "1Y",
                  "all": "All Days",
                }[filter]}
              </span>

              <span className="ml-1 shrink-0">▼</span>

            </button>

            {showFilter && (

              <div
                role="listbox"
                aria-label="History filter options"
                className="absolute right-0 z-50 mt-2 w-44 rounded-xl border border-zinc-800 bg-[#111] p-2 animate-[fade-in_160ms_ease-out]"
              >

                {[
                  ["today", "Today"],
                  ["7d", "Last 7 Days"],
                  ["14d", "Last 14 Days"],
                  ["30d", "Last 30 Days"],
                  ["6m", "Last 6 Months"],
                  ["1y", "Last 1 Year"],
                  ["all", "All Days"],
                ].map(([id, label]) => (

                  <button
                    key={id}
                    type="button"
                    role="option"
                    aria-selected={filter === id}
                    onClick={() => {
                      setFilter(id);
                      setShowFilter(false);
                    }}
                    className={`btn-base block w-full rounded-lg px-3 py-2 text-left text-sm ${filter === id
                      ? "bg-lime-400 text-black"
                      : "text-zinc-300 hover:bg-zinc-800"
                      }`}
                  >
                    {label}
                  </button>

                ))}

              </div>

            )}

          </div>

        </div>

        {/* Progressive Overload Level */}

        {loadingRecords ? (
          <div className="mt-6" aria-busy="true">
            <LoadingCard rows={2} />
          </div>
        ) : (
          <div
            className="card-surface mt-6 overflow-hidden p-5"
            style={{
              background:
                "linear-gradient(135deg, rgba(17,17,17,1) 0%, rgba(17,17,17,1) 60%, rgba(57,255,20,0.06) 100%)",
            }}
          >
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="text-xl" aria-hidden="true">
                  🔥
                </span>
                <span
                  className="text-2xl font-bold"
                  style={{ color: overallLevel.color }}
                >
                  Level {overallLevel.level}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-zinc-400">
                  {overallLevel.title}
                </span>

                <button
                  type="button"
                  onClick={() => setShowShareCard(true)}
                  aria-label="Share your progress"
                  className="btn-base rounded-full p-1.5 text-zinc-500 hover:text-lime-400"
                >
                  <Share2 size={16} aria-hidden="true" />
                </button>
              </div>
            </div>

            <div className="mt-4 h-2.5 w-full overflow-hidden rounded-full bg-zinc-800">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${overallLevel.progressPercent}%`,
                  backgroundColor: overallLevel.color,
                }}
              />
            </div>

            <div className="mt-2 flex items-center justify-between text-xs text-zinc-500">
              <span>{overallLevel.progressPercent}%</span>
              <span>
                {overallLevel.nextLevel
                  ? `Next: ${overallLevel.nextLevel.title}`
                  : "Max Level"}
              </span>
            </div>
          </div>
        )}

        {/* Stats */}

        {loadingHistory ? (
          <div className="mt-8 grid grid-cols-2 gap-4" aria-busy="true">
            <LoadingCard rows={2} />
            <LoadingCard rows={2} />
            <LoadingCard rows={2} />
            <LoadingCard rows={2} />
          </div>
        ) : (
          <div className="mt-8 grid grid-cols-2 gap-4">

            <StatCard
              icon={<Dumbbell size={20} />}
              title="Total Workouts"
              value={String(totalWorkouts)}
            />

            <StatCard
              icon={<Trophy size={20} />}
              title="Exercises Completed"
              value={String(totalExercises)}
            />

            <StatCard
              icon={<Clock3 size={20} />}
              title="Training Time"
              value={`${trainingHours}h ${remainingMinutes}m`}
            />

            <StatCard
              icon={<Flame size={20} />}
              title="Current Streak"
              value={`${currentStreak} Days`}
            />

            <div className="col-span-2">
              <StatCard
                icon={<span aria-hidden="true">🏋</span>}
                title={highestPR ? `Highest PR • ${highestPR.exerciseName}` : "Highest PR"}
                value={highestPR ? `${highestPR.weight} kg` : "-"}
              />
            </div>

          </div>
        )}

        {/* Last Workout */}

        <div className="card-surface mt-8 p-5">

          <div className="text-sm text-zinc-500">
            Last Workout
          </div>

          {loadingHistory ? (
            <div className="mt-4 space-y-3" aria-busy="true">
              <div className="h-7 w-1/2 animate-pulse rounded bg-zinc-800" />
              <div className="h-5 w-2/3 animate-pulse rounded bg-zinc-800" />
              <div className="h-4 w-1/3 animate-pulse rounded bg-zinc-800" />
            </div>
          ) : lastWorkout ? (

            <>

              <div className="mt-3 text-2xl font-bold">
                {lastWorkout.date}
              </div>

              <div className="mt-4 text-lg font-semibold text-lime-400">
                {lastWorkout.bodyParts?.join(" + ") || "Workout"}
              </div>

              <div className="mt-2 text-sm text-zinc-400">
                {lastWorkout.sections?.join(", ")}
              </div>

              <div className="mt-2 text-sm text-zinc-500">
                {lastWorkout.exercises} Exercises • {lastWorkout.durationMinutes || 0} Minutes
              </div>

              <div className="mt-4 inline-flex rounded-full bg-lime-400/15 px-3 py-1 text-sm text-lime-400">
                Score {lastWorkout.score}
              </div>

              <Link
                href={`/history/${lastWorkout.id}`}
                className="btn-base mt-6 block w-full rounded-xl bg-[#191919] py-3 text-center font-medium hover:bg-[#222]"
              >
                View Workout Details →
              </Link>

            </>

          ) : (

            <>

              <div className="mt-4 flex h-11 w-11 items-center justify-center rounded-full bg-zinc-900 text-lime-400">
                <Dumbbell size={20} aria-hidden="true" />
              </div>

              <div className="mt-3 text-xl font-semibold">
                No workout data available
              </div>

              <div className="mt-2 text-sm text-zinc-500">
                Complete your first workout to see it here.
              </div>

            </>

          )}

        </div>

        {/* Workout Insights */}

        <div className="card-surface mt-8 p-5">

          <h2 className="text-lg font-semibold">
            Workout Insights
          </h2>

          {loadingHistory ? (
            <div className="mt-5 space-y-3" aria-busy="true">
              <div className="h-4 w-full animate-pulse rounded bg-zinc-800" />
              <div className="h-4 w-5/6 animate-pulse rounded bg-zinc-800" />
              <div className="h-4 w-4/6 animate-pulse rounded bg-zinc-800" />
            </div>
          ) : !hasInsightData ? (
            <div className="mt-5">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-zinc-900 text-lime-400">
                <Activity size={20} aria-hidden="true" />
              </div>
              <p className="mt-3 text-sm leading-6 text-zinc-500">
                Complete your first workout to unlock insights.
              </p>
            </div>
          ) : (

          <div className="mt-5 space-y-4">

            <InsightRow
              icon={<Activity size={18} />}
              label="Most Trained Muscle"
              value={insights.mostTrainedMuscle}
            />

            <InsightRow
              icon={<Trophy size={18} />}
              label="Best Workout Score"
              value={
                insights.bestWorkoutScore === "-"
                  ? "-"
                  : `${insights.bestWorkoutScore} Points`
              }
            />

            <InsightRow
              icon={<Timer size={18} />}
              label="Average Workout Time"
              value={
                insights.averageWorkoutTime === "-"
                  ? "-"
                  : `${insights.averageWorkoutTime} min`
              }
            />

            <InsightRow
              icon={<BicepsFlexed size={18} />}
              label="Total Reps"
              value={
                insights.totalReps === "-"
                  ? "-"
                  : `${insights.totalReps} Reps`
              }
            />

            <InsightRow
              icon={<ClipboardList size={18} />}
              label="Total Sets"
              value={
                insights.totalSets === "-"
                  ? "-"
                  : `${insights.totalSets} Sets`
              }
            />

          </div>
          )}

        </div>

        {/* Friends */}

        <Link
          href="/friends"
          className="btn-base card-surface mt-8 flex items-center justify-between gap-3 p-5 hover:border-lime-400/40"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-zinc-900 text-lime-400">
              <Users size={20} aria-hidden="true" />
            </div>
            <div>
              <p className="font-semibold text-white">
                Friends {user ? `(${friendCount})` : ""}
              </p>
              <p className="mt-0.5 text-sm text-zinc-500">
                {user ? "View All" : "Sign in to connect with friends"}
              </p>
            </div>
          </div>

          <ChevronRight size={20} className="shrink-0 text-zinc-500" aria-hidden="true" />
        </Link>

        {/* Upgrade */}

        {!user && (
          <button
            type="button"
            onClick={handleGoogleSignIn}
            className="btn-base mt-8 w-full rounded-2xl border border-yellow-500 bg-yellow-500/5 p-5 text-left hover:bg-yellow-500/10"
          >
            <div className="flex items-center gap-3">
              <UserPlus size={20} className="shrink-0 text-yellow-400" />

              <div>
                <p className="font-semibold text-yellow-400">
                  Backup your workouts
                </p>

                <p className="mt-1 text-sm text-zinc-400">
                  Sign in with Google to sync your history across devices.
                </p>
              </div>
            </div>
          </button>
        )}

      </div>

      {showShareCard && (
        <ShareCardModal
          data={buildLevelShareCard(overallLevel, highestPR, currentStreak)}
          onClose={() => setShowShareCard(false)}
        />
      )}

      <BottomNav />
    </main>
  );
}

function StatCard({
  title,
  value,
  icon,
}: {
  title: string;
  value: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="card-surface p-4">
      <div className="text-lime-400" aria-hidden="true">
        {icon}
      </div>

      <div className="mt-4 text-2xl font-bold">
        {value}
      </div>

      <div className="mt-1 text-sm text-zinc-500">
        {title}
      </div>
    </div>
  );
}

function InsightRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="flex min-w-0 items-center gap-3">
        <div className="text-lime-400 shrink-0">
          {icon}
        </div>
        <span className="text-sm text-zinc-400">
          {label}
        </span>
      </div>

      <span className="shrink-0 text-right font-semibold text-white">
        {value}
      </span>
    </div>
  );
}