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
  calculateWeeklyProgress,
  getGreeting,
  type WeeklyProgress as WeeklyProgressData,
} from "@/lib/dashboard";
import {
  type BodyPartRecovery,
  type RecoveryIntelligenceReport,
  type TrainingStatus,
  type WorkoutRecommendation,
} from "@/lib/recoveryIntelligence";
import { workouts } from "@/app/Data/workouts";

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

const WEEKDAY_LETTERS = ["M", "T", "W", "T", "F", "S", "S"];

function fmtKg(value: number | null | undefined): string {
  if (value == null || !Number.isFinite(value)) return "-";
  return `${Math.round(value * 10) / 10} kg`;
}

/** Drops a trailing body-part name from a section title, e.g. "Upper Chest" + "Chest" -> "Upper". */
function shortSectionLabel(title: string, bodyPartName: string): string {
  const stripped = title.replace(new RegExp(`\\s*${bodyPartName}$`, "i"), "").trim();
  return stripped.length > 0 ? stripped : title;
}

/** Section labels + total exercise count per body part, derived once from the existing workouts data. */
const BODY_PART_META = new Map(
  BODY_PARTS.map((part) => {
    const sections = workouts[part.slug as keyof typeof workouts]?.sections ?? [];
    return [
      part.name,
      {
        sectionLabels: sections.map((section) => shortSectionLabel(section.title, part.name)),
        exerciseCount: sections.reduce((sum, section) => sum + section.exerciseCount, 0),
      },
    ] as const;
  })
);

function BodyPartCard({
  name,
  slug,
  image,
  isLastTrained = false,
}: BodyPart & { isLastTrained?: boolean }) {
  const meta = BODY_PART_META.get(name);

  return (
    <Link
      href={`/workout/${slug}`}
      transitionTypes={["nav-forward"]}
      className={`group relative flex items-center gap-3 overflow-hidden rounded-xl bg-[#111111] border px-5 py-3 transition-all duration-200 hover:border-[#39ff14] hover:shadow-[0_0_0_1px_#39ff14] active:scale-[0.98] active:border-[#39ff14] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#39ff14] focus-visible:ring-offset-2 focus-visible:ring-offset-black ${
        isLastTrained ? "border-orange-500/30 animate-last-trained-glow" : "border-[#1a1a1a]"
      }`}
    >
      {isLastTrained && (
        <span className="absolute right-2 top-2 z-10 rounded-full bg-black/70 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-orange-300 ring-1 ring-orange-500/25 backdrop-blur-sm">
          Last Trained
        </span>
      )}

      <div className="min-w-0 flex-1">
        <h2 className="truncate text-[18px] font-normal text-white">{name}</h2>

        {meta && meta.sectionLabels.length > 0 && (
          <p className="mt-1 truncate text-xs text-zinc-500">
            {meta.sectionLabels.join(" • ")}
          </p>
        )}

        {meta && (
          <p className="mt-1 text-xs font-medium text-lime-400">
            {meta.exerciseCount} Exercise{meta.exerciseCount !== 1 ? "s" : ""}
          </p>
        )}
      </div>

      <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-black">
        <ViewTransition
          name={`muscle-${slug}`}
          default="none"
          share="auto"
        >
          <Image
            src={image}
            alt={name}
            fill
            className="object-contain"
            sizes="80px"
          />
        </ViewTransition>
      </div>

      <ChevronRight
        size={18}
        className="shrink-0 text-zinc-500 transition-colors group-hover:text-[#39ff14]"
        aria-hidden="true"
      />
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

const STATUS_STYLES: Record<
  TrainingStatus,
  { text: string; bar: string; bg: string; icon: React.ReactNode }
> = {
  Ready: {
    text: "text-lime-400",
    bar: "bg-lime-400",
    bg: "bg-lime-400/10",
    icon: <BatteryCharging size={18} />,
  },
  "Moderate Fatigue": {
    text: "text-yellow-400",
    bar: "bg-yellow-400",
    bg: "bg-yellow-400/10",
    icon: <BatteryMedium size={18} />,
  },
  "Recovery Needed": {
    text: "text-orange-400",
    bar: "bg-orange-400",
    bg: "bg-orange-400/10",
    icon: <BatteryWarning size={18} />,
  },
};

/** Overall status label, using the same thresholds as each body part's status. */
function overallStatus(score: number): TrainingStatus {
  if (score >= 85) return "Ready";
  if (score >= 50) return "Moderate Fatigue";
  return "Recovery Needed";
}

function BodyPartRow({ bodyPart }: { bodyPart: BodyPartRecovery }) {
  const style = STATUS_STYLES[bodyPart.status];

  return (
    <div className="flex items-center justify-between gap-3 rounded-xl bg-[#191919] px-3 py-2.5">
      <div className="min-w-0">
        <p className="truncate text-sm font-medium text-white">{bodyPart.bodyPart}</p>
        <p className="mt-0.5 truncate text-xs text-zinc-500">
          {bodyPart.daysSinceLastTrained == null
            ? "Never trained"
            : bodyPart.daysSinceLastTrained === 0
              ? "Trained today"
              : `${bodyPart.daysSinceLastTrained}d ago`}
          {" • "}
          {bodyPart.estimatedReadiness}
        </p>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        <span className={`text-sm font-semibold ${style.text}`}>{bodyPart.recoveryPercent}%</span>
        <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${style.bg} ${style.text}`}>
          {bodyPart.status}
        </span>
      </div>
    </div>
  );
}

function RecoveryScoreCard({
  report,
  hasHistory,
}: {
  report: RecoveryIntelligenceReport;
  hasHistory: boolean;
}) {
  const status = overallStatus(report.overallRecoveryScore);
  const style = STATUS_STYLES[status];

  return (
    <div id="recovery" className="card-surface p-5">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <SectionIcon className={`${style.bg} ${style.text}`}>{style.icon}</SectionIcon>
          <h2 className="text-lg font-semibold tracking-tight">Recovery Score</h2>
        </div>

        {hasHistory && (
          <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${style.bg} ${style.text}`}>
            {status}
          </span>
        )}
      </div>

      {!hasHistory ? (
        <p className="mt-4 text-sm leading-6 text-zinc-500">
          Complete a workout to start tracking recovery for every muscle group.
        </p>
      ) : (
        <>
          <div className="mt-4 flex items-baseline gap-1.5">
            <span className={`text-4xl font-bold tracking-tight ${style.text}`}>
              <AnimatedStatValue value={`${report.overallRecoveryScore}%`} />
            </span>
            <span className="text-sm text-zinc-500">overall readiness</span>
          </div>

          <div
            className="mt-4 h-2.5 w-full overflow-hidden rounded-full bg-zinc-800"
            role="progressbar"
            aria-valuenow={report.overallRecoveryScore}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="Overall recovery percent"
          >
            <div
              className={`h-full rounded-full transition-all duration-500 ${style.bar}`}
              style={{ width: `${report.overallRecoveryScore}%` }}
            />
          </div>

          <div className="mt-5 space-y-2.5">
            {report.bodyParts.map((bodyPart) => (
              <BodyPartRow key={bodyPart.bodyPart} bodyPart={bodyPart} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function RecommendationCard({ recommendation }: { recommendation: WorkoutRecommendation }) {
  const [showReasoning, setShowReasoning] = useState(false);

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

      {recommendation.reasoning.length > 0 && (
        <div className="mt-4">
          <button
            type="button"
            onClick={() => setShowReasoning((visible) => !visible)}
            aria-expanded={showReasoning}
            className="btn-base flex w-full items-center justify-between text-sm text-zinc-500 hover:text-zinc-300"
          >
            <span>Why this recommendation?</span>
            <ChevronRight
              size={14}
              className={`transition-transform duration-200 ${showReasoning ? "rotate-90" : ""}`}
              aria-hidden="true"
            />
          </button>

          {showReasoning && (
            <ul className="mt-3 space-y-2 border-t border-zinc-800 pt-3">
              {recommendation.reasoning.map((reason, index) => (
                <li key={index} className="text-xs leading-5 text-zinc-500">
                  {reason}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
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
  const hasHistory = history.length > 0;

  const weeklyProgress = useMemo(() => calculateWeeklyProgress(history), [history]);
  const overallLevel = useMemo(() => calculateOverallLevel(personalRecords), [personalRecords]);
  const latestPR = useMemo(() => getMostRecentPersonalRecord(personalRecords), [personalRecords]);

  const lastWorkout = history[0] ?? null;

  const lastWorkoutIsToday = useMemo(() => {
    if (!lastWorkout) return false;
    return toLocalDayKey(lastWorkout.timestamp) === toLocalDayKey(new Date().getTime());
  }, [lastWorkout]);

  const lastWorkoutBodyPartSlug = lastWorkout?.bodyParts?.[0]?.toLowerCase() || "chest";

  const lastTrainedBodyParts = useMemo(
    () => new Set(lastWorkout?.bodyParts ?? []),
    [lastWorkout]
  );

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

        {/* 6. Weekly Progress */}
        <section aria-label="Weekly progress" className="mt-5">
          {isLoading ? (
            <LoadingCard rows={2} />
          ) : (
            <WeeklyProgressCard progress={weeklyProgress} />
          )}
        </section>

        {/* 8. Quick Start Workout */}
        <section aria-label="Quick start workout" id="quick-start" className="mt-8">

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
              className="mt-5 flex flex-col gap-4"
            >
              {BODY_PARTS.map((part) => (
                <BodyPartCard
                  key={part.name}
                  {...part}
                  isLastTrained={lastTrainedBodyParts.has(part.name)}
                />
              ))}
            </section>
          </ViewTransition>
        </section>
      </div>

      <BottomNav />
    </main>
  );
}
