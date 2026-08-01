import type { RecoverySummary } from "@/app/lib/recovery/recoveryTypes";
import { formatLastUpdated } from "@/components/recovery/buildOverallSummary";

type OverallRecoveryCardProps = {
  summary: RecoverySummary;
};

export default function OverallRecoveryCard({
  summary,
}: OverallRecoveryCardProps) {
  const percent = Math.min(100, Math.max(0, summary.overallRecoveryPercent));

  return (
    <div className="card-surface p-5">
      <p className="text-sm font-medium text-zinc-500">Overall Recovery</p>

      <p
        className="mt-3 text-5xl font-bold tracking-tight"
        style={{ color: summary.overallColor }}
      >
        {percent}%
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
        Last Updated{" "}
        <span className="text-zinc-400">{formatLastUpdated(summary.asOf)}</span>
      </p>
    </div>
  );
}
