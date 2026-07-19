"use client";

import Link from "next/link";
import { CircleUserRound } from "lucide-react";
import { getFriendDisplayName, type PublicProfile } from "@/lib/friends";
import type { PublicStrengthSummary } from "@/lib/profilePublic";

type FriendCardProps = {
  profile: PublicProfile;
  summary?: PublicStrengthSummary;
};

/** A friend list row: avatar, name, level, streak, highest PR, and a link to their read-only profile. */
export default function FriendCard({ profile, summary }: FriendCardProps) {
  const displayName = getFriendDisplayName(profile);

  return (
    <Link
      href={`/friends/${profile.id}`}
      className="btn-base card-surface flex items-center gap-3 p-4 hover:border-lime-400/40"
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

        {summary ? (
          <p className="mt-0.5 truncate text-sm text-zinc-500">
            <span style={{ color: summary.level.color }}>Level {summary.level.level}</span>
            {" • 🔥 "}
            {summary.currentStreak}d
            {summary.highestPR ? ` • ${summary.highestPR.weight}kg PR` : ""}
          </p>
        ) : (
          <p className="mt-0.5 text-sm text-zinc-500">View profile</p>
        )}
      </div>
    </Link>
  );
}
