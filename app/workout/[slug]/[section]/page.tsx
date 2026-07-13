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
import { useState } from "react";
import { usePathname } from "next/navigation";
import Image from "next/image";

type Exercise = {
  name: string;
  section: string;
  fatigue: Record<string, number>;
};

export default function SectionPage() {
  const [search, setSearch] = useState("");

  const pathname = usePathname();

  const slug = pathname.split("/")[2];

  const section =
    pathname.split("/").pop() || "upper-chest";

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

  return (
    <main className="min-h-dvh bg-black px-6 pt-4 pb-8 text-white">
      <div className="mx-auto w-full max-w-[430px]">
        <Link
          href={`/workout/${slug}`}
          className="mb-6 inline-flex items-center gap-2 text-zinc-400 transition hover:text-white"
        >
          ← Back
        </Link>

        <h1 className="heading-font text-[1.7rem] font-semibold tracking-tight text-[#39ff14]">
          {title}
        </h1>

        <div className="mt-6">
          <input
            type="text"
            placeholder="Search exercises..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-2xl bg-[#111] px-4 py-4 text-white placeholder:text-zinc-500 outline-none"
          />
        </div>

        <div className="mt-6 space-y-4">
          {Object.entries(allExercises)
            .filter(([_, exercise]) => exercise.section === section)
            .filter(([_, exercise]) =>
              exercise.name
                .toLowerCase()
                .includes(search.toLowerCase())
            )
            .sort((a, b) =>
              a[1].name.localeCompare(b[1].name)
            )
            .map(([slug, exercise]) => {
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