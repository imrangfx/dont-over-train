/**
 * Dedicated configuration for the Body Part Strength Level system.
 *
 * This is the ONLY place level titles/thresholds live - lib/bodyPartProgression.ts
 * contains zero hardcoded numbers. To add Level 21+, just append another
 * entry to BODY_PART_LEVELS below; every calculation and every UI checklist
 * picks it up automatically.
 */

export type BodyPartName = "Chest" | "Back" | "Shoulders" | "Biceps" | "Triceps" | "Legs";

/** The 6 body parts this level system is judged against, in display order. */
export const STRENGTH_BODY_PARTS: BodyPartName[] = [
  "Chest",
  "Back",
  "Shoulders",
  "Biceps",
  "Triceps",
  "Legs",
];

export type BodyPartLevelDefinition = {
  level: number;
  title: string;
  /** Minimum qualifying PR (kg) required for each body part to be considered "at" this level. */
  requirements: Record<BodyPartName, number>;
  /** Accent color used everywhere this level is displayed (Home, Profile, Friends, Share Card). */
  color: string;
};

export const BODY_PART_LEVELS: BodyPartLevelDefinition[] = [
  { level: 1, title: "Rookie", color: "#9CA3AF", requirements: { Chest: 0, Back: 0, Shoulders: 0, Biceps: 0, Triceps: 0, Legs: 0 } },
  { level: 2, title: "Beginner", color: "#60A5FA", requirements: { Chest: 20, Back: 20, Shoulders: 10, Biceps: 10, Triceps: 10, Legs: 30 } },
  { level: 3, title: "Novice", color: "#38BDF8", requirements: { Chest: 30, Back: 30, Shoulders: 15, Biceps: 15, Triceps: 15, Legs: 50 } },
  { level: 4, title: "Trainee", color: "#22D3EE", requirements: { Chest: 40, Back: 40, Shoulders: 20, Biceps: 20, Triceps: 20, Legs: 70 } },
  { level: 5, title: "Intermediate", color: "#34D399", requirements: { Chest: 50, Back: 50, Shoulders: 25, Biceps: 25, Triceps: 25, Legs: 90 } },
  { level: 6, title: "Consistent", color: "#4ADE80", requirements: { Chest: 60, Back: 60, Shoulders: 30, Biceps: 30, Triceps: 30, Legs: 110 } },
  { level: 7, title: "Dedicated", color: "#39FF14", requirements: { Chest: 70, Back: 70, Shoulders: 35, Biceps: 35, Triceps: 35, Legs: 130 } },
  { level: 8, title: "Advanced", color: "#A3E635", requirements: { Chest: 80, Back: 80, Shoulders: 40, Biceps: 40, Triceps: 40, Legs: 150 } },
  { level: 9, title: "Athlete", color: "#FACC15", requirements: { Chest: 90, Back: 90, Shoulders: 45, Biceps: 45, Triceps: 45, Legs: 170 } },
  { level: 10, title: "Strong", color: "#FBBF24", requirements: { Chest: 100, Back: 100, Shoulders: 50, Biceps: 50, Triceps: 50, Legs: 190 } },
  { level: 11, title: "Elite", color: "#FB923C", requirements: { Chest: 110, Back: 110, Shoulders: 55, Biceps: 55, Triceps: 55, Legs: 210 } },
  { level: 12, title: "Expert", color: "#F97316", requirements: { Chest: 120, Back: 120, Shoulders: 60, Biceps: 60, Triceps: 60, Legs: 230 } },
  { level: 13, title: "Master", color: "#F87171", requirements: { Chest: 130, Back: 130, Shoulders: 65, Biceps: 65, Triceps: 65, Legs: 250 } },
  { level: 14, title: "Champion", color: "#EF4444", requirements: { Chest: 140, Back: 140, Shoulders: 70, Biceps: 70, Triceps: 70, Legs: 270 } },
  { level: 15, title: "Titan", color: "#FB7185", requirements: { Chest: 150, Back: 150, Shoulders: 75, Biceps: 75, Triceps: 75, Legs: 290 } },
  { level: 16, title: "Beast", color: "#E879F9", requirements: { Chest: 160, Back: 160, Shoulders: 80, Biceps: 80, Triceps: 80, Legs: 310 } },
  { level: 17, title: "Legend", color: "#C084FC", requirements: { Chest: 170, Back: 170, Shoulders: 85, Biceps: 85, Triceps: 85, Legs: 330 } },
  { level: 18, title: "Iron King", color: "#A78BFA", requirements: { Chest: 180, Back: 180, Shoulders: 90, Biceps: 90, Triceps: 90, Legs: 350 } },
  { level: 19, title: "Apex", color: "#818CF8", requirements: { Chest: 190, Back: 190, Shoulders: 95, Biceps: 95, Triceps: 95, Legs: 370 } },
  { level: 20, title: "Don't Over Train", color: "#FFD700", requirements: { Chest: 200, Back: 200, Shoulders: 100, Biceps: 100, Triceps: 100, Legs: 390 } },
];
