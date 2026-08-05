"use client";

import type { RecoverySummary } from "@/app/lib/recovery/recoveryTypes";
import {
  formatRecoveryPercent,
  formatRecoveryPercentWhole,
  sanitizeRecoveryPercent,
} from "@/components/recovery/buildOverallSummary";
import {
  formatRecoveryUpdatedAt,
  overallRecoveryAdvice,
} from "@/components/recovery/recoveryDashboard";
import { RefreshCw } from "lucide-react";

type RecoveryHeroCardProps = {
  readonly summary: RecoverySummary;
  readonly onRefresh?: () => void;
  readonly integerPercent?: boolean;
};

const RING_SIZE = 132;
const STROKE = 10;
const RADIUS = (RING_SIZE - STROKE) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export default function RecoveryHeroCard({
  summary,
  onRefresh,
  integerPercent = false,
}: RecoveryHeroCardProps) {
  const percent = integerPercent
    ? Math.round(sanitizeRecoveryPercent(summary.overallRecoveryPercent))
    : sanitizeRecoveryPercent(summary.overallRecoveryPercent);

  const label = integerPercent
    ? formatRecoveryPercentWhole(summary.overallRecoveryPercent)
    : formatRecoveryPercent(percent);

  const dashOffset = CIRCUMFERENCE * (1 - Math.min(100, Math.max(0, percent)) / 100);
  const color = summary.overallColor;

  return (
    <section
      className="relative overflow-hidden rounded-3xl border border-zinc-800/90 bg-[#111] p-5 shadow-[0_12px_32px_rgba(0,0,0,0.4)]"
      aria-label="Overall recovery"
    >
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <p className="text-xs text-zinc-500">Last updated</p>
          <p className="mt-0.5 text-sm font-medium text-zinc-300">
            {formatRecoveryUpdatedAt(summary.asOf)}
          </p>
        </div>

        {onRefresh ? (
          <button
            type="button"
            onClick={onRefresh}
            aria-label="Refresh recovery"
            className="btn-base flex h-10 w-10 items-center justify-center rounded-full border border-lime-400/30 bg-lime-400/10 text-lime-400 hover:bg-lime-400/15"
          >
            <RefreshCw size={16} aria-hidden="true" />
          </button>
        ) : null}
      </div>

      <div className="flex items-center gap-5">
        <div
          className="relative shrink-0"
          style={{
            width: RING_SIZE,
            height: RING_SIZE,
            filter: `drop-shadow(0 0 18px ${color}55)`,
          }}
        >
          <svg
            width={RING_SIZE}
            height={RING_SIZE}
            viewBox={`0 0 ${RING_SIZE} ${RING_SIZE}`}
            className="-rotate-90"
            aria-hidden="true"
          >
            <circle
              cx={RING_SIZE / 2}
              cy={RING_SIZE / 2}
              r={RADIUS}
              fill="none"
              stroke="#27272a"
              strokeWidth={STROKE}
            />
            <circle
              cx={RING_SIZE / 2}
              cy={RING_SIZE / 2}
              r={RADIUS}
              fill="none"
              stroke={color}
              strokeWidth={STROKE}
              strokeLinecap="round"
              strokeDasharray={CIRCUMFERENCE}
              strokeDashoffset={dashOffset}
              className="transition-[stroke-dashoffset] duration-500 ease-out"
            />
          </svg>

          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <p className="text-3xl font-bold tabular-nums tracking-tight text-white">
              {label}%
            </p>
            <p
              className="mt-0.5 max-w-[5.5rem] text-[10px] font-semibold uppercase tracking-[0.12em]"
              style={{ color }}
            >
              {summary.overallLabel}
            </p>
          </div>
        </div>

        <div className="min-w-0 flex-1">
          <h2 className="text-lg font-semibold tracking-tight text-white">
            Overall Recovery
          </h2>

          <span
            className="mt-2 inline-flex rounded-lg px-2.5 py-1 text-xs font-semibold"
            style={{
              color,
              backgroundColor: `${color}22`,
            }}
          >
            {summary.overallLabel}
          </span>

          <p className="mt-3 text-sm leading-relaxed text-zinc-400">
            {overallRecoveryAdvice(summary)}
          </p>

          <div className="mt-4">
            <div
              className="h-1.5 w-full overflow-hidden rounded-full bg-zinc-800"
              role="progressbar"
              aria-valuenow={percent}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label="Overall recovery percent"
            >
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{ width: `${percent}%`, backgroundColor: color }}
              />
            </div>
            <div className="mt-1.5 flex justify-between text-[10px] tabular-nums text-zinc-600">
              <span>{label}%</span>
              <span>100%</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
