"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  CircleUserRound,
  Flame,
  Trophy,
  Dumbbell,
  Activity,
  Lock,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { loadPublicFriendProfile, type PublicFriendProfile } from "@/lib/profilePublic";
import {
  acceptFriendRequest,
  cancelFriendRequest,
  declineFriendRequest,
  loadFriendGraph,
  removeFriend,
  sendFriendRequest,
} from "@/lib/friendService";
import { emptyFriendGraph, getFriendDisplayName, getRelationshipStatus, type FriendGraph } from "@/lib/friends";
import EmptyState from "@/components/ui/EmptyState";
import LoadingCard from "@/components/ui/LoadingCard";
import ConfirmationModal from "@/components/ui/ConfirmationModal";
import { useToast } from "@/components/ui/Toast";

export default function FriendProfilePage() {
  const params = useParams();
  const id = params.id as string;
  const { toast } = useToast();

  const [viewerId, setViewerId] = useState<string | null>(null);
  const [graph, setGraph] = useState<FriendGraph>(emptyFriendGraph());
  const [profile, setProfile] = useState<PublicFriendProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [confirmRemove, setConfirmRemove] = useState(false);

  useEffect(() => {
    let active = true;

    async function load() {
      const [{ data: session }, graphResult] = await Promise.all([
        supabase.auth.getSession(),
        loadFriendGraph(),
      ]);

      if (!active) return;

      const currentViewerId = session.session?.user?.id ?? null;
      const currentStatus = getRelationshipStatus(currentViewerId, id, graphResult.graph);
      const canViewStats = currentStatus === "self" || currentStatus === "friends";

      const profileResult = await loadPublicFriendProfile(id, canViewStats);
      if (!active) return;

      setViewerId(currentViewerId);
      setGraph(graphResult.graph);
      setProfile(profileResult.profile);
      setError(profileResult.error);
      setLoading(false);
    }

    load();

    return () => {
      active = false;
    };
  }, [id]);

  // Re-runs the same load used on mount - needed after accept/decline/remove
  // so a just-unlocked (or just-locked) relationship immediately refetches
  // stats with the correct canViewStats flag, instead of leaving stale data.
  async function refreshAfterRelationshipChange() {
    const { graph: loadedGraph } = await loadFriendGraph();
    const newStatus = getRelationshipStatus(viewerId, id, loadedGraph);
    const canViewStats = newStatus === "self" || newStatus === "friends";

    const profileResult = await loadPublicFriendProfile(id, canViewStats);
    setGraph(loadedGraph);
    setProfile(profileResult.profile);
    setError(profileResult.error);
  }

  const status = getRelationshipStatus(viewerId, id, graph);
  const displayName = profile ? getFriendDisplayName(profile.profile) : "";

  const handleAdd = async () => {
    setBusy(true);
    const { error: sendError } = await sendFriendRequest(id);
    setBusy(false);
    if (sendError) {
      toast(sendError, "error");
      return;
    }
    toast("Friend request sent");
    refreshAfterRelationshipChange();
  };

  const handleCancel = async () => {
    setBusy(true);
    const { error: cancelError } = await cancelFriendRequest(id);
    setBusy(false);
    if (cancelError) {
      toast(cancelError, "error");
      return;
    }
    toast("Request cancelled");
    refreshAfterRelationshipChange();
  };

  const handleAccept = async () => {
    setBusy(true);
    const { error: acceptError } = await acceptFriendRequest(id);
    setBusy(false);
    if (acceptError) {
      toast(acceptError, "error");
      return;
    }
    toast("Friend request accepted");
    refreshAfterRelationshipChange();
  };

  const handleDecline = async () => {
    setBusy(true);
    const { error: declineError } = await declineFriendRequest(id);
    setBusy(false);
    if (declineError) {
      toast(declineError, "error");
      return;
    }
    toast("Request declined");
    refreshAfterRelationshipChange();
  };

  const handleConfirmRemove = async () => {
    setBusy(true);
    const { error: removeError } = await removeFriend(id);
    setBusy(false);
    setConfirmRemove(false);
    if (removeError) {
      toast(removeError, "error");
      return;
    }
    toast("Friend removed");
    refreshAfterRelationshipChange();
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-black px-6 py-8 text-white">
        <div className="mx-auto max-w-[390px] space-y-4">
          <LoadingCard rows={2} />
          <LoadingCard rows={4} />
        </div>
      </main>
    );
  }

  if (error || !profile) {
    return (
      <main className="min-h-screen bg-black px-6 py-8 text-white">
        <div className="mx-auto max-w-[390px]">
          <EmptyState
            icon={<CircleUserRound size={22} />}
            title="Profile not found"
            description="This user may not exist or their profile is unavailable."
          />
          <Link
            href="/friends"
            className="btn-base mt-6 inline-flex items-center gap-2 rounded-lg text-zinc-400 hover:text-white"
          >
            <ArrowLeft size={18} aria-hidden="true" />
            ← Friends
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black px-6 py-8 pb-12 text-white animate-[fade-in_200ms_ease-out]">
      <div className="mx-auto max-w-[390px]">
        <Link
          href="/friends"
          className="btn-base inline-flex items-center gap-2 rounded-lg text-zinc-400 hover:text-white"
        >
          <ArrowLeft size={18} aria-hidden="true" />
          ← Friends
        </Link>

        {/* Header */}
        <div className="mt-6 flex items-center gap-4">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-full border border-zinc-800 bg-zinc-900">
            {profile.profile.avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={profile.profile.avatarUrl} alt="" className="h-full w-full object-cover" />
            ) : (
              <CircleUserRound size={38} className="text-[#39ff14]" aria-hidden="true" />
            )}
          </div>

          <div className="min-w-0 flex-1">
            <h1 className="truncate text-2xl font-bold">{displayName}</h1>
            {profile.canViewStats && profile.level ? (
              <p className="mt-1 text-sm" style={{ color: profile.level.color }}>
                Level {profile.level.level} • {profile.level.title}
              </p>
            ) : (
              <p className="mt-1 text-sm text-zinc-500">Add as a friend to view stats</p>
            )}
          </div>
        </div>

        {/* Relationship action */}
        <div className="mt-5">
          {status === "self" ? null : status === "friends" ? (
            <button
              type="button"
              disabled={busy}
              onClick={() => setConfirmRemove(true)}
              className="btn-base w-full rounded-2xl border border-zinc-700 py-3 text-sm font-medium text-zinc-300 hover:border-red-500 hover:text-red-400 disabled:opacity-50"
            >
              Remove Friend
            </button>
          ) : status === "request_sent" ? (
            <button
              type="button"
              disabled={busy}
              onClick={handleCancel}
              className="btn-base w-full rounded-2xl border border-zinc-700 py-3 text-sm font-medium text-zinc-300 hover:border-red-500 hover:text-red-400 disabled:opacity-50"
            >
              Cancel Request
            </button>
          ) : status === "request_received" ? (
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                disabled={busy}
                onClick={handleAccept}
                className="btn-base rounded-2xl bg-lime-400 py-3 text-sm font-semibold text-black disabled:opacity-50"
              >
                Accept
              </button>
              <button
                type="button"
                disabled={busy}
                onClick={handleDecline}
                className="btn-base rounded-2xl border border-zinc-700 py-3 text-sm font-medium text-zinc-300 disabled:opacity-50"
              >
                Decline
              </button>
            </div>
          ) : (
            <button
              type="button"
              disabled={busy || !viewerId}
              onClick={handleAdd}
              className="btn-base w-full rounded-2xl bg-lime-400 py-3 text-sm font-semibold text-black hover:bg-lime-300 disabled:opacity-50"
            >
              {viewerId ? "Add Friend" : "Sign in to add friends"}
            </button>
          )}
        </div>

        {!profile.canViewStats || !profile.level ? (
          <div className="card-surface mt-6 p-6 text-center">
            <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-zinc-900 text-lime-400">
              <Lock size={20} aria-hidden="true" />
            </div>
            <p className="font-semibold text-white">Stats are for friends only</p>
            <p className="mt-2 text-sm leading-6 text-zinc-500">
              Add {displayName} as a friend to see their Level, streak, personal records, and workout stats.
            </p>
          </div>
        ) : (
          <>
            {/* Level card */}
            <div
              className="card-surface mt-6 p-5"
              style={{
                background:
                  "linear-gradient(135deg, rgba(17,17,17,1) 0%, rgba(17,17,17,1) 60%, rgba(57,255,20,0.06) 100%)",
              }}
            >
              <div className="h-2.5 w-full overflow-hidden rounded-full bg-zinc-800">
                <div
                  className="h-full rounded-full"
                  style={{ width: `${profile.level.progressPercent}%`, backgroundColor: profile.level.color }}
                />
              </div>
              <div className="mt-2 flex items-center justify-between text-xs text-zinc-500">
                <span>{profile.level.progressPercent}%</span>
                <span>
                  {profile.level.nextLevel ? `Next: ${profile.level.nextLevel.title}` : "Max Level"}
                </span>
              </div>
            </div>

            {/* Stats grid */}
            <div className="mt-6 grid grid-cols-2 gap-4">
              <StatTile icon={<Flame size={20} />} title="Current Streak" value={`${profile.currentStreak} Days`} />
              <StatTile icon={<Dumbbell size={20} />} title="Total Workouts" value={String(profile.totalWorkouts)} />
              <StatTile
                icon={<Trophy size={20} />}
                title={profile.highestPR ? `Highest PR • ${profile.highestPR.exerciseName}` : "Highest PR"}
                value={profile.highestPR ? `${profile.highestPR.weight} kg` : "-"}
              />
              <StatTile
                icon={<Activity size={20} />}
                title="Achievements"
                value="0"
              />
            </div>

            {/* Workout stats */}
            <div className="card-surface mt-6 p-5">
              <h2 className="text-lg font-semibold">Workout Statistics</h2>
              <div className="mt-4 space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-zinc-400">Last Workout</span>
                  <span className="font-semibold text-white">{profile.lastWorkoutDate || "-"}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-zinc-400">Most Trained Muscle</span>
                  <span className="font-semibold text-white">{profile.insights?.mostTrainedMuscle}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-zinc-400">Best Workout Score</span>
                  <span className="font-semibold text-white">
                    {profile.insights?.bestWorkoutScore === "-" ? "-" : `${profile.insights?.bestWorkoutScore} Points`}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-zinc-400">Total Sets</span>
                  <span className="font-semibold text-white">{profile.insights?.totalSets}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-zinc-400">Total Reps</span>
                  <span className="font-semibold text-white">{profile.insights?.totalReps}</span>
                </div>
              </div>
            </div>

            {/* Recent PRs */}
            <div className="card-surface mt-6 p-5">
              <h2 className="text-lg font-semibold">Recent Personal Records</h2>

              {profile.recentPersonalRecords.length === 0 ? (
                <p className="mt-3 text-sm text-zinc-500">No personal records yet.</p>
              ) : (
                <div className="mt-4 space-y-3">
                  {profile.recentPersonalRecords.map((record) => (
                    <div key={record.exerciseName} className="flex items-center justify-between text-sm">
                      <span className="min-w-0 truncate text-zinc-300">{record.exerciseName}</span>
                      <span className="shrink-0 font-semibold text-lime-400">{record.weight} kg</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>

      <ConfirmationModal
        open={confirmRemove}
        title="Remove friend?"
        description={`${displayName} will be removed from your friends list.`}
        confirmLabel="Remove"
        danger
        busy={busy}
        onConfirm={handleConfirmRemove}
        onClose={() => setConfirmRemove(false)}
      />
    </main>
  );
}

function StatTile({ icon, title, value }: { icon: React.ReactNode; title: string; value: string }) {
  return (
    <div className="card-surface p-4">
      <div className="text-lime-400" aria-hidden="true">
        {icon}
      </div>
      <div className="mt-4 text-2xl font-bold">{value}</div>
      <div className="mt-1 text-sm text-zinc-500">{title}</div>
    </div>
  );
}
