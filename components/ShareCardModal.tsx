"use client";

import { useEffect, useRef, useState } from "react";
import { Download, Share2, Copy, X } from "lucide-react";
import { buildShareSummaryText, type ShareCardData } from "@/lib/shareCard";
import { useToast } from "@/components/ui/Toast";

type ShareCardModalProps = {
  data: ShareCardData;
  onClose: () => void;
};

/** Instagram-Story-shaped (9:16) share card with download/share/copy actions. Rendered on demand, so html-to-image is only imported when a share is actually requested. */
export default function ShareCardModal({ data, onClose }: ShareCardModalProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const [busy, setBusy] = useState(false);
  const summaryText = buildShareSummaryText(data);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [onClose]);

  async function renderPng(): Promise<string | null> {
    if (!cardRef.current) return null;
    try {
      const { toPng } = await import("html-to-image");
      return await toPng(cardRef.current, { pixelRatio: 2, cacheBust: true });
    } catch {
      return null;
    }
  }

  function downloadDataUrl(dataUrl: string) {
    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = "progressive-overload.png";
    a.click();
  }

  const handleDownload = async () => {
    setBusy(true);
    try {
      const dataUrl = await renderPng();

      if (!dataUrl) {
        toast("Couldn't generate image.", "error");
        return;
      }

      downloadDataUrl(dataUrl);
      toast("Image downloaded");
    } finally {
      setBusy(false);
    }
  };

  const handleShare = async () => {
    setBusy(true);
    try {
      const dataUrl = await renderPng();

      if (!dataUrl) {
        toast("Couldn't generate image.", "error");
        return;
      }

      try {
        const blob = await (await fetch(dataUrl)).blob();
        const file = new File([blob], "progressive-overload.png", { type: "image/png" });

        if (navigator.share && navigator.canShare?.({ files: [file] })) {
          await navigator.share({ files: [file], title: "Progressive Overload", text: summaryText });
          return;
        }
      } catch {
        // Fall through to a plain download below.
      }

      downloadDataUrl(dataUrl);
      toast("Sharing isn't supported here — image downloaded instead.");
    } finally {
      setBusy(false);
    }
  };

  const handleCopyText = async () => {
    try {
      await navigator.clipboard.writeText(summaryText);
      toast("Summary copied");
    } catch {
      toast("Couldn't copy summary.", "error");
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Share achievement"
      className="fixed inset-0 z-140 flex items-center justify-center bg-black/80 px-6 py-8 animate-[fade-in_180ms_ease-out]"
      onClick={onClose}
    >
      <div className="w-full max-w-[360px]" onClick={(event) => event.stopPropagation()}>
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">Share</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="btn-base flex h-10 w-10 items-center justify-center rounded-full text-zinc-400 hover:text-white"
          >
            <X size={20} aria-hidden="true" />
          </button>
        </div>

        <div className="mt-4 overflow-hidden rounded-3xl border border-zinc-800">
          <div
            ref={cardRef}
            className="flex aspect-[9/16] w-full flex-col justify-between p-8"
            style={{
              background:
                "radial-gradient(circle at 30% 0%, rgba(57,255,20,0.18), transparent 55%), linear-gradient(160deg, #0a0a0a 0%, #111111 60%, #000000 100%)",
            }}
          >
            <div>
              <p className="text-sm font-semibold uppercase tracking-widest text-lime-400">
                {data.headline}
              </p>

              {data.exerciseName && (
                <p className="mt-6 text-3xl font-bold text-white">{data.exerciseName}</p>
              )}

              {data.weight != null && (
                <p className="mt-2 text-5xl font-extrabold" style={{ color: data.level.color }}>
                  {data.weight} kg
                </p>
              )}

              {data.deltaWeight != null && data.deltaWeight > 0 && (
                <p className="mt-2 text-lg font-semibold text-lime-400">
                  +{data.deltaWeight.toFixed(1)} kg
                </p>
              )}
            </div>

            <div className="space-y-4">
              <div
                className="inline-flex items-center gap-2 rounded-2xl border px-4 py-2"
                style={{ borderColor: data.level.color }}
              >
                <span className="text-xl font-bold" style={{ color: data.level.color }}>
                  Level {data.level.level}
                </span>
                <span className="text-sm text-zinc-300">{data.level.title}</span>
              </div>

              {data.currentStreak > 0 && (
                <p className="text-lg font-semibold text-white">
                  🔥 {data.currentStreak} Day Streak
                </p>
              )}

              <div className="border-t border-white/10 pt-4">
                <p className="text-sm font-semibold text-white">Progressive Overload Tracker</p>
                <p className="text-xs text-zinc-500">dontovertrain.app</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-2">
          <button
            type="button"
            disabled={busy}
            onClick={handleDownload}
            className="btn-base flex flex-col items-center gap-1 rounded-xl bg-[#191919] py-3 text-xs text-zinc-300 hover:bg-[#222] disabled:opacity-50"
          >
            <Download size={18} aria-hidden="true" />
            Download
          </button>

          <button
            type="button"
            disabled={busy}
            onClick={handleShare}
            className="btn-base flex flex-col items-center gap-1 rounded-xl bg-[#191919] py-3 text-xs text-zinc-300 hover:bg-[#222] disabled:opacity-50"
          >
            <Share2 size={18} aria-hidden="true" />
            Share
          </button>

          <button
            type="button"
            disabled={busy}
            onClick={handleCopyText}
            className="btn-base flex flex-col items-center gap-1 rounded-xl bg-[#191919] py-3 text-xs text-zinc-300 hover:bg-[#222] disabled:opacity-50"
          >
            <Copy size={18} aria-hidden="true" />
            Copy Text
          </button>
        </div>
      </div>
    </div>
  );
}
