import {
  formatRecoveryPercentWhole,
  type SessionForecast,
} from "@/components/recovery/sessionForecast";

type SessionForecastCardProps = {
  forecast: SessionForecast;
};

export default function SessionForecastCard({
  forecast,
}: SessionForecastCardProps) {
  const currentPct = formatRecoveryPercentWhole(
    forecast.currentOverall.overallRecoveryPercent,
  );
  const projectedPct = formatRecoveryPercentWhole(
    forecast.projectedOverall.overallRecoveryPercent,
  );

  return (
    <div className="mb-5 rounded-3xl border border-[#222] bg-[#111] p-5">
      <div className="mb-5 flex items-center justify-between">
        <h2 className="text-2xl">Session Forecast</h2>
        <span className="text-xs text-zinc-500">Live</span>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-2xl border border-zinc-800 bg-[#191919] p-4">
          <p className="text-xs font-medium text-zinc-500">Current Recovery</p>
          <p
            className="mt-2 text-3xl font-bold tabular-nums"
            style={{ color: forecast.currentOverall.overallColor }}
          >
            {currentPct}%
          </p>
        </div>

        <div className="rounded-2xl border border-zinc-800 bg-[#191919] p-4">
          <p className="text-xs font-medium text-zinc-500">After Workout</p>
          <p
            className="mt-2 text-3xl font-bold tabular-nums"
            style={{ color: forecast.projectedOverall.overallColor }}
          >
            {projectedPct}%
          </p>
        </div>
      </div>

      <p className="mt-3 text-center text-xs text-zinc-500">
        {currentPct}% → {projectedPct}%
      </p>

      {forecast.impacted.length > 0 ? (
        <div className="mt-5">
          <p className="mb-3 text-sm font-medium text-zinc-400">
            Most Impacted Muscles
          </p>
          <div className="space-y-3">
            {forecast.impacted.map((row) => (
              <div
                key={row.muscle}
                className="flex items-center justify-between gap-3"
              >
                <span className="min-w-0 truncate text-sm text-white">
                  {row.muscle}
                </span>
                <span
                  className="shrink-0 text-sm font-semibold tabular-nums"
                  style={{ color: row.color }}
                >
                  {formatRecoveryPercentWhole(row.currentFatigue)}% →{" "}
                  {formatRecoveryPercentWhole(row.projectedFatigue)}%
                </span>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      <p className="mt-5 text-sm leading-5 text-zinc-400">
        {forecast.outlook}
      </p>

      {forecast.highRecoveryCost ? (
        <div className="mt-4 rounded-2xl border border-red-500/40 bg-red-500/10 p-4">
          <p className="font-semibold text-red-400">
            ⚠ High Recovery Cost
          </p>
          <p className="mt-2 text-sm text-zinc-400">
            Changing exercises may improve tomorrow&apos;s recovery.
          </p>
        </div>
      ) : null}
    </div>
  );
}
