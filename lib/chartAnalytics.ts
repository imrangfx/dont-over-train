import {
  findMilestoneEvents,
  type ExerciseSession,
  type MilestoneEvent,
} from "@/lib/exerciseAnalytics";

/**
 * Pure chart-data generation for the Exercise Analytics Graph. Takes the
 * same ExerciseSession[] already produced by lib/exerciseAnalytics.ts and
 * turns it into plot-ready points for a given metric + time range. No UI,
 * no framer-motion, no DOM - safe to reuse from any future dashboard.
 */

export const CHART_METRICS = ["weight", "volume", "estimatedStrength"] as const;
export type ChartMetric = (typeof CHART_METRICS)[number];

export const CHART_RANGES = ["7D", "30D", "90D", "1Y", "ALL"] as const;
export type ChartRange = (typeof CHART_RANGES)[number];

export const METRIC_META: Record<ChartMetric, { label: string; unit: string; shortLabel: string }> = {
  weight: { label: "Weight", unit: "kg", shortLabel: "Weight" },
  volume: { label: "Volume", unit: "kg", shortLabel: "Volume" },
  estimatedStrength: { label: "Estimated Strength", unit: "kg", shortLabel: "Est. 1RM" },
};

const RANGE_DAYS: Record<ChartRange, number | null> = {
  "7D": 7,
  "30D": 30,
  "90D": 90,
  "1Y": 365,
  ALL: null,
};

/**
 * Estimated one-rep-max via the Epley formula. Chosen over Brzycki because
 * Epley stays well-behaved for any rep count (Brzycki is undefined at 37
 * reps), and this is only ever used for the visualization trend line - it
 * intentionally never touches/replaces the real Personal Records data.
 */
export function estimateOneRepMax(weight: number, reps: number): number {
  if (!Number.isFinite(weight) || weight <= 0) return 0;
  if (!Number.isFinite(reps) || reps <= 1) return weight;
  return weight * (1 + reps / 30);
}

export function getMetricValue(session: ExerciseSession, metric: ChartMetric): number {
  switch (metric) {
    case "weight":
      return session.weight;
    case "volume":
      return session.volume;
    case "estimatedStrength":
      return estimateOneRepMax(session.weight, session.reps);
  }
}

/** Filters an already-chronological session list down to the requested trailing window. */
export function filterSessionsByRange(
  chronological: ExerciseSession[],
  range: ChartRange
): ExerciseSession[] {
  const days = RANGE_DAYS[range];
  if (days == null || chronological.length === 0) return chronological;

  const latestTimestamp = chronological[chronological.length - 1].timestamp;
  const cutoff = latestTimestamp - days * 24 * 60 * 60 * 1000;

  return chronological.filter((s) => s.timestamp >= cutoff);
}

export type ChartPoint = {
  session: ExerciseSession;
  value: number;
  /** True when this point is a new running-max for the selected metric (a "PR" for that metric). */
  isNewHigh: boolean;
  isLatest: boolean;
};

/** Builds the ordered (oldest -> newest) plot points for one metric over an already-range-filtered session list. */
export function buildChartSeries(sessionsInRange: ExerciseSession[], metric: ChartMetric): ChartPoint[] {
  let runningMax = 0;

  return sessionsInRange.map((session, index) => {
    const value = getMetricValue(session, metric);
    const isNewHigh = value > 0 && value > runningMax;
    if (value > runningMax) runningMax = value;

    return {
      session,
      value,
      isNewHigh,
      isLatest: index === sessionsInRange.length - 1,
    };
  });
}

export type ChartMilestoneMarker = {
  event: MilestoneEvent;
  /** Value plotted for the current metric at this milestone's session (so the marker sits on the line). */
  value: number;
};

/**
 * Positions the four key milestone events (from lib/exerciseAnalytics.ts)
 * on the currently visible series, for the optional chart overlay. A
 * milestone is only returned if its session is within the visible range.
 */
export function buildChartMilestoneMarkers(
  fullChronological: ExerciseSession[],
  visibleSeries: ChartPoint[],
  metric: ChartMetric
): ChartMilestoneMarker[] {
  const events = findMilestoneEvents(fullChronological);
  const visibleTimestamps = new Set(visibleSeries.map((p) => p.session.timestamp));

  return [events.firstWorkout, events.firstPR, events.biggestJump, events.highestVolume]
    .filter((event): event is MilestoneEvent => Boolean(event) && visibleTimestamps.has(event!.session.timestamp))
    .map((event) => ({ event, value: getMetricValue(event.session, metric) }));
}

/** Percentage change between the first and last point of a series (null if not computable). */
export function calculateSeriesPercentChange(series: ChartPoint[]): number | null {
  if (series.length < 2) return null;

  const first = series[0].value;
  const last = series[series.length - 1].value;
  if (first <= 0) return null;

  return ((last - first) / first) * 100;
}
