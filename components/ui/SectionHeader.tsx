type SectionHeaderProps = {
  title: string;
  className?: string;
};

export default function SectionHeader({
  title,
  className = "",
}: SectionHeaderProps) {
  return (
    <h2
      className={`mb-3 text-sm font-medium uppercase tracking-wide text-zinc-500 ${className}`}
    >
      {title}
    </h2>
  );
}
