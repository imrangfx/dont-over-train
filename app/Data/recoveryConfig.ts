/**
 * Don't Over Train — Recovery Engine Configuration (v2)
 *
 * ---------------------------------------------------------------------------
 * PURPOSE
 * ---------------------------------------------------------------------------
 * Central, import-safe constants for the recovery engine. This module is the
 * single source of truth for limits, decay rates, status bands, colors,
 * recommendation thresholds, and primary/secondary fatigue weighting.
 *
 * No calculation logic lives here. Consumers apply these values in the
 * recovery engine; this file only defines the policy knobs.
 *
 * ---------------------------------------------------------------------------
 * CONCEPTS
 * ---------------------------------------------------------------------------
 *
 * Fatigue
 *   A 0–MAX_FATIGUE score representing accumulated training stress on a
 *   muscle. Higher fatigue means more residual damage / CNS load and less
 *   readiness to train that tissue hard again.
 *
 * Recovery percentage
 *   Inverse readiness signal derived from current fatigue relative to the
 *   fatigue ceiling (conceptually: closer to 100% = fresher). Status bands
 *   and recommendation rules are keyed off this percentage so UI and
 *   coaching copy stay consistent with the engine.
 *
 * Why decay exists
 *   Soft tissue and nervous-system stress do not reset instantly. Decay
 *   rates model gradual return toward baseline over hours and days so the
 *   app can show continuous recovery without requiring a new workout log.
 *
 * Why primary vs secondary multipliers differ
 *   An exercise loads its primary movers near full intensity and secondary
 *   movers at a lower effective dose. Weighting secondary fatigue at half
 *   (by default) prevents double-counting assistance work while still
 *   reflecting real residual stress on supporting muscles.
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** Numeric policy knobs for fatigue caps, visibility, and time decay. */
export type RecoveryConfig = {
  readonly MAX_FATIGUE: number;
  readonly MAX_EXERCISE_FATIGUE: number;
  /** Multiplicative remaining-fatigue factor applied once per elapsed hour. */
  readonly FATIGUE_DECAY_PER_HOUR: number;
  /** Multiplicative remaining-fatigue factor applied once per elapsed day. */
  readonly FATIGUE_DECAY_PER_DAY: number;
  /** Fatigue below this is treated as visually / practically zero. */
  readonly MIN_VISIBLE_FATIGUE: number;
};

/** Stable identifier for a recovery status band. */
export type RecoveryStatusId =
  | "FRESH"
  | "RECOVERED"
  | "MODERATE"
  | "HIGH"
  | "OVERREACHED";

/**
 * One ordered recovery band.
 *
 * `minimumRecovery` is the inclusive lower bound (0–100) for this band.
 * When evaluating status, pick the healthiest band whose minimum is met.
 */
export type RecoveryStatusBand = {
  readonly id: RecoveryStatusId;
  readonly label: string;
  readonly minimumRecovery: number;
  /** Hex color used for charts, badges, and status indicators. */
  readonly color: string;
};

/** Training recommendation thresholds keyed by recovery percentage. */
export type RecommendationRules = {
  /** Recovery at or above this → generally safe to train hard. */
  readonly SAFE_TO_TRAIN_AT: number;
  /** Recovery at or above this (but below safe) → train with caution. */
  readonly CAUTION_AT: number;
  /** Recovery at or below this → prefer avoiding heavy work on that muscle. */
  readonly AVOID_AT: number;
};

/**
 * How exercise muscle roles contribute to applied fatigue.
 * Primary movers take full dose; secondary movers take a reduced share.
 */
export type FatigueSourceMultipliers = {
  readonly PRIMARY_MULTIPLIER: number;
  readonly SECONDARY_MULTIPLIER: number;
};

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

/**
 * Global fatigue limits and decay factors.
 *
 * Decay values are multiplicative remainders (e.g. 0.985 ≈ 1.5% fatigue
 * cleared per hour of rest). They are not additive “points lost.”
 */
export const RECOVERY_CONFIG = {
  /** Absolute ceiling for accumulated fatigue on any single muscle. */
  MAX_FATIGUE: 100,

  /**
   * Soft upper bound for fatigue contributed by one exercise entry before
   * role multipliers / caps in the engine. Keeps a single set from
   * dominating overnight recovery math.
   */
  MAX_EXERCISE_FATIGUE: 20,

  /**
   * Remaining-fatigue factor per hour of elapsed rest.
   * Example: fatigue * (FATIGUE_DECAY_PER_HOUR ** hours).
   */
  FATIGUE_DECAY_PER_HOUR: 0.985,

  /**
   * Remaining-fatigue factor per full day of rest.
   * Coarser companion to hourly decay for long idle windows.
   */
  FATIGUE_DECAY_PER_DAY: 0.72,

  /**
   * Fatigue at or below this threshold is treated as fully recovered for
   * display and “is this muscle hot?” checks.
   */
  MIN_VISIBLE_FATIGUE: 1,
} as const satisfies RecoveryConfig;

/**
 * Recovery status bands, ordered from healthiest → worst.
 *
 * Evaluate by finding the first band (from the top) whose
 * `minimumRecovery` is ≤ the athlete’s current recovery %.
 */
export const RECOVERY_STATUS = [
  {
    id: "FRESH",
    label: "Fresh",
    minimumRecovery: 90,
    color: "#22C55E",
  },
  {
    id: "RECOVERED",
    label: "Recovered",
    minimumRecovery: 70,
    color: "#84CC16",
  },
  {
    id: "MODERATE",
    label: "Moderate Fatigue",
    minimumRecovery: 50,
    color: "#FACC15",
  },
  {
    id: "HIGH",
    label: "High Fatigue",
    minimumRecovery: 25,
    color: "#F97316",
  },
  {
    id: "OVERREACHED",
    label: "Overreached",
    minimumRecovery: 0,
    color: "#EF4444",
  },
] as const satisfies readonly RecoveryStatusBand[];

/** Convenience alias for the readonly status tuple type. */
export type RecoveryStatusList = typeof RECOVERY_STATUS;

/**
 * Coaching thresholds for “should I train this muscle?” copy and gates.
 * All values are recovery percentages (0–100), not raw fatigue.
 */
export const RECOMMENDATION_RULES = {
  SAFE_TO_TRAIN_AT: 80,
  CAUTION_AT: 60,
  AVOID_AT: 40,
} as const satisfies RecommendationRules;

/**
 * Role multipliers applied when an exercise’s fatigue map hits a muscle
 * listed as primary vs secondary.
 *
 * Primary = full contribution (1.0).
 * Secondary = half contribution (0.5) so assistance work loads recovery
 * without equating it to a dedicated primary session.
 */
export const FATIGUE_SOURCE = {
  PRIMARY_MULTIPLIER: 1,
  SECONDARY_MULTIPLIER: 0.5,
} as const satisfies FatigueSourceMultipliers;

/**
 * Schema / policy version for this config surface.
 * Bump when thresholds or band semantics change in a breaking way.
 */
export const RECOVERY_VERSION = "2.0" as const;

export type RecoveryVersion = typeof RECOVERY_VERSION;
