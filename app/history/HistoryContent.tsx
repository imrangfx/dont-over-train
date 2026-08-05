"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CalendarDays, ChevronRight, Clock3, Dumbbell } from "lucide-react";
import { loadWorkoutHistory, type WorkoutHistoryEntry } from "@/lib/workouts";
import { formatDurationMinutes } from "@/lib/workoutSession";
import {
  formatDisplayDate,
  formatHistoryDateParts,
  formatMonthYear,
  monthGroupKey,
} from "@/lib/formatDate";
import {
  bodyPartDisplayName,
  bodyPartHistoryTitle,
  filterHistoryByBodyPart,
} from "@/lib/historyFilter";
import BottomNav from "@/components/BottomNav";
import EmptyState from "@/components/ui/EmptyState";
import LoadingCard from "@/components/ui/LoadingCard";

const BODY_PART_SLUG: Record<string, string> = {
  Chest: "chest",
  Back: "back",
  Shoulders: "shoulders",
  Triceps: "triceps",
  Biceps: "biceps",
  Legs: "legs",
  Forearms: "forearms",
  Abs: "abs",
};

type MonthGroup = {
  readonly key: string;
  readonly label: string;
  readonly workouts: WorkoutHistoryEntry[];
};

function groupHistoryByMonth(
  workouts: readonly WorkoutHistoryEntry[],
): MonthGroup[] {
  const groups = new Map<string, MonthGroup>();

  for (const workout of workouts) {
    const anchor = workout.timestamp || workout.date;
    const key = monthGroupKey(anchor);
    const existing = groups.get(key);

    if (existing) {
      existing.workouts.push(workout);
      continue;
    }

    groups.set(key, {
      key,
      label: formatMonthYear(anchor),
      workouts: [workout],
    });
  }

  return [...groups.values()].sort((a, b) => b.key.localeCompare(a.key));
}

function sessionTitle(workout: WorkoutHistoryEntry): string {
  if (workout.bodyParts && workout.bodyParts.length > 0) {
    return workout.bodyParts.join(" + ");
  }
  return "Workout";
}

function primaryBodyPartImage(workout: WorkoutHistoryEntry): string | null {
  const part = workout.bodyParts?.[0];
  if (!part) return null;
  const slug = BODY_PART_SLUG[part] ?? part.toLowerCase();
  if (!slug) return null;
  return `/body-parts/${slug}.webp`;
}

function HistorySummaryStrip({
  sessions,
  exercises,
  totalMinutes,
}: {
  sessions: number;
  exercises: number;
  totalMinutes: number;
}) {
  const tiles = [
    {
      label: "Sessions",
      value: String(sessions),
      icon: <CalendarDays size={16} aria-hidden="true" />,
    },
    {
      label: "Exercises",
      value: String(exercises),
      icon: <Dumbbell size={16} aria-hidden="true" />,
    },
    {
      label: "Total Time",
      value: formatDurationMinutes(totalMinutes),
      icon: <Clock3 size={16} aria-hidden="true" />,
    },
  ] as const;

  return (
    <div className="mb-8 grid grid-cols-3 gap-2.5">
      {tiles.map((tile) => (
        <div
          key={tile.label}
          className="rounded-2xl border border-zinc-800/90 bg-[#111] px-2.5 py-3 text-center shadow-[0_8px_24px_rgba(0,0,0,0.35)]"
        >
          <div className="mx-auto flex h-7 w-7 items-center justify-center text-lime-400">
            {tile.icon}
          </div>
          <p className="mt-1.5 text-lg font-bold tabular-nums tracking-tight text-lime-400">
            {tile.value}
          </p>
          <p className="mt-0.5 text-[10px] font-medium uppercase tracking-wide text-zinc-500">
            {tile.label}
          </p>
        </div>
      ))}
    </div>
  );
}

function WorkoutHistoryCard({
  workout,
  href,
  emphasize,
}: {
  workout: WorkoutHistoryEntry;
  href: string;
  emphasize: boolean;
}) {
  const title = sessionTitle(workout);
  const anchor = workout.timestamp || workout.date;
  const fullDate = formatDisplayDate(anchor);
  const parts = formatHistoryDateParts(anchor);
  const duration = Math.max(0, Number(workout.durationMinutes) || 0);
  const exerciseCount = Math.max(0, Number(workout.exercises) || 0);
  const imageSrc = primaryBodyPartImage(workout);

  return (
    <Link
      href={href}
      aria-label={`${title} on ${fullDate}`}
      className={`btn-base group relative flex items-center gap-3 overflow-hidden rounded-2xl border border-zinc-800/90 bg-[#111] px-3.5 py-3.5 shadow-[0_10px_28px_rgba(0,0,0,0.38)] transition-colors hover:border-lime-400/30 active:border-lime-400/45 ${
        emphasize ? "border-lime-400/25" : ""
      }`}
      style={{
        background:
          "linear-gradient(135deg, rgba(17,17,17,1) 0%, rgba(17,17,17,1) 58%, rgba(57,255,20,0.045) 100%)",
      }}
    >
      {emphasize ? (
        <span
          className="absolute inset-y-3 left-0 w-0.5 rounded-full bg-lime-400 shadow-[0_0_10px_rgba(57,255,20,0.45)]"
          aria-hidden="true"
        />
      ) : null}

      {/* Date column */}
      <div className="flex w-11 shrink-0 flex-col items-center justify-center text-center">
        <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-zinc-500">
          {parts.weekday}
        </span>
        <span className="mt-0.5 text-2xl font-bold leading-none tabular-nums text-white">
          {parts.day}
        </span>
        <span className="mt-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-zinc-500">
          {parts.month}
        </span>
      </div>

      {/* Body-part mark */}
      <div className="relative flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full border border-zinc-800 bg-black/50">
        {imageSrc ? (
          <Image
            src={imageSrc}
            alt=""
            width={36}
            height={36}
            className="object-contain opacity-90"
          />
        ) : (
          <Dumbbell size={18} className="text-lime-400" aria-hidden="true" />
        )}
      </div>

      {/* Title + meta */}
      <div className="min-w-0 flex-1">
        <h3 className="truncate text-[17px] font-semibold tracking-tight text-white">
          {title}
        </h3>

        <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-zinc-500">
          <span className="inline-flex items-center gap-1">
            <Dumbbell size={12} className="text-lime-400/80" aria-hidden="true" />
            <span>
              {exerciseCount} Exercise{exerciseCount === 1 ? "" : "s"}
            </span>
          </span>

          <span className="h-3 w-px bg-zinc-700" aria-hidden="true" />

          <span className="inline-flex items-center gap-1 tabular-nums">
            <Clock3 size={12} className="text-lime-400/80" aria-hidden="true" />
            <span>{duration > 0 ? `${duration} min` : "—"}</span>
          </span>
        </div>
      </div>

      <ChevronRight
        size={18}
        className="shrink-0 text-zinc-500 transition-colors group-hover:text-lime-400"
        aria-hidden="true"
      />
    </Link>
  );
}

export default function HistoryContent() {
  const searchParams = useSearchParams();
  const bodyPartSlug = searchParams.get("bodyPart");

  const [history, setHistory] = useState<WorkoutHistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const filteredHistory = useMemo(
    () => filterHistoryByBodyPart(history, bodyPartSlug),
    [history, bodyPartSlug],
  );

  const monthGroups = useMemo(
    () => groupHistoryByMonth(filteredHistory),
    [filteredHistory],
  );

  const summary = useMemo(() => {
    let exercises = 0;
    let totalMinutes = 0;
    for (const workout of filteredHistory) {
      exercises += Number(workout.exercises) || 0;
      totalMinutes += Number(workout.durationMinutes) || 0;
    }
    return {
      sessions: filteredHistory.length,
      exercises,
      totalMinutes,
    };
  }, [filteredHistory]);

  const pageTitle = bodyPartSlug
    ? bodyPartHistoryTitle(bodyPartSlug)
    : "Workout History";

  const pageSubtitle = bodyPartSlug
    ? `Workouts that include ${bodyPartDisplayName(bodyPartSlug).toLowerCase()}`
    : "Your completed workouts.";

  useEffect(() => {
    let active = true;

    loadWorkoutHistory().then((result) => {
      if (!active) return;
      setHistory(result.history);
      setError(result.error);
      setLoading(false);
    });

    return () => {
      active = false;
    };
  }, []);

  function detailsHref(workoutId: string) {
    if (!bodyPartSlug) return `/history/${workoutId}`;
    return `/history/${workoutId}?bodyPart=${encodeURIComponent(bodyPartSlug)}`;
  }

  return (
    <main className="min-h-screen bg-black px-6 py-6 pb-[calc(72px+env(safe-area-inset-bottom)+1.5rem)] text-white animate-[fade-in_200ms_ease-out]">
      <div className="mx-auto w-full max-w-[390px]">
        <header className="mb-6">
          <h1 className="heading-font text-[1.75rem] font-semibold tracking-tight text-white">
            {pageTitle}
          </h1>
          <p className="mt-1.5 text-sm leading-relaxed text-zinc-500">
            {pageSubtitle}
          </p>
        </header>

        {loading ? (
          <div className="space-y-4" aria-busy="true">
            <LoadingCard rows={2} />
            <LoadingCard rows={3} />
            <LoadingCard rows={3} />
          </div>
        ) : error ? (
          <EmptyState
            icon={<Dumbbell size={22} />}
            title="Couldn't load workouts"
            description="Something went wrong while loading your history. Please try again."
          />
        ) : filteredHistory.length === 0 ? (
          <EmptyState
            icon={<Dumbbell size={22} />}
            title="No workouts yet"
            description={
              bodyPartSlug
                ? `Finish a ${bodyPartDisplayName(bodyPartSlug).toLowerCase()} workout and it will appear here.`
                : "Finish your first workout and it will appear here."
            }
          />
        ) : (
          <>
            <HistorySummaryStrip
              sessions={summary.sessions}
              exercises={summary.exercises}
              totalMinutes={summary.totalMinutes}
            />

            <div className="space-y-7">
              {monthGroups.map((group) => (
                <section key={group.key} aria-labelledby={`month-${group.key}`}>
                  <h2
                    id={`month-${group.key}`}
                    className="mb-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-lime-400"
                  >
                    {group.label}
                  </h2>

                  <div className="space-y-3">
                    {group.workouts.map((workout, index) => (
                      <WorkoutHistoryCard
                        key={workout.id}
                        workout={workout}
                        href={detailsHref(workout.id)}
                        emphasize={group === monthGroups[0] && index === 0}
                      />
                    ))}
                  </div>
                </section>
              ))}
            </div>
          </>
        )}
      </div>

      <BottomNav />
    </main>
  );
}
