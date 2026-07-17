import Image from "next/image";
import Link from "next/link";
import { ViewTransition } from "react";
import { Clock3, CircleUserRound } from "lucide-react";

type BodyPart = {
  name: string;
  slug: string;
  image: string;
};

const BODY_PARTS: BodyPart[] = [
  { name: "Chest", slug: "chest", image: "/body-parts/chest.webp" },
  { name: "Back", slug: "back", image: "/body-parts/back.webp" },
  { name: "Shoulders", slug: "shoulders", image: "/body-parts/shoulders.webp" },
  { name: "Biceps", slug: "biceps", image: "/body-parts/biceps.webp" },
  { name: "Triceps", slug: "triceps", image: "/body-parts/triceps.webp" },
  { name: "Legs", slug: "legs", image: "/body-parts/legs.webp" },
  { name: "Abs", slug: "abs", image: "/body-parts/abs.webp" },
  { name: "Forearms", slug: "forearms", image: "/body-parts/forearms.webp" },
];

function BodyPartCard({ name, slug, image }: BodyPart) {
  return (
    <Link
      href={`/workout/${slug}`}
      transitionTypes={["nav-forward"]}
      className="group overflow-hidden rounded-xl bg-[#111111] border border-[#1a1a1a] transition-all duration-200 hover:border-[#39ff14] hover:shadow-[0_0_0_1px_#39ff14] active:scale-[0.98] active:border-[#39ff14] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#39ff14] focus-visible:ring-offset-2 focus-visible:ring-offset-black"
    >
      <div className="p-3">
        <div className="relative h-[140px] w-full overflow-hidden rounded-lg bg-black">
          <ViewTransition
            name={`muscle-${slug}`}
            default="none"
            share="auto"
          >
            <Image
              src={image}
              alt={name}
              fill
              className="object-cover"
              sizes="(max-width: 640px) 50vw, 180px"
            />
          </ViewTransition>
        </div>
      </div>

      <div className="pb-4">
        <h2 className="text-center text-[18px] font-normal text-white">
          {name}
        </h2>
      </div>
    </Link>
  );
}

export default function Home() {
  
  return (
    <main className="min-h-screen bg-black px-6 pt-8 pb-10 text-white">
      <div className="mx-auto w-full max-w-[390px]">
        <header className="pb-5">

          <div className="flex items-start justify-between">

            <div>
              <h1 className="heading-font text-[1.7rem] font-semibold tracking-tight text-[#39ff14]">
                DontOverTrain
              </h1>

              <p className="mt-2 text-sm leading-relaxed text-zinc-400">
                Select muscle group to train
              </p>
            </div>

            <div className="flex gap-2">

              <Link
                href="/history"
                className="rounded-xl border border-zinc-800 bg-[#111111] p-2.5 transition-all hover:border-[#39ff14]"
              >
                <Clock3 size={20} className="text-zinc-300" />
              </Link>

              <Link
                href="/profile"
                className="rounded-xl border border-zinc-800 bg-[#111111] p-2.5 transition-all hover:border-[#39ff14]"
              >
                <CircleUserRound size={20} className="text-zinc-300" />
              </Link>

            </div>

          </div>

          <div className="bg-yellow-500/5 border border-yellow-500 rounded-2xl p-4 mt-6 mb-8">

            <div className="flex items-center gap-2 mb-2">
              <span className="text-xl">⚠️</span>

              <h2 className="text-yellow-400 font-semibold">
                Warm Up First
              </h2>
            </div>

            <p className="text-zinc-300 text-sm leading-6">
              Warm up with light cardio and dynamic stretches for 5–10 minutes before every workout.
            </p>

          </div>

        </header>
        {/* Muscle cards */}

        <ViewTransition
          name="home-content"
          enter={{
            "nav-forward": "nav-forward",
            "nav-back": "nav-back",
            default: "none",
          }}
          exit={{
            "nav-forward": "nav-forward",
            "nav-back": "nav-back",
            default: "none",
          }}
          default="none"
        >
          <section
            aria-label="Muscle groups"
            className="grid grid-cols-2 gap-4"
          >
            {BODY_PARTS.map((part) => (
              <BodyPartCard key={part.name} {...part} />
            ))}
          </section>
        </ViewTransition>
      </div>
    </main>
  );
}