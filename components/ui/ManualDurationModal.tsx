"use client";

import { useEffect, useId, useRef, useState } from "react";
import { Clock } from "lucide-react";

type ManualDurationModalProps = {
  open: boolean;
  busy?: boolean;
  onConfirm: (durationMinutes: number) => void;
  onClose: () => void;
};

/**
 * Collects a manual workout duration (minutes) when no timer was started.
 */
export default function ManualDurationModal({
  open,
  busy = false,
  onConfirm,
  onClose,
}: ManualDurationModalProps) {
  const titleId = useId();
  const descId = useId();
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [value, setValue] = useState("45");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;

    setValue("45");
    setError(null);

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    queueMicrotask(() => inputRef.current?.focus());

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !busy) {
        onClose();
      }
    };

    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open, busy, onClose]);

  if (!open) return null;

  function handleConfirm() {
    const minutes = Number(value);
    if (!Number.isFinite(minutes) || minutes < 1) {
      setError("Enter at least 1 minute.");
      return;
    }

    setError(null);
    onConfirm(Math.round(minutes));
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center px-6 animate-[fade-in_180ms_ease-out]"
      role="presentation"
    >
      <button
        type="button"
        aria-label="Close dialog"
        className="btn-base absolute inset-0 bg-black/70"
        onClick={() => {
          if (!busy) onClose();
        }}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descId}
        className="relative z-10 w-full max-w-[340px] rounded-2xl border border-zinc-800 bg-[#111111] p-5 shadow-xl"
      >
        <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-full bg-lime-400/15 text-lime-400">
          <Clock size={22} aria-hidden="true" />
        </div>

        <h2 id={titleId} className="text-xl font-semibold text-white">
          Enter Workout Duration
        </h2>

        <p id={descId} className="mt-2 text-sm leading-6 text-zinc-400">
          No workout timer was started. Enter how long this workout lasted so we
          can save it accurately.
        </p>

        <label htmlFor={inputId} className="mt-5 block text-sm text-zinc-500">
          Duration (minutes)
        </label>
        <input
          ref={inputRef}
          id={inputId}
          type="number"
          inputMode="numeric"
          min={1}
          step={1}
          value={value}
          disabled={busy}
          onChange={(e) => {
            setValue(e.target.value);
            if (error) setError(null);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              handleConfirm();
            }
          }}
          aria-invalid={!!error}
          aria-describedby={error ? `${inputId}-error` : undefined}
          className="mt-2 w-full [appearance:textfield] rounded-2xl border border-zinc-700 bg-[#1a1a1a] px-4 py-3 text-center text-2xl font-semibold text-white outline-none focus:border-lime-400 disabled:opacity-50 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
        />

        {error && (
          <p id={`${inputId}-error`} className="mt-2 text-sm text-red-400" role="alert">
            {error}
          </p>
        )}

        <div className="mt-6 grid grid-cols-2 gap-3">
          <button
            type="button"
            disabled={busy}
            onClick={onClose}
            className="rounded-2xl border border-zinc-700 px-4 py-3 text-sm font-medium text-zinc-300 transition hover:border-zinc-500 hover:bg-zinc-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#39ff14] focus-visible:ring-offset-2 focus-visible:ring-offset-black active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="button"
            disabled={busy}
            onClick={handleConfirm}
            className="rounded-2xl bg-[#39ff14] px-4 py-3 text-sm font-semibold text-black transition hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#39ff14] focus-visible:ring-offset-2 focus-visible:ring-offset-black active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {busy ? "Please wait..." : "Save & Finish"}
          </button>
        </div>
      </div>
    </div>
  );
}
