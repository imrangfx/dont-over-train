"use client";

import Image from "next/image";
import Link from "next/link";
import { workouts } from "@/app/Data/workouts";

export default function WorkoutClient({
  slug,
  title,
}: {
  slug: string;
  title: string;
}) {
  const workoutData = workouts[slug as keyof typeof workouts];
  const sections = workoutData?.sections ?? [];

  return (
    <div className="flex min-h-dvh justify-center bg-black">
      <div className="relative mx-auto flex min-h-dvh w-full max-w-[430px] flex-col bg-black md:shadow-[0_0_60px_rgba(57,255,20,0.04)]">
        <div
          className="pointer-events-none absolute inset-x-0 top-0 z-10 h-px bg-gradient-to-r from-transparent via-[#39ff14]/50 to-transparent"
          aria-hidden="true"
        />

        <header className="shrink-0 bg-black/95 px-5 pb-5 pt-[max(1rem,env(safe-area-inset-top))] backdrop-blur-sm">
          <Link
            href="/"
            className="btn-base mb-4 inline-flex items-center gap-2 rounded-lg text-zinc-400 hover:text-white"
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
            {sections.length > 0 ? (
              <div className="space-y-4">
                {sections.map((section) => (
                  <Link
                    key={section.slug}
                    href={`/workout/${slug}/${section.slug}`}
                    className="btn-base flex items-center justify-between rounded-2xl bg-[#111] px-4 py-5 transition-all duration-200 hover:scale-[1.02] hover:ring-1 hover:ring-[#39ff14]/40"
                  >
                    <div className="flex-1">
                      <h2 className="text-[20px] font-medium text-white">
                        {section.title}
                      </h2>

                      <p className="text-lime-400 text-sm mt-2 font-medium">
                        {section.exerciseCount} Exercises
                      </p>
                    </div>

                    <Image
                      src={section.image}
                      alt={section.title}
                      width={128}
                      height={128}
                      className="h-32 w-32 rounded-lg object-cover"
                    />
                  </Link>
                ))}
              </div>
            ) : (
              <div className="rounded-2xl bg-[#111] px-4 py-10 text-center">
                <p className="text-sm text-zinc-400">
                  No sections found for this muscle group.
                </p>
              </div>
            )}
          </section>

          <div className="mt-5">
            <Link
              href="/history"
              className="btn-base block w-full rounded-2xl border border-[#222] bg-[#111] py-4 text-center text-white transition-all hover:border-[#39ff14]/40"
            >
              Workout History
            </Link>
          </div>
        </main>
      </div>
    </div>
  );
}
