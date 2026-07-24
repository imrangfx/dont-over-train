"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { User as SupabaseUser } from "@supabase/supabase-js";
import {
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
import ConfirmationModal from "@/components/ui/ConfirmationModal";
import SectionHeader from "@/components/ui/SectionHeader";
import {
  SettingButton,
  SettingLink,
  SettingRow,
} from "@/components/ui/SettingRow";
import { useToast } from "@/components/ui/Toast";

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
  const { toast } = useToast();
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [lastSynced, setLastSynced] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);

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
    setBusy(true);
    try {
      await supabase.auth.signOut();
      localStorage.removeItem("hasSeenOnboarding");
      setUser(null);
      toast("Signed out successfully");
      router.replace("/");
    } finally {
      setBusy(false);
    }
  };

  const handleExport = async () => {
    setBusy(true);
    try {
      const { history, error } = await loadWorkoutHistory();
      if (error) {
        toast("Couldn't export workouts. Please try again.", "error");
        return;
      }
      if (history.length === 0) {
        toast("No workouts to export.", "error");
        return;
      }
      exportHistoryAsCsv(history);
      setLastSynced(getLastSyncedAt());
      toast("History exported");
    } finally {
      setBusy(false);
    }
  };

  const handleConfirmDelete = async () => {
    setBusy(true);
    try {
      const { error } = await deleteAllWorkoutHistory();
      if (error) {
        toast("Couldn't delete workout history. Please try again.", "error");
        return;
      }
      setConfirmDeleteOpen(false);
      toast("History cleared");
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="min-h-screen bg-black px-6 py-8 pb-[calc(72px+env(safe-area-inset-bottom)+1.5rem)] text-white animate-[fade-in_200ms_ease-out]">
      <div className="mx-auto w-full max-w-[390px]">

        <Link
          href="/profile"
          className="btn-base inline-flex items-center gap-1 rounded-lg text-zinc-400 hover:text-white"
        >
          ← Profile
        </Link>

        <h1 className="mt-6 text-4xl font-bold">
          Settings
        </h1>

        <p className="mt-2 text-zinc-500">
          Manage your account and app preferences
        </p>

        <section className="mt-8" aria-labelledby="account-heading">
          <SectionHeader id="account-heading" title="Account" />
          <div className="card-surface overflow-hidden divide-y divide-zinc-800">
            <SettingRow
              icon={<User size={18} />}
              label="Account"
              value={user?.email || "Guest mode"}
            />
          </div>
        </section>

        <section className="mt-8" aria-labelledby="sync-heading">
          <SectionHeader id="sync-heading" title="Backup & Sync" />
          <div className="card-surface overflow-hidden divide-y divide-zinc-800">
            <SettingRow
              icon={<Cloud size={18} />}
              label="Sync status"
              value={user ? "Cloud sync enabled" : "Local only"}
            />
            <SettingRow
              icon={<Cloud size={18} />}
              label="Last synced"
              value={user ? formatLastSynced(lastSynced) : "—"}
            />
          </div>
        </section>

        <section className="mt-8" aria-labelledby="export-heading">
          <SectionHeader id="export-heading" title="Export" />
          <div className="card-surface overflow-hidden">
            <SettingButton
              icon={<Download size={18} />}
              label="Export Workout History"
              onClick={handleExport}
              disabled={busy}
            />
          </div>
        </section>

        <section className="mt-8" aria-labelledby="danger-heading">
          <SectionHeader id="danger-heading" title="Danger Zone" />
          <div className="overflow-hidden rounded-2xl border border-red-500/40 bg-red-500/5">
            <p className="border-b border-red-500/20 px-4 py-3 text-sm leading-6 text-red-300/90">
              Deleting your workout history permanently removes all saved
              workouts. This cannot be undone.
            </p>
            <SettingButton
              icon={<Trash2 size={18} />}
              label="Delete Workout History"
              onClick={() => setConfirmDeleteOpen(true)}
              disabled={busy}
              danger
            />
          </div>
        </section>

        <section className="mt-8" aria-labelledby="about-heading">
          <SectionHeader id="about-heading" title="About" />
          <div className="card-surface overflow-hidden divide-y divide-zinc-800">
            <SettingRow
              icon={<FileText size={18} />}
              label="App Version"
              value="v1.0.0"
            />
            <SettingLink
              icon={<Shield size={18} />}
              label="Privacy Policy"
              href="mailto:support@dontovertrain.app?subject=Privacy%20Policy"
            />
            <SettingLink
              icon={<FileText size={18} />}
              label="Terms & Conditions"
              href="mailto:support@dontovertrain.app?subject=Terms%20%26%20Conditions"
            />
            <SettingLink
              icon={<Mail size={18} />}
              label="Contact Support"
              href={`mailto:imran.mgfx@gmail.com?subject=${encodeURIComponent("Dont Over Train Support")}&body=${encodeURIComponent(
                "Hi,\n\nI need help with Dont Over Train.\n\nIssue:\n(Describe your problem here)\n\nDevice:\nBrowser:\n\nThank you."
              )}`}
            />
          </div>
        </section>

        {user && (
          <button
            type="button"
            onClick={handleLogout}
            disabled={busy}
            className="btn-base mt-8 w-full rounded-2xl border border-red-500 py-4 font-medium text-red-400 hover:bg-red-500/10"
          >
            Sign Out
          </button>
        )}

      </div>

      <ConfirmationModal
        open={confirmDeleteOpen}
        title="Delete workout history?"
        description="This will permanently remove all of your workout history. This action cannot be undone."
        confirmLabel="Delete"
        cancelLabel="Cancel"
        danger
        showWarningIcon
        busy={busy}
        onClose={() => {
          if (!busy) setConfirmDeleteOpen(false);
        }}
        onConfirm={handleConfirmDelete}
      />

      <BottomNav />
    </main>
  );
}
