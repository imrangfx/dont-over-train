"use client";

import { CheckCircle, ChevronRight, Download } from "lucide-react";
import { usePWAInstall } from "@/lib/hooks/usePWAInstall";

type InstallAppButtonProps = {
  /**
   * `onboarding` — full-width green CTA (default).
   * `settings` — Settings-row style with subtitle / installed status.
   */
  variant?: "onboarding" | "settings";
};

/**
 * Custom PWA install UI. Uses the shared usePWAInstall hook so onboarding
 * and Settings stay on one install-prompt source of truth.
 *
 * Renders nothing when the browser cannot install and the app is not
 * already running as an installed PWA.
 */
export default function InstallAppButton({
  variant = "onboarding",
}: InstallAppButtonProps) {
  const { canInstall, isInstalled, install } = usePWAInstall();

  if (variant === "settings") {
    if (isInstalled) {
      return (
        <div
          className="flex items-center gap-3 px-4 py-4"
          role="status"
          aria-label="App Installed. You're using the installed version."
        >
          <div className="shrink-0 text-lime-400" aria-hidden="true">
            <CheckCircle size={18} />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-zinc-300">App Installed</p>
            <p className="mt-0.5 text-xs leading-5 text-zinc-500">
              You&apos;re using the installed version.
            </p>
          </div>
        </div>
      );
    }

    if (!canInstall) return null;

    return (
      <button
        type="button"
        onClick={() => {
          void install();
        }}
        className="flex w-full items-center justify-between gap-3 px-4 py-4 text-left text-zinc-300 transition hover:bg-zinc-900/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#39ff14] focus-visible:ring-inset active:scale-[0.99]"
        aria-label="Install App. Install Don't Over Train for faster access."
      >
        <div className="flex min-w-0 items-center gap-3">
          <div className="shrink-0 text-lime-400" aria-hidden="true">
            <Download size={18} />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium">Install App</p>
            <p className="mt-0.5 text-xs leading-5 text-zinc-500">
              Install Don&apos;t Over Train for faster access.
            </p>
          </div>
        </div>
        <ChevronRight size={18} className="shrink-0 text-zinc-600" aria-hidden="true" />
      </button>
    );
  }

  if (!canInstall) return null;

  return (
    <button
      type="button"
      onClick={() => {
        void install();
      }}
      className="btn-base mt-3 flex h-14 w-full items-center justify-center gap-3 rounded-3xl bg-[#16a34a] text-lg font-semibold text-white hover:brightness-110"
    >
      <Download size={22} aria-hidden="true" />
      Install App
    </button>
  );
}
