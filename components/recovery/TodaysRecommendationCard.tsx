import Link from "next/link";
import type { TodaysRecommendation } from "@/components/recovery/todaysRecommendation";

type TodaysRecommendationCardProps = {
  recommendation: TodaysRecommendation;
};

export default function TodaysRecommendationCard({
  recommendation,
}: TodaysRecommendationCardProps) {
  if (recommendation.kind === "recovery-day") {
    return (
      <section
        aria-label="Today's recommendation"
        className="card-surface p-5"
      >
        <p className="text-sm font-medium text-zinc-500">Today&apos;s Recommendation</p>
        <h2 className="mt-2 text-3xl font-bold tracking-tight text-white">
          Recovery Day
        </h2>
        <p className="mt-3 text-sm leading-6 text-zinc-400">
          Your body needs recovery today. Consider walking, stretching,
          mobility work or taking a full rest day.
        </p>

        {recommendation.reasons.length > 0 ? (
          <ul className="mt-4 space-y-2">
            {recommendation.reasons.map((reason) => (
              <li
                key={reason}
                className="text-sm leading-5 text-zinc-400"
              >
                · {reason}
              </li>
            ))}
          </ul>
        ) : null}

        <Link
          href="/recovery"
          className="btn-base mt-5 flex w-full items-center justify-center rounded-2xl border border-lime-400/40 bg-lime-400/10 py-3.5 text-sm font-semibold text-lime-400 hover:bg-lime-400/15"
        >
          View Recovery
        </Link>
      </section>
    );
  }

  return (
    <section
      aria-label="Today's recommendation"
      className="card-surface p-5"
    >
      <p className="text-sm font-medium text-zinc-500">Today&apos;s Recommendation</p>

      <div className="mt-2 flex flex-wrap items-center gap-2">
        <h2 className="text-3xl font-bold tracking-tight text-white">
          {recommendation.bodyPartName}
        </h2>
        <span
          className={`rounded-full bg-black/70 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide ring-1 backdrop-blur-sm ${recommendation.badge.className}`}
        >
          {recommendation.badge.label}
        </span>
      </div>

      {recommendation.reasons.length > 0 ? (
        <ul className="mt-4 space-y-2">
          {recommendation.reasons.map((reason) => (
            <li key={reason} className="text-sm leading-5 text-zinc-400">
              · {reason}
            </li>
          ))}
        </ul>
      ) : null}

      <Link
        href={`/workout/${recommendation.bodyPartSlug}`}
        className="btn-base mt-5 flex w-full items-center justify-center rounded-2xl bg-lime-400 py-3.5 text-sm font-semibold text-black hover:brightness-110"
      >
        Start Workout
      </Link>
    </section>
  );
}
