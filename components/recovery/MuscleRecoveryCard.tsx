import type { MuscleStatus } from "@/app/lib/recovery/recoveryTypes";

type MuscleRecoveryCardProps = {
  status: MuscleStatus;
};

export default function MuscleRecoveryCard({ status }: MuscleRecoveryCardProps) {
  const percent = Math.min(100, Math.max(0, status.recoveryPercent));

  return (
    <div className="card-surface p-4">
      <div className="mb-2 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="truncate text-base font-semibold text-white">
            {status.muscle}
          </h3>
          <p
            className="mt-0.5 text-sm font-medium"
            style={{ color: status.color }}
          >
            {status.label}
          </p>
        </div>

        <span
          className="shrink-0 text-lg font-bold tabular-nums"
          style={{ color: status.color }}
        >
          {percent}%
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
