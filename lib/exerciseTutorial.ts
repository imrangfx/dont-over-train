/**
 * Resolve playable URLs for an exercise tutorial.
 * Presentation helper only — no recovery / fatigue logic.
 */

import type { ExerciseTutorial } from "@/app/Data/exerciseTypes";

export type ResolvedExerciseTutorial =
  | {
      readonly kind: "youtube";
      readonly embedUrl: string;
      readonly externalUrl: string;
    }
  | {
      readonly kind: "file";
      readonly src: string;
      readonly externalUrl: string;
    };

/** Accept raw id or common YouTube URL shapes → 11-char id. */
export function extractYoutubeId(raw: string): string | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;

  if (/^[\w-]{11}$/.test(trimmed)) return trimmed;

  try {
    const url = new URL(trimmed);
    const host = url.hostname.replace(/^www\./, "");

    if (host === "youtu.be") {
      const id = url.pathname.split("/").filter(Boolean)[0];
      return id && /^[\w-]{11}$/.test(id) ? id : null;
    }

    if (host === "youtube.com" || host === "m.youtube.com") {
      const fromQuery = url.searchParams.get("v");
      if (fromQuery && /^[\w-]{11}$/.test(fromQuery)) return fromQuery;

      const parts = url.pathname.split("/").filter(Boolean);
      if (
        (parts[0] === "embed" || parts[0] === "shorts" || parts[0] === "live") &&
        parts[1] &&
        /^[\w-]{11}$/.test(parts[1])
      ) {
        return parts[1];
      }
    }
  } catch {
    // Not a URL — fall through.
  }

  return null;
}

/**
 * Build embed + external URLs for the in-app player and fallback link.
 * Returns null when neither youtubeId nor src is usable.
 */
export function resolveExerciseTutorial(
  tutorial: ExerciseTutorial,
): ResolvedExerciseTutorial | null {
  const youtubeRaw = tutorial.youtubeId?.trim();
  if (youtubeRaw) {
    const id = extractYoutubeId(youtubeRaw);
    if (id) {
      return {
        kind: "youtube",
        embedUrl: `https://www.youtube-nocookie.com/embed/${id}?rel=0&modestbranding=1&playsinline=1`,
        externalUrl: `https://www.youtube.com/watch?v=${id}`,
      };
    }
  }

  const src = tutorial.src?.trim();
  if (src) {
    return {
      kind: "file",
      src,
      externalUrl: src,
    };
  }

  return null;
}
