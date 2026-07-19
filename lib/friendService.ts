import { supabase } from "@/lib/supabase";
import { getCurrentUserId } from "@/lib/workouts";
import {
  emptyFriendGraph,
  orderedPair,
  rowToPublicProfile,
  type FriendGraph,
  type PublicProfile,
} from "@/lib/friends";

const DUPLICATE_ERROR_CODE = "23505";

function friendlyError(err: unknown, fallback: string): string {
  if (err && typeof err === "object" && "code" in err && (err as { code?: string }).code === DUPLICATE_ERROR_CODE) {
    return "That request already exists.";
  }
  if (err instanceof Error) return err.message;
  return fallback;
}

/** Search other users by display name (username is matched too, ready for when usernames are introduced). Never matches on email. */
export async function searchUsers(
  query: string
): Promise<{ profiles: PublicProfile[]; error: string | null }> {
  const trimmed = query.trim().replace(/[,%]/g, "");
  if (!trimmed) return { profiles: [], error: null };

  const userId = await getCurrentUserId();

  try {
    let request = supabase
      .from("profiles")
      .select("id, full_name, avatar_url, username")
      .or(`full_name.ilike.%${trimmed}%,username.ilike.%${trimmed}%`)
      .limit(20);

    if (userId) request = request.neq("id", userId);

    const { data, error } = await request;
    if (error) return { profiles: [], error: error.message };
    return { profiles: (data || []).map(rowToPublicProfile), error: null };
  } catch (err) {
    return { profiles: [], error: err instanceof Error ? err.message : "Search failed." };
  }
}

/** All of the signed-in user's friendships + pending/sent requests, as sets of the *other* user's id. Empty for guests. */
export async function loadFriendGraph(): Promise<{ graph: FriendGraph; error: string | null }> {
  const userId = await getCurrentUserId();
  if (!userId) return { graph: emptyFriendGraph(), error: null };

  try {
    const [friendshipsRes, requestsRes] = await Promise.all([
      supabase
        .from("friendships")
        .select("user_id_a, user_id_b")
        .or(`user_id_a.eq.${userId},user_id_b.eq.${userId}`),
      supabase
        .from("friend_requests")
        .select("sender_id, receiver_id")
        .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`),
    ]);

    if (friendshipsRes.error) return { graph: emptyFriendGraph(), error: friendshipsRes.error.message };
    if (requestsRes.error) return { graph: emptyFriendGraph(), error: requestsRes.error.message };

    const graph = emptyFriendGraph();

    for (const row of friendshipsRes.data || []) {
      graph.friendIds.add(row.user_id_a === userId ? row.user_id_b : row.user_id_a);
    }

    for (const row of requestsRes.data || []) {
      if (row.sender_id === userId) graph.sentRequestReceiverIds.add(row.receiver_id);
      if (row.receiver_id === userId) graph.receivedRequestSenderIds.add(row.sender_id);
    }

    return { graph, error: null };
  } catch (err) {
    return { graph: emptyFriendGraph(), error: err instanceof Error ? err.message : "Couldn't load friends." };
  }
}

/** Friends + pending (received) + sent lists with profile info, for the Friends hub page. Batches profile lookups into a single query. */
export async function loadFriendsHub(): Promise<{
  friends: PublicProfile[];
  pending: PublicProfile[];
  sent: PublicProfile[];
  error: string | null;
}> {
  const userId = await getCurrentUserId();
  if (!userId) return { friends: [], pending: [], sent: [], error: null };

  try {
    const [friendshipsRes, requestsRes] = await Promise.all([
      supabase
        .from("friendships")
        .select("user_id_a, user_id_b")
        .or(`user_id_a.eq.${userId},user_id_b.eq.${userId}`),
      supabase
        .from("friend_requests")
        .select("sender_id, receiver_id")
        .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`),
    ]);

    if (friendshipsRes.error) return { friends: [], pending: [], sent: [], error: friendshipsRes.error.message };
    if (requestsRes.error) return { friends: [], pending: [], sent: [], error: requestsRes.error.message };

    const friendIds = (friendshipsRes.data || []).map((row) =>
      row.user_id_a === userId ? row.user_id_b : row.user_id_a
    );
    const pendingIds = (requestsRes.data || [])
      .filter((row) => row.receiver_id === userId)
      .map((row) => row.sender_id);
    const sentIds = (requestsRes.data || [])
      .filter((row) => row.sender_id === userId)
      .map((row) => row.receiver_id);

    const allIds = Array.from(new Set([...friendIds, ...pendingIds, ...sentIds]));
    if (allIds.length === 0) return { friends: [], pending: [], sent: [], error: null };

    const { data: profileRows, error: profileError } = await supabase
      .from("profiles")
      .select("id, full_name, avatar_url, username")
      .in("id", allIds);

    if (profileError) return { friends: [], pending: [], sent: [], error: profileError.message };

    const byId = new Map((profileRows || []).map((row) => [row.id, rowToPublicProfile(row)]));
    const resolve = (ids: string[]) => ids.map((id) => byId.get(id)).filter((p): p is PublicProfile => Boolean(p));

    return {
      friends: resolve(friendIds),
      pending: resolve(pendingIds),
      sent: resolve(sentIds),
      error: null,
    };
  } catch (err) {
    return {
      friends: [],
      pending: [],
      sent: [],
      error: err instanceof Error ? err.message : "Couldn't load friends.",
    };
  }
}

/** Row count only - cheap enough to call from the Profile page's "Friends (N)" summary. */
export async function getFriendCount(): Promise<{ count: number; error: string | null }> {
  const userId = await getCurrentUserId();
  if (!userId) return { count: 0, error: null };

  try {
    const { count, error } = await supabase
      .from("friendships")
      .select("*", { count: "exact", head: true })
      .or(`user_id_a.eq.${userId},user_id_b.eq.${userId}`);

    if (error) return { count: 0, error: error.message };
    return { count: count ?? 0, error: null };
  } catch (err) {
    return { count: 0, error: err instanceof Error ? err.message : "Couldn't load friend count." };
  }
}

export async function sendFriendRequest(receiverId: string): Promise<{ error: string | null }> {
  const userId = await getCurrentUserId();
  if (!userId) return { error: "Sign in to add friends." };
  if (userId === receiverId) return { error: "You can't add yourself." };

  try {
    const { error } = await supabase
      .from("friend_requests")
      .insert({ sender_id: userId, receiver_id: receiverId });

    if (error) return { error: friendlyError(error, error.message) };
    return { error: null };
  } catch (err) {
    return { error: friendlyError(err, "Couldn't send friend request.") };
  }
}

export async function cancelFriendRequest(receiverId: string): Promise<{ error: string | null }> {
  const userId = await getCurrentUserId();
  if (!userId) return { error: "Sign in required." };

  try {
    const { error } = await supabase
      .from("friend_requests")
      .delete()
      .eq("sender_id", userId)
      .eq("receiver_id", receiverId);

    return { error: error?.message ?? null };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Couldn't cancel request." };
  }
}

export async function declineFriendRequest(senderId: string): Promise<{ error: string | null }> {
  const userId = await getCurrentUserId();
  if (!userId) return { error: "Sign in required." };

  try {
    const { error } = await supabase
      .from("friend_requests")
      .delete()
      .eq("sender_id", senderId)
      .eq("receiver_id", userId);

    return { error: error?.message ?? null };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Couldn't decline request." };
  }
}

export async function acceptFriendRequest(senderId: string): Promise<{ error: string | null }> {
  const userId = await getCurrentUserId();
  if (!userId) return { error: "Sign in required." };

  try {
    const [userIdA, userIdB] = orderedPair(userId, senderId);

    const { error: insertError } = await supabase
      .from("friendships")
      .insert({ user_id_a: userIdA, user_id_b: userIdB });

    if (insertError && (insertError as { code?: string }).code !== DUPLICATE_ERROR_CODE) {
      return { error: insertError.message };
    }

    const { error: deleteError } = await supabase
      .from("friend_requests")
      .delete()
      .eq("sender_id", senderId)
      .eq("receiver_id", userId);

    return { error: deleteError?.message ?? null };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Couldn't accept request." };
  }
}

export async function removeFriend(friendId: string): Promise<{ error: string | null }> {
  const userId = await getCurrentUserId();
  if (!userId) return { error: "Sign in required." };

  try {
    const [userIdA, userIdB] = orderedPair(userId, friendId);

    const { error } = await supabase
      .from("friendships")
      .delete()
      .eq("user_id_a", userIdA)
      .eq("user_id_b", userIdB);

    return { error: error?.message ?? null };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Couldn't remove friend." };
  }
}
