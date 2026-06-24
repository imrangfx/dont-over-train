"use client";

import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import MuscleHeatmap from "@/app/components/MuscleHeatmap";
import { workouts } from "@/app/Data/workouts";

type Exercise = {
  name: string;
  slug: string;
  setsReps: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
};

const EXERCISES_BY_WORKOUT: Record<string, Exercise[]> = {
  chest: [
    // Upper Chest
    {
      name: "Incline Barbell Press",
      slug: "incline-barbell-press",
      setsReps: "3 sets • 8–12 reps",
      difficulty: "Intermediate",
    },
    {
      name: "Incline Cable Fly",
      slug: "incline-cable-fly",
      setsReps: "3 sets • 12–15 reps",
      difficulty: "Beginner",
    },
    {
      name: "Incline Dumbbell Press",
      slug: "incline-dumbbell-press",
      setsReps: "3 sets • 8–12 reps",
      difficulty: "Beginner",
    },
    {
      name: "Incline Hammer Press",
      slug: "incline-hammer-press",
      setsReps: "3 sets • 10–12 reps",
      difficulty: "Intermediate",
    },
    {
      name: "Incline Smith Press",
      slug: "incline-smith-press",
      setsReps: "3 sets • 10–12 reps",
      difficulty: "Beginner",
    },
    {
      name: "Landmine Press",
      slug: "landmine-press",
      setsReps: "3 sets • 10–12 reps",
      difficulty: "Intermediate",
    },
    {
      name: "Low Cable Crossover",
      slug: "low-cable-crossover",
      setsReps: "3 sets • 12–15 reps",
      difficulty: "Intermediate",
    },
    {
      name: "Reverse Grip Bench Press",
      slug: "reverse-grip-bench-press",
      setsReps: "3 sets • 8–12 reps",
      difficulty: "Intermediate",
    },
    {
      name: "Smith Machine Incline Press",
      slug: "smith-machine-incline-press",
      setsReps: "3 sets • 10–12 reps",
      difficulty: "Beginner",
    },
    {
      name: "Wide Grip Incline Press",
      slug: "wide-grip-incline-press",
      setsReps: "3 sets • 8–12 reps",
      difficulty: "Intermediate",
    },
  
    // Mid Chest
    {
      name: "Barbell Bench Press",
      slug: "barbell-bench-press",
      setsReps: "3 sets • 8–12 reps",
      difficulty: "Intermediate",
    },
    {
      name: "Bench Press",
      slug: "bench-press",
      setsReps: "3 sets • 8–12 reps",
      difficulty: "Intermediate",
    },
    {
      name: "Cable Chest Press",
      slug: "cable-chest-press",
      setsReps: "3 sets • 10–12 reps",
      difficulty: "Intermediate",
    },
    {
      name: "Chest Press Machine",
      slug: "chest-press-machine",
      setsReps: "3 sets • 10–12 reps",
      difficulty: "Beginner",
    },
    {
      name: "Dumbbell Bench Press",
      slug: "dumbbell-bench-press",
      setsReps: "3 sets • 8–12 reps",
      difficulty: "Beginner",
    },
    {
      name: "Dumbbell Fly",
      slug: "dumbbell-fly",
      setsReps: "3 sets • 12–15 reps",
      difficulty: "Intermediate",
    },
    {
      name: "Machine Chest Press",
      slug: "machine-chest-press",
      setsReps: "3 sets • 10–12 reps",
      difficulty: "Beginner",
    },
    {
      name: "Pec Deck Fly",
      slug: "pec-deck-fly",
      setsReps: "3 sets • 12–15 reps",
      difficulty: "Beginner",
    },
    {
      name: "Push-Ups",
      slug: "push-ups",
      setsReps: "3 sets • 15–20 reps",
      difficulty: "Beginner",
    },
    {
      name: "Seated Chest Press",
      slug: "seated-chest-press",
      setsReps: "3 sets • 10–12 reps",
      difficulty: "Intermediate",
    },
  
    // Lower Chest
    {
      name: "Cable Chest Dip",
      slug: "cable-chest-dip",
      setsReps: "3 sets • 12–15 reps",
      difficulty: "Intermediate",
    },
    {
      name: "Chest Dips",
      slug: "chest-dips",
      setsReps: "3 sets • 10–15 reps",
      difficulty: "Advanced",
    },
    {
      name: "Decline Bench Press",
      slug: "decline-bench-press",
      setsReps: "3 sets • 8–12 reps",
      difficulty: "Intermediate",
    },
    {
      name: "Decline Cable Fly",
      slug: "decline-cable-fly",
      setsReps: "3 sets • 12–15 reps",
      difficulty: "Intermediate",
    },
    {
      name: "Decline Dumbbell Press",
      slug: "decline-dumbbell-press",
      setsReps: "3 sets • 8–12 reps",
      difficulty: "Intermediate",
    },
    {
      name: "Decline Push-Ups",
      slug: "decline-push-ups",
      setsReps: "3 sets • 15–20 reps",
      difficulty: "Beginner",
    },
    {
      name: "Decline Smith Press",
      slug: "decline-smith-press",
      setsReps: "3 sets • 8–12 reps",
      difficulty: "Intermediate",
    },
    {
      name: "High To Low Cable Fly",
      slug: "high-to-low-cable-fly",
      setsReps: "3 sets • 12–15 reps",
      difficulty: "Intermediate",
    },
    {
      name: "Straight Bar Dips",
      slug: "straight-bar-dips",
      setsReps: "3 sets • 10–15 reps",
      difficulty: "Advanced",
    },
    {
      name: "Weighted Chest Dips",
      slug: "weighted-chest-dips",
      setsReps: "3 sets • 8–12 reps",
      difficulty: "Advanced",
    },
  ],
  back: [
    {
      name: "Pull Up",
      slug: "pull-up",
      setsReps: "3 sets • 6–10 reps",
      difficulty: "Advanced",
    },
    {
      name: "Barbell Row",
      slug: "barbell-row",
      setsReps: "3 sets • 8–12 reps",
      difficulty: "Intermediate",
    },
  ],
};

type SessionStateV1 = {
  started: boolean;
  activeIndex: number | null;
  completedSlugs: string[];
  rest: { open: boolean; remainingMs: number; durationMs: number };
};

function sessionStorageKey(workoutSlug: string) {
  return `dontovertrain:workout:${workoutSlug}:session:v1`;
}

type Muscle =
  | "Chest"
  | "Upper Chest"
  | "Shoulders"
  | "Front Delts"
  | "Triceps"
  | "Biceps"
  | "Lats"
  | "Abs"
  | "Forearms"
  | "Quads"
  | "Calves";

type FatigueStateV1 = Record<Muscle, number>;

const ALL_MUSCLES: Muscle[] = [
  "Chest",
  "Upper Chest",
  "Shoulders",
  "Front Delts",
  "Triceps",
  "Biceps",
  "Lats",
  "Abs",
  "Forearms",
  "Quads",
  "Calves",
];

const DEFAULT_FATIGUE: FatigueStateV1 = {
  Chest: 0,
  "Upper Chest": 0,
  Shoulders: 0,
  "Front Delts": 0,
  Triceps: 0,
  Biceps: 0,
  Lats: 0,
  Abs: 0,
  Forearms: 0,
  Quads: 0,
  Calves: 0,
};

type FatigueImpact = { muscle: Muscle; delta: number };

const FATIGUE_IMPACTS_BY_EXERCISE: Record<string, FatigueImpact[]> = {
  "bench-press": [
    { muscle: "Chest", delta: 20 },
    { muscle: "Triceps", delta: 10 },
    { muscle: "Shoulders", delta: 5 },
  ],
  "incline-dumbbell-press": [
    { muscle: "Upper Chest", delta: 25 },
    { muscle: "Front Delts", delta: 10 },
    { muscle: "Triceps", delta: 8 },
  ],
  "pull-up": [
    { muscle: "Lats", delta: 20 },
    { muscle: "Biceps", delta: 10 },
  ],
  "barbell-row": [
    { muscle: "Lats", delta: 16 },
    { muscle: "Biceps", delta: 8 },
    { muscle: "Shoulders", delta: 4 },
  ],
  "incline-barbell-press": [
  { muscle: "Upper Chest", delta: 12 },
  { muscle: "Front Delts", delta: 5 },
  { muscle: "Triceps", delta: 4 },
],
  "incline-cable-fly": [
  { muscle: "Upper Chest", delta: 10 },
  { muscle: "Front Delts", delta: 2 },
],
"machine-chest-press": [
  { muscle: "Chest", delta: 12 },
  { muscle: "Front Delts", delta: 4 },
  { muscle: "Triceps", delta: 5 },
],
"pec-deck-fly": [
  { muscle: "Chest", delta: 10 },
],
"dumbbell-bench-press": [
  { muscle: "Chest", delta: 15 },
  { muscle: "Front Delts", delta: 5 },
  { muscle: "Triceps", delta: 6 },
],
};

function fatigueStorageKey() {
  return "dontovertrain:fatigue:v1";
}

function clamp0to100(n: number) {
  return Math.max(0, Math.min(100, n));
}

function zone(n: number) {
  if (n <= 40) return "green";
  if (n <= 75) return "yellow";
  return "red";
}

function zoneColor(n: number) {
  const z = zone(n);
  if (z === "green") return "#39ff14";
  if (z === "yellow") return "#facc15";
  return "#ef4444";
}

function CheckIcon() {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      className="h-4 w-4"
      aria-hidden
    >
      <path
        d="M16.5 5.8 8.4 13.9 3.5 9"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function RestTimerModal({
  open,
  remainingMs,
  durationMs,
  onSkip,
}: {
  open: boolean;
  remainingMs: number;
  durationMs: number;
  onSkip: () => void;
}) {
  const total = Math.max(1, durationMs);
  const remaining = Math.max(0, remainingMs);
  const seconds = Math.ceil(remaining / 1000);

  const size = 164;
  const stroke = 10;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const progress = 1 - remaining / total;
  const offset = c * (1 - Math.min(1, Math.max(0, progress)));

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-5 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          role="dialog"
          aria-modal="true"
          aria-label="Rest timer"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, y: 10 }}
            transition={{ type: "spring", stiffness: 420, damping: 30 }}
            className="w-full max-w-[430px] overflow-hidden rounded-xl bg-zinc-900 ring-1 ring-zinc-800/80"
          >
            <div className="p-5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#39ff14]">
                Rest
              </p>
              <p className="mt-1 text-base font-semibold text-white">
                Next set in {seconds}s
              </p>
              <p className="mt-1 text-sm text-zinc-400">
                Breathe. Reset. Stay sharp.
              </p>

              <div className="mt-5 flex items-center justify-center">
                <div className="relative">
                  <svg
                    width={size}
                    height={size}
                    viewBox={`0 0 ${size} ${size}`}
                    className="block"
                    aria-hidden
                  >
                    <circle
                      cx={size / 2}
                      cy={size / 2}
                      r={r}
                      stroke="rgba(255,255,255,0.08)"
                      strokeWidth={stroke}
                      fill="none"
                    />
                    <motion.circle
                      cx={size / 2}
                      cy={size / 2}
                      r={r}
                      stroke="#39ff14"
                      strokeWidth={stroke}
                      fill="none"
                      strokeLinecap="round"
                      strokeDasharray={c}
                      strokeDashoffset={offset}
                      style={{ rotate: -90, transformOrigin: "50% 50%" }}
                      animate={{ strokeDashoffset: offset }}
                      transition={{ ease: "linear", duration: 0.2 }}
                    />
                  </svg>
                  <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                    <p className="text-4xl font-bold tracking-tight text-white">
                      {seconds}
                    </p>
                    <p className="mt-1 text-xs font-semibold uppercase tracking-[0.2em] text-[#39ff14]/90">
                      seconds
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex gap-3">
                <button
                  type="button"
                  onClick={onSkip}
                  className="flex-1 rounded-full bg-black/40 px-4 py-3 text-sm font-semibold text-white ring-1 ring-zinc-700/80 transition hover:ring-[#39ff14]/35 active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#39ff14] focus-visible:ring-offset-2 focus-visible:ring-offset-black"
                >
                  Skip rest
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

export default function WorkoutClient({
  slug,
  title,
}: {
  slug: string;
  title: string;
}) {

  const [search, setSearch] = useState("");
  const workoutData =
  workouts[slug as keyof typeof workouts];
  const CHEST_SECTIONS = [
    {
      title: "Upper Chest",
      image: "/chest/upper-chest.png",
      slug: "upper-chest",
    },
    {
      title: "Mid Chest",
      image: "/chest/mid-chest.png",
      slug: "mid-chest",
    },
    {
      title: "Lower Chest",
      image: "/chest/lower-chest.png",
      slug: "lower-chest",
    },
  ];
  const exercises = useMemo(() => EXERCISES_BY_WORKOUT[slug] ?? [], [slug]);

  const initialSession = useMemo((): SessionStateV1 => {
    if (typeof window === "undefined") {
      return {
        started: false,
        activeIndex: null,
        completedSlugs: [],
        rest: { open: false, remainingMs: 60_000, durationMs: 60_000 },
      };
    }

    try {
      const raw = localStorage.getItem(sessionStorageKey(slug));
      if (!raw) throw new Error("no session");
      const parsed = JSON.parse(raw) as Partial<SessionStateV1> | null;
      if (!parsed || typeof parsed !== "object") throw new Error("bad session");

      return {
        started: !!parsed.started,
        activeIndex:
          typeof parsed.activeIndex === "number" ? parsed.activeIndex : null,
        completedSlugs: Array.isArray(parsed.completedSlugs)
          ? parsed.completedSlugs.filter((s): s is string => typeof s === "string")
          : [],
        rest: parsed.rest
          ? {
              open: !!parsed.rest.open,
              remainingMs:
                typeof parsed.rest.remainingMs === "number"
                  ? parsed.rest.remainingMs
                  : 60_000,
              durationMs:
                typeof parsed.rest.durationMs === "number"
                  ? parsed.rest.durationMs
                  : 60_000,
            }
          : { open: false, remainingMs: 60_000, durationMs: 60_000 },
      };
    } catch {
      return {
        started: false,
        activeIndex: null,
        completedSlugs: [],
        rest: { open: false, remainingMs: 60_000, durationMs: 60_000 },
      };
    }
  }, [slug]);

  const [started, setStarted] = useState<boolean>(initialSession.started);
  const [activeIndex, setActiveIndex] = useState<number | null>(
    initialSession.activeIndex,
  );
  const [completed, setCompleted] = useState<Record<string, boolean>>(() => {
    const next: Record<string, boolean> = {};
    for (const s of initialSession.completedSlugs) next[s] = true;
    return next;
  });
  const [rest, setRest] = useState<{
    open: boolean;
    remainingMs: number;
    durationMs: number;
  }>(initialSession.rest);

  const [fatigue, setFatigue] = useState<FatigueStateV1>(() => {
    if (typeof window === "undefined") return DEFAULT_FATIGUE;
    try {
      const raw = localStorage.getItem(fatigueStorageKey());
      if (!raw) return DEFAULT_FATIGUE;
      const parsed = JSON.parse(raw) as Partial<Record<string, unknown>> | null;
      if (!parsed || typeof parsed !== "object") return DEFAULT_FATIGUE;
      const next: FatigueStateV1 = { ...DEFAULT_FATIGUE };
      for (const m of ALL_MUSCLES) {
        const v = (parsed as Record<string, unknown>)[m];
        if (typeof v === "number") next[m] = clamp0to100(v);
      }
      return next;
    } catch {
      return DEFAULT_FATIGUE;
    }
  });

  const restIntervalRef = useRef<number | null>(null);

  useEffect(() => {
    try {
      const completedSlugs = Object.entries(completed)
        .filter(([, v]) => v)
        .map(([k]) => k);
      const payload: SessionStateV1 = {
        started,
        activeIndex,
        completedSlugs,
        rest,
      };
      localStorage.setItem(sessionStorageKey(slug), JSON.stringify(payload));
    } catch {
      // ignore
    }
  }, [activeIndex, completed, rest, slug, started]);

  useEffect(() => {
    try {
      localStorage.setItem(fatigueStorageKey(), JSON.stringify(fatigue));
    } catch {
      // ignore
    }
  }, [fatigue]);

  useEffect(() => {
    return () => {
      if (restIntervalRef.current) window.clearInterval(restIntervalRef.current);
    };
  }, []);

  const completedCount = useMemo(() => {
    if (!exercises.length) return 0;
    return exercises.reduce((acc, ex) => acc + (completed[ex.slug] ? 1 : 0), 0);
  }, [completed, exercises]);

  const percent = exercises.length
    ? Math.round((completedCount / exercises.length) * 100)
    : 0;

  const allDone = exercises.length > 0 && completedCount === exercises.length;

  const motivational = useMemo(() => {
    if (!allDone) return null;
    return "Perfect session. Consistency beats intensity.";
  }, [allDone]);

  const anyRed = useMemo(() => {
    return ALL_MUSCLES.some((m) => zone(fatigue[m]) === "red");
  }, [fatigue]);

  function firstIncompleteIndex(nextCompleted: Record<string, boolean>) {
    return exercises.findIndex((ex) => !nextCompleted[ex.slug]);
  }

  function beginWorkout() {
    setStarted(true);
    setRest({ open: false, remainingMs: 60_000, durationMs: 60_000 });
    setCompleted((prev) => {
      const idx = firstIncompleteIndex(prev);
      setActiveIndex(idx >= 0 ? idx : null);
      return prev;
    });
  }

  function startRest(durationMs = 60_000) {
    if (restIntervalRef.current) window.clearInterval(restIntervalRef.current);
    setRest({ open: true, remainingMs: durationMs, durationMs });

    restIntervalRef.current = window.setInterval(() => {
      setRest((r) => {
        const remainingMs = Math.max(0, r.remainingMs - 200);
        if (remainingMs <= 0 && restIntervalRef.current) {
          window.clearInterval(restIntervalRef.current);
          restIntervalRef.current = null;
        }
        return { ...r, remainingMs, open: remainingMs > 0 };
      });
    }, 200);
  }

  function skipRest() {
    if (restIntervalRef.current) window.clearInterval(restIntervalRef.current);
    restIntervalRef.current = null;
    setRest((r) => ({ ...r, open: false, remainingMs: 0 }));
  }

  function advanceToNext(nextCompleted: Record<string, boolean>) {
    const next = firstIncompleteIndex(nextCompleted);
    setActiveIndex(next >= 0 ? next : null);
  }

  function toggleCompleted(exerciseSlug: string) {
    setCompleted((prev) => ({ ...prev, [exerciseSlug]: !prev[exerciseSlug] }));
  }

  function completeExercise(exerciseSlug: string) {
    setCompleted((prev) => {
      if (prev[exerciseSlug]) return prev;
      const nextCompleted = { ...prev, [exerciseSlug]: true };

      const impacts = FATIGUE_IMPACTS_BY_EXERCISE[exerciseSlug] ?? [];
      if (impacts.length) {
        setFatigue((f) => {
          const nextFatigue: FatigueStateV1 = { ...f };
          for (const imp of impacts) {
            nextFatigue[imp.muscle] = clamp0to100(
              nextFatigue[imp.muscle] + imp.delta,
            );
          }
          return nextFatigue;
        });
      }

      const nowAllDone =
        exercises.length > 0 &&
        exercises.every((ex) => nextCompleted[ex.slug] === true);
      if (nowAllDone) {
        skipRest();
        setActiveIndex(null);
      } else {
        startRest(60_000);
        advanceToNext(nextCompleted);
      }

      return nextCompleted;
    });
  }

  return (
    <div className="flex min-h-dvh justify-center bg-black">
      <div className="relative mx-auto flex min-h-dvh w-full max-w-[430px] flex-col bg-black md:shadow-[0_0_60px_rgba(57,255,20,0.04)]">
        <div
          className="pointer-events-none absolute inset-x-0 top-0 z-10 h-px bg-gradient-to-r from-transparent via-[#39ff14]/50 to-transparent"
          aria-hidden
        />

        <header className="shrink-0  bg-black/95 px-5 pb-5 pt-[max(1rem,env(safe-area-inset-top))] backdrop-blur-sm">
        <Link
  href="/"
  className="mb-4 inline-flex items-center gap-2 text-zinc-400 transition hover:text-white"
>
  ← Back
</Link>
<h1 className="heading-font text-[1.7rem] font-semibold tracking-tight text-[#39ff14]">
{title.charAt(0).toUpperCase() + title.slice(1)} Exercises
</h1>

<p className="mt-2 text-sm leading-relaxed text-zinc-400">
Choose the area to train
</p>

        </header>

        <main className="flex-1 overflow-y-auto overscroll-y-contain scroll-smooth px-5 pt-2 pb-[max(5.5rem,env(safe-area-inset-bottom))]">
        <section className="space-y-3">

  {workoutData?.sections && (
  <div className="space-y-4">
    {workoutData.sections.map((section) => (
      <Link
        key={section.slug}
        href={`/workout/${slug}/${section.slug}`}
        className="
          flex items-center justify-between
          rounded-2xl bg-[#111]
          px-4 py-5
          transition-all duration-200
          hover:scale-[1.02]
          hover:ring-1 hover:ring-[#39ff14]/40
        "
      >
        <div className="flex-1">
  <h2 className="text-[20px] font-medium text-white">
    {section.title}
  </h2>

  <p className="text-lime-400 text-sm mt-2 font-medium">
  {section.exerciseCount} Exercises
</p>
</div>

        <img
          src={section.image}
          alt={section.title}
          className="h-32 w-32 rounded-lg object-cover"
        />
      </Link>
    ))}
  </div>
)}
</section>

<div className="mt-5">
  <Link
    href="/history"
    className="block w-full rounded-2xl bg-[#111] border border-[#222] py-4 text-center text-white transition-all hover:border-[#39ff14]/40"
  >
    Workout History
  </Link>
</div>

</main>

<RestTimerModal
  open={rest.open}
  remainingMs={rest.remainingMs}
  durationMs={rest.durationMs}
  onSkip={skipRest}
/>
</div>
</div>
);
}
