import { chest } from "./chest";
import { back } from "./back";
import { shoulders } from "./shoulders";
import { biceps } from "./biceps";
import { triceps } from "./triceps";
import { legs } from "./legs";
import { abs } from "./abs";
import { forearms } from "./forearms";

/** How an exercise is logged in the workout logger. */
export type ExerciseTrackingType = "weight" | "bodyweight" | "duration";

/** Shared shape for every exercise in the database. */
export type ExerciseData = {
  name: string;
  bodyPart: string;
  section: string;
  /**
   * weight → weight + reps
   * bodyweight → reps only
   * duration → seconds only
   */
  trackingType: ExerciseTrackingType;
  fatigue: Record<string, number>;
  image?: string;
};

export const exercises = {
  ...chest,
  ...back,
  ...shoulders,
  ...biceps,
  ...triceps,
  ...legs,
  ...abs,
  ...forearms,
} as const satisfies Record<string, ExerciseData>;
