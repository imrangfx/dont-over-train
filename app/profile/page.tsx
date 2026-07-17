"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { loadWorkoutHistory } from "@/lib/workouts";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  CircleUserRound,
  ChevronRight,
  Trophy,
  Dumbbell,
  Flame,
  Clock3,
  UserPlus,
} from "lucide-react";

export default function ProfilePage() {
  const router = useRouter();

  const [history, setHistory] = useState<any[]>([]);
  const [filter, setFilter] = useState("30d");
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

  const totalWorkouts = history.length;

  const totalExercises = history.reduce(
    (sum, w) => sum + (w.exercises || 0),
    0
  );

  const trainingMinutes = history.reduce(
    (sum, w) => sum + (w.durationMinutes || 0),
    0
  );

  const trainingHours = Math.floor(trainingMinutes / 60);
  const remainingMinutes = trainingMinutes % 60;

  const lastWorkout =
    history.length > 0
      ? history[0]
      : null;

  const currentStreak = history.length;

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
    <main className="min-h-screen bg-black px-6 py-8 text-white">

      <div className="mx-auto max-w-[390px]">

        {/* Back */}

        <Link
          href="/home"
          className="inline-flex items-center gap-2 text-zinc-400 hover:text-white"
        >
          <ArrowLeft size={18} />
          Back
        </Link>

        {/* Header */}


        <div className="mt-8 flex items-start justify-between">

          <div className="flex items-center gap-4">

            <div className="flex h-20 w-20 items-center justify-center rounded-full border border-zinc-800 bg-zinc-900 overflow-hidden">
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

            <div>

              <h1 className="text-2xl font-bold">
                {user ? displayName : "Guest User"}
              </h1>

              <span className="mt-2 inline-block rounded-full bg-lime-400/20 px-3 py-1 text-xs font-semibold text-lime-400">
                {user?.email || "Guest"}
              </span>

            </div>

          </div>

          {/* Filter */}

          <div className="relative">

            <button
              onClick={() => setShowFilter(!showFilter)}
              className="rounded-xl border border-zinc-800 bg-[#111] px-4 py-2 text-sm text-zinc-300 hover:border-lime-400"
            >

              {{
                "7d": "Last 7 Days",
                "14d": "Last 14 Days",
                "30d": "Last 30 Days",
                "6m": "Last 6 Months",
                "1y": "Last 1 Year",
                "all": "All Time",
              }[filter]} ▼

            </button>

            {showFilter && (

              <div className="absolute right-0 mt-2 w-44 rounded-xl border border-zinc-800 bg-[#111] p-2 z-50">

                {[
                  ["7d", "Last 7 Days"],
                  ["14d", "Last 14 Days"],
                  ["30d", "Last 30 Days"],
                  ["6m", "Last 6 Months"],
                  ["1y", "Last 1 Year"],
                  ["all", "All Time"],
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