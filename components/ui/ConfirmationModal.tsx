"use client";

import { useEffect, useId, useRef } from "react";
import { AlertTriangle } from "lucide-react";

type ConfirmationModalProps = {
  open: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
  showWarningIcon?: boolean;
  busy?: boolean;
  onConfirm: () => void;
  onClose: () => void;
};

export default function ConfirmationModal({
  open,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  danger = false,
  showWarningIcon = true,
  busy = false,
  onConfirm,
  onClose,
}: ConfirmationModalProps) {
  const titleId = useId();
  const descId = useId();
  const cancelRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    cancelRef.current?.focus();

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

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center px-6 animate-[fade-in_180ms_ease-out]"
      role="presentation"
    >
      <button
        type="button"
        aria-label="Close dialog"
        className="absolute inset-0 bg-black/70"
        onClick={() => {
          if (!busy) onClose();
        }}
      />

      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descId}
        className="relative z-10 w-full max-w-[340px] rounded-2xl border border-zinc-800 bg-[#111111] p-5 shadow-xl"
      >
        {showWarningIcon && (
          <div
            className={`mb-4 flex h-11 w-11 items-center justify-center rounded-full ${
              danger ? "bg-red-500/15 text-red-400" : "bg-lime-400/15 text-lime-400"
            }`}
          >
            <AlertTriangle size={22} aria-hidden="true" />
          </div>
        )}

        <h2 id={titleId} className="text-xl font-semibold text-white">
          {title}
        </h2>

        <p id={descId} className="mt-2 text-sm leading-6 text-zinc-400">
          {description}
        </p>

        <div className="mt-6 grid grid-cols-2 gap-3">
          <button
            ref={cancelRef}
            type="button"
            disabled={busy}
            onClick={onClose}
            className="rounded-2xl border border-zinc-700 px-4 py-3 text-sm font-medium text-zinc-300 transition hover:border-zinc-500 hover:bg-zinc-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#39ff14] focus-visible:ring-offset-2 focus-visible:ring-offset-black active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {cancelLabel}
          </button>

          <button
            type="button"
            disabled={busy}
            onClick={onConfirm}
            className={`rounded-2xl px-4 py-3 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-black active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 ${
              danger
                ? "bg-red-500 text-white hover:bg-red-400 focus-visible:ring-red-400"
                : "bg-[#39ff14] text-black hover:brightness-110 focus-visible:ring-[#39ff14]"
            }`}
          >
            {busy ? "Please wait..." : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
