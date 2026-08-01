"use client";

import { useEffect, useId, useRef } from "react";
import { HeartPulse } from "lucide-react";
import type { RecoveryCheckWarning } from "@/components/recovery/workoutRecoveryCheck";
import {
  formatRecoveryPercentWhole,
  sanitizeRecoveryPercent,
} from "@/components/recovery/buildOverallSummary";

type RecoveryCheckModalProps = {
  open: boolean;
  warning: RecoveryCheckWarning;
  onContinue: () => void;
  onChooseAnother: () => void;
};

export default function RecoveryCheckModal({
  open,
  warning,
  onContinue,
  onChooseAnother,
}: RecoveryCheckModalProps) {
  const titleId = useId();
  const descId = useId();
  const chooseRef = useRef<HTMLButtonElement>(null);
  const percent = sanitizeRecoveryPercent(warning.muscle.recoveryPercent);

  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    chooseRef.current?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onChooseAnother();
      }
    };

    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open, onChooseAnother]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center px-6 animate-[fade-in_180ms_ease-out]"
      role="presentation"
    >
      <button
        type="button"
        aria-label="Close dialog"
        className="btn-base absolute inset-0 bg-black/70"
        onClick={onChooseAnother}
      />

      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descId}
        className="relative z-10 w-full max-w-[340px] rounded-2xl border border-zinc-800 bg-[#111111] p-5 shadow-xl"
      >
        <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-full bg-orange-500/15 text-orange-400">
          <HeartPulse size={22} aria-hidden="true" />
        </div>

        <h2 id={titleId} className="text-xl font-semibold text-white">
          Recovery Check
        </h2>

        <p id={descId} className="mt-2 text-sm leading-6 text-zinc-400">
          One or more muscles for this workout are still below the safe
          recovery threshold. You can continue or pick another muscle group.
        </p>

        <div className="mt-5 rounded-2xl border border-zinc-800 bg-[#191919] p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
                Most fatigued
              </p>
              <p className="mt-1 truncate text-base font-semibold text-white">
                {warning.muscle.muscle}
              </p>
              <span
                className="mt-2 inline-flex rounded-full px-2.5 py-1 text-xs font-semibold"
                style={{
                  color: warning.muscle.color,
                  backgroundColor: `${warning.muscle.color}1A`,
                }}
              >
                {warning.muscle.label}
              </span>
            </div>

            <span
              className="shrink-0 text-2xl font-bold tabular-nums"
              style={{ color: warning.muscle.color }}
            >
              {formatRecoveryPercentWhole(percent)}%
            </span>
          </div>

          <p className="mt-3 text-sm leading-5 text-zinc-400">
            {warning.recommendation.message}
          </p>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-3">
          <button
            type="button"
            onClick={onContinue}
            className="rounded-2xl bg-[#39ff14] px-4 py-3 text-sm font-semibold text-black transition hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#39ff14] focus-visible:ring-offset-2 focus-visible:ring-offset-black active:scale-[0.98]"
          >
            Continue Anyway
          </button>

          <button
            ref={chooseRef}
            type="button"
            onClick={onChooseAnother}
            className="rounded-2xl border border-zinc-700 px-4 py-3 text-sm font-medium text-zinc-300 transition hover:border-zinc-500 hover:bg-zinc-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#39ff14] focus-visible:ring-offset-2 focus-visible:ring-offset-black active:scale-[0.98]"
          >
            Choose Another Muscle
          </button>
        </div>
      </div>
    </div>
  );
}
