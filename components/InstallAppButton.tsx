"use client";

import { Download } from "lucide-react";
import { usePWAInstall } from "@/lib/hooks/usePWAInstall";

/**
 * Custom PWA install CTA. Renders nothing when the app is already installed
 * or the browser does not support installation prompts.
 */
export default function InstallAppButton() {
  const { canInstall, install } = usePWAInstall();

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
