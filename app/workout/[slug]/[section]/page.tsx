"use client";
import { chest } from "@/app/Data/chest";
import { back } from "@/app/Data/back";
import { biceps } from "@/app/Data/biceps";
import { triceps } from "@/app/Data/triceps";
import { shoulders } from "@/app/Data/shoulders";
import { legs } from "@/app/Data/legs";
import { abs } from "@/app/Data/abs";
import { forearms } from "@/app/Data/forearms";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname, useParams } from "next/navigation";
import Image from "next/image";
import { ArrowUpDown } from "lucide-react";
import LoadingScreen from "@/components/ui/LoadingScreen";
import { useMinimumLoadingDelay } from "@/lib/hooks/useMinimumLoadingDelay";
import { loadWorkoutHistory, type WorkoutHistoryEntry } from "@/lib/workouts";
import { countExercisePerformances } from "@/lib/exerciseAnalytics";

type Exercise = {
  name: string;
  section: string;
  fatigue: Record<string, number>;
};

type SortOption = "recommended" | "mostPerformed" | "az";

const SORT_STORAGE_KEY = "exerciseSortOption";

const SORT_OPTIONS: { id: SortOption; label: string }[] = [
  { id: "recommended", label: "Recommended" },
  { id: "mostPerformed", label: "Most Performed" },
  { id: "az", label: "A → Z" },
];

export default function SectionPage() {
  const [search, setSearch] = useState("");
  const [sortOption, setSortOption] = useState<SortOption>("recommended");
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [history, setHistory] = useState<WorkoutHistoryEntry[]>([]);

  const pathname = usePathname();

  const params = useParams<{ slug: string; section: string }>();

  const isLoading = useMinimumLoadingDelay();

  // Sort preference is remembered only for the current app session (not
  // persisted across app restarts) - sessionStorage is read after mount so
  // the client's first render still matches the server-rendered "recommended"
  // default and never causes a hydration mismatch.
  useEffect(() => {
    const stored = sessionStorage.getItem(SORT_STORAGE_KEY);
    if (stored === "recommended" || stored === "mostPerformed" || stored === "az") {
      queueMicrotask(() => setSortOption(stored));
    }
  }, []);

  useEffect(() => {
    let active = true;

    loadWorkoutHistory().then((result) => {
      if (!active) return;
      setHistory(result.history);
    });

    return () => {
      active = false;
    };
  }, []);

  function handleSelectSort(option: SortOption) {
    setSortOption(option);
    sessionStorage.setItem(SORT_STORAGE_KEY, option);
    setShowSortMenu(false);
  }

  if (isLoading) {
    return (
      <LoadingScreen
        title="Before You Start"
        message="For most workouts, limit yourself to 1–2 exercises per muscle area (e.g. Upper Chest, Mid Chest, Lower Chest) to help reduce unnecessary fatigue."
      />
    );
  }

  const slug = params.slug;

  const section = params.section || "upper-chest";

  const title = section
    .split("-")
    .map(
      (word) =>
        word.charAt(0).toUpperCase() + word.slice(1)
    )
    .join(" ");

  const DATABASE = {
    chest,
    back,
    biceps,
    triceps,
    shoulders,
    legs,
    abs,
    forearms,
  };

  const allExercises = (DATABASE[
    slug as keyof typeof DATABASE
  ] || {}) as Record<string, Exercise>;

  // "Recommended" = the existing/natural exercise order - no sort applied.
  const recommendedExercises = Object.entries(allExercises)
    .filter(([, exercise]) => exercise.section === section)
    .filter(([, exercise]) =>
      exercise.name.toLowerCase().includes(search.toLowerCase())
    );

  let filteredExercises = recommendedExercises;

  if (sortOption === "az") {
    filteredExercises = [...recommendedExercises].sort((a, b) =>
      a[1].name.localeCompare(b[1].name)
    );
  } else if (sortOption === "mostPerformed") {
    filteredExercises = recommendedExercises
      .map((entry, index) => ({
        entry,
        index,
        count: countExercisePerformances(entry[1].name, history),
      }))
      // Ties fall back to the Recommended order (original index).
      .sort((a, b) => b.count - a.count || a.index - b.index)
      .map((item) => item.entry);
  }

  return (
    <main className="min-h-dvh bg-black px-6 pt-4 pb-8 text-white">
      <div className="mx-auto w-full max-w-[430px]">
        <Link
          href={`/workout/${slug}`}
          className="btn-base mb-6 inline-flex items-center gap-2 rounded-lg text-zinc-400 hover:text-white"
        >
          ← Back
        </Link>

        <h1 className="heading-font text-[1.7rem] font-semibold tracking-tight text-[#39ff14]">
          {title}
        </h1>

        <div className="mt-6 flex items-center gap-2">
          <input
            type="text"
            placeholder="Search exercises..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Search exercises"
            className="w-full flex-1 rounded-2xl bg-[#111] px-4 py-4 text-white placeholder:text-zinc-500 outline-none focus:ring-2 focus:ring-lime-400"
          />

          <div className="relative shrink-0">
            <button
              type="button"
              onClick={() => setShowSortMenu((value) => !value)}
              aria-haspopup="listbox"
              aria-expanded={showSortMenu}
              aria-label="Sort exercises"
              className="btn-base flex items-center gap-1.5 rounded-2xl border border-transparent bg-[#111] px-4 py-4 text-sm font-medium text-zinc-300 hover:border-lime-400"
            >
              <ArrowUpDown size={16} aria-hidden="true" />
              Sort
            </button>

            {showSortMenu && (
              <div
                role="listbox"
                aria-label="Sort options"
                className="absolute right-0 z-50 mt-2 w-48 rounded-xl border border-zinc-800 bg-[#111] p-2 animate-[fade-in_160ms_ease-out]"
              >
                {SORT_OPTIONS.map((option) => (
                  <button
                    key={option.id}
                    type="button"
                    role="option"
                    aria-selected={sortOption === option.id}
                    onClick={() => handleSelectSort(option.id)}
                    className={`btn-base block w-full rounded-lg px-3 py-2 text-left text-sm ${
                      sortOption === option.id
                        ? "bg-lime-400 text-black"
                        : "text-zinc-300 hover:bg-zinc-800"
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="mt-6 space-y-4">
          {filteredExercises.length === 0 && (
            <div className="rounded-2xl bg-[#111] px-4 py-10 text-center">
              <p className="text-sm text-zinc-400">
                {search
                  ? `No exercises match "${search}".`
                  : "No exercises found for this section."}
              </p>
            </div>
          )}

          {filteredExercises.map(([slug, exercise]) => {
              const muscles = Object.entries(exercise.fatigue).sort(
                (a, b) => b[1] - a[1]
              );


              const primary = muscles[0];
              const secondary = muscles[1];

              return (
                <Link
                  key={exercise.name}
                  href={`/exercise/${slug}?from=${encodeURIComponent(pathname)}`}
                  className="block rounded-3xl bg-[#111] p-4 transition hover:bg-[#161616]"
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-medium">
                        {exercise.name}
                      </h3>

                      <div className="mt-3">
                        <div className="mt-3 flex flex-wrap gap-2">

                          {primary && (
                            <span className="rounded-full bg-lime-500 px-3 py-1 text-xs font-medium text-black">
                              {primary[0]
                                .replace(/([A-Z])/g, " $1")
                                .replace(/^./, s => s.toUpperCase())}
                            </span>
                          )}

                          {secondary && (
                            <span className="rounded-full bg-yellow-400 px-3 py-1 text-xs font-medium text-black">
                              {secondary[0]
                                .replace(/([A-Z])/g, " $1")
                                .replace(/^./, s => s.toUpperCase())}
                            </span>
                          )}

                        </div>
                      </div>
                    </div>

                    <Image
                      src={`/exercises/${slug}.webp`}
                      alt={exercise.name}
                      width={90}
                      height={90}
                      className="h-20 w-20 rounded-xl object-cover"
                    />
                  </div>
                </Link>
              );
            })}
        </div>
      </div>
    </main>
  );
}