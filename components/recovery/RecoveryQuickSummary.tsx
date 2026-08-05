import { Activity, AlertTriangle, CheckCircle2, HeartPulse } from "lucide-react";
import type { RecoveryQuickCounts } from "@/components/recovery/recoveryDashboard";

type RecoveryQuickSummaryProps = {
  readonly counts: RecoveryQuickCounts;
};

const COLUMNS = [
  {
    key: "recover" as const,
    title: "Recover",
    subtitle: "High Fatigue",
    color: "#EF4444",
    Icon: AlertTriangle,
  },
  {
    key: "moderate" as const,
    title: "Moderate",
    subtitle: "Train Carefully",
    color: "#F97316",
    Icon: Activity,
  },
  {
    key: "ready" as const,
    title: "Ready",
    subtitle: "Good to Train",
    color: "#22C55E",
    Icon: CheckCircle2,
  },
] as const;

export default function RecoveryQuickSummary({
  counts,
}: RecoveryQuickSummaryProps) {
  return (
    <section
      aria-label="Recovery summary"
      className="overflow-hidden rounded-3xl border border-zinc-800/90 bg-[#111] shadow-[0_10px_28px_rgba(0,0,0,0.35)]"
    >
      <div className="grid grid-cols-4 divide-x divide-zinc-800/90">
        {COLUMNS.map(({ key, title, subtitle, color, Icon }) => (
          <div key={key} className="flex flex-col items-center px-1.5 py-4 text-center">
            <span
              className="flex h-8 w-8 items-center justify-center rounded-full"
              style={{ backgroundColor: `${color}1F`, color }}
            >
              <Icon size={15} aria-hidden="true" />
            </span>
            <p
              className="mt-2 text-xl font-bold tabular-nums tracking-tight"
              style={{ color }}
            >
              {counts[key]}
            </p>
            <p className="mt-0.5 text-[11px] font-semibold text-white">{title}</p>
            <p className="mt-0.5 text-[9px] leading-tight text-zinc-500">{subtitle}</p>
          </div>
        ))}

        <div className="flex flex-col items-center px-1.5 py-4 text-center">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-800 text-zinc-200">
            <HeartPulse size={15} aria-hidden="true" />
          </span>
          <p className="mt-2 text-xl font-bold tabular-nums tracking-tight text-white">
            {counts.total}
          </p>
          <p className="mt-0.5 text-[11px] font-semibold leading-tight text-white">
            Total
          </p>
          <p className="mt-0.5 text-[9px] leading-tight text-zinc-500">
            Muscles Tracked
          </p>
        </div>
      </div>
    </section>
  );
}
