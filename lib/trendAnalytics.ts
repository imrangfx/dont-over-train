import {
  calculateAverageDaysBetweenSessions,
  calculateBestMonthByVolume,
  calculateConsistencyPercent,
  calculateTrainingFrequency,
  type ExerciseSession,
} from "@/lib/exerciseAnalytics";
import { METRIC_META, type ChartMetric, type ChartPoint } from "@/lib/chartAnalytics";

/**
 * Pure Trend Summary calculations for the Exercise Analytics Graph. Reuses
 * the same session-level primitives as lib/exerciseAnalytics.ts (frequency,
 * consistency, best month) so nothing is computed twice - this module only
 * adds trend-direction + weekly-growth logic that is specific to the
 * currently selected metric/range.
 */

const TREND_THRESHOLD_PERCENT = 3;
const MIN_SESSIONS_FOR_TREND = 3;

export type TrendDirection = "Improving" | "Stable" | "Declining";

/**
 * Splits the series into an earlier and later half and compares their
 * average value. A stable threshold (rather than first-vs-last) avoids a
 * single noisy session from flipping the verdict.
 */
export function calculateTrendDirection(series: ChartPoint[]): TrendDirection | null {
  if (series.length < MIN_SESSIONS_FOR_TREND) return null;

  const midpoint = Math.floor(series.length / 2);
  const earlier = series.slice(0, midpoint);
  const later = series.slice(midpoint);

  const earlierAvg = earlier.reduce((sum, p) => sum + p.value, 0) / earlier.length;
  const laterAvg = later.reduce((sum, p) => sum + p.value, 0) / later.length;

  if (earlierAvg <= 0) return null;

  const changePercent = ((laterAvg - earlierAvg) / earlierAvg) * 100;

  if (changePercent > TREND_THRESHOLD_PERCENT) return "Improving";
  if (changePercent < -TREND_THRESHOLD_PERCENT) return "Declining";
  return "Stable";
}

/** Average per-week change in the selected metric across the visible series. */
export function calculateAverageWeeklyGrowth(series: ChartPoint[]): number | null {
  if (series.length < 2) return null;

  const first = series[0];
  const last = series[series.length - 1];
  const spanMs = Math.max(last.session.timestamp - first.session.timestamp, 1);
  const spanWeeks = Math.max(spanMs / (7 * 24 * 60 * 60 * 1000), 1 / 7);

  return (last.value - first.value) / spanWeeks;
}

export type TrendCardKind =
  | "trend"
  | "weeklyGrowth"
  | "bestMonth"
  | "frequency"
  | "daysBetween"
  | "consistency";

export type TrendSummaryCard = {
  kind: TrendCardKind;
  title: string;
  value: string;
  description: string;
};

const TREND_DESCRIPTIONS: Record<TrendDirection, string> = {
  Improving: "Your recent sessions are trending up.",
  Stable: "Holding steady - no big swings recently.",
  Declining: "Recent sessions are trending down.",
};

/**
 * Builds the six Trend Summary cards from an already range-filtered
 * session list + its matching chart series (so the trend direction and
 * weekly growth reflect exactly what's plotted).
 */
export function buildTrendSummary(
  sessionsInRange: ExerciseSession[],
  metric: ChartMetric,
  series: ChartPoint[]
): TrendSummaryCard[] {
  const unit = METRIC_META[metric].unit;
  const metricLabel = METRIC_META[metric].shortLabel;

  const trend = calculateTrendDirection(series);
  const weeklyGrowth = calculateAverageWeeklyGrowth(series);
  const bestMonth = calculateBestMonthByVolume(sessionsInRange);
  const frequency = calculateTrainingFrequency(sessionsInRange);
  const avgDaysBetween = calculateAverageDaysBetweenSessions(sessionsInRange);
  const consistency = calculateConsistencyPercent(sessionsInRange);

  return [
    {
      kind: "trend",
      title: "Current Trend",
      value: trend ?? "-",
      description: trend
        ? TREND_DESCRIPTIONS[trend]
        : "Log a few more sessions to reveal a trend.",
    },
    {
      kind: "weeklyGrowth",
      title: "Average Weekly Growth",
      value:
        weeklyGrowth != null
          ? `${weeklyGrowth > 0 ? "+" : ""}${weeklyGrowth.toFixed(1)} ${unit}/wk`
          : "-",
      description: `Average ${metricLabel.toLowerCase()} change per week in this range.`,
    },
    {
      kind: "bestMonth",
      title: "Best Month",
      value: bestMonth?.label ?? "-",
      description: bestMonth
        ? `Highest total volume: ${Math.round(bestMonth.volume).toLocaleString()} kg.`
        : "Not enough history yet.",
    },
    {
      kind: "frequency",
      title: "Training Frequency",
      value: frequency != null ? `${frequency.toFixed(1)}x / week` : "-",
      description: "How often you train this exercise, on average.",
    },
    {
      kind: "daysBetween",
      title: "Avg. Days Between Sessions",
      value: avgDaysBetween != null ? `${avgDaysBetween.toFixed(1)} days` : "-",
      description: "Typical rest gap between sessions of this exercise.",
    },
    {
      kind: "consistency",
      title: "Consistency Score",
      value: consistency != null ? `${consistency}%` : "-",
      description: "Share of weeks in this range with at least one session.",
    },
  ];
}
