"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ChevronRight,
  Cloud,
  Download,
  FileText,
  Mail,
  Shield,
  Trash2,
  User,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import {
  deleteAllWorkoutHistory,
  getLastSyncedAt,
  loadWorkoutHistory,
  type WorkoutHistoryEntry,
} from "@/lib/workouts";
import BottomNav from "@/components/BottomNav";

function formatLastSynced(iso: string | null): string {
  if (!iso) return "Never";

  try {
    return new Date(iso).toLocaleString();
  } catch {
    return "Never";
  }
}

function exportHistoryAsCsv(history: WorkoutHistoryEntry[]) {
  const header = [
    "id",
    "date",
    "body_parts",
    "exercises",
    "sets",
    "reps",
    "duration_minutes",
    "score",
  ];

  const rows = history.map((workout) =>
    [
      workout.id,
      workout.date,
      (workout.bodyParts || []).join(" | "),
      workout.exercises,
      workout.sets,
      workout.reps,
      workout.durationMinutes,
      workout.score,
    ]
      .map((cell) => `"${String(cell ?? "").replace(/"/g, '""')}"`)
      .join(",")
  );

  const csv = [header.join(","), ...rows].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "workout-history.csv";
  a.click();
  URL.revokeObjectURL(url);
}

export default function SettingsPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [lastSynced, setLastSynced] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let active = true;

    async function load() {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!active) return;
      setUser(session?.user ?? null);
      setLastSynced(getLastSyncedAt());
    }

    load();

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (!active) return;
        setUser(session?.user ?? null);
        setLastSynced(getLastSyncedAt());
      }
    );

    return () => {
      active = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    localStorage.removeItem("hasSeenOnboarding");
    setUser(null);
    router.replace("/");
  };

  const handleExport = async () => {
    setBusy(true);
    try {
      const { history, error } = await loadWorkoutHistory();
      if (error) {
        alert("Couldn't export workouts. Please try again.");
        return;
      }
      if (history.length === 0) {
        alert("No workouts to export.");
        return;
      }
      exportHistoryAsCsv(history);
      setLastSynced(getLastSyncedAt());
    } finally {
      setBusy(false);
    }
  };

  const handleDeleteHistory = async () => {
    const confirmed = window.confirm(
      "Delete all workout history? This cannot be undone."
    );
    if (!confirmed) return;

    setBusy(true);
    try {
      const { error } = await deleteAllWorkoutHistory();
      if (error) {
        alert("Couldn't delete workout history. Please try again.");
        return;
      }
      alert("Workout history deleted.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="min-h-screen bg-black px-6 py-8 pb-[calc(72px+env(safe-area-inset-bottom)+1.5rem)] text-white">
      <div className="mx-auto max-w-[390px]">

        <Link
          href="/profile"
          className="inline-flex items-center gap-2 text-zinc-400 hover:text-white"
        >
          <ArrowLeft size={18} />
          Back
        </Link>

        <h1 className="mt-6 text-4xl font-bold">
          Settings
        </h1>

        <p className="mt-2 text-zinc-500">
          Manage your account and app preferences
        </p>

        {/* Account */}
        <Section title="Account">
          <SettingsRow
            icon={<User size={18} />}
            label="Account"
            value={user?.email || "Guest mode"}
          />
        </Section>

        {/* Backup & Sync */}
        <Section title="Backup & Sync">
          <SettingsRow
            icon={<Cloud size={18} />}
            label="Sync status"
            value={user ? "Cloud sync enabled" : "Local only"}
          />
          <SettingsRow
            icon={<Cloud size={18} />}
            label="Last synced"
            value={user ? formatLastSynced(lastSynced) : "—"}
          />
        </Section>

        {/* Export */}
        <Section title="Export">
          <SettingsButton
            icon={<Download size={18} />}
            label="Export Workout History"
            onClick={handleExport}
            disabled={busy}
          />
        </Section>

        {/* Data */}
        <Section title="Data">
          <SettingsButton
            icon={<Trash2 size={18} />}
            label="Delete Workout History"
            onClick={handleDeleteHistory}
            disabled={busy}
            danger
          />
        </Section>

        {/* About */}
        <Section title="About">
          <SettingsRow
            icon={<FileText size={18} />}
            label="App Version"
            value="1.0.0"
          />
          <SettingsLink
            icon={<Shield size={18} />}
            label="Privacy Policy"
            href="mailto:support@dontovertrain.app?subject=Privacy%20Policy"
          />
          <SettingsLink
            icon={<FileText size={18} />}
            label="Terms & Conditions"
            href="mailto:support@dontovertrain.app?subject=Terms%20%26%20Conditions"
          />
          <SettingsLink
            icon={<Mail size={18} />}
            label="Contact"
            href="mailto:support@dontovertrain.app"
          />
        </Section>

        {user && (
          <button
            onClick={handleLogout}
            disabled={busy}
            className="mt-8 w-full rounded-2xl border border-red-500 py-4 text-red-400 transition hover:bg-red-500/10 disabled:opacity-50"
          >
            Sign Out
          </button>
        )}

      </div>

      <BottomNav />
    </main>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mt-8">
      <h2 className="mb-3 text-sm font-medium uppercase tracking-wide text-zinc-500">
        {title}
      </h2>
      <div className="overflow-hidden rounded-2xl border border-zinc-800 bg-[#111111]">
        <div className="divide-y divide-zinc-800">
          {children}
        </div>
      </div>
    </div>
  );
}

function SettingsRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between gap-3 px-4 py-4">
      <div className="flex min-w-0 items-center gap-3">
        <div className="shrink-0 text-lime-400">
          {icon}
        </div>
        <span className="text-sm text-zinc-300">
          {label}
        </span>
      </div>
      <span className="max-w-[55%] truncate text-right text-sm font-medium text-white">
        {value}
      </span>
    </div>
  );
}

function SettingsButton({
  icon,
  label,
  onClick,
  disabled,
  danger,
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  disabled?: boolean;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="flex w-full items-center justify-between gap-3 px-4 py-4 text-left transition hover:bg-zinc-900/80 disabled:opacity-50"
    >
      <div className="flex min-w-0 items-center gap-3">
        <div className={`shrink-0 ${danger ? "text-red-400" : "text-lime-400"}`}>
          {icon}
        </div>
        <span className={`text-sm ${danger ? "text-red-400" : "text-zinc-300"}`}>
          {label}
        </span>
      </div>
      <ChevronRight size={18} className="shrink-0 text-zinc-600" />
    </button>
  );
}

function SettingsLink({
  icon,
  label,
  href,
}: {
  icon: React.ReactNode;
  label: string;
  href: string;
}) {
  return (
    <a
      href={href}
      className="flex w-full items-center justify-between gap-3 px-4 py-4 transition hover:bg-zinc-900/80"
    >
      <div className="flex min-w-0 items-center gap-3">
        <div className="shrink-0 text-lime-400">
          {icon}
        </div>
        <span className="text-sm text-zinc-300">
          {label}
        </span>
      </div>
      <ChevronRight size={18} className="shrink-0 text-zinc-600" />
    </a>
  );
}
