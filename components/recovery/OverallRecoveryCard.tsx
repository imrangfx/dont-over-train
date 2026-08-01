import type { RecoverySummary } from "@/app/lib/recovery/recoveryTypes";
import {
  formatLastUpdated,
  formatRecoveryPercent,
  formatRecoveryPercentWhole,
  sanitizeRecoveryPercent,
} from "@/components/recovery/buildOverallSummary";

type OverallRecoveryCardProps = {
  summary: RecoverySummary;
  /** Defaults to "Last Updated". History snapshot uses "Snapshot taken". */
  timestampLabel?: string;
  /** Whole-number percentages (history snapshot). Default keeps one decimal. */
  integerPercent?: boolean;
};

export default function OverallRecoveryCard({
  summary,
  timestampLabel = "Last Updated",
  integerPercent = false,
}: OverallRecoveryCardProps) {
  const percent = integerPercent
    ? Math.round(sanitizeRecoveryPercent(summary.overallRecoveryPercent))
    : sanitizeRecoveryPercent(summary.overallRecoveryPercent);

  const label = integerPercent
    ? formatRecoveryPercentWhole(summary.overallRecoveryPercent)
    : formatRecoveryPercent(percent);

  return (
    <div className="card-surface p-5">
      <p className="text-sm font-medium text-zinc-500">Overall Recovery</p>

      <p
        className="mt-3 text-5xl font-bold tracking-tight"
        style={{ color: summary.overallColor }}
      >
        {label}%
      </p>

      <div className="mt-3 flex items-center gap-2">
        <span
          className="rounded-full px-2.5 py-1 text-xs font-semibold"
          style={{
            color: summary.overallColor,
            backgroundColor: `${summary.overallColor}1A`,
          }}
        >
          {summary.overallLabel}
        </span>
      </div>

      <div
        className="mt-5 h-3 w-full overflow-hidden rounded-full bg-[#222]"
        role="progressbar"
        aria-valuenow={percent}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Overall recovery percent"
      >
        <div
          className="h-full rounded-full"
          style={{
            width: `${percent}%`,
            backgroundColor: summary.overallColor,
          }}
        />
      </div>

      <p className="mt-4 text-xs text-zinc-500">
        {timestampLabel}{" "}
        <span className="text-zinc-400">{formatLastUpdated(summary.asOf)}</span>
      </p>
    </div>
  );
}
