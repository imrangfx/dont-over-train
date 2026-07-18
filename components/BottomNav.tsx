"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { House, History, CircleUserRound, Settings } from "lucide-react";

const NAV_ITEMS = [
  {
    label: "Home",
    href: "/home",
    icon: House,
  },
  {
    label: "History",
    href: "/history",
    icon: History,
  },
  {
    label: "Profile",
    href: "/profile",
    icon: CircleUserRound,
  },
  {
    label: "Settings",
    href: "/settings",
    icon: Settings,
  },
] as const;

function isActive(pathname: string, href: string) {
  if (href === "/home") {
    return pathname === "/home" || pathname.startsWith("/home/");
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Bottom navigation"
      className="fixed bottom-0 left-0 right-0 z-50 border-t border-zinc-800 bg-[#111] pb-[env(safe-area-inset-bottom)]"
    >
      <div className="mx-auto grid h-[72px] w-full max-w-[430px] grid-cols-4 items-center px-1">
        {NAV_ITEMS.map(({ label, href, icon: Icon }) => {
          const active = isActive(pathname, href);

          return (
            <Link
              key={href}
              href={href}
              aria-label={label}
              aria-current={active ? "page" : undefined}
              className={`flex min-w-0 flex-col items-center justify-center gap-1 px-0.5 py-2 text-[10px] font-medium leading-none whitespace-nowrap transition-colors duration-200 sm:text-xs ${
                active ? "text-[#39FF14]" : "text-zinc-500"
              }`}
            >
              <Icon
                size={active ? 22 : 18}
                strokeWidth={active ? 2.25 : 2}
                className="shrink-0 transition-all duration-200"
                aria-hidden="true"
              />
              <span className="max-w-full truncate">
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
