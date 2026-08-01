/**
 * Don't Over Train — Recovery Engine Types
 *
 * ---------------------------------------------------------------------------
 * PURPOSE
 * ---------------------------------------------------------------------------
 * Shared, logic-free TypeScript contracts for every recovery-engine module.
 * Fatigue math, decay, status resolution, and recommendations consume these
 * shapes; they never redefine them.
 *
 * Import MuscleName / RecoveryStatusId from the Data layer so engine types
 * stay locked to the canonical muscle dictionary and status band IDs.
 *
 * No runtime values. No functions. Types only.
 */

import type { MuscleName } from "@/app/Data/muscles";
import type { RecoveryStatusId } from "@/app/Data/recoveryConfig";

// ---------------------------------------------------------------------------
// Logged workout inputs
// ---------------------------------------------------------------------------

/**
 * One set as recorded by the workout logger.
 *
 * Field usage depends on the exercise `trackingType`:
 * - weight      → `weight` + `reps`
 * - bodyweight  → `reps`
 * - duration    → `durationSeconds`
 *
 * Empty string weight mirrors the in-progress logger UI (value not yet entered).
 */
export type LoggedWorkoutSet = {
  readonly weight?: number | "";
  readonly reps?: number;
  readonly durationSeconds?: number;
};

/**
 * One exercise contribution inside a completed (or in-progress) workout,
 * shaped for the recovery engine — not for UI form state.
 *
 * `fatigueBreakdown` is the sets/reps-adjusted fatigue already attributed to
 * each muscle at log time. When present, the engine should prefer it over
 * re-deriving load from `sets` + catalog baselines.
 *
 * `primaryMuscles` / `secondaryMuscles` drive FATIGUE_SOURCE multipliers when
 * the engine must apply catalog fatigue maps itself.
 */
export type LoggedWorkoutExercise = {
  /** Stable exercise catalog slug (e.g. "barbell-back-squat"). */
  readonly slug: string;
  readonly name: string;
  /** UI / history body-part label (e.g. "Legs") — not a MuscleName. */
  readonly bodyPart: string;
  /** UI navigation section only. */
  readonly section?: string;
  readonly sets: readonly LoggedWorkoutSet[];
  /**
   * Per-muscle fatigue applied by this exercise after logging adjustments.
   * Keys must be MuscleName values from muscles.ts.
   */
  readonly fatigueBreakdown: Readonly<Partial<Record<MuscleName, number>>>;
  /** Catalog primary movers for this exercise (when available). */
  readonly primaryMuscles?: readonly MuscleName[];
  /** Catalog secondary / synergist movers (when available). */
  readonly secondaryMuscles?: readonly MuscleName[];
  /**
   * Unix ms when this exercise was logged / the parent workout ended.
   * Used as the decay anchor when computing current fatigue.
   */
  readonly completedAt?: number;
};

// ---------------------------------------------------------------------------
// Per-muscle engine outputs
// ---------------------------------------------------------------------------

/**
 * Accumulated training stress on a single muscle at a point in time.
 *
 * `fatigue` is a 0–MAX_FATIGUE score (see RECOVERY_CONFIG). Higher values
 * mean more residual load and lower readiness to train that tissue hard.
 */
export type MuscleFatigue = {
  readonly muscle: MuscleName;
  readonly fatigue: number;
  /** Unix ms for which this fatigue snapshot is valid. */
  readonly asOf: number;
};

/**
 * Readiness view of a single muscle derived from its current fatigue.
 *
 * `recoveryPercent` is 0–100 where higher = fresher. Status bands and
 * recommendation thresholds are evaluated against this percentage — not
 * against raw fatigue — so UI and coaching stay aligned with the engine.
 */
export type MuscleRecovery = {
  readonly muscle: MuscleName;
  /** 0–100 readiness signal (100 = fully recovered). */
  readonly recoveryPercent: number;
  /** Underlying fatigue used to derive recoveryPercent. */
  readonly fatigue: number;
  /** Unix ms for which this recovery snapshot is valid. */
  readonly asOf: number;
};

/**
 * Fully resolved recovery status for one muscle: readiness + band metadata.
 *
 * `statusId` matches RECOVERY_STATUS band IDs (FRESH … OVERREACHED).
 * `label` / `color` are denormalized from config for convenient rendering
 * without re-looking up bands in every consumer.
 */
export type MuscleStatus = {
  readonly muscle: MuscleName;
  readonly statusId: RecoveryStatusId;
  readonly label: string;
  /** Hex color from the matching RECOVERY_STATUS band. */
  readonly color: string;
  readonly recoveryPercent: number;
  readonly fatigue: number;
  readonly asOf: number;
};

// ---------------------------------------------------------------------------
// Aggregate & recommendation outputs
// ---------------------------------------------------------------------------

/**
 * Cross-muscle recovery snapshot for dashboards and recovery screens.
 *
 * `muscles` is the authoritative per-muscle list. Overall fields summarize
 * that list for hero metrics (e.g. average readiness, worst band).
 */
export type RecoverySummary = {
  /** Unix ms when this summary was computed. */
  readonly asOf: number;
  readonly muscles: readonly MuscleStatus[];
  /** Aggregate readiness (0–100). Exact aggregation is engine-defined. */
  readonly overallRecoveryPercent: number;
  /** Status band representing overall / worst-case readiness. */
  readonly overallStatusId: RecoveryStatusId;
  readonly overallLabel: string;
  readonly overallColor: string;
};

/**
 * Coaching action suggested for a muscle, aligned with RECOMMENDATION_RULES.
 *
 * - SAFE    → recovery ≥ SAFE_TO_TRAIN_AT
 * - CAUTION → recovery ≥ CAUTION_AT (and below SAFE)
 * - AVOID   → recovery ≤ AVOID_AT (or otherwise below caution)
 */
export type RecommendationLevel = "SAFE" | "CAUTION" | "AVOID";

/**
 * Train / rest recommendation for one muscle (or muscle focus).
 *
 * Pure data for UI copy and gates — the engine fills `message` with a
 * human-readable reason; this type does not encode how that string is built.
 */
export type RecommendationResult = {
  readonly muscle: MuscleName;
  readonly level: RecommendationLevel;
  readonly recoveryPercent: number;
  readonly statusId: RecoveryStatusId;
  /** Plain-language explanation suitable for dashboard / recovery UI. */
  readonly message: string;
  readonly asOf: number;
};
