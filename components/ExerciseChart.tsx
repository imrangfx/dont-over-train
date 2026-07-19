"use client";

import { useId, useMemo, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Sparkles, Trophy } from "lucide-react";
import type { ExerciseSession } from "@/lib/exerciseAnalytics";
import {
  CHART_METRICS,
  CHART_RANGES,
  METRIC_META,
  buildChartMilestoneMarkers,
  buildChartSeries,
  filterSessionsByRange,
  type ChartMetric,
  type ChartRange,
} from "@/lib/chartAnalytics";
import { useContainerSize } from "@/lib/hooks/useContainerSize";

/**
 * Reusable Analytics Graph. Fully self-contained (owns its own metric /
 * range / hover state) so any future dashboard can drop in
 * <ExerciseChart sessions={...} exerciseName={...} /> without wiring
 * anything else up. All math lives in lib/chartAnalytics.ts - this
 * component only turns that data into pixel coordinates + interactions.
 */

const PADDING = { top: 28, right: 14, bottom: 28, left: 14 };

type ExerciseChartProps = {
  exerciseName: string;
  sessions: ExerciseSession[];
  className?: string;
};

function getX(index: number, total: number, width: number): number {
  const usableWidth = Math.max(width - PADDING.left - PADDING.right, 1);
  if (total <= 1) return PADDING.left + usableWidth / 2;
  return PADDING.left + (index / (total - 1)) * usableWidth;
}

function getY(value: number, minValue: number, maxValue: number, height: number): number {
  const usableHeight = Math.max(height - PADDING.top - PADDING.bottom, 1);
  const span = maxValue - minValue || 1;
  return PADDING.top + usableHeight - ((value - minValue) / span) * usableHeight;
}

function formatValue(value: number, metric: ChartMetric): string {
  const rounded = Math.round(value * 10) / 10;
  return `${rounded.toLocaleString()} ${METRIC_META[metric].unit}`;
}

export default function ExerciseChart({ exerciseName, sessions, className = "" }: ExerciseChartProps) {
  const reactId = useId();
  const prefersReducedMotion = useReducedMotion();
  const { ref, size } = useContainerSize<HTMLDivElement>();
  const [metric, setMetric] = useState<ChartMetric>("weight");
  const [range, setRange] = useState<ChartRange>("90D");
  const [showMilestones, setShowMilestones] = useState(true);
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  const chronological = useMemo(
    () => [...sessions].sort((a, b) => a.timestamp - b.timestamp),
    [sessions]
  );

  const sessionsInRange = useMemo(
    () => filterSessionsByRange(chronological, range),
    [chronological, range]
  );

  const series = useMemo(() => buildChartSeries(sessionsInRange, metric), [sessionsInRange, metric]);

  const milestoneMarkers = useMemo(
    () => (showMilestones ? buildChartMilestoneMarkers(chronological, series, metric) : []),
    [chronological, series, metric, showMilestones]
  );

  const { width, height } = size;

  const { points, maxValue, minValue } = useMemo(() => {
    const values = series.map((p) => p.value);
    const max = values.length > 0 ? Math.max(...values) * 1.15 : 1;
    const min = 0;

    return {
      minValue: min,
      maxValue: max,
      points: series.map((point, index) => ({
        point,
        x: getX(index, series.length, width),
        y: getY(point.value, min, max, height),
      })),
    };
  }, [series, width, height]);

  const pathD =
    points.length > 1
      ? points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ")
      : "";

  const hovered = hoverIndex != null ? points[hoverIndex] ?? null : null;

  function handlePointerActivity(clientX: number, rectLeft: number) {
    if (points.length === 0) return;
    const usableWidth = Math.max(width - PADDING.left - PADDING.right, 1);
    const relativeX = clientX - rectLeft - PADDING.left;
    const ratio = points.length > 1 ? relativeX / usableWidth : 0;
    const index = Math.round(ratio * (points.length - 1));
    setHoverIndex(Math.min(points.length - 1, Math.max(0, index)));
  }

  const animationKey = `${metric}-${range}`;
  const chartDescription =
    series.length > 0
      ? `${METRIC_META[metric].label} trend for ${exerciseName}: ${series.length} session${
          series.length === 1 ? "" : "s"
        }, latest ${formatValue(series[series.length - 1].value, metric)}.`
      : `No ${METRIC_META[metric].label.toLowerCase()} data for ${exerciseName} in this range.`;

  const fadeTransition = { duration: prefersReducedMotion ? 0 : 0.25 };
  const pillTransition = prefersReducedMotion
    ? { duration: 0 }
    : { type: "spring" as const, stiffness: 500, damping: 40 };
  const drawTransition = { duration: prefersReducedMotion ? 0 : 0.6, ease: "easeOut" as const };

  return (
    <div className={`card-surface p-5 sm:p-6 ${className}`}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-semibold tracking-tight">Progress Graph</h2>
        <button
          type="button"
          onClick={() => setShowMilestones((v) => !v)}
          aria-pressed={showMilestones}
          className="btn-base flex items-center gap-1.5 rounded-full border border-zinc-800 px-3 py-2 text-xs font-medium text-zinc-400 hover:text-white"
        >
          <Trophy size={14} aria-hidden="true" />
          Milestones {showMilestones ? "On" : "Off"}
        </button>
      </div>

      {/* Metric selector */}
      <div className="mt-5 flex gap-1.5 rounded-2xl bg-zinc-950 p-1" role="group" aria-label="Select chart metric">
        {CHART_METRICS.map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => setMetric(m)}
            aria-pressed={metric === m}
            className="btn-base relative flex-1 rounded-xl px-2 py-2.5 text-xs font-semibold sm:text-sm"
          >
            {metric === m && (
              <motion.span
                layoutId={`metric-pill-${reactId}`}
                className="absolute inset-0 rounded-xl bg-lime-400"
                transition={pillTransition}
              />
            )}
            <span className={`relative z-10 ${metric === m ? "text-black" : "text-zinc-300"}`}>
              {METRIC_META[m].shortLabel}
            </span>
          </button>
        ))}
      </div>

      {/* Range filters */}
      <div className="mt-3 flex gap-1.5 overflow-x-auto" role="group" aria-label="Select time range">
        {CHART_RANGES.map((r) => (
          <button
            key={r}
            type="button"
            onClick={() => setRange(r)}
            aria-pressed={range === r}
            className="btn-base relative shrink-0 rounded-full px-3 py-2 text-xs font-medium"
          >
            {range === r && (
              <motion.span
                layoutId={`range-pill-${reactId}`}
                className="absolute inset-0 rounded-full bg-zinc-800"
                transition={pillTransition}
              />
            )}
            <span className={`relative z-10 ${range === r ? "text-white" : "text-zinc-500"}`}>{r}</span>
          </button>
        ))}
      </div>

      {/* Chart */}
      <div
        ref={ref}
        className="relative mt-6 h-[220px] w-full select-none touch-none sm:h-[260px]"
        onPointerMove={(e) => handlePointerActivity(e.clientX, e.currentTarget.getBoundingClientRect().left)}
        onPointerDown={(e) => handlePointerActivity(e.clientX, e.currentTarget.getBoundingClientRect().left)}
        onPointerLeave={() => setHoverIndex(null)}
      >
        <span className="sr-only">{chartDescription}</span>

        {width === 0 || height === 0 ? (
          <div className="absolute inset-0 animate-pulse rounded-xl bg-zinc-900" aria-hidden="true" />
        ) : (
          <>
            {series.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center gap-2 text-center">
                <Sparkles size={20} className="text-zinc-600" aria-hidden="true" />
                <p className="text-sm text-zinc-500">No sessions in this range.</p>
                <button
                  type="button"
                  onClick={() => setRange("ALL")}
                  className="btn-base text-xs font-medium text-lime-400 hover:underline"
                >
                  View All Time
                </button>
              </div>
            ) : (
              <AnimatePresence>
                <motion.svg
                  key={animationKey}
                  width={width}
                  height={height}
                  aria-hidden="true"
                  className="absolute inset-0"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={fadeTransition}
                >
                  <line
                    x1={PADDING.left}
                    x2={width - PADDING.right}
                    y1={height - PADDING.bottom}
                    y2={height - PADDING.bottom}
                    stroke="#27272a"
                    strokeWidth={1}
                  />

                  {pathD && (
                    <motion.path
                      d={pathD}
                      fill="none"
                      stroke="#39ff14"
                      strokeWidth={2.5}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      initial={{ pathLength: 0, opacity: 0 }}
                      animate={{ pathLength: 1, opacity: 1 }}
                      transition={drawTransition}
                    />
                  )}

                  {points.map(({ point, x, y }, index) => {
                    const isHovered = hoverIndex === index;
                    const revealDelay = prefersReducedMotion ? 0 : Math.min(index * 0.02, 0.4);
                    return (
                      <motion.g
                        key={`${point.session.workoutId}-${index}`}
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: revealDelay, duration: prefersReducedMotion ? 0 : 0.25 }}
                        style={{ transformOrigin: `${x}px ${y}px` }}
                      >
                        {(point.isLatest || isHovered) && (
                          <circle cx={x} cy={y} r={isHovered ? 10 : 8} fill="#39ff14" opacity={0.15} />
                        )}
                        <circle
                          cx={x}
                          cy={y}
                          r={point.isNewHigh || isHovered ? 5 : 3.5}
                          fill={point.isNewHigh ? "#facc15" : "#39ff14"}
                          stroke={point.isLatest ? "#fff" : "none"}
                          strokeWidth={point.isLatest ? 2 : 0}
                        />
                      </motion.g>
                    );
                  })}
                </motion.svg>
              </AnimatePresence>
            )}

            {/* Keyboard-accessible focus targets, one per point */}
            <div className="absolute inset-0">
              {points.map(({ point, x, y }, index) => (
                <button
                  key={`focus-${point.session.workoutId}-${index}`}
                  type="button"
                  onFocus={() => setHoverIndex(index)}
                  onBlur={() => setHoverIndex((current) => (current === index ? null : current))}
                  className="absolute h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lime-400"
                  style={{ left: x, top: y }}
                  aria-label={`${point.session.date}: ${formatValue(point.value, metric)}${
                    point.isNewHigh ? ", new high" : ""
                  }`}
                />
              ))}
            </div>

            {/* Milestone overlay */}
            {milestoneMarkers.map(({ event, value }) => {
              const index = series.findIndex((p) => p.session.timestamp === event.session.timestamp);
              if (index === -1) return null;
              const x = getX(index, series.length, width);
              const y = getY(value, minValue, maxValue, height);
              return (
                <div
                  key={event.type}
                  className="pointer-events-none absolute -translate-x-1/2 -translate-y-full rounded-full border border-zinc-800 bg-black px-1.5 py-0.5 text-[11px] leading-none shadow"
                  style={{ left: x, top: y - 10 }}
                  aria-hidden="true"
                >
                  {event.icon}
                </div>
              );
            })}

            {/* Tooltip */}
            {hovered && (
              <div
                className="pointer-events-none absolute z-10 w-40 -translate-x-1/2 rounded-xl border border-zinc-700 bg-[#111] p-3 text-xs shadow-xl"
                style={{
                  left: Math.min(Math.max(hovered.x, 70), Math.max(width - 70, 70)),
                  top: Math.max(hovered.y - 92, 0),
                }}
                role="status"
              >
                <p className="font-semibold text-white">{hovered.point.session.date}</p>
                <p className="mt-1 text-lime-400">{formatValue(hovered.point.value, metric)}</p>
                <p className="mt-1 text-zinc-500">
                  {hovered.point.session.sets} sets × {hovered.point.session.reps} reps
                </p>
                {hovered.point.isNewHigh && <p className="mt-1 font-medium text-yellow-400">New high 🏆</p>}
              </div>
            )}
          </>
        )}
      </div>

      {series.length === 1 && (
        <p className="mt-3 text-center text-xs text-zinc-500">
          Log another session to start seeing your trend line.
        </p>
      )}
    </div>
  );
}
