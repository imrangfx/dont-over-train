/**
 * Social Lite: pure friend-graph types and helpers (no Supabase access).
 * Kept separate from friendService.ts so the relationship-status logic can
 * be unit-tested and reused (e.g. by a future notifications/leaderboard
 * feature) without pulling in any I/O.
 */

export type PublicProfile = {
  id: string;
  fullName: string | null;
  avatarUrl: string | null;
  username: string | null;
};

/** Maps a raw `profiles` row to the public-safe shape. Never includes email or auth data - those columns don't exist on this table. */
export function rowToPublicProfile(row: {
  id: string;
  full_name?: string | null;
  avatar_url?: string | null;
  username?: string | null;
}): PublicProfile {
  return {
    id: row.id,
    fullName: row.full_name ?? null,
    avatarUrl: row.avatar_url ?? null,
    username: row.username ?? null,
  };
}

export function getFriendDisplayName(profile: Pick<PublicProfile, "fullName">): string {
  const trimmed = profile.fullName?.trim();
  return trimmed && trimmed.length > 0 ? trimmed : "User";
}

export type RelationshipStatus =
  | "self"
  | "friends"
  | "request_sent"
  | "request_received"
  | "none";

export type FriendGraph = {
  friendIds: Set<string>;
  sentRequestReceiverIds: Set<string>;
  receivedRequestSenderIds: Set<string>;
};

export function emptyFriendGraph(): FriendGraph {
  return {
    friendIds: new Set(),
    sentRequestReceiverIds: new Set(),
    receivedRequestSenderIds: new Set(),
  };
}

/** Relationship of the signed-in viewer toward another user, given their friend graph. */
export function getRelationshipStatus(
  viewerId: string | null,
  targetId: string,
  graph: FriendGraph
): RelationshipStatus {
  if (!viewerId) return "none";
  if (viewerId === targetId) return "self";
  if (graph.friendIds.has(targetId)) return "friends";
  if (graph.sentRequestReceiverIds.has(targetId)) return "request_sent";
  if (graph.receivedRequestSenderIds.has(targetId)) return "request_received";
  return "none";
}

/** Always stores the lexicographically smaller id first, so a pair is never stored twice. */
export function orderedPair(a: string, b: string): [string, string] {
  return a < b ? [a, b] : [b, a];
}
