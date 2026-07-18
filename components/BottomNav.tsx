"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { House, History, CircleUserRound } from "lucide-react";

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
      <div className="mx-auto grid h-[72px] w-full max-w-[390px] grid-cols-3 items-center px-2">
        {NAV_ITEMS.map(({ label, href, icon: Icon }) => {
          const active = isActive(pathname, href);

          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-col items-center justify-center gap-1 py-2 text-xs font-medium transition-colors duration-200 ${
                active ? "text-[#39FF14]" : "text-zinc-500"
              }`}
            >
              <Icon
                size={active ? 24 : 20}
                strokeWidth={active ? 2.25 : 2}
                className="transition-all duration-200"
              />
              <span>{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
