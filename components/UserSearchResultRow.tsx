"use client";

import { CircleUserRound } from "lucide-react";
import Link from "next/link";
import { getFriendDisplayName, type PublicProfile, type RelationshipStatus } from "@/lib/friends";
import type { BodyPartLevelProgress } from "@/lib/bodyPartProgression";

type UserSearchResultRowProps = {
  profile: PublicProfile;
  level?: BodyPartLevelProgress;
  status: RelationshipStatus;
  busy?: boolean;
  onAdd: () => void;
  onCancel: () => void;
  onAccept: () => void;
  onDecline: () => void;
};

/** A search result row: avatar, name, level, and a relationship-aware action button. */
export default function UserSearchResultRow({
  profile,
  level,
  status,
  busy,
  onAdd,
  onCancel,
  onAccept,
  onDecline,
}: UserSearchResultRowProps) {
  const displayName = getFriendDisplayName(profile);

  return (
    <div className="card-surface flex items-center gap-3 p-4">
      <Link
        href={`/friends/${profile.id}`}
        className="btn-base flex min-w-0 flex-1 items-center gap-3 rounded-lg"
        aria-label={`View ${displayName}'s profile`}
      >
        <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full border border-zinc-800 bg-zinc-900">
          {profile.avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={profile.avatarUrl} alt="" className="h-full w-full object-cover" />
          ) : (
            <CircleUserRound size={26} className="text-[#39ff14]" aria-hidden="true" />
          )}
        </div>

        <div className="min-w-0 flex-1">
          <p className="truncate font-semibold text-white">{displayName}</p>
          {level && (
            <p className="mt-0.5 truncate text-sm" style={{ color: level.color }}>
              Level {level.level} • {level.title}
            </p>
          )}
        </div>
      </Link>

      {status === "self" ? null : status === "friends" ? (
        <span className="btn-base shrink-0 rounded-full bg-zinc-800 px-3 py-1.5 text-xs font-medium text-zinc-400">
          Friends
        </span>
      ) : status === "request_sent" ? (
        <button
          type="button"
          disabled={busy}
          onClick={onCancel}
          aria-label={`Cancel friend request to ${displayName}`}
          className="btn-base min-h-10 shrink-0 rounded-full border border-zinc-700 px-3 py-2.5 text-xs font-medium text-zinc-300 hover:border-red-500 hover:text-red-400 disabled:opacity-50"
        >
          Cancel
        </button>
      ) : status === "request_received" ? (
        <div className="flex shrink-0 gap-2">
          <button
            type="button"
            disabled={busy}
            onClick={onAccept}
            aria-label={`Accept ${displayName}'s friend request`}
            className="btn-base min-h-10 rounded-full bg-lime-400 px-3 py-2.5 text-xs font-semibold text-black hover:bg-lime-300 disabled:opacity-50"
          >
            Accept
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={onDecline}
            aria-label={`Decline ${displayName}'s friend request`}
            className="btn-base min-h-10 rounded-full border border-zinc-700 px-3 py-2.5 text-xs font-medium text-zinc-300 disabled:opacity-50"
          >
            Decline
          </button>
        </div>
      ) : (
        <button
          type="button"
          disabled={busy}
          onClick={onAdd}
          aria-label={`Add ${displayName} as a friend`}
          className="btn-base min-h-10 shrink-0 rounded-full bg-lime-400 px-3 py-2.5 text-xs font-semibold text-black hover:bg-lime-300 disabled:opacity-50"
        >
          Add Friend
        </button>
      )}
    </div>
  );
}
