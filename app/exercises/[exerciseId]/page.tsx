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
} from "lucide-react";
import { loadWorkoutHistory, type WorkoutHistoryEntry } from "@/lib/workouts";
import { loadPersonalRecords } from "@/lib/personalRecords";
import { CATEGORY_LABELS, type PersonalRecord } from "@/lib/progression";
import { buildExerciseAnalytics } from "@/lib/exerciseAnalytics";
import { buildChartSeries } from "@/lib/chartAnalytics";
import { buildTrendSummary } from "@/lib/trendAnalytics";
import { buildGraphInsights } from "@/lib/graphInsights";
import EmptyState from "@/components/ui/EmptyState";
import LoadingCard from "@/components/ui/LoadingCard";
import ExerciseChart from "@/components/ExerciseChart";
import TrendSummaryGrid from "@/components/TrendSummaryGrid";
import GraphInsightsList from "@/components/GraphInsightsList";

const PAGE_SIZE = 10;

function fmtKg(value: number | null): string {
  if (value == null || !Number.isFinite(value)) return "-";
  return `${Math.round(value * 10) / 10} kg`;
}

function fmtNum(value: number | null): string {
  if (value == null || !Number.isFinite(value)) return "-";
  return String(Math.round(value * 10) / 10);
}

export default function ExerciseDetailPage() {
  const params = useParams();
  const exerciseName = decodeURIComponent(String(params.exerciseId ?? ""));

  const [history, setHistory] = useState<WorkoutHistoryEntry[]>([]);
  const [personalRecords, setPersonalRecords] = useState<PersonalRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  useEffect(() => {
    let active = true;

    Promise.all([loadWorkoutHistory(), loadPersonalRecords()]).then(
      ([historyResult, recordsResult]) => {
        if (!active) return;
        setHistory(historyResult.history);
        setPersonalRecords(recordsResult.records);
        setLoading(false);
      }
    );

    return () => {
      active = false;
    };
  }, []);

  // Memoized so re-renders (e.g. "Show more" pagination) never re-derive
  // the full analytics payload from scratch.
  const analytics = useMemo(
    () => buildExerciseAnalytics(exerciseName, history, personalRecords),
    [exerciseName, history, personalRecords]
  );

  const visibleSessions = analytics.sessions.slice(0, visibleCount);
  const hasMoreSessions = analytics.sessions.length > visibleCount;

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
      <main className="min-h-screen bg-black px-6 py-8 text-white">
        <div className="mx-auto max-w-[430px] space-y-4">
          <LoadingCard rows={2} />
          <LoadingCard rows={4} />
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black px-6 py-8 pb-12 text-white animate-[fade-in_200ms_ease-out]">
      <div className="mx-auto max-w-[430px]">
        <Link
          href="/history"
          className="btn-base inline-flex items-center gap-2 rounded-lg text-zinc-400 hover:text-white"
        >
          <ArrowLeft size={18} aria-hidden="true" />
          ← History
        </Link>

        {/* Header */}
        <h1 className="mt-6 text-3xl font-bold">{analytics.exerciseName}</h1>

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

        {analytics.categoryLevel && (
          <div
            className="card-surface mt-5 p-4"
            style={{
              background:
                "linear-gradient(135deg, rgba(17,17,17,1) 0%, rgba(17,17,17,1) 60%, rgba(57,255,20,0.06) 100%)",
            }}
          >
            <div className="flex items-center justify-between gap-3 text-sm">
              <span className="text-zinc-400">Current Level Contribution</span>
              <span className="font-semibold" style={{ color: analytics.categoryLevel.color }}>
                Level {analytics.categoryLevel.level} • {analytics.categoryLevel.title}
              </span>
            </div>
            <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-zinc-800">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${analytics.categoryLevel.progressPercent}%`,
                  backgroundColor: analytics.categoryLevel.color,
                }}
              />
            </div>
          </div>
        )}

        {analytics.stats.totalSessions === 0 ? (
          <div className="mt-6">
            <EmptyState
              icon={<Dumbbell size={22} />}
              title="No history for this exercise yet"
              description="Complete a workout with this exercise to unlock Personal Records, session history, milestones, and insights here."
            />
          </div>
        ) : (
          <>
            {/* Personal Record highlight */}
            {analytics.stats.currentPR != null && (
              <div className="mt-6 rounded-3xl border border-yellow-500/40 bg-yellow-500/10 p-6 text-center">
                <p className="font-semibold text-yellow-400">🏆 Personal Record</p>
                <p className="mt-2 text-4xl font-bold text-white">{fmtKg(analytics.stats.currentPR)}</p>
                {analytics.sessions.find((s) => s.weight === analytics.stats.currentPR)?.date && (
                  <p className="mt-2 text-sm text-zinc-400">
                    Achieved{" "}
                    {
                      analytics.sessions.find((s) => s.weight === analytics.stats.currentPR)
                        ?.date
                    }
                  </p>
                )}
              </div>
            )}

            {/* Analytics Graph - the visual centerpiece of this page */}
            <div className="mt-8">
              <ExerciseChart exerciseName={analytics.exerciseName} sessions={analytics.sessions} />
            </div>

            {/* Trend Summary */}
            <h2 className="mt-8 text-xl font-semibold">Trend Summary</h2>
            <div className="mt-4">
              <TrendSummaryGrid cards={trendCards} />
            </div>

            {/* Graph Insights */}
            {graphInsights.length > 0 && (
              <div className="mt-8">
                <GraphInsightsList insights={graphInsights} />
              </div>
            )}

            {/* Statistics */}
            <h2 className="mt-8 text-xl font-semibold">Statistics</h2>
            <div className="mt-4 grid grid-cols-2 gap-4">
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
            <h2 className="mt-8 text-xl font-semibold">Recent Sessions</h2>
            <div className="mt-4 space-y-3">
              {visibleSessions.map((session) => (
                <Link
                  key={`${session.workoutId}-${session.timestamp}`}
                  href={`/history/${session.workoutId}`}
                  className="btn-base card-surface flex items-center justify-between gap-3 p-4 hover:border-lime-400/40"
                >
                  <div className="min-w-0">
                    <p className="font-semibold text-white">{session.date}</p>
                    <p className="mt-1 text-sm text-zinc-500">
                      {session.sets} Sets • {session.reps} Reps
                    </p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="font-semibold text-lime-400">{fmtKg(session.weight)}</p>
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
            <h2 className="mt-8 text-xl font-semibold">Milestones</h2>
            {analytics.milestones.length === 0 ? (
              <p className="mt-3 text-sm text-zinc-500">Not enough data yet.</p>
            ) : (
              <div className="mt-4 space-y-3">
                {analytics.milestones.map((milestone) => (
                  <div
                    key={milestone.label}
                    className="card-surface flex items-center justify-between gap-3 p-4"
                  >
                    <span className="text-sm text-zinc-400">{milestone.label}</span>
                    <div className="text-right">
                      <p className="font-semibold text-white">{milestone.value}</p>
                      {milestone.date && <p className="mt-0.5 text-xs text-zinc-500">{milestone.date}</p>}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Insights */}
            <h2 className="mt-8 text-xl font-semibold">Insights</h2>
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
              <div className="mt-4 grid grid-cols-2 gap-4">
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
    <div className="card-surface p-4">
      <div className="text-lime-400" aria-hidden="true">
        {icon}
      </div>
      <div className="mt-4 text-2xl font-bold">{value}</div>
      <div className="mt-1 text-sm text-zinc-500">{title}</div>
    </div>
  );
}
