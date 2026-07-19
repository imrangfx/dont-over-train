"use client";

import Image from "next/image";
import Link from "next/link";
import { ViewTransition } from "react";
import { useEffect, useMemo, useState } from "react";
import {
  BatteryCharging,
  BatteryMedium,
  BatteryWarning,
  CalendarCheck,
  ChevronRight,
  Lightbulb,
  PlayCircle,
} from "lucide-react";
import BottomNav from "@/components/BottomNav";
import AnimatedStatValue from "@/components/AnimatedStatValue";
import LoadingCard from "@/components/ui/LoadingCard";
import { supabase } from "@/lib/supabase";
import {
  calculateCurrentStreak,
  loadWorkoutHistory,
  toLocalDayKey,
  type WorkoutHistoryEntry,
} from "@/lib/workouts";
import { loadPersonalRecords } from "@/lib/personalRecords";
import {
  calculateOverallLevel,
  getMostRecentPersonalRecord,
  type LevelProgress,
  type PersonalRecord,
} from "@/lib/progression";
import { exerciseHref } from "@/lib/exerciseAnalytics";
import {
  calculateRecoveryScore,
  calculateWeeklyProgress,
  formatMuscleLabel,
  getGreeting,
  getTodaysRecommendation,
  type RecoveryStatusLabel,
  type RecoverySummary,
  type TodaysRecommendation,
  type WeeklyProgress as WeeklyProgressData,
} from "@/lib/dashboard";

type BodyPart = {
  name: string;
  slug: string;
  image: string;
};

const BODY_PARTS: BodyPart[] = [
  { name: "Chest", slug: "chest", image: "/body-parts/chest.webp" },
  { name: "Back", slug: "back", image: "/body-parts/back.webp" },
  { name: "Shoulders", slug: "shoulders", image: "/body-parts/shoulders.webp" },
  { name: "Biceps", slug: "biceps", image: "/body-parts/biceps.webp" },
  { name: "Triceps", slug: "triceps", image: "/body-parts/triceps.webp" },
  { name: "Legs", slug: "legs", image: "/body-parts/legs.webp" },
  { name: "Abs", slug: "abs", image: "/body-parts/abs.webp" },
  { name: "Forearms", slug: "forearms", image: "/body-parts/forearms.webp" },
];

const BODY_PART_NAMES = BODY_PARTS.map((part) => part.name);
const WEEKDAY_LETTERS = ["M", "T", "W", "T", "F", "S", "S"];

function fmtKg(value: number | null | undefined): string {
  if (value == null || !Number.isFinite(value)) return "-";
  return `${Math.round(value * 10) / 10} kg`;
}

function BodyPartCard({ name, slug, image }: BodyPart) {
  return (
    <Link
      href={`/workout/${slug}`}
      transitionTypes={["nav-forward"]}
      className="group overflow-hidden rounded-xl bg-[#111111] border border-[#1a1a1a] transition-all duration-200 hover:border-[#39ff14] hover:shadow-[0_0_0_1px_#39ff14] active:scale-[0.98] active:border-[#39ff14] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#39ff14] focus-visible:ring-offset-2 focus-visible:ring-offset-black"
    >
      <div className="p-3">
        <div className="relative h-[140px] w-full overflow-hidden rounded-lg bg-black">
          <ViewTransition
            name={`muscle-${slug}`}
            default="none"
            share="auto"
          >
            <Image
              src={image}
              alt={name}
              fill
              className="object-cover"
              sizes="(max-width: 640px) 50vw, 180px"
            />
          </ViewTransition>
        </div>
      </div>

      <div className="pb-4">
        <h2 className="text-center text-[18px] font-normal text-white">
          {name}
        </h2>
      </div>
    </Link>
  );
}

function SectionIcon({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${className}`}
      aria-hidden="true"
    >
      {children}
    </div>
  );
}

const RECOVERY_STYLES: Record<
  RecoveryStatusLabel,
  { text: string; bar: string; bg: string; icon: React.ReactNode }
> = {
  Fresh: {
    text: "text-lime-400",
    bar: "bg-lime-400",
    bg: "bg-lime-400/10",
    icon: <BatteryCharging size={18} />,
  },
  Recovering: {
    text: "text-yellow-400",
    bar: "bg-yellow-400",
    bg: "bg-yellow-400/10",
    icon: <BatteryMedium size={18} />,
  },
  Fatigued: {
    text: "text-orange-400",
    bar: "bg-orange-400",
    bg: "bg-orange-400/10",
    icon: <BatteryWarning size={18} />,
  },
};

function RecoveryScoreCard({ recovery }: { recovery: RecoverySummary }) {
  const style = RECOVERY_STYLES[recovery.status];

  return (
    <div className="card-surface p-5">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <SectionIcon className={`${style.bg} ${style.text}`}>{style.icon}</SectionIcon>
          <h2 className="text-lg font-semibold tracking-tight">Recovery Score</h2>
        </div>

        {recovery.hasData && (
          <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${style.bg} ${style.text}`}>
            {recovery.status}
          </span>
        )}
      </div>

      {!recovery.hasData ? (
        <p className="mt-4 text-sm leading-6 text-zinc-500">
          Complete a workout to start tracking your recovery.
        </p>
      ) : (
        <>
          <div className="mt-4 flex items-baseline gap-1.5">
            <span className={`text-4xl font-bold tracking-tight ${style.text}`}>
              <AnimatedStatValue value={`${recovery.overallRecoveryPercent}%`} />
            </span>
            <span className="text-sm text-zinc-500">ready to train</span>
          </div>

          <div
            className="mt-4 h-2.5 w-full overflow-hidden rounded-full bg-zinc-800"
            role="progressbar"
            aria-valuenow={recovery.overallRecoveryPercent}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="Recovery percent"
          >
            <div
              className={`h-full rounded-full transition-all duration-500 ${style.bar}`}
              style={{ width: `${recovery.overallRecoveryPercent}%` }}
            />
          </div>

          <p className="mt-3 text-sm leading-6 text-zinc-400">
            {recovery.mostFatiguedMuscle
              ? `${formatMuscleLabel(recovery.mostFatiguedMuscle.muscle)} is still recovering (${recovery.mostFatiguedMuscle.recoveryPercent}% ready).`
              : "All muscle groups are fully recovered."}
          </p>
        </>
      )}
    </div>
  );
}

function RecommendationCard({ recommendation }: { recommendation: TodaysRecommendation }) {
  return (
    <div
      className="card-surface overflow-hidden p-5"
      style={{
        background:
          "linear-gradient(135deg, rgba(17,17,17,1) 0%, rgba(17,17,17,1) 60%, rgba(57,255,20,0.06) 100%)",
      }}
    >
      <div className="flex items-center gap-2.5">
        <SectionIcon className="bg-lime-400/10 text-lime-400">
          <Lightbulb size={18} />
        </SectionIcon>
        <h2 className="text-lg font-semibold tracking-tight">Today&apos;s Recommendation</h2>
      </div>

      <p className="mt-4 text-xl font-bold tracking-tight text-white">
        {recommendation.headline}
      </p>

      <p className="mt-2 text-sm leading-6 text-zinc-400">
        {recommendation.detail}
      </p>

      <Link
        href={recommendation.ctaHref}
        className="btn-base mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-lime-400 py-3 text-sm font-semibold text-black hover:brightness-95"
      >
        {recommendation.ctaLabel}
      </Link>
    </div>
  );
}

function ContinueWorkoutCard({
  workout,
  isToday,
  bodyPartSlug,
}: {
  workout: WorkoutHistoryEntry | null;
  isToday: boolean;
  bodyPartSlug: string;
}) {
  return (
    <div className="card-surface p-5">
      <div className="flex items-center gap-2.5">
        <SectionIcon className="bg-lime-400/10 text-lime-400">
          <PlayCircle size={18} />
        </SectionIcon>
        <h2 className="text-lg font-semibold tracking-tight">
          {isToday ? "Continue Today's Workout" : "Continue Last Workout"}
        </h2>
      </div>

      {!workout ? (
        <>
          <p className="mt-4 text-sm leading-6 text-zinc-500">
            No workouts yet. Start one below to see it here.
          </p>

          <Link
            href="#quick-start"
            className="btn-base mt-5 inline-flex w-full items-center justify-center rounded-xl border border-zinc-800 bg-[#191919] py-3 text-sm font-medium text-white hover:bg-[#222]"
          >
            Choose a Muscle Group
          </Link>
        </>
      ) : (
        <>
          <p className="mt-4 text-lg font-semibold text-lime-400">
            {workout.bodyParts?.join(" + ") || "Workout"}
          </p>

          <p className="mt-1 text-sm text-zinc-500">
            {isToday ? "Today" : workout.date} • {workout.exercises} Exercise
            {workout.exercises !== 1 ? "s" : ""} • {workout.sets} Sets
          </p>

          <div className="mt-3 inline-flex rounded-full bg-lime-400/15 px-3 py-1 text-sm text-lime-400">
            Score {workout.score}
          </div>

          <div className="mt-5 flex gap-3">
            <Link
              href={`/workout/${bodyPartSlug}`}
              className="btn-base flex-1 rounded-xl bg-lime-400 py-3 text-center text-sm font-semibold text-black hover:brightness-95"
            >
              {isToday ? "Add More Exercises" : "Repeat Workout"}
            </Link>

            <Link
              href={`/history/${workout.id}`}
              className="btn-base flex-1 rounded-xl border border-zinc-800 bg-[#191919] py-3 text-center text-sm font-medium text-white hover:bg-[#222]"
            >
              View Details
            </Link>
          </div>
        </>
      )}
    </div>
  );
}

function LatestPRCard({ record }: { record: PersonalRecord | null }) {
  return (
    <div className="card-surface p-5">
      <div className="flex items-center gap-2.5">
        <SectionIcon className="bg-yellow-500/10 text-yellow-400">
          <span aria-hidden="true">🏆</span>
        </SectionIcon>
        <h2 className="text-lg font-semibold tracking-tight">Latest Personal Record</h2>
      </div>

      {!record ? (
        <p className="mt-4 text-sm leading-6 text-zinc-500">
          No personal records yet. Complete a workout to set your first PR.
        </p>
      ) : (
        <Link
          href={exerciseHref(record.exerciseName)}
          className="btn-base mt-4 block rounded-2xl border border-yellow-500/30 bg-yellow-500/5 p-4 hover:bg-yellow-500/10"
        >
          <p className="font-semibold text-yellow-400 truncate">{record.exerciseName}</p>

          <p className="mt-2 text-3xl font-bold tracking-tight text-white">
            <AnimatedStatValue value={fmtKg(record.weight)} />
          </p>

          <p className="mt-2 text-sm text-zinc-400">
            Achieved{" "}
            {new Date(record.achievedAt).toLocaleDateString(undefined, {
              month: "long",
              day: "numeric",
              year: "numeric",
            })}
          </p>
        </Link>
      )}
    </div>
  );
}

function WeeklyProgressCard({ progress }: { progress: WeeklyProgressData }) {
  return (
    <div className="card-surface p-5">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <SectionIcon className="bg-lime-400/10 text-lime-400">
            <CalendarCheck size={18} />
          </SectionIcon>
          <h2 className="text-lg font-semibold tracking-tight">Weekly Progress</h2>
        </div>

        <span className="shrink-0 text-xs text-zinc-500">
          Week of {progress.weekStartLabel}
        </span>
      </div>

      <div className="mt-5 flex items-center justify-between">
        {progress.daysTrained.map((trained, index) => (
          <div key={index} className="flex flex-col items-center gap-2">
            <span className="text-[11px] font-medium text-zinc-500">
              {WEEKDAY_LETTERS[index]}
            </span>

            <div
              className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition-colors ${
                trained
                  ? "bg-lime-400 text-black"
                  : index === progress.todayIndex
                    ? "bg-zinc-900 text-lime-400 ring-2 ring-lime-400/60"
                    : "bg-zinc-900 text-zinc-600"
              }`}
              aria-label={
                trained ? "Trained" : index === progress.todayIndex ? "Today" : "Not trained"
              }
            >
              {trained ? "✓" : ""}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-5 flex items-center justify-between text-sm">
        <span className="text-zinc-400">
          <span className="font-semibold text-white">{progress.workoutsThisWeek}</span> workout
          {progress.workoutsThisWeek !== 1 ? "s" : ""} this week
        </span>
        <span className="text-zinc-500">{progress.setsThisWeek} sets</span>
      </div>
    </div>
  );
}

function LevelCard({ level }: { level: LevelProgress }) {
  return (
    <div
      className="card-surface overflow-hidden p-5"
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
          <span className="text-2xl font-bold" style={{ color: level.color }}>
            Level {level.level}
          </span>
        </div>

        <span className="text-sm font-semibold text-zinc-400">{level.title}</span>
      </div>

      <div
        className="mt-4 h-2.5 w-full overflow-hidden rounded-full bg-zinc-800"
        role="progressbar"
        aria-valuenow={level.progressPercent}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Level progress"
      >
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${level.progressPercent}%`, backgroundColor: level.color }}
        />
      </div>

      <div className="mt-2 flex items-center justify-between text-xs text-zinc-500">
        <span>{level.progressPercent}%</span>
        <span>{level.nextLevel ? `Next: ${level.nextLevel.title}` : "Max Level"}</span>
      </div>

      <Link
        href="/profile"
        className="btn-base mt-4 inline-flex items-center gap-1 text-sm text-lime-400 hover:underline"
      >
        View Full Profile
        <ChevronRight size={14} aria-hidden="true" />
      </Link>
    </div>
  );
}

export default function Home() {
  const [user, setUser] = useState<{ user_metadata?: { full_name?: string; name?: string } } | null>(
    null
  );
  const [history, setHistory] = useState<WorkoutHistoryEntry[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [personalRecords, setPersonalRecords] = useState<PersonalRecord[]>([]);
  const [loadingRecords, setLoadingRecords] = useState(true);

  useEffect(() => {
    let active = true;

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (active) setUser(session?.user ?? null);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (active) setUser(session?.user ?? null);
    });

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

  const isLoading = loadingHistory || loadingRecords;

  const greeting = useMemo(() => getGreeting(), []);

  const displayName = useMemo(() => {
    const fullName = user?.user_metadata?.full_name || user?.user_metadata?.name || null;
    if (!fullName) return null;
    return String(fullName).trim().split(/\s+/)[0];
  }, [user]);

  const todayLabel = useMemo(
    () =>
      new Date().toLocaleDateString(undefined, {
        weekday: "long",
        month: "long",
        day: "numeric",
      }),
    []
  );

  const currentStreak = useMemo(() => calculateCurrentStreak(history), [history]);
  const recovery = useMemo(() => calculateRecoveryScore(history), [history]);

  const recommendation = useMemo(
    () => getTodaysRecommendation(history, recovery, BODY_PART_NAMES),
    [history, recovery]
  );

  const weeklyProgress = useMemo(() => calculateWeeklyProgress(history), [history]);
  const overallLevel = useMemo(() => calculateOverallLevel(personalRecords), [personalRecords]);
  const latestPR = useMemo(() => getMostRecentPersonalRecord(personalRecords), [personalRecords]);

  const lastWorkout = history[0] ?? null;

  const lastWorkoutIsToday = useMemo(() => {
    if (!lastWorkout) return false;
    return toLocalDayKey(lastWorkout.timestamp) === toLocalDayKey(new Date().getTime());
  }, [lastWorkout]);

  const lastWorkoutBodyPartSlug = lastWorkout?.bodyParts?.[0]?.toLowerCase() || "chest";

  return (
    <main className="min-h-screen bg-black px-6 pt-8 pb-[calc(72px+env(safe-area-inset-bottom)+1.5rem)] text-white animate-[fade-in_200ms_ease-out]">
      <div className="mx-auto w-full max-w-[390px]">

        {/* 1. Greeting */}
        <header className="pb-1">
          <p className="text-sm text-zinc-500">{todayLabel}</p>

          <h1 className="heading-font mt-1 text-[1.7rem] font-semibold tracking-tight text-white">
            {greeting}
            {displayName ? `, ${displayName}` : ""}
          </h1>

          <p className="mt-2 text-sm leading-relaxed text-zinc-400">
            {isLoading
              ? "Loading your dashboard..."
              : currentStreak > 0
                ? `🔥 ${currentStreak}-day streak - keep it going.`
                : "Ready to make progress today?"}
          </p>
        </header>

        {/* 2. Recovery Score */}
        <section aria-label="Recovery score" className="mt-6">
          {isLoading ? <LoadingCard rows={2} /> : <RecoveryScoreCard recovery={recovery} />}
        </section>

        {/* 3. Today's Recommendation */}
        <section aria-label="Today's recommendation" className="mt-5">
          {isLoading ? (
            <LoadingCard rows={2} />
          ) : (
            <RecommendationCard recommendation={recommendation} />
          )}
        </section>

        {/* 4. Continue Last Workout */}
        <section aria-label="Continue last workout" className="mt-5">
          {isLoading ? (
            <LoadingCard rows={3} />
          ) : (
            <ContinueWorkoutCard
              workout={lastWorkout}
              isToday={lastWorkoutIsToday}
              bodyPartSlug={lastWorkoutBodyPartSlug}
            />
          )}
        </section>

        {/* 5. Latest Personal Record */}
        <section aria-label="Latest personal record" className="mt-5">
          {isLoading ? <LoadingCard rows={2} /> : <LatestPRCard record={latestPR} />}
        </section>

        {/* 6. Weekly Progress */}
        <section aria-label="Weekly progress" className="mt-5">
          {isLoading ? (
            <LoadingCard rows={2} />
          ) : (
            <WeeklyProgressCard progress={weeklyProgress} />
          )}
        </section>

        {/* 7. Current Level */}
        <section aria-label="Current level" className="mt-5">
          {isLoading ? <LoadingCard rows={2} /> : <LevelCard level={overallLevel} />}
        </section>

        {/* 8. Quick Start Workout */}
        <section aria-label="Quick start workout" id="quick-start" className="mt-8">
          <h2 className="text-lg font-semibold tracking-tight text-white">
            Quick Start Workout
          </h2>
          <p className="mt-1 text-sm text-zinc-500">
            Select a muscle group to begin
          </p>

          <div className="mt-5 rounded-2xl border border-yellow-500 bg-yellow-500/5 p-4">
            <div className="mb-2 flex items-center gap-2">
              <span className="text-xl" aria-hidden="true">⚠️</span>

              <h3 className="font-semibold text-yellow-400">
                Warm Up First
              </h3>
            </div>

            <p className="text-zinc-300 text-sm leading-6">
              Warm up with light cardio and dynamic stretches for 5–10 minutes before every workout.
            </p>
          </div>

          <ViewTransition
            name="home-content"
            enter={{
              "nav-forward": "nav-forward",
              "nav-back": "nav-back",
              default: "none",
            }}
            exit={{
              "nav-forward": "nav-forward",
              "nav-back": "nav-back",
              default: "none",
            }}
            default="none"
          >
            <section
              aria-label="Muscle groups"
              className="mt-5 grid grid-cols-2 gap-4"
            >
              {BODY_PARTS.map((part) => (
                <BodyPartCard key={part.name} {...part} />
              ))}
            </section>
          </ViewTransition>
        </section>
      </div>

      <BottomNav />
    </main>
  );
}
