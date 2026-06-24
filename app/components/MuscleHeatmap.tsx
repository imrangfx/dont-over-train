"use client";

import { motion } from "framer-motion";

export type HeatmapMuscleKey =
  | "chest"
  | "shoulders"
  | "biceps"
  | "triceps"
  | "abs"
  | "forearms"
  | "quads"
  | "calves";

export type MuscleHeatmapValues = Record<HeatmapMuscleKey, number>;

function clamp0to100(n: number) {
  return Math.max(0, Math.min(100, n));
}

function fatigueColor(value: number) {
  const v = clamp0to100(value);
  if (v <= 40) return "#39ff14"; // green (neon)
  if (v <= 75) return "#facc15"; // yellow
  return "#ef4444"; // red
}

function baseOpacity(value: number) {
  const v = clamp0to100(value);
  if (v <= 40) return 0.55;
  if (v <= 75) return 0.65;
  return 0.78;
}

function HeatPath({
  d,
  value,
  label,
}: {
  d: string;
  value: number;
  label: string;
}) {
  const fill = fatigueColor(value);
  const opacity = baseOpacity(value);

  return (
    <motion.path
      d={d}
      animate={{ fill, opacity }}
      initial={false}
      transition={{ duration: 0.45, ease: "easeOut" }}
      stroke="rgba(255,255,255,0.12)"
      strokeWidth="1"
      vectorEffect="non-scaling-stroke"
      aria-label={label}
    />
  );
}

export default function MuscleHeatmap({
  values,
}: {
  values: MuscleHeatmapValues;
}) {
  return (
    <div className="rounded-2xl bg-zinc-900/50 p-4 ring-1 ring-zinc-800/80">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-semibold text-white">Live heatmap</p>
        <span className="rounded-full bg-black/40 px-2.5 py-1 text-[11px] font-semibold text-[#39ff14] ring-1 ring-[#39ff14]/20">
          Fatigue
        </span>
      </div>

      <div className="mt-3 flex items-center justify-center">
        <div className="relative w-full max-w-[280px]">
          <div
            className="pointer-events-none absolute -inset-6 bg-[radial-gradient(circle_at_50%_40%,rgba(57,255,20,0.12),transparent_60%)]"
            aria-hidden
          />

          <svg
            viewBox="0 0 240 520"
            className="relative z-10 h-auto w-full"
            role="img"
            aria-label="Front body muscle fatigue heatmap"
          >
            <defs>
              <filter
                id="neonGlow"
                x="-40%"
                y="-40%"
                width="180%"
                height="180%"
              >
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feColorMatrix
                  in="blur"
                  type="matrix"
                  values="
                    1 0 0 0 0
                    0 1 0 0 0
                    0 0 1 0 0
                    0 0 0 0.55 0"
                  result="glow"
                />
                <feMerge>
                  <feMergeNode in="glow" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* silhouette (more realistic proportions) */}
            <path
              d="M120 24c18 0 31 14 31 32 0 11-5 20-12 26 21 12 36 35 36 63v34c0 17 5 30 16 44 10 12 12 27 6 41-7 18-22 28-41 28h-3v20c0 20-6 36-16 50l-5 8v55c0 12 6 26 18 42 8 10 10 23 6 35-5 14-17 23-33 25-7 1-13 1-19 1s-12 0-19-1c-16-2-28-11-33-25-4-12-2-25 6-35 12-16 18-30 18-42v-55l-5-8c-10-14-16-30-16-50v-20h-3c-19 0-34-10-41-28-6-14-4-29 6-41 11-14 16-27 16-44v-34c0-28 15-51 36-63-7-6-12-15-12-26 0-18 13-32 31-32Z"
              fill="rgba(255,255,255,0.04)"
              stroke="rgba(255,255,255,0.08)"
              strokeWidth="1"
            />

            {/* chest (pecs, L/R) */}
            <g filter="url(#neonGlow)">
              <HeatPath
                label="Chest"
                value={values.chest}
                d="M78 158c7-18 22-30 42-30s35 12 42 30c-2 20-11 36-25 46-9 6-20 9-25 17h-5c-5-8-16-11-25-17-14-10-23-26-24-46Z"
              />
            </g>

            {/* shoulders (delts, L/R) */}
            <g filter="url(#neonGlow)">
              <HeatPath
                label="Shoulders"
                value={values.shoulders}
                d="M58 150c6-18 18-29 36-35 4 8 5 18 2 27-5 16-18 28-33 33-7 2-9-11-5-25Zm124 0c4 14 2 27-5 25-15-5-28-17-33-33-3-9-2-19 2-27 18 6 30 17 36 35Z"
              />
            </g>

            {/* biceps (L/R) */}
            <g filter="url(#neonGlow)">
              <HeatPath
                label="Biceps"
                value={values.biceps}
                d="M54 224c5-18 18-28 36-30 7 17 7 34-1 49-6 10-20 12-30 4-13-10-15-17-5-23Zm132 0c10 6 8 13-5 23-10 8-24 6-30-4-8-15-8-32-1-49 18 2 31 12 36 30Z"
              />
            </g>

            {/* triceps (L/R) */}
            <g filter="url(#neonGlow)">
              <HeatPath
                label="Triceps"
                value={values.triceps}
                d="M72 252c6 10 16 16 29 18 4 16 2 31-9 42-11 11-25 8-31-6-8-20-5-38 11-54Zm96 0c16 16 19 34 11 54-6 14-20 17-31 6-11-11-13-26-9-42 13-2 23-8 29-18Z"
              />
            </g>

            {/* abs (rectus) */}
            <g filter="url(#neonGlow)">
              <HeatPath
                label="Abs"
                value={values.abs}
                d="M98 222h44c8 24 8 49 1 74-5 16-14 28-23 37-9-9-18-21-23-37-7-25-7-50 1-74Z"
              />
            </g>

            {/* forearms (L/R) */}
            <g filter="url(#neonGlow)">
              <HeatPath
                label="Forearms"
                value={values.forearms}
                d="M38 312c12-16 27-21 44-16 3 25-4 49-20 70-10 12-28 10-33-6-6-18-2-34 9-48Zm164 0c11 14 15 30 9 48-5 16-23 18-33 6-16-21-23-45-20-70 17-5 32 0 44 16Z"
              />
            </g>

            {/* quads (L/R combined block for readability) */}
            <g filter="url(#neonGlow)">
              <HeatPath
                label="Quads"
                value={values.quads}
                d="M86 340h68c8 24 10 48 7 71-3 21-15 39-31 53-16-14-28-32-31-53-3-23-1-47 7-71Z"
              />
            </g>

            {/* calves */}
            <g filter="url(#neonGlow)">
              <HeatPath
                label="Calves"
                value={values.calves}
                d="M92 420h56c6 22 6 42-2 61-7 17-19 27-26 30-7-3-19-13-26-30-8-19-8-39-2-61Z"
              />
            </g>
          </svg>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2 text-[11px] font-semibold">
        <div className="flex items-center gap-2 rounded-full bg-black/40 px-2.5 py-1 ring-1 ring-zinc-800/70">
          <span
            className="h-2.5 w-2.5 rounded-full"
            style={{ backgroundColor: "#39ff14" }}
            aria-hidden
          />
          <span className="text-zinc-200">0–40</span>
        </div>
        <div className="flex items-center gap-2 rounded-full bg-black/40 px-2.5 py-1 ring-1 ring-zinc-800/70">
          <span
            className="h-2.5 w-2.5 rounded-full"
            style={{ backgroundColor: "#facc15" }}
            aria-hidden
          />
          <span className="text-zinc-200">41–75</span>
        </div>
        <div className="flex items-center gap-2 rounded-full bg-black/40 px-2.5 py-1 ring-1 ring-zinc-800/70">
          <span
            className="h-2.5 w-2.5 rounded-full"
            style={{ backgroundColor: "#ef4444" }}
            aria-hidden
          />
          <span className="text-zinc-200">76–100</span>
        </div>
      </div>
    </div>
  );
}

