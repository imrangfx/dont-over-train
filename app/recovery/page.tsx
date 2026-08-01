"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { BatteryCharging } from "lucide-react";
import {
  loadWorkoutHistory,
  type WorkoutHistoryEntry,
} from "@/lib/workouts";
import type { RecoveryEngineResult } from "@/app/lib/recovery";
import BottomNav from "@/components/BottomNav";
import EmptyState from "@/components/ui/EmptyState";
import LoadingCard from "@/components/ui/LoadingCard";
import SectionHeader from "@/components/ui/SectionHeader";
import OverallRecoveryCard from "@/components/recovery/OverallRecoveryCard";
import MuscleRecoveryCard from "@/components/recovery/MuscleRecoveryCard";
import RecommendationCard from "@/components/recovery/RecommendationCard";
import {
  buildOverallSummary,
  sortMusclesByLowestRecovery,
} from "@/components/recovery/buildOverallSummary";

function hasRecoverySnapshot(
  entry: WorkoutHistoryEntry | null | undefined,
): entry is WorkoutHistoryEntry & { recovery: RecoveryEngineResult } {
  return entry?.recovery != null;
}

export default function RecoveryPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [latest, setLatest] = useState<WorkoutHistoryEntry | null>(null);

  useEffect(() => {
    let active = true;

    loadWorkoutHistory().then((result) => {
      if (!active) return;

      if (result.error) {
        setError(result.error);
        setLatest(null);
      } else {
        setError(null);
        // Newest first from loadWorkoutHistory / local storage.
        setLatest(result.history[0] ?? null);
      }

      setLoading(false);
    });

    return () => {
      active = false;
    };
  }, []);

  const snapshot = hasRecoverySnapshot(latest) ? latest.recovery : null;

  const muscles = useMemo(
    () =>
      snapshot
        ? sortMusclesByLowestRecovery(snapshot.recovery)
        : [],
    [snapshot],
  );

  const recommendations = snapshot?.recommendations ?? [];

  const summary = useMemo(
    () =>
      snapshot
        ? buildOverallSummary(snapshot.recovery, snapshot.generatedAt)
        : null,
    [snapshot],
  );

  return (
    <main className="min-h-screen bg-black text-white">
      <div className="mx-auto w-full max-w-[430px] px-6 pb-[calc(72px+env(safe-area-inset-bottom)+1.5rem)] pt-8">
        <header className="mb-6">
          <h1 className="text-3xl font-bold tracking-tight">Recovery</h1>
          <p className="mt-1 text-sm text-zinc-500">Current Muscle Recovery</p>
        </header>

        {loading ? (
          <div className="space-y-4">
            <LoadingCard rows={2} />
            <LoadingCard rows={4} />
            <LoadingCard rows={3} />
          </div>
        ) : error ? (
          <EmptyState
            icon={<BatteryCharging size={22} aria-hidden="true" />}
            title="Couldn't load recovery"
            description={error}
          />
        ) : !snapshot || !summary ? (
          <div className="flex min-h-[50vh] flex-col items-center justify-center gap-5">
            <EmptyState
              icon={<BatteryCharging size={22} aria-hidden="true" />}
              title="No recovery data yet"
              description="Complete a workout to see muscle recovery."
              className="w-full"
            />
            <Link
              href="/home"
              className="btn-base w-full rounded-2xl bg-lime-400 py-4 text-center text-lg font-semibold text-black hover:brightness-110"
            >
              Start Workout
            </Link>
          </div>
        ) : (
          <div className="space-y-8">
            <OverallRecoveryCard summary={summary} />

            <section aria-labelledby="muscle-recovery-heading">
              <SectionHeader id="muscle-recovery-heading" title="Muscles" />
              <div className="space-y-3">
                {muscles.map((status) => (
                  <MuscleRecoveryCard
                    key={status.muscle}
                    status={status}
                  />
                ))}
              </div>
            </section>

            {recommendations.length > 0 && (
              <section aria-labelledby="recommendations-heading">
                <SectionHeader
                  id="recommendations-heading"
                  title="Recommendations"
                />
                <div className="space-y-3">
                  {recommendations.map((recommendation) => (
                    <RecommendationCard
                      key={recommendation.muscle}
                      recommendation={recommendation}
                    />
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </div>

      <BottomNav />
    </main>
  );
}
