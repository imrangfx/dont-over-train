import type { ReactNode } from "react";
import { ChevronRight } from "lucide-react";

type SettingRowProps = {
  icon: ReactNode;
  label: string;
  value?: string;
};

export function SettingRow({ icon, label, value }: SettingRowProps) {
  return (
    <div className="flex items-center justify-between gap-3 px-4 py-4">
      <div className="flex min-w-0 items-center gap-3">
        <div className="shrink-0 text-lime-400" aria-hidden="true">
          {icon}
        </div>
        <span className="text-sm text-zinc-300">
          {label}
        </span>
      </div>
      {value !== undefined && (
        <span className="max-w-[55%] truncate text-right text-sm font-medium text-white">
          {value}
        </span>
      )}
    </div>
  );
}

type SettingButtonProps = {
  icon: ReactNode;
  label: string;
  onClick: () => void;
  disabled?: boolean;
  danger?: boolean;
};

export function SettingButton({
  icon,
  label,
  onClick,
  disabled,
  danger,
}: SettingButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`flex w-full items-center justify-between gap-3 px-4 py-4 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#39ff14] focus-visible:ring-inset active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50 ${
        danger
          ? "text-red-400 hover:bg-red-500/10"
          : "text-zinc-300 hover:bg-zinc-900/80"
      }`}
    >
      <div className="flex min-w-0 items-center gap-3">
        <div
          className={`shrink-0 ${danger ? "text-red-400" : "text-lime-400"}`}
          aria-hidden="true"
        >
          {icon}
        </div>
        <span className="text-sm font-medium">
          {label}
        </span>
      </div>
      <ChevronRight size={18} className="shrink-0 text-zinc-600" aria-hidden="true" />
    </button>
  );
}

type SettingLinkProps = {
  icon: ReactNode;
  label: string;
  href: string;
};

export function SettingLink({ icon, label, href }: SettingLinkProps) {
  return (
    <a
      href={href}
      onClick={(event) => {
        // Keep this inside the same user gesture. Programmatic <a>.click()
        // after preventDefault can be blocked by browsers for mailto:.
        if (!/^mailto:/i.test(href)) return;
        event.preventDefault();
        window.location.href = href;
      }}
      className="flex w-full items-center justify-between gap-3 px-4 py-4 transition hover:bg-zinc-900/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#39ff14] focus-visible:ring-inset active:scale-[0.99]"
    >
      <div className="flex min-w-0 items-center gap-3">
        <div className="shrink-0 text-lime-400" aria-hidden="true">
          {icon}
        </div>
        <span className="text-sm text-zinc-300">
          {label}
        </span>
      </div>
      <ChevronRight size={18} className="shrink-0 text-zinc-600" aria-hidden="true" />
    </a>
  );
}
