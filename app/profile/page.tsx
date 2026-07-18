"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { calculateCurrentStreak, loadWorkoutHistory } from "@/lib/workouts";
import { useRouter } from "next/navigation";
import {
  CircleUserRound,
  Trophy,
  Dumbbell,
  Flame,
  Clock3,
  UserPlus,
} from "lucide-react";
import BottomNav from "@/components/BottomNav";

export default function ProfilePage() {
  const router = useRouter();

  const [history, setHistory] = useState<any[]>([]);
  const [filter, setFilter] = useState("all");
  const [showFilter, setShowFilter] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [avatarError, setAvatarError] = useState(false);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    localStorage.removeItem("hasSeenOnboarding");
    setUser(null);
    router.replace("/");
  };

  const handleGoogleSignIn = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: window.location.origin,
      },
    });

    if (error) {
      console.error(error);
      alert(error.message);
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
    });

    return () => {
      active = false;
    };
  }, []);
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

  return (
    <main className="min-h-screen bg-black px-6 py-8 pb-[calc(72px+env(safe-area-inset-bottom)+1.5rem)] text-white">

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
              onClick={() => setShowFilter(!showFilter)}
              className="inline-flex w-[7.5rem] shrink-0 items-center justify-between rounded-full border border-zinc-800 bg-[#111] px-3 py-1.5 text-sm text-zinc-300 hover:border-lime-400"
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

              <div className="absolute right-0 mt-2 w-44 rounded-xl border border-zinc-800 bg-[#111] p-2 z-50">

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
                    onClick={() => {
                      setFilter(id);
                      setShowFilter(false);
                    }}
                    className={`block w-full rounded-lg px-3 py-2 text-left text-sm ${filter === id
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

        {/* Stats */}

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

        </div>

        {/* Last Workout */}

        <div className="mt-8 rounded-2xl border border-zinc-800 bg-[#111111] p-5">

          <div className="text-sm text-zinc-500">
            Last Workout
          </div>

          {lastWorkout ? (

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
                className="mt-6 block w-full rounded-xl bg-[#191919] py-3 text-center font-medium transition hover:bg-[#222]"
              >
                View Workout Details →
              </Link>

            </>

          ) : (

            <>

              <div className="mt-3 text-xl font-semibold">
                No workouts yet
              </div>

              <div className="mt-2 text-sm text-zinc-500">
                Complete your first workout to see it here.
              </div>

            </>

          )}

        </div>

        {/* Upgrade */}

        {!user && (
          <button
            onClick={handleGoogleSignIn}
            className="mt-8 w-full rounded-2xl border border-yellow-500 bg-yellow-500/5 p-5 text-left transition hover:bg-yellow-500/10"
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

        {user && (
          <button
            onClick={handleLogout}
            className="mt-8 w-full rounded-2xl border border-red-500 py-4 text-red-400 transition hover:bg-red-500/10"
          >
            Sign Out
          </button>
        )}

      </div>

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
    <div className="rounded-2xl border border-zinc-800 bg-[#111111] p-4">
      <div className="text-lime-400">
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