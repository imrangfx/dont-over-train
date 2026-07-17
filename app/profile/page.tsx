"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
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
  const [history, setHistory] = useState<any[]>([]);
  const [filter, setFilter] = useState("30d");
  const [showFilter, setShowFilter] = useState(false);

  useEffect(() => {
    const saved = JSON.parse(
      localStorage.getItem("workoutHistory") || "[]"
    );

    setHistory(saved);
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
      ? history[history.length - 1]
      : null;

  const currentStreak = history.length;

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

            <div className="flex h-20 w-20 items-center justify-center rounded-full border border-zinc-800 bg-zinc-900">

              <CircleUserRound
                size={42}
                className="text-[#39ff14]"
              />

            </div>

            <div>

              <h1 className="text-2xl font-bold">
                Guest User
              </h1>

              <span className="mt-2 inline-block rounded-full bg-lime-400/20 px-3 py-1 text-xs font-semibold text-lime-400">
                Guest
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

        <div className="mt-8 rounded-2xl border border-yellow-500 bg-yellow-500/5 p-5">

          <div className="flex items-center justify-between">

            <div>

              <div className="flex items-center gap-2">

                <UserPlus
                  size={18}
                  className="text-yellow-400"
                />

                <h2 className="font-semibold text-yellow-400">
                  Create Free Account
                </h2>

              </div>

              <p className="mt-3 text-sm leading-6 text-zinc-400">
                Sync workouts across devices.
                Never lose your history.
              </p>

            </div>

            <ChevronRight className="text-yellow-400" />

          </div>

        </div>

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