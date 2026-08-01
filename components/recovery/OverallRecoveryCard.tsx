import type { RecoverySummary } from "@/app/lib/recovery/recoveryTypes";

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

      <p
        className="mt-2 text-base font-semibold"
        style={{ color: summary.overallColor }}
      >
        {summary.overallLabel}
      </p>

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
    </div>
  );
}
