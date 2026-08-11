/**
 * Adaptive workout-split recommendation.
 *
 * Learns the user's training pattern from existing WorkoutHistoryEntry data
 * (no separate history store). Deterministic; recovery is applied as a filter
 * after the split-based next session is chosen.
 */

import { exercises } from "@/app/Data/exercises";
import type { WorkoutExercise, WorkoutHistoryEntry } from "@/lib/workouts";

/** Canonical Home body-part slugs. */
export const SPLIT_BODY_PART_SLUGS = [
  "chest",
  "back",
  "shoulders",
  "biceps",
  "triceps",
  "legs",
  "abs",
  "forearms",
] as const;

export type SplitBodyPartSlug = (typeof SPLIT_BODY_PART_SLUGS)[number];

const UPPER_SLUGS: readonly SplitBodyPartSlug[] = [
  "chest",
  "back",
  "shoulders",
  "biceps",
  "triceps",
  "forearms",
];

const LOWER_SLUGS: readonly SplitBodyPartSlug[] = ["legs", "abs"];

const SLUG_SET = new Set<string>(SPLIT_BODY_PART_SLUGS);

/** Default single-muscle rotation when the user trains one part per session. */
const SINGLE_ROTATION: readonly SplitBodyPartSlug[] = [
  "chest",
  "back",
  "biceps",
  "triceps",
  "shoulders",
  "legs",
  "abs",
];

/**
 * Soft complements used only when history has no observed transition yet
 * (learning phase). These are pair→pair mappings, not Chest→Back alone.
 */
const PAIR_COMPLEMENTS: Readonly<Record<string, readonly SplitBodyPartSlug[]>> = {
  "chest+triceps": ["back", "biceps"],
  "back+biceps": ["legs", "shoulders"],
  "legs+shoulders": ["chest", "triceps"],
  "chest+biceps": ["back", "triceps"],
  "back+triceps": ["legs", "shoulders"],
  "legs+abs": ["chest", "back"],
  "back+shoulders": ["chest", "triceps"],
  "chest+shoulders": ["back", "biceps"],
  "shoulders+triceps": ["back", "biceps"],
  "shoulders+biceps": ["chest", "triceps"],
  "chest+back": ["legs", "abs"],
  "biceps+triceps": ["shoulders", "legs"],
};

export type SessionParts = {
  /** Unique body-part slugs trained in the session (forearms dropped if biceps present). */
  readonly parts: readonly SplitBodyPartSlug[];
  /** Stable key, e.g. "chest+triceps". */
  readonly key: string;
};

export type SplitMode = "learning" | "single" | "pair" | "upper_lower" | "mixed";

export type SplitRecommendation = {
  readonly mode: SplitMode;
  /** Up to two body-part slugs to mark as Best Choice (preferred order). */
  readonly recommendedSlugs: readonly SplitBodyPartSlug[];
  /** Last session key used as the pattern anchor (empty if no history). */
  readonly lastSessionKey: string;
};

function normalizeSlug(value: string): string {
  return value.trim().toLowerCase();
}

function isSplitSlug(value: string): value is SplitBodyPartSlug {
  return SLUG_SET.has(value);
}

function resolveExerciseBodyPartSlug(exercise: WorkoutExercise): SplitBodyPartSlug | null {
  const raw =
    exercise.bodyPart ||
    Object.values(exercises).find(
      (entry) => entry.name.toLowerCase() === exercise.name.toLowerCase(),
    )?.bodyPart ||
    "";

  const slug = normalizeSlug(raw);
  // History may store "Shoulder" / "Core" variants.
  if (slug === "shoulder") return "shoulders";
  if (slug === "core" || slug === "abdominals") return "abs";
  return isSplitSlug(slug) ? slug : null;
}

function sessionKey(parts: readonly SplitBodyPartSlug[]): string {
  return [...parts].sort().join("+");
}

/**
 * Body parts trained in one workout. Forearms are omitted when biceps are
 * present (already heavily involved in biceps work).
 */
export function extractSessionParts(
  workout: WorkoutHistoryEntry,
): SessionParts | null {
  const found = new Set<SplitBodyPartSlug>();

  for (const exercise of workout.exerciseList || []) {
    const slug = resolveExerciseBodyPartSlug(exercise);
    if (slug) found.add(slug);
  }

  // Fallback to entry-level bodyParts if exerciseList lacked usable labels.
  if (found.size === 0) {
    for (const label of workout.bodyParts || []) {
      const slug = normalizeSlug(label);
      if (slug === "shoulder") found.add("shoulders");
      else if (slug === "core" || slug === "abdominals") found.add("abs");
      else if (isSplitSlug(slug)) found.add(slug);
    }
  }

  if (found.has("biceps")) found.delete("forearms");

  if (found.size === 0) return null;

  const parts = [...found].sort() as SplitBodyPartSlug[];
  return { parts, key: sessionKey(parts) };
}

function isUpperHeavy(parts: readonly SplitBodyPartSlug[]): boolean {
  const upper = parts.filter((p) => UPPER_SLUGS.includes(p)).length;
  const lower = parts.filter((p) => LOWER_SLUGS.includes(p)).length;
  return upper >= 3 && lower === 0;
}

function isLowerHeavy(parts: readonly SplitBodyPartSlug[]): boolean {
  const upper = parts.filter((p) => UPPER_SLUGS.includes(p)).length;
  const lower = parts.filter((p) => LOWER_SLUGS.includes(p)).length;
  return lower >= 1 && upper === 0;
}

function countUpperLowerSessions(sessions: readonly SessionParts[]) {
  let upper = 0;
  let lower = 0;
  for (const session of sessions) {
    if (isUpperHeavy(session.parts)) upper += 1;
    else if (isLowerHeavy(session.parts)) lower += 1;
  }
  return { upper, lower };
}

function preferSingleMuscle(sessions: readonly SessionParts[]): boolean {
  if (sessions.length === 0) return false;
  const singles = sessions.filter((s) => s.parts.length === 1).length;
  return singles / sessions.length >= 0.6;
}

function preferPairs(sessions: readonly SessionParts[]): boolean {
  if (sessions.length === 0) return false;
  const pairs = sessions.filter((s) => s.parts.length === 2).length;
  return pairs / sessions.length >= 0.5;
}

/** Chronological sessions (oldest → newest) from newest-first history. */
export function buildSessionTimeline(
  history: readonly WorkoutHistoryEntry[],
  limit = 16,
): SessionParts[] {
  const newestFirst = history.slice(0, limit);
  const sessions: SessionParts[] = [];
  for (let i = newestFirst.length - 1; i >= 0; i -= 1) {
    const session = extractSessionParts(newestFirst[i]);
    if (session) sessions.push(session);
  }
  return sessions;
}

function mostFrequentSuccessor(
  timeline: readonly SessionParts[],
  fromKey: string,
): string | null {
  const counts = new Map<string, number>();
  for (let i = 0; i < timeline.length - 1; i += 1) {
    if (timeline[i].key !== fromKey) continue;
    const next = timeline[i + 1].key;
    counts.set(next, (counts.get(next) ?? 0) + 1);
  }
  let best: string | null = null;
  let bestCount = 0;
  for (const [key, count] of counts) {
    if (count > bestCount) {
      best = key;
      bestCount = count;
    }
  }
  return best;
}

function parseKey(key: string): SplitBodyPartSlug[] {
  return key
    .split("+")
    .filter((part): part is SplitBodyPartSlug => isSplitSlug(part));
}

function nextInSingleRotation(
  last: SplitBodyPartSlug,
  timeline: readonly SessionParts[],
): SplitBodyPartSlug[] {
  // Prefer observed single→single transitions from this user's history.
  const successorKey = mostFrequentSuccessor(timeline, last);
  if (successorKey) {
    const parts = parseKey(successorKey);
    if (parts.length > 0) return parts.slice(0, 2);
  }

  // After Back with no learned transition: suggest arms together once,
  // then fall back to pure single rotation if they keep training one-at-a-time.
  if (last === "back") {
    const trainedBicepsAlone = timeline.some(
      (s) => s.key === "biceps" && s.parts.length === 1,
    );
    if (!trainedBicepsAlone) return ["biceps", "triceps"];
  }

  const idx = SINGLE_ROTATION.indexOf(last);
  if (idx < 0) return ["back"];
  const next = SINGLE_ROTATION[(idx + 1) % SINGLE_ROTATION.length];
  // Skip forearms after biceps (not in SINGLE_ROTATION anyway).
  return [next];
}

function heuristicComplement(last: SessionParts): SplitBodyPartSlug[] {
  if (isUpperHeavy(last.parts)) return ["legs", "abs"];
  if (isLowerHeavy(last.parts)) {
    // Prefer a broad but not exhaustive upper return.
    return ["chest", "back"];
  }

  if (last.parts.length === 1) {
    return nextInSingleRotation(last.parts[0], []);
  }

  const mapped = PAIR_COMPLEMENTS[last.key];
  if (mapped) return [...mapped];

  // Generic: if last had chest, lean pull/arms; if had back, lean push/legs.
  if (last.parts.includes("chest") && !last.parts.includes("back")) {
    return ["back", last.parts.includes("biceps") ? "triceps" : "biceps"];
  }
  if (last.parts.includes("back") && !last.parts.includes("chest")) {
    return ["legs", "shoulders"];
  }
  if (last.parts.includes("legs")) {
    return ["chest", "triceps"];
  }

  return ["back"];
}

function detectMode(timeline: readonly SessionParts[]): SplitMode {
  if (timeline.length === 0) return "learning";
  if (timeline.length === 1) return "learning";

  const { upper, lower } = countUpperLowerSessions(timeline);
  if (upper >= 2 && lower >= 1) return "upper_lower";
  // One full upper + one lower is enough signal once we have 2+ sessions.
  if (upper >= 1 && lower >= 1 && timeline.length >= 2) {
    const recent = timeline.slice(-4);
    const recentUL = countUpperLowerSessions(recent);
    if (recentUL.upper + recentUL.lower >= Math.min(2, recent.length)) {
      return "upper_lower";
    }
  }

  if (preferSingleMuscle(timeline)) return "single";
  if (preferPairs(timeline)) return "pair";
  return "mixed";
}

function recommendFromMode(
  mode: SplitMode,
  timeline: readonly SessionParts[],
  last: SessionParts,
): SplitBodyPartSlug[] {
  // Observed transition always wins when available.
  const learned = mostFrequentSuccessor(timeline, last.key);
  if (learned) {
    const parts = parseKey(learned);
    if (parts.length > 0) {
      if (mode === "single" && preferSingleMuscle(timeline)) {
        // Keep intentional multi-part successors learned from history (e.g. back → biceps+triceps).
        return parts.slice(0, 2);
      }
      return parts.slice(0, 2);
    }
  }

  switch (mode) {
    case "upper_lower": {
      if (isUpperHeavy(last.parts)) return ["legs", "abs"];
      if (isLowerHeavy(last.parts)) {
        for (let i = timeline.length - 1; i >= 0; i -= 1) {
          if (isUpperHeavy(timeline[i].parts)) {
            return timeline[i].parts.filter((p) => p !== "forearms").slice(0, 2);
          }
        }
        return ["chest", "back"];
      }
      // Mixed last session while overall pattern is upper/lower.
      if (last.parts.includes("legs") || last.parts.includes("abs")) {
        return ["chest", "back"];
      }
      return ["legs", "abs"];
    }

    case "single":
      if (last.parts.length === 1) {
        return nextInSingleRotation(last.parts[0], timeline);
      }
      for (const slug of SINGLE_ROTATION) {
        if (last.parts.includes(slug)) {
          return nextInSingleRotation(slug, timeline);
        }
      }
      return ["back"];

    case "pair":
    case "learning":
    case "mixed":
    default:
      return heuristicComplement(last);
  }
}

/**
 * Recommend up to two body-part slugs for the user's next session.
 * Does not apply recovery filtering — callers do that.
 */
export function recommendNextSplit(
  history: readonly WorkoutHistoryEntry[],
): SplitRecommendation {
  const timeline = buildSessionTimeline(history);
  if (timeline.length === 0) {
    return { mode: "learning", recommendedSlugs: [], lastSessionKey: "" };
  }

  const last = timeline[timeline.length - 1];
  const mode = detectMode(timeline);
  let recommended = recommendFromMode(mode, timeline, last);

  // Enforce single-muscle output when the user clearly trains one-at-a-time,
  // unless the recommendation is an intentional arms pairing after Back.
  if (
    mode === "single" &&
    recommended.length > 1 &&
    !(last.parts.length === 1 && last.parts[0] === "back" && recommended[0] === "biceps")
  ) {
    recommended = recommended.slice(0, 1);
  }

  // Never recommend the exact same set as the last session when alternatives exist.
  if (sessionKey(recommended) === last.key && recommended.length > 0) {
    recommended = heuristicComplement(last);
  }

  // Dedupe + cap at 2.
  const unique: SplitBodyPartSlug[] = [];
  for (const slug of recommended) {
    if (!unique.includes(slug)) unique.push(slug);
    if (unique.length >= 2) break;
  }

  return {
    mode,
    recommendedSlugs: unique,
    lastSessionKey: last.key,
  };
}
