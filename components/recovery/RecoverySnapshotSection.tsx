import type { RecoveryEngineResult } from "@/app/lib/recovery";
import OverallRecoveryCard from "@/components/recovery/OverallRecoveryCard";
import MuscleRecoveryCard from "@/components/recovery/MuscleRecoveryCard";
import RecommendationCard from "@/components/recovery/RecommendationCard";
import { buildOverallSummary } from "@/components/recovery/buildOverallSummary";
import SectionHeader from "@/components/ui/SectionHeader";

type RecoverySnapshotSectionProps = {
  /** Immutable saved snapshot from WorkoutHistoryEntry.recovery. */
  snapshot: RecoveryEngineResult;
};

/**
 * Read-only display of a workout's saved Recovery Engine snapshot.
 * Does not call calculateRecovery or mutate history.
 */
export default function RecoverySnapshotSection({
  snapshot,
}: RecoverySnapshotSectionProps) {
  const muscles = snapshot.recovery;
  const mostFatigued = muscles[0];
  const summary = buildOverallSummary(muscles, snapshot.generatedAt);

  return (
    <section
      aria-labelledby="recovery-snapshot-heading"
      className="mt-8 space-y-4"
    >
      <h2
        id="recovery-snapshot-heading"
        className="text-2xl font-semibold"
      >
        Recovery Snapshot
      </h2>

      <OverallRecoveryCard
        summary={summary}
        timestampLabel="Snapshot taken"
        integerPercent
      />

      {mostFatigued ? (
        <MuscleRecoveryCard
          status={mostFatigued}
          heading="Most Fatigued"
          integerPercent
        />
      ) : null}

      {snapshot.recommendations.length > 0 ? (
        <div>
          <SectionHeader title="Recommendations" />
          <div className="space-y-3">
            {snapshot.recommendations.map((recommendation) => (
              <RecommendationCard
                key={recommendation.muscle}
                recommendation={recommendation}
              />
            ))}
          </div>
        </div>
      ) : null}
    </section>
  );
}
