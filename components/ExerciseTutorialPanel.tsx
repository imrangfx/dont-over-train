"use client";

import { useEffect, useMemo, useState } from "react";
import { ExternalLink } from "lucide-react";
import type { ExerciseTutorial } from "@/app/Data/exerciseTypes";
import {
  resolveExerciseTutorial,
  type ResolvedExerciseTutorial,
} from "@/lib/exerciseTutorial";

type ExerciseTutorialPanelProps = {
  readonly tutorial: ExerciseTutorial;
  readonly exerciseName: string;
};

/**
 * Always-visible in-app tutorial player (YouTube embed or self-hosted file).
 * No expand/collapse — renders immediately when a tutorial exists.
 */
export default function ExerciseTutorialPanel({
  tutorial,
  exerciseName,
}: ExerciseTutorialPanelProps) {
  const [loadFailed, setLoadFailed] = useState(false);

  const resolved = useMemo(
    () => resolveExerciseTutorial(tutorial),
    [tutorial],
  );

  useEffect(() => {
    queueMicrotask(() => setLoadFailed(false));
  }, [tutorial]);

  if (!resolved) return null;

  return (
    <div className="mb-5 overflow-hidden rounded-3xl border border-[#222] bg-[#111] p-3">
      {loadFailed ? (
        <TutorialFallback
          exerciseName={exerciseName}
          externalUrl={resolved.externalUrl}
        />
      ) : (
        <TutorialPlayer
          resolved={resolved}
          exerciseName={exerciseName}
          onError={() => setLoadFailed(true)}
        />
      )}
    </div>
  );
}

function TutorialPlayer({
  resolved,
  exerciseName,
  onError,
}: {
  resolved: ResolvedExerciseTutorial;
  exerciseName: string;
  onError: () => void;
}) {
  if (resolved.kind === "youtube") {
    return (
      <div className="aspect-video overflow-hidden rounded-2xl bg-black ring-1 ring-zinc-800">
        <iframe
          src={resolved.embedUrl}
          title={`${exerciseName} tutorial`}
          className="h-full w-full border-0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
          allowFullScreen
          loading="lazy"
          referrerPolicy="strict-origin-when-cross-origin"
          onError={onError}
        />
      </div>
    );
  }

  return (
    <div className="aspect-video overflow-hidden rounded-2xl bg-black ring-1 ring-zinc-800">
      <video
        className="h-full w-full object-contain"
        controls
        playsInline
        preload="metadata"
        src={resolved.src}
        onError={onError}
      >
        <track kind="captions" />
      </video>
    </div>
  );
}

function TutorialFallback({
  exerciseName,
  externalUrl,
}: {
  exerciseName: string;
  externalUrl: string;
}) {
  return (
    <div className="rounded-2xl border border-zinc-800 bg-black/40 px-4 py-5 text-center">
      <p className="text-sm text-zinc-400">
        Couldn&apos;t load the in-app player for {exerciseName}.
      </p>
      <a
        href={externalUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="btn-base mt-4 inline-flex items-center justify-center gap-2 rounded-xl border border-lime-400/40 bg-lime-400/10 px-4 py-2.5 text-sm font-semibold text-lime-400 hover:bg-lime-400/15"
      >
        Open tutorial
        <ExternalLink size={14} aria-hidden="true" />
      </a>
    </div>
  );
}
