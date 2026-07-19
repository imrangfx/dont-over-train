"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Search, UserSearch } from "lucide-react";
import { supabase } from "@/lib/supabase";
import {
  searchUsers,
  loadFriendGraph,
  sendFriendRequest,
  cancelFriendRequest,
  acceptFriendRequest,
  declineFriendRequest,
} from "@/lib/friendService";
import { loadPublicStrengthSummaries, type PublicStrengthSummary } from "@/lib/profilePublic";
import { getRelationshipStatus, type FriendGraph, type PublicProfile } from "@/lib/friends";
import { emptyFriendGraph } from "@/lib/friends";
import BottomNav from "@/components/BottomNav";
import UserSearchResultRow from "@/components/UserSearchResultRow";
import EmptyState from "@/components/ui/EmptyState";
import LoadingCard from "@/components/ui/LoadingCard";
import { useToast } from "@/components/ui/Toast";

export default function FriendSearchPage() {
  const { toast } = useToast();
  const [userId, setUserId] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<PublicProfile[]>([]);
  const [summaries, setSummaries] = useState<Map<string, PublicStrengthSummary>>(new Map());
  const [graph, setGraph] = useState<FriendGraph>(emptyFriendGraph());
  const [loading, setLoading] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setUserId(data.session?.user?.id ?? null));
    loadFriendGraph().then(({ graph: loaded }) => setGraph(loaded));
  }, []);

  // Level/streak/PR data is friend-gated at the RLS layer, so only fetch it
  // for results the viewer is already friends with - a non-friend result
  // would otherwise come back with an empty (Level 1) default that could be
  // mistaken for their real progress.
  async function loadSummariesForFriends(profiles: PublicProfile[], currentGraph: FriendGraph) {
    const friendIds = profiles.filter((p) => currentGraph.friendIds.has(p.id)).map((p) => p.id);
    if (friendIds.length === 0) return new Map<string, PublicStrengthSummary>();
    const { summaries: loaded } = await loadPublicStrengthSummaries(friendIds);
    return loaded;
  }

  async function runSearch(value: string) {
    setLoading(true);
    const { profiles, error } = await searchUsers(value);
    if (error) toast(error, "error");

    setResults(profiles);
    setSummaries(await loadSummariesForFriends(profiles, graph));
    setLoading(false);
  }

  const handleChange = (value: string) => {
    setQuery(value);

    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (!value.trim()) {
      setResults([]);
      setSummaries(new Map());
      setLoading(false);
      return;
    }

    debounceRef.current = setTimeout(() => runSearch(value), 350);
  };

  const withBusy = async (id: string, action: () => Promise<{ error: string | null }>, successMessage: string) => {
    setBusyId(id);
    const { error } = await action();
    setBusyId(null);

    if (error) {
      toast(error, "error");
      return;
    }

    toast(successMessage);
    const { graph: loadedGraph } = await loadFriendGraph();
    setGraph(loadedGraph);
    setSummaries(await loadSummariesForFriends(results, loadedGraph));
  };

  return (
    <main className="min-h-screen bg-black px-6 py-8 pb-[calc(72px+env(safe-area-inset-bottom)+1.5rem)] text-white animate-[fade-in_200ms_ease-out]">
      <div className="mx-auto w-full max-w-[390px]">
        <Link
          href="/friends"
          className="btn-base inline-flex items-center gap-1 rounded-lg text-zinc-400 hover:text-white"
        >
          ← Friends
        </Link>

        <h1 className="mt-4 text-4xl font-bold">Find Friends</h1>
        <p className="mt-2 text-zinc-500">Search by display name.</p>

        <div className="mt-6 flex items-center gap-3 rounded-2xl border border-zinc-800 bg-[#111] px-4 py-3 transition focus-within:border-lime-400">
          <Search size={18} className="shrink-0 text-zinc-500" aria-hidden="true" />
          <input
            type="search"
            value={query}
            onChange={(event) => handleChange(event.target.value)}
            placeholder="Search by name"
            aria-label="Search users by display name"
            className="w-full bg-transparent text-white placeholder:text-zinc-500 focus:outline-none"
          />
        </div>

        <div className="mt-6 space-y-3">
          {loading ? (
            <>
              <LoadingCard rows={1} />
              <LoadingCard rows={1} />
            </>
          ) : !query.trim() ? (
            <EmptyState
              icon={<UserSearch size={22} />}
              title="Search for friends"
              description="Type a name above to find people already using the app."
            />
          ) : results.length === 0 ? (
            <EmptyState
              icon={<UserSearch size={22} />}
              title="No results"
              description={`No one matching "${query.trim()}" was found.`}
            />
          ) : (
            results.map((profile) => (
              <UserSearchResultRow
                key={profile.id}
                profile={profile}
                level={summaries.get(profile.id)?.level}
                status={getRelationshipStatus(userId, profile.id, graph)}
                busy={busyId === profile.id}
                onAdd={() =>
                  withBusy(profile.id, () => sendFriendRequest(profile.id), "Friend request sent")
                }
                onCancel={() =>
                  withBusy(profile.id, () => cancelFriendRequest(profile.id), "Request cancelled")
                }
                onAccept={() =>
                  withBusy(profile.id, () => acceptFriendRequest(profile.id), "Friend request accepted")
                }
                onDecline={() =>
                  withBusy(profile.id, () => declineFriendRequest(profile.id), "Request declined")
                }
              />
            ))
          )}
        </div>
      </div>

      <BottomNav />
    </main>
  );
}
