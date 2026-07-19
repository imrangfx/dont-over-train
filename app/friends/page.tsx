"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { UserPlus, Search, Users } from "lucide-react";
import { supabase } from "@/lib/supabase";
import {
  acceptFriendRequest,
  declineFriendRequest,
  cancelFriendRequest,
  removeFriend,
  loadFriendsHub,
} from "@/lib/friendService";
import { loadPublicStrengthSummaries, type PublicStrengthSummary } from "@/lib/profilePublic";
import { getFriendDisplayName, type PublicProfile } from "@/lib/friends";
import BottomNav from "@/components/BottomNav";
import FriendCard from "@/components/FriendCard";
import EmptyState from "@/components/ui/EmptyState";
import LoadingCard from "@/components/ui/LoadingCard";
import ConfirmationModal from "@/components/ui/ConfirmationModal";
import { useToast } from "@/components/ui/Toast";

type Tab = "friends" | "pending" | "sent";

export default function FriendsPage() {
  const { toast } = useToast();
  const [user, setUser] = useState<User | null>(null);
  const [checkedAuth, setCheckedAuth] = useState(false);
  const [tab, setTab] = useState<Tab>("friends");
  const [friends, setFriends] = useState<PublicProfile[]>([]);
  const [pending, setPending] = useState<PublicProfile[]>([]);
  const [sent, setSent] = useState<PublicProfile[]>([]);
  const [summaries, setSummaries] = useState<Map<string, PublicStrengthSummary>>(new Map());
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [removeTarget, setRemoveTarget] = useState<PublicProfile | null>(null);

  useEffect(() => {
    let active = true;

    supabase.auth.getSession().then(({ data }) => {
      if (!active) return;
      setUser(data.session?.user ?? null);
      setCheckedAuth(true);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!active) return;
      setUser(session?.user ?? null);
    });

    return () => {
      active = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  async function fetchHubData() {
    const result = await loadFriendsHub();

    let summaries = new Map<string, PublicStrengthSummary>();
    if (result.friends.length > 0) {
      const { summaries: loaded } = await loadPublicStrengthSummaries(result.friends.map((f) => f.id));
      summaries = loaded;
    }

    return { ...result, summaries };
  }

  async function refresh() {
    const data = await fetchHubData();
    setFriends(data.friends);
    setPending(data.pending);
    setSent(data.sent);
    setSummaries(data.summaries);
    if (data.error) toast(data.error, "error");
    setLoading(false);
  }

  useEffect(() => {
    // Guests never render the tab content that reads `loading`, so there's
    // nothing to synchronize for that branch - only fetch once signed in.
    if (!checkedAuth || !user) return;
    let active = true;

    fetchHubData().then((data) => {
      if (!active) return;
      setFriends(data.friends);
      setPending(data.pending);
      setSent(data.sent);
      setSummaries(data.summaries);
      if (data.error) toast(data.error, "error");
      setLoading(false);
    });

    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [checkedAuth, user]);

  const handleAccept = async (senderId: string) => {
    setBusyId(senderId);
    const { error } = await acceptFriendRequest(senderId);
    setBusyId(null);
    if (error) {
      toast(error, "error");
      return;
    }
    toast("Friend request accepted");
    refresh();
  };

  const handleDecline = async (senderId: string) => {
    setBusyId(senderId);
    const { error } = await declineFriendRequest(senderId);
    setBusyId(null);
    if (error) {
      toast(error, "error");
      return;
    }
    toast("Request declined");
    refresh();
  };

  const handleCancel = async (receiverId: string) => {
    setBusyId(receiverId);
    const { error } = await cancelFriendRequest(receiverId);
    setBusyId(null);
    if (error) {
      toast(error, "error");
      return;
    }
    toast("Request cancelled");
    refresh();
  };

  const handleConfirmRemove = async () => {
    if (!removeTarget) return;
    setBusyId(removeTarget.id);
    const { error } = await removeFriend(removeTarget.id);
    setBusyId(null);
    setRemoveTarget(null);
    if (error) {
      toast(error, "error");
      return;
    }
    toast("Friend removed");
    refresh();
  };

  const handleGoogleSignIn = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: window.location.origin },
    });
    if (error) toast(error.message || "Couldn't start Google sign-in.", "error");
  };

  return (
    <main className="min-h-screen bg-black px-6 py-8 pb-[calc(72px+env(safe-area-inset-bottom)+1.5rem)] text-white animate-[fade-in_200ms_ease-out]">
      <div className="mx-auto w-full max-w-[390px]">
        <div className="flex items-center justify-between gap-4">
          <div>
            <Link
              href="/profile"
              className="btn-base inline-flex items-center gap-1 rounded-lg text-zinc-400 hover:text-white"
            >
              ← Profile
            </Link>
            <h1 className="mt-4 text-4xl font-bold">Friends</h1>
          </div>

          {user && (
            <Link
              href="/friends/search"
              aria-label="Search users"
              className="btn-base flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-zinc-800 bg-[#111] text-lime-400 hover:border-lime-400"
            >
              <Search size={20} aria-hidden="true" />
            </Link>
          )}
        </div>

        {!checkedAuth ? (
          <div className="mt-8">
            <LoadingCard rows={3} />
          </div>
        ) : !user ? (
          <div className="mt-8">
            <EmptyState
              icon={<Users size={22} />}
              title="Connect with friends"
              description="Sign in with Google to add friends and see their Progressive Overload journey."
            />
            <button
              type="button"
              onClick={handleGoogleSignIn}
              className="btn-base mt-6 w-full rounded-2xl border border-yellow-500 bg-yellow-500/5 p-5 text-left hover:bg-yellow-500/10"
            >
              <div className="flex items-center gap-3">
                <UserPlus size={20} className="shrink-0 text-yellow-400" aria-hidden="true" />
                <div>
                  <p className="font-semibold text-yellow-400">Sign in with Google</p>
                  <p className="mt-1 text-sm text-zinc-400">
                    Required to search for and add friends.
                  </p>
                </div>
              </div>
            </button>
          </div>
        ) : (
          <>
            <div
              role="tablist"
              aria-label="Friends sections"
              className="mt-6 grid grid-cols-3 gap-2 rounded-2xl border border-zinc-800 bg-[#111] p-1"
            >
              {(
                [
                  ["friends", `Friends (${friends.length})`],
                  ["pending", `Pending (${pending.length})`],
                  ["sent", `Sent (${sent.length})`],
                ] as [Tab, string][]
              ).map(([id, label]) => (
                <button
                  key={id}
                  type="button"
                  role="tab"
                  aria-selected={tab === id}
                  onClick={() => setTab(id)}
                  className={`btn-base truncate rounded-xl px-2 py-2 text-xs font-medium ${
                    tab === id ? "bg-lime-400 text-black" : "text-zinc-400 hover:text-white"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            <div className="mt-6 space-y-3">
              {loading ? (
                <>
                  <LoadingCard rows={2} />
                  <LoadingCard rows={2} />
                </>
              ) : tab === "friends" ? (
                friends.length === 0 ? (
                  <EmptyState
                    icon={<Users size={22} />}
                    title="No friends yet"
                    description="Search for people you know to send your first friend request."
                  />
                ) : (
                  friends.map((profile) => (
                    <div key={profile.id} className="group relative">
                      <FriendCard profile={profile} summary={summaries.get(profile.id)} />
                      <button
                        type="button"
                        onClick={() => setRemoveTarget(profile)}
                        aria-label={`Remove ${getFriendDisplayName(profile)} as a friend`}
                        className="btn-base absolute right-3 top-3 rounded-full bg-black/60 px-2 py-1 text-[10px] font-medium text-zinc-400 hover:text-red-400"
                      >
                        Remove
                      </button>
                    </div>
                  ))
                )
              ) : tab === "pending" ? (
                pending.length === 0 ? (
                  <EmptyState
                    icon={<UserPlus size={22} />}
                    title="No pending requests"
                    description="Friend requests sent to you will show up here."
                  />
                ) : (
                  pending.map((profile) => (
                    <div key={profile.id} className="card-surface flex items-center justify-between gap-3 p-4">
                      <span className="min-w-0 truncate font-medium text-white">
                        {getFriendDisplayName(profile)}
                      </span>
                      <div className="flex shrink-0 gap-2">
                        <button
                          type="button"
                          disabled={busyId === profile.id}
                          onClick={() => handleAccept(profile.id)}
                          className="btn-base min-h-10 rounded-full bg-lime-400 px-3 py-2.5 text-xs font-semibold text-black disabled:opacity-50"
                        >
                          Accept
                        </button>
                        <button
                          type="button"
                          disabled={busyId === profile.id}
                          onClick={() => handleDecline(profile.id)}
                          className="btn-base min-h-10 rounded-full border border-zinc-700 px-3 py-2.5 text-xs font-medium text-zinc-300 disabled:opacity-50"
                        >
                          Decline
                        </button>
                      </div>
                    </div>
                  ))
                )
              ) : sent.length === 0 ? (
                <EmptyState
                  icon={<UserPlus size={22} />}
                  title="No sent requests"
                  description="Requests you've sent will show up here until they're accepted."
                />
              ) : (
                sent.map((profile) => (
                  <div key={profile.id} className="card-surface flex items-center justify-between gap-3 p-4">
                    <span className="min-w-0 truncate font-medium text-white">
                      {getFriendDisplayName(profile)}
                    </span>
                    <button
                      type="button"
                      disabled={busyId === profile.id}
                      onClick={() => handleCancel(profile.id)}
                      className="btn-base min-h-10 shrink-0 rounded-full border border-zinc-700 px-3 py-2.5 text-xs font-medium text-zinc-300 hover:border-red-500 hover:text-red-400 disabled:opacity-50"
                    >
                      Cancel
                    </button>
                  </div>
                ))
              )}
            </div>
          </>
        )}
      </div>

      <ConfirmationModal
        open={Boolean(removeTarget)}
        title="Remove friend?"
        description={
          removeTarget
            ? `${getFriendDisplayName(removeTarget)} will be removed from your friends list.`
            : ""
        }
        confirmLabel="Remove"
        danger
        busy={busyId === removeTarget?.id}
        onConfirm={handleConfirmRemove}
        onClose={() => setRemoveTarget(null)}
      />

      <BottomNav />
    </main>
  );
}
