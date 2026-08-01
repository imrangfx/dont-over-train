import type { MuscleStatus } from "@/app/lib/recovery/recoveryTypes";
import {
  formatRecoveryPercent,
  sanitizeRecoveryPercent,
} from "@/components/recovery/buildOverallSummary";

type MuscleRecoveryCardProps = {
  status: MuscleStatus;
};

export default function MuscleRecoveryCard({ status }: MuscleRecoveryCardProps) {
  const percent = sanitizeRecoveryPercent(status.recoveryPercent);

  return (
    <div className="card-surface p-4">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="truncate text-base font-semibold text-white">
            {status.muscle}
          </h3>
          <span
            className="mt-1.5 inline-flex rounded-full px-2.5 py-1 text-xs font-semibold"
            style={{
              color: status.color,
              backgroundColor: `${status.color}1A`,
            }}
          >
            {status.label}
          </span>
        </div>

        <span
          className="shrink-0 text-lg font-bold tabular-nums"
          style={{ color: status.color }}
        >
          {formatRecoveryPercent(percent)}%
        </span>
      </div>

      <div
        className="h-2.5 w-full overflow-hidden rounded-full bg-[#222]"
        role="progressbar"
        aria-valuenow={percent}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`${status.muscle} recovery`}
      >
        <div
          className="h-full rounded-full"
          style={{
            width: `${percent}%`,
            backgroundColor: status.color,
          }}
        />
      </div>
    </div>
  );
}
