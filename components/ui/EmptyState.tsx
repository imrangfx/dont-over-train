import type { ReactNode } from "react";

type EmptyStateProps = {
  icon: ReactNode;
  title: string;
  description: string;
  className?: string;
};

export default function EmptyState({
  icon,
  title,
  description,
  className = "",
}: EmptyStateProps) {
  return (
    <div
      className={`rounded-2xl border border-zinc-800 bg-[#111111] p-8 text-center ${className}`}
    >
      <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-zinc-900 text-lime-400">
        {icon}
      </div>
      <h2 className="text-lg font-semibold text-white">
        {title}
      </h2>
      <p className="mt-2 text-sm leading-6 text-zinc-500">
        {description}
      </p>
    </div>
  );
}
