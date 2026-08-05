"use client";

import Image from "next/image";
import { useState } from "react";

type ExerciseHeroImageProps = {
  readonly slug: string;
  readonly name: string;
  /** Optional catalog override; defaults to `/exercises/${slug}.webp`. */
  readonly image?: string;
};

/**
 * Exercise still for the details page.
 * Matches the section-list convention (`/exercises/${slug}.webp`).
 * Hides itself if the asset is missing.
 */
export default function ExerciseHeroImage({
  slug,
  name,
  image,
}: ExerciseHeroImageProps) {
  const [failed, setFailed] = useState(false);
  const src = image?.trim() || `/exercises/${slug}.webp`;

  if (failed) return null;

  return (
    <div className="mb-4 overflow-hidden rounded-3xl border border-[#222] bg-[#111]">
      <div className="relative aspect-[4/3] w-full">
        <Image
          src={src}
          alt={name}
          fill
          sizes="(max-width: 430px) 100vw, 430px"
          className="object-cover"
          priority={false}
          onError={() => setFailed(true)}
        />
      </div>
    </div>
  );
}
