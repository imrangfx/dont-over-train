type SectionHeaderProps = {
  title: string;
  className?: string;
  id?: string;
};

export default function SectionHeader({
  title,
  className = "",
  id,
}: SectionHeaderProps) {
  return (
    <h2
      id={id}
      className={`mb-3 text-sm font-medium uppercase tracking-wide text-zinc-500 ${className}`}
    >
      {title}
    </h2>
  );
}
