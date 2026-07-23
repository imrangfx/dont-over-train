"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  Trophy,
  Dumbbell,
  BarChart3,
  Repeat,
  Layers,
  Calendar,
  CalendarCheck,
  TrendingUp,
  Sparkles,
  Award,
  Flame,
  ChevronDown,
  AlertTriangle,
  RefreshCw,
  Compass,
} from "lucide-react";
import { loadWorkoutHistory, type WorkoutHistoryEntry } from "@/lib/workouts";
import { loadPersonalRecords } from "@/lib/personalRecords";
import { CATEGORY_LABELS, type PersonalRecord } from "@/lib/progression";
import { buildExerciseAnalytics } from "@/lib/exerciseAnalytics";
import { buildChartSeries } from "@/lib/chartAnalytics";
import { buildTrendSummary } from "@/lib/trendAnalytics";
import { buildGraphInsights } from "@/lib/graphInsights";
import ExerciseChart from "@/components/ExerciseChart";
import TrendSummaryGrid from "@/components/TrendSummaryGrid";
import GraphInsightsList from "@/components/GraphInsightsList";
import AnimatedStatValue from "@/components/AnimatedStatValue";

const PAGE_SIZE = 10;

function fmtKg(value: number | null): string {
  if (value == null || !Number.isFinite(value)) return "-";
  return `${Math.round(value * 10) / 10} kg`;
}

function fmtNum(value: number | null): string {
  if (value == null || !Number.isFinite(value)) return "-";
  return String(Math.round(value * 10) / 10);
}

type HistoryResult = Awaited<ReturnType<typeof loadWorkoutHistory>>;
type RecordsResult = Awaited<ReturnType<typeof loadPersonalRecords>>;

function SkeletonBlock({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded-lg bg-zinc-800/80 ${className}`} />;
}

export default function ExerciseDetailPage() {
  const params = useParams();
  const exerciseName = decodeURIComponent(String(params.exerciseId ?? ""));

  const [history, setHistory] = useState<WorkoutHistoryEntry[]>([]);
  const [personalRecords, setPersonalRecords] = useState<PersonalRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  function applyResults(historyResult: HistoryResult, recordsResult: RecordsResult) {
    const combinedError = historyResult.error || recordsResult.error;

    if (combinedError) {
      setError(combinedError);
    } else {
      setError(null);
      setHistory(historyResult.history);
      setPersonalRecords(recordsResult.records);
    }

    setLoading(false);
  }

  useEffect(() => {
    let active = true;

    Promise.all([loadWorkoutHistory(), loadPersonalRecords()]).then(
      ([historyResult, recordsResult]) => {
        if (!active) return;
        applyResults(historyResult, recordsResult);
      }
    );

    return () => {
      active = false;
    };
  }, []);

  function handleRetry() {
    setLoading(true);
    setError(null);

    Promise.all([loadWorkoutHistory(), loadPersonalRecords()]).then(
      ([historyResult, recordsResult]) => {
        applyResults(historyResult, recordsResult);
      }
    );
  }

  // Memoized so re-renders (e.g. "Show more" pagination) never re-derive
  // the full analytics payload from scratch.
  const analytics = useMemo(
    () => buildExerciseAnalytics(exerciseName, history, personalRecords),
    [exerciseName, history, personalRecords]
  );

  const visibleSessions = analytics.sessions.slice(0, visibleCount);
  const hasMoreSessions = analytics.sessions.length > visibleCount;
  const currentPRSession = analytics.sessions.find(
    (s) => s.weight === analytics.stats.currentPR
  );

  // Chronological (oldest -> newest) copy: the chart/trend/insight helpers
  // all assume ascending order, while analytics.sessions (Sprint 1) is
  // newest-first for the Recent Sessions list. Memoized so the graph's own
  // internal metric/range switching never triggers this to recompute.
  const chronological = useMemo(
    () => [...analytics.sessions].sort((a, b) => a.timestamp - b.timestamp),
    [analytics.sessions]
  );

  const trendCards = useMemo(() => {
    const weightSeries = buildChartSeries(chronological, "weight");
    return buildTrendSummary(chronological, "weight", weightSeries);
  }, [chronological]);

  const graphInsights = useMemo(
    () => buildGraphInsights(chronological, analytics.exerciseName),
    [chronological, analytics.exerciseName]
  );

  if (loading) {
    return (
      <main className="min-h-screen bg-black px-6 py-8 pb-12 text-white">
        <div
          className="mx-auto max-w-[430px]"
          role="status"
          aria-live="polite"
          aria-busy="true"
          aria-label="Loading exercise analytics"
        >
          <SkeletonBlock className="h-5 w-24" />
          <SkeletonBlock className="mt-7 h-9 w-2/3" />
          <div className="mt-3 flex gap-2">
            <SkeletonBlock className="h-6 w-16 rounded-full" />
            <SkeletonBlock className="h-6 w-24 rounded-full" />
            <SkeletonBlock className="h-6 w-16 rounded-full" />
          </div>
          <SkeletonBlock className="mt-5 h-16 w-full rounded-2xl" />
          <SkeletonBlock className="mt-6 h-28 w-full rounded-3xl" />

          <SkeletonBlock className="mt-10 h-6 w-40" />
          <SkeletonBlock className="mt-4 h-72 w-full rounded-2xl" />

          <SkeletonBlock className="mt-10 h-6 w-40" />
          <div className="mt-4 grid grid-cols-2 gap-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <SkeletonBlock key={index} className="h-28 w-full rounded-2xl" />
            ))}
          </div>

          <span className="sr-only">Loading exercise analytics…</span>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen bg-black px-6 py-8 text-white">
        <div className="mx-auto max-w-[430px]">
          <Link
            href="/history"
            className="btn-base inline-flex items-center gap-2 rounded-lg text-zinc-400 hover:text-white"
          >
            <ArrowLeft size={18} aria-hidden="true" />
            ← History
          </Link>

          <div
            role="alert"
            className="mt-8 flex flex-col items-center rounded-3xl border border-red-500/30 bg-red-500/5 px-6 py-12 text-center"
          >
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-red-500/10 text-red-400">
              <AlertTriangle size={24} aria-hidden="true" />
            </div>
            <h1 className="mt-5 text-xl font-semibold">Couldn&apos;t load this exercise</h1>
            <p className="mt-2 max-w-xs text-sm leading-6 text-zinc-500">
              Something went wrong while loading your analytics. Check your connection and try again.
            </p>
            <button
              type="button"
              onClick={handleRetry}
              className="btn-base mt-6 inline-flex items-center gap-2 rounded-2xl bg-lime-400 px-5 py-3 text-sm font-semibold text-black hover:brightness-95"
            >
              <RefreshCw size={16} aria-hidden="true" />
              Try Again
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black px-6 py-8 pb-16 text-white animate-[fade-in_200ms_ease-out]">
      <div className="mx-auto max-w-[430px]">
        <Link
          href="/history"
          className="btn-base inline-flex items-center gap-2 rounded-lg text-zinc-400 hover:text-white"
        >
          <ArrowLeft size={18} aria-hidden="true" />
          ← History
        </Link>

        {/* Header */}
        <h1 className="mt-7 text-3xl font-bold tracking-tight sm:text-4xl">{analytics.exerciseName}</h1>

        <div className="mt-3 flex flex-wrap items-center gap-2">
          {analytics.bodyPart && (
            <span className="rounded-full border border-zinc-800 bg-[#111] px-3 py-1 text-xs font-medium text-zinc-300">
              {analytics.bodyPart}
            </span>
          )}
          <span className="rounded-full border border-zinc-800 bg-[#111] px-3 py-1 text-xs font-medium text-zinc-300">
            {CATEGORY_LABELS[analytics.category]}
          </span>
          {analytics.stats.currentPR != null && (
            <span className="rounded-full bg-lime-400/15 px-3 py-1 text-xs font-semibold text-lime-400">
              PR {fmtKg(analytics.stats.currentPR)}
            </span>
          )}
        </div>

        {analytics.stats.totalSessions === 0 ? (
          <div className="mt-8 flex flex-col items-center rounded-3xl border border-zinc-800 bg-linear-to-b from-[#111111] to-black px-6 py-12 text-center animate-[fade-in_250ms_ease-out]">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-lime-400/10 text-lime-400 ring-1 ring-lime-400/30">
              <Dumbbell size={26} aria-hidden="true" />
            </div>
            <h2 className="mt-6 text-xl font-semibold tracking-tight">No history for this exercise yet</h2>
            <p className="mt-2 max-w-xs text-sm leading-6 text-zinc-500">
              Complete a workout with {analytics.exerciseName} to unlock Personal Records, trend graphs,
              milestones, and insights here.
            </p>
            <Link
              href="/home"
              className="btn-base mt-7 inline-flex items-center gap-2 rounded-2xl bg-lime-400 px-5 py-3 text-sm font-semibold text-black hover:brightness-95"
            >
              <Compass size={16} aria-hidden="true" />
              Start a Workout
            </Link>
          </div>
        ) : (
          <>
            {/* Personal Record highlight */}
            {analytics.stats.currentPR != null && (
              <div className="mt-7 rounded-3xl border border-yellow-500/40 bg-yellow-500/10 p-6 text-center">
                <p className="font-semibold text-yellow-400">🏆 Personal Record</p>
                <p className="mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl">
                  <AnimatedStatValue value={fmtKg(analytics.stats.currentPR)} />
                </p>
                {currentPRSession?.date && (
                  <p className="mt-2 text-sm text-zinc-400">
                    Achieved {currentPRSession.date}
                  </p>
                )}
              </div>
            )}

            {/* Analytics Graph - the visual centerpiece of this page */}
            <div className="mt-9">
              <ExerciseChart exerciseName={analytics.exerciseName} sessions={analytics.sessions} />
            </div>

            {/* Trend Summary */}
            <h2 className="mt-10 text-xl font-semibold tracking-tight">Trend Summary</h2>
            <div className="mt-4">
              <TrendSummaryGrid cards={trendCards} />
            </div>

            {/* Graph Insights */}
            {graphInsights.length > 0 && (
              <div className="mt-9">
                <GraphInsightsList insights={graphInsights} />
              </div>
            )}

            {/* Statistics */}
            <h2 className="mt-10 text-xl font-semibold tracking-tight">Statistics</h2>
            <div className="mt-4 grid grid-cols-2 gap-3 sm:gap-4">
              <StatTile icon={<Trophy size={20} />} title="Current PR" value={fmtKg(analytics.stats.currentPR)} />
              <StatTile icon={<Award size={20} />} title="Highest Weight" value={fmtKg(analytics.stats.highestWeight)} />
              <StatTile icon={<Dumbbell size={20} />} title="Average Weight" value={fmtKg(analytics.stats.averageWeight)} />
              <StatTile icon={<Repeat size={20} />} title="Average Reps" value={fmtNum(analytics.stats.averageReps)} />
              <StatTile icon={<Layers size={20} />} title="Average Sets" value={fmtNum(analytics.stats.averageSets)} />
              <StatTile icon={<BarChart3 size={20} />} title="Total Sessions" value={String(analytics.stats.totalSessions)} />
              <StatTile icon={<Flame size={20} />} title="Total Volume" value={`${Math.round(analytics.stats.totalVolume).toLocaleString()} kg`} />
              <StatTile icon={<Calendar size={20} />} title="First Workout" value={analytics.stats.firstWorkoutDate ?? "-"} />
              <div className="col-span-2">
                <StatTile icon={<CalendarCheck size={20} />} title="Last Workout" value={analytics.stats.lastWorkoutDate ?? "-"} />
              </div>
            </div>

            {/* Recent Sessions */}
            <h2 className="mt-10 text-xl font-semibold tracking-tight">Recent Sessions</h2>
            <div className="mt-4 space-y-3">
              {visibleSessions.map((session) => (
                <Link
                  key={`${session.workoutId}-${session.timestamp}`}
                  href={`/history/${session.workoutId}`}
                  className="btn-base card-surface flex min-h-[76px] items-center justify-between gap-3 p-4 hover:border-lime-400/40"
                  aria-label={`${session.date}: ${fmtKg(session.weight)}, ${session.sets} sets, ${session.reps} reps, ${Math.round(session.volume).toLocaleString()} kg volume. View workout.`}
                >
                  <div className="min-w-0" aria-hidden="true">
                    <p className="font-semibold text-white">{session.date}</p>
                    <p className="mt-1 text-sm text-zinc-500">
                      {session.sets} Sets • {session.reps} Reps
                    </p>
                  </div>
                  <div className="shrink-0 text-right" aria-hidden="true">
                    <p className="font-semibold text-lime-400">
                      <AnimatedStatValue value={fmtKg(session.weight)} />
                    </p>
                    <p className="mt-1 text-xs text-zinc-500">
                      {Math.round(session.volume).toLocaleString()} kg vol
                    </p>
                  </div>
                </Link>
              ))}
            </div>

            {hasMoreSessions && (
              <button
                type="button"
                onClick={() => setVisibleCount((count) => count + PAGE_SIZE)}
                className="btn-base mt-4 flex w-full items-center justify-center gap-2 rounded-2xl border border-zinc-800 bg-[#111] py-3 text-sm font-medium text-zinc-300 hover:border-lime-400 hover:text-white"
              >
                <ChevronDown size={16} aria-hidden="true" />
                Show More
              </button>
            )}

            {/* Milestones */}
            <h2 className="mt-10 text-xl font-semibold tracking-tight">Milestones</h2>
            {analytics.milestones.length === 0 ? (
              <p className="mt-3 text-sm text-zinc-500">Not enough data yet.</p>
            ) : (
              <div className="mt-4 space-y-3">
                {analytics.milestones.map((milestone) => (
                  <div
                    key={milestone.label}
                    className="card-surface flex min-h-[68px] items-center justify-between gap-3 p-4"
                  >
                    <span className="text-sm text-zinc-400">{milestone.label}</span>
                    <div className="text-right">
                      <p className="font-semibold text-white">
                        <AnimatedStatValue value={milestone.value} />
                      </p>
                      {milestone.date && <p className="mt-0.5 text-xs text-zinc-500">{milestone.date}</p>}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Insights */}
            <h2 className="mt-10 text-xl font-semibold tracking-tight">Insights</h2>
            {!analytics.hasEnoughDataForTrends ? (
              <div className="mt-4 rounded-2xl border border-zinc-800 bg-[#111111] p-6 text-center">
                <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-zinc-900 text-lime-400">
                  <Sparkles size={20} aria-hidden="true" />
                </div>
                <p className="font-semibold text-white">More workouts will unlock insights</p>
                <p className="mt-2 text-sm leading-6 text-zinc-500">
                  Log this exercise a couple more times to see trends, frequency, and consistency.
                </p>
              </div>
            ) : (
              <div className="mt-4 grid grid-cols-2 gap-3 sm:gap-4">
                <StatTile icon={<TrendingUp size={20} />} title="Weekly Improvement" value={analytics.insights.averageWeeklyImprovement} />
                <StatTile icon={<Calendar size={20} />} title="Training Frequency" value={analytics.insights.averageTrainingFrequency} />
                <StatTile icon={<Award size={20} />} title="Best Month" value={analytics.insights.bestPerformingMonth} />
                <StatTile icon={<Sparkles size={20} />} title="Consistency" value={analytics.insights.estimatedConsistency} />
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
}

function StatTile({ icon, title, value }: { icon: React.ReactNode; title: string; value: string }) {
  return (
    <div
      className="card-surface flex h-full min-h-[112px] flex-col justify-between p-4"
      role="group"
      aria-label={`${title}: ${value}`}
    >
      <div className="text-lime-400" aria-hidden="true">
        {icon}
      </div>
      <div aria-hidden="true">
        <div className="mt-3 text-2xl font-bold tracking-tight">
          <AnimatedStatValue value={value} />
        </div>
        <div className="mt-1 text-sm text-zinc-500">{title}</div>
      </div>
    </div>
  );
}
