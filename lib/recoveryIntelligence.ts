/**
 * Recovery Intelligence engine.
 *
 * Rule-based only (no AI/ML). Every number here is derived from real,
 * already-stored workout history - specifically the per-exercise
 * `fatigueBreakdown` values (sets/reps-adjusted at log time, see
 * app/exercise/[slug]/page.tsx) and workout timestamps. Nothing here reads
 * from or writes to the database; it only consumes `WorkoutHistoryEntry[]`
 * that callers already load via lib/workouts.ts.
 *
 * Kept as its own module (separate from lib/dashboard.ts) since this is a
 * distinct, reusable engine: per-body-part recovery + a recommendation
 * engine with human-readable reasoning, suitable for the Home dashboard
 * today and any future screen (e.g. a full Recovery page) tomorrow.
 */
import { recoveryHoursForFatigue, type WorkoutHistoryEntry } from "@/lib/workouts";

export type TrainingStatus = "Ready" | "Moderate Fatigue" | "Recovery Needed";

/** >= this recovery % => Ready. */
const READY_THRESHOLD = 85;
/** >= this (and < READY_THRESHOLD) => Moderate Fatigue. Below => Recovery Needed. */
const MODERATE_THRESHOLD = 50;

function statusForRecovery(recoveryPercent: number): TrainingStatus {
  if (recoveryPercent >= READY_THRESHOLD) return "Ready";
  if (recoveryPercent >= MODERATE_THRESHOLD) return "Moderate Fatigue";
  return "Recovery Needed";
}

function formatEstimatedReadiness(hoursUntilReady: number): string {
  if (hoursUntilReady <= 0) return "Ready now";
  if (hoursUntilReady < 24) return `Ready in ${Math.ceil(hoursUntilReady)}h`;
  const days = Math.ceil(hoursUntilReady / 24);
  return `Ready in ${days} day${days === 1 ? "" : "s"}`;
}

function formatDaysAgo(days: number): string {
  if (days <= 0) return "earlier today";
  if (days === 1) return "1 day ago";
  return `${days} days ago`;
}

export type BodyPartRecovery = {
  bodyPart: string;
  /** Recovery % (0-100). Higher = more recovered / ready to train again. */
  recoveryPercent: number;
  /** null when this body part has never appeared in workout history. */
  daysSinceLastTrained: number | null;
  hoursSinceLastTrained: number | null;
  /** Fatigue (0-100+) produced by the most recent session that trained this body part. */
  lastFatigue: number;
  /** Hours of rest that session's fatigue level calls for. */
  recoveryHoursNeeded: number;
  /** Hours remaining until fully recovered (0 if already there). */
  hoursUntilReady: number;
  /** Human-readable readiness estimate, e.g. "Ready now", "Ready in 6h", "Ready in 2 days". */
  estimatedReadiness: string;
  status: TrainingStatus;
  /** Plain-language explanation of how this result was calculated. */
  reasoning: string;
};

/**
 * Total fatigue a single workout imposed on one body part. Sums the
 * per-exercise `fatigueBreakdown` values (already sets/reps-adjusted) for
 * exercises logged against that body part. Falls back to an even split of
 * the workout-level fatigue total across the body parts it trained, which
 * only matters for legacy history entries saved before `exerciseList` was
 * introduced.
 */
function fatigueForBodyPartInWorkout(workout: WorkoutHistoryEntry, bodyPart: string): number {
  const matchingExercises = (workout.exerciseList || []).filter(
    (exercise) => exercise.bodyPart === bodyPart
  );

  if (matchingExercises.length > 0) {
    return matchingExercises.reduce((sum, exercise) => {
      const values = Object.values(exercise.fatigueBreakdown || {});
      return sum + values.reduce((s, v) => s + Number(v), 0);
    }, 0);
  }

  if (!workout.bodyParts?.includes(bodyPart)) return 0;

  const trainedCount = workout.bodyParts.length || 1;
  const workoutFatigueTotal = Object.values(workout.fatigueBreakdown || {}).reduce(
    (sum, v) => sum + Number(v),
    0
  );

  return workoutFatigueTotal / trainedCount;
}

function buildReasoning(input: {
  bodyPart: string;
  daysSinceLastTrained: number;
  lastFatigue: number;
  recoveryHoursNeeded: number;
  recoveryPercent: number;
  status: TrainingStatus;
}): string {
  const { bodyPart, daysSinceLastTrained, lastFatigue, recoveryHoursNeeded, recoveryPercent, status } =
    input;
  const when = formatDaysAgo(daysSinceLastTrained);

  if (recoveryHoursNeeded === 0) {
    return `${bodyPart} was trained ${when} with very light load, so it's fully recovered.`;
  }

  if (status === "Ready") {
    return `${bodyPart} was trained ${when} and needed about ${recoveryHoursNeeded}h to recover - that window has passed, so it's ${recoveryPercent}% ready.`;
  }

  if (status === "Moderate Fatigue") {
    return `${bodyPart} was trained ${when} with moderate fatigue (${lastFatigue}%). It typically needs ~${recoveryHoursNeeded}h to fully recover and is currently only ${recoveryPercent}% ready.`;
  }

  return `${bodyPart} was trained ${when} with high fatigue (${lastFatigue}%) and needs ~${recoveryHoursNeeded}h to recover. It's only ${recoveryPercent}% ready, so it should not be trained again yet.`;
}

/** Calculates full recovery intelligence for a single body part from real workout history. */
export function calculateBodyPartRecovery(
  history: WorkoutHistoryEntry[],
  bodyPart: string,
  now: number = Date.now()
): BodyPartRecovery {
  const lastWorkout = (history || []).find((workout) => workout.bodyParts?.includes(bodyPart));

  if (!lastWorkout) {
    return {
      bodyPart,
      recoveryPercent: 100,
      daysSinceLastTrained: null,
      hoursSinceLastTrained: null,
      lastFatigue: 0,
      recoveryHoursNeeded: 0,
      hoursUntilReady: 0,
      estimatedReadiness: "Ready now",
      status: "Ready",
      reasoning: `${bodyPart} has never been trained, so it's fully ready.`,
    };
  }

  const hoursSinceLastTrained = Math.max(0, (now - lastWorkout.timestamp) / (1000 * 60 * 60));
  const daysSinceLastTrained = Math.floor(hoursSinceLastTrained / 24);
  const lastFatigue = Math.min(fatigueForBodyPartInWorkout(lastWorkout, bodyPart), 100);
  const recoveryHoursNeeded = lastFatigue > 0 ? recoveryHoursForFatigue(lastFatigue) : 0;

  const recoveryPercent =
    recoveryHoursNeeded === 0
      ? 100
      : Math.round(Math.min(100, (hoursSinceLastTrained / recoveryHoursNeeded) * 100));

  const hoursUntilReady = Math.max(0, recoveryHoursNeeded - hoursSinceLastTrained);
  const status = statusForRecovery(recoveryPercent);

  return {
    bodyPart,
    recoveryPercent,
    daysSinceLastTrained,
    hoursSinceLastTrained,
    lastFatigue,
    recoveryHoursNeeded,
    hoursUntilReady,
    estimatedReadiness: formatEstimatedReadiness(hoursUntilReady),
    status,
    reasoning: buildReasoning({
      bodyPart,
      daysSinceLastTrained,
      lastFatigue,
      recoveryHoursNeeded,
      recoveryPercent,
      status,
    }),
  };
}

export type RecoveryIntelligenceReport = {
  /** One entry per known body part, sorted most-fatigued first. */
  bodyParts: BodyPartRecovery[];
  /** 0-100 average recovery across every known body part. */
  overallRecoveryScore: number;
  readyBodyParts: string[];
  moderateBodyParts: string[];
  fatiguedBodyParts: string[];
};

/** Runs calculateBodyPartRecovery() across every known body part and aggregates the result. */
export function calculateRecoveryIntelligence(
  history: WorkoutHistoryEntry[],
  knownBodyParts: string[],
  now: number = Date.now()
): RecoveryIntelligenceReport {
  const bodyParts = knownBodyParts
    .map((bodyPart) => calculateBodyPartRecovery(history, bodyPart, now))
    .sort((a, b) => a.recoveryPercent - b.recoveryPercent);

  const overallRecoveryScore = bodyParts.length
    ? Math.round(bodyParts.reduce((sum, b) => sum + b.recoveryPercent, 0) / bodyParts.length)
    : 100;

  return {
    bodyParts,
    overallRecoveryScore,
    readyBodyParts: bodyParts.filter((b) => b.status === "Ready").map((b) => b.bodyPart),
    moderateBodyParts: bodyParts
      .filter((b) => b.status === "Moderate Fatigue")
      .map((b) => b.bodyPart),
    fatiguedBodyParts: bodyParts
      .filter((b) => b.status === "Recovery Needed")
      .map((b) => b.bodyPart),
  };
}

export type WorkoutRecommendation = {
  /** Ready-only, ranked best-first. Empty when nothing is safe to recommend. */
  recommendedBodyParts: string[];
  headline: string;
  detail: string;
  /** One reasoning sentence per known body part - full transparency for every recommendation. */
  reasoning: string[];
  ctaLabel: string;
  ctaHref: string;
};

/**
 * Recommends what to train today, ranked from a recovery-based report.
 * Only ever recommends body parts with status "Ready" - "Moderate Fatigue"
 * and "Recovery Needed" body parts are never recommended, per design.
 * Ties are broken by longest time since last trained, to keep training
 * balanced across the whole body over time.
 */
export function recommendTodaysWorkout(
  report: RecoveryIntelligenceReport,
  history: WorkoutHistoryEntry[]
): WorkoutRecommendation {
  const reasoning = report.bodyParts.map((b) => b.reasoning);

  if (!history || history.length === 0) {
    return {
      recommendedBodyParts: [],
      headline: "Start Your Fitness Journey",
      detail:
        "Pick a muscle group below to log your first workout and unlock personalized recovery tracking.",
      reasoning,
      ctaLabel: "Choose a Muscle Group",
      ctaHref: "#quick-start",
    };
  }

  const readyCandidates = report.bodyParts.filter((b) => b.status === "Ready");

  if (readyCandidates.length === 0) {
    return {
      recommendedBodyParts: [],
      headline: "Active Recovery Day",
      detail:
        "Every muscle group is still recovering from recent training. Consider rest, light cardio, or mobility work today.",
      reasoning,
      ctaLabel: "View Recovery Details",
      ctaHref: "#recovery",
    };
  }

  const ranked = [...readyCandidates].sort((a, b) => {
    const aDays = a.daysSinceLastTrained ?? Number.POSITIVE_INFINITY;
    const bDays = b.daysSinceLastTrained ?? Number.POSITIVE_INFINITY;
    if (bDays !== aDays) return bDays - aDays;
    return b.recoveryPercent - a.recoveryPercent;
  });

  const top = ranked[0];

  return {
    recommendedBodyParts: ranked.map((b) => b.bodyPart),
    headline: `Train ${top.bodyPart} Today`,
    detail: top.reasoning,
    reasoning,
    ctaLabel: `Start ${top.bodyPart} Workout`,
    ctaHref: `/workout/${top.bodyPart.toLowerCase()}`,
  };
}
