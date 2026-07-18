type LoadingCardProps = {
  rows?: number;
  className?: string;
};

export default function LoadingCard({
  rows = 3,
  className = "",
}: LoadingCardProps) {
  return (
    <div
      role="status"
      aria-label="Loading"
      aria-busy="true"
      className={`rounded-2xl border border-zinc-800 bg-[#111111] p-5 ${className}`}
    >
      <div className="mb-4 h-4 w-1/3 animate-pulse rounded bg-zinc-800" />
      <div className="space-y-3">
        {Array.from({ length: rows }).map((_, index) => (
          <div
            key={index}
            className="h-3 animate-pulse rounded bg-zinc-800"
            style={{ width: `${85 - index * 12}%` }}
          />
        ))}
      </div>
      <span className="sr-only">Loading...</span>
    </div>
  );
}
