import { RECOVERY_STATUS } from "@/app/Data/recoveryConfig";
import type {
  RecommendationLevel,
  RecommendationResult,
} from "@/app/lib/recovery/recoveryTypes";

type RecommendationCardProps = {
  recommendation: RecommendationResult;
};

/** Map recommendation levels to existing RECOVERY_STATUS band colors. */
const LEVEL_COLOR: Record<RecommendationLevel, string> = {
  SAFE: RECOVERY_STATUS[0].color,
  CAUTION: RECOVERY_STATUS[2].color,
  AVOID: RECOVERY_STATUS[4].color,
};

const LEVEL_EMOJI: Record<RecommendationLevel, string> = {
  SAFE: "🟢",
  CAUTION: "🟡",
  AVOID: "🔴",
};

export default function RecommendationCard({
  recommendation,
}: RecommendationCardProps) {
  const color = LEVEL_COLOR[recommendation.level];
  const emoji = LEVEL_EMOJI[recommendation.level];

  return (
    <div className="card-surface p-4">
      <div className="flex items-start justify-between gap-3">
        <h3 className="min-w-0 truncate text-base font-semibold text-white">
          {recommendation.muscle}
        </h3>

        <span
          className="shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold"
          style={{
            color,
            backgroundColor: `${color}1A`,
          }}
        >
          {emoji} {recommendation.level}
        </span>
      </div>

      <p className="mt-2 text-sm leading-5 text-zinc-400">
        {recommendation.message}
      </p>
    </div>
  );
}
