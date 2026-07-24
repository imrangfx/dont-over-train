import type { ExerciseSession } from "@/lib/exerciseAnalytics";
import { buildChartSeries, calculateSeriesPercentChange, filterSessionsByRange } from "@/lib/chartAnalytics";

/**
 * Rule-based (no AI) sentence insights generated purely from workout
 * history. Reuses lib/chartAnalytics.ts for the underlying series/percent
 * math instead of re-implementing it, so the numbers here always agree
 * with what the graph shows.
 */

const MIN_SESSIONS_FOR_INSIGHTS = 3;
const DAY_MS = 24 * 60 * 60 * 1000;
const MAX_INSIGHTS = 5;

const NUMBER_WORDS = ["zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten"];

function numberWord(n: number): string {
  return n < NUMBER_WORDS.length ? NUMBER_WORDS[n] : String(n);
}

export function buildGraphInsights(chronological: ExerciseSession[], exerciseName: string): string[] {
  if (chronological.length < MIN_SESSIONS_FOR_INSIGHTS) return [];

  const insights: string[] = [];
  const realNow = Date.now();

  // 1. Weight % change over the trailing 90 days of data.
  const last90 = filterSessionsByRange(chronological, "90D");
  if (last90.length >= 2) {
    const percentChange = calculateSeriesPercentChange(buildChartSeries(last90, "weight"));
    if (percentChange != null && Math.abs(percentChange) >= 3) {
      const direction = percentChange > 0 ? "increased" : "decreased";
      insights.push(
        `Your ${exerciseName} ${direction} ${Math.abs(Math.round(percentChange))}% in the last 90 days.`
      );
    }
  }

  // 2. Training frequency trend: sessions in the last 30 real days vs the 30 before that.
  const recentCount = chronological.filter((s) => s.timestamp >= realNow - 30 * DAY_MS).length;
  const priorCount = chronological.filter(
    (s) => s.timestamp >= realNow - 60 * DAY_MS && s.timestamp < realNow - 30 * DAY_MS
  ).length;

  if (priorCount >= 2) {
    if (recentCount < priorCount * 0.7) {
      insights.push("Your training frequency for this exercise is decreasing.");
    } else if (recentCount > priorCount * 1.3) {
      insights.push("Your training frequency for this exercise is increasing.");
    }
  }

  // 3. Trailing consecutive-PR streak, counted back from the most recent session.
  let trailingStreak = 1;
  for (let i = chronological.length - 1; i > 0; i--) {
    if (chronological[i].weight > 0 && chronological[i].weight > chronological[i - 1].weight) {
      trailingStreak++;
    } else {
      break;
    }
  }
  if (trailingStreak >= 3) {
    insights.push(`You reached ${numberWord(trailingStreak)} consecutive PRs.`);
  }

  // 4. Volume growth vs weight growth, over the same window.
  const comparisonWindow = last90.length >= 3 ? last90 : chronological;
  if (comparisonWindow.length >= 3) {
    const volumeChange = calculateSeriesPercentChange(buildChartSeries(comparisonWindow, "volume"));
    const weightChange = calculateSeriesPercentChange(buildChartSeries(comparisonWindow, "weight"));

    if (volumeChange != null && weightChange != null) {
      if (volumeChange > 0 && volumeChange - weightChange >= 8) {
        insights.push("Volume is increasing faster than weight - you're adding more sets or reps.");
      } else if (weightChange > 0 && weightChange - volumeChange >= 8) {
        insights.push("Weight is increasing faster than volume - you're prioritizing heavier lifts.");
      }
    }
  }

  // Sessions-this-month is shown as an Insights tile; omit the duplicate sentence.

  return insights.slice(0, MAX_INSIGHTS);
}
