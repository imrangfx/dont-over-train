import { formatElapsedClock } from "@/lib/workoutSession";

const TIMER_SURFACE =
  "shrink-0 rounded-2xl border border-lime-400/40 bg-lime-400/10 px-3 py-2 text-right";

type WorkoutSessionTimerDisplayProps = {
  readonly elapsedMs: number;
  readonly className?: string;
};

/**
 * Visual clock used on the Workout Session page (and the global floating twin).
 * Presentation only — elapsed ms comes from the existing session timer source.
 */
export default function WorkoutSessionTimerDisplay({
  elapsedMs,
  className = "",
}: WorkoutSessionTimerDisplayProps) {
  return (
    <div
      className={`${TIMER_SURFACE}${className ? ` ${className}` : ""}`}
      aria-live="polite"
      aria-label="Workout timer"
    >
      <p className="text-[10px] font-semibold uppercase tracking-wide text-lime-400/80">
        Time
      </p>
      <p className="font-mono text-lg font-semibold tabular-nums text-lime-400">
        {formatElapsedClock(elapsedMs)}
      </p>
    </div>
  );
}
