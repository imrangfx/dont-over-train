"use client";

import { useEffect, useMemo, useState } from "react";
import { ChevronDown } from "lucide-react";
import type { MuscleStatus } from "@/app/lib/recovery/recoveryTypes";
import {
  formatRecoveryPercent,
  sanitizeRecoveryPercent,
} from "@/components/recovery/buildOverallSummary";
import {
  buildBodyPartRecoveryGroups,
  type BodyPartRecoveryGroup,
} from "@/components/recovery/recoveryDashboard";

type MuscleRecoveryAccordionProps = {
  readonly muscles: readonly MuscleStatus[];
};

function MuscleRow({ status }: { status: MuscleStatus }) {
  const percent = sanitizeRecoveryPercent(status.recoveryPercent);
  const label = formatRecoveryPercent(percent);

  return (
    <div className="border-t border-zinc-800/80 py-3 first:border-t-0">
      <div className="flex items-center justify-between gap-3">
        <p className="min-w-0 truncate text-sm font-medium text-white">
          {status.muscle}
        </p>
        <div className="flex shrink-0 items-center gap-2">
          <span
            className="text-sm font-bold tabular-nums"
            style={{ color: status.color }}
          >
            {label}%
          </span>
          <span
            className="rounded-md px-2 py-0.5 text-[10px] font-semibold"
            style={{
              color: status.color,
              backgroundColor: `${status.color}22`,
            }}
          >
            {status.label}
          </span>
        </div>
      </div>

      <div
        className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-zinc-800"
        role="progressbar"
        aria-valuenow={percent}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`${status.muscle} recovery`}
      >
        <div
          className="h-full rounded-full transition-all duration-300"
          style={{ width: `${percent}%`, backgroundColor: status.color }}
        />
      </div>
    </div>
  );
}

function BodyPartGroupCard({
  group,
  open,
  onToggle,
}: {
  group: BodyPartRecoveryGroup;
  open: boolean;
  onToggle: () => void;
}) {
  const panelId = `muscle-group-${group.bodyPart}`;

  return (
    <div className="overflow-hidden rounded-2xl border border-zinc-800/90 bg-[#111] shadow-[0_8px_24px_rgba(0,0,0,0.3)]">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        aria-controls={panelId}
        className="btn-base flex w-full items-center gap-3 px-4 py-3.5 text-left"
      >
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-sm font-bold uppercase tracking-[0.12em] text-white">
              {group.bodyPart}
            </h3>
            <span className="text-xs text-zinc-500">
              {group.muscles.length} muscle
              {group.muscles.length === 1 ? "" : "s"}
            </span>
          </div>
        </div>

        <span
          className="shrink-0 rounded-md px-2 py-1 text-[10px] font-semibold"
          style={{
            color: group.worstColor,
            backgroundColor: `${group.worstColor}22`,
          }}
        >
          {group.worstLabel}
        </span>

        <ChevronDown
          size={18}
          className={`shrink-0 text-zinc-500 transition-transform duration-300 ease-out ${
            open ? "rotate-180" : "rotate-0"
          }`}
          aria-hidden="true"
        />
      </button>

      <div
        id={panelId}
        className={`grid transition-[grid-template-rows] duration-300 ease-out ${
          open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
        }`}
      >
        <div className="min-h-0 overflow-hidden">
          <div className="border-t border-zinc-800 px-4 pb-2">
            {group.muscles.map((status) => (
              <MuscleRow key={status.muscle} status={status} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function MuscleRecoveryAccordion({
  muscles,
}: MuscleRecoveryAccordionProps) {
  const groups = useMemo(() => buildBodyPartRecoveryGroups(muscles), [muscles]);
  const [openParts, setOpenParts] = useState<ReadonlySet<string>>(new Set());
  const [didInit, setDidInit] = useState(false);

  useEffect(() => {
    if (didInit || groups.length === 0) return;
    queueMicrotask(() => {
      setOpenParts(new Set([groups[0].bodyPart]));
      setDidInit(true);
    });
  }, [groups, didInit]);

  if (groups.length === 0) return null;

  const allOpen = openParts.size === groups.length;

  function togglePart(bodyPart: string) {
    setOpenParts((prev) => {
      const next = new Set(prev);
      if (next.has(bodyPart)) next.delete(bodyPart);
      else next.add(bodyPart);
      return next;
    });
  }

  function toggleAll() {
    if (allOpen) {
      setOpenParts(new Set());
      return;
    }
    setOpenParts(new Set(groups.map((group) => group.bodyPart)));
  }

  return (
    <section aria-labelledby="muscle-recovery-heading">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h2
          id="muscle-recovery-heading"
          className="text-lg font-semibold tracking-tight text-white"
        >
          Muscle Recovery
        </h2>

        <button
          type="button"
          onClick={toggleAll}
          className="btn-base inline-flex items-center gap-1 text-sm font-medium text-lime-400 hover:text-lime-300"
        >
          {allOpen ? "Collapse all" : "Expand all"}
          <ChevronDown
            size={16}
            className={`transition-transform duration-300 ${allOpen ? "rotate-180" : ""}`}
            aria-hidden="true"
          />
        </button>
      </div>

      <div className="space-y-3">
        {groups.map((group) => (
          <BodyPartGroupCard
            key={group.bodyPart}
            group={group}
            open={openParts.has(group.bodyPart)}
            onToggle={() => togglePart(group.bodyPart)}
          />
        ))}
      </div>
    </section>
  );
}
