/**
 * Navigation helpers for the workout entry flow.
 * Body part section → Workout Start → exercise list.
 */

/** Path to the Workout Start screen, preserving the target exercise list. */
export function workoutStartHref(bodyPartSlug: string, sectionSlug: string): string {
  const next = `/workout/${bodyPartSlug}/${sectionSlug}`;
  return `/workout/start?next=${encodeURIComponent(next)}`;
}

/** Safe in-app path from a `next` query value (blocks external URLs). */
export function resolveWorkoutNextPath(
  raw: string | null | undefined,
  fallback = "/home"
): string {
  if (!raw || typeof raw !== "string") return fallback;
  if (!raw.startsWith("/") || raw.startsWith("//")) return fallback;
  return raw;
}

/** Parent path for Back from Start (e.g. /workout/chest/upper-chest → /workout/chest). */
export function workoutStartBackHref(nextPath: string): string {
  const trimmed = nextPath.replace(/\/$/, "");
  const parts = trimmed.split("/").filter(Boolean);
  if (parts.length <= 1) return "/home";
  parts.pop();
  return `/${parts.join("/")}`;
}
