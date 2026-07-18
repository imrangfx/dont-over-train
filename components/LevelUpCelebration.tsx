"use client";

import { useEffect } from "react";

type LevelUpCelebrationProps = {
  level: number;
  title: string;
  color: string;
  onClose: () => void;
};

/** Subtle full-screen celebration shown once when the user's overall Progressive Overload level increases. */
export default function LevelUpCelebration({
  level,
  title,
  color,
  onClose,
}: LevelUpCelebrationProps) {
  useEffect(() => {
    const timer = window.setTimeout(onClose, 3200);
    return () => window.clearTimeout(timer);
  }, [onClose]);

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed inset-0 z-130 flex items-center justify-center bg-black/70 px-6 animate-[fade-in_180ms_ease-out]"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-[320px] rounded-3xl border p-8 text-center shadow-2xl animate-[level-up-pop_320ms_cubic-bezier(0.34,1.56,0.64,1)]"
        style={{ borderColor: color, background: "#111111" }}
      >
        <div className="text-4xl" aria-hidden="true">
          🎉
        </div>

        <p className="mt-3 text-sm font-medium uppercase tracking-wide text-zinc-400">
          Level Up
        </p>

        <p className="mt-1 text-3xl font-bold" style={{ color }}>
          Level {level}
        </p>

        <p className="mt-1 text-xl font-semibold text-white">{title}</p>

        <p className="mt-4 text-xs text-zinc-500">Tap anywhere to continue</p>
      </div>
    </div>
  );
}
