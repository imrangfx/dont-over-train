import { chest } from "./chest";
import { back } from "./back";
import { shoulders } from "./shoulders";
import { biceps } from "./biceps";
import { triceps } from "./triceps";
import { legs } from "./legs";
import { abs } from "./abs";
import { forearms } from "./forearms";

/** Shared shape for every exercise in the database. */
export type ExerciseData = {
  name: string;
  bodyPart: string;
  section: string;
  /** True when the exercise needs external load (barbell, dumbbell, machine, cable, etc.). */
  requiresWeight: boolean;
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
