import type { RecommendationResult } from "@/app/lib/recovery/recoveryTypes";
import { groupRecommendationsByLevel } from "@/components/recovery/recoveryDashboard";

type TodaysTrainingAdviceCardProps = {
  readonly recommendations: readonly RecommendationResult[];
};

const COLUMNS = [
  {
    level: "AVOID" as const,
    title: "Avoid",
    color: "#EF4444",
  },
  {
    level: "CAUTION" as const,
    title: "Moderate",
    color: "#F97316",
  },
  {
    level: "SAFE" as const,
    title: "Good to Train",
    color: "#22C55E",
  },
] as const;

export default function TodaysTrainingAdviceCard({
  recommendations,
}: TodaysTrainingAdviceCardProps) {
  if (recommendations.length === 0) return null;

  const grouped = groupRecommendationsByLevel(recommendations);

  return (
    <section
      aria-labelledby="training-advice-heading"
      className="rounded-3xl border border-zinc-800/90 bg-[#111] p-5 shadow-[0_10px_28px_rgba(0,0,0,0.35)]"
    >
      <div className="flex items-center justify-between gap-3">
        <h2
          id="training-advice-heading"
          className="text-lg font-semibold tracking-tight text-white"
        >
          Today&apos;s Training Advice
        </h2>
      </div>

      <p className="mt-1 text-sm text-zinc-500">
        Quick read for what to push, ease, or skip today.
      </p>

      <div className="mt-5 grid grid-cols-3 gap-3">
        {COLUMNS.map(({ level, title, color }) => {
          const items = grouped[level];

          return (
            <div key={level} className="min-w-0">
              <span
                className="inline-flex rounded-md px-2 py-1 text-[10px] font-bold uppercase tracking-wide"
                style={{ color, backgroundColor: `${color}22` }}
              >
                {title}
              </span>

              {items.length === 0 ? (
                <p className="mt-3 text-xs leading-5 text-zinc-600">None</p>
              ) : (
                <ul className="mt-3 space-y-2">
                  {items.map((item) => (
                    <li key={item.muscle} className="flex items-start gap-1.5">
                      <span
                        className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full"
                        style={{ backgroundColor: color }}
                        aria-hidden="true"
                      />
                      <span className="text-xs leading-4 text-zinc-300">
                        {item.muscle}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
