"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Grid2x2, House, Package, User } from "lucide-react";
import { cn } from "@/lib/format";

const TABS = [
  { href: "/", label: "Home", icon: House, match: (p: string) => p === "/" },
  { href: "/categories", label: "Categories", icon: Grid2x2, match: (p: string) => p.startsWith("/categories") || p.startsWith("/shop") },
  { href: "/account/orders", label: "Orders", icon: Package, match: (p: string) => p.startsWith("/account/orders") || p.startsWith("/track") },
  { href: "/account", label: "Profile", icon: User, match: (p: string) => p === "/account" || p.startsWith("/login") || p.startsWith("/signup") || p.startsWith("/account/a") || p.startsWith("/account/s") },
];

export default function MobileTabBar() {
  const pathname = usePathname();
  return (
    <nav aria-label="Primary" className="fixed inset-x-0 bottom-0 z-40 border-t border-beige bg-ivory/95 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden">
      <ul className="grid grid-cols-4">
        {TABS.map(({ href, label, icon: Icon, match }) => {
          const active = match(pathname);
          return (
            <li key={href}>
              <Link href={href} aria-current={active ? "page" : undefined} className={cn("flex flex-col items-center gap-1 py-2.5 text-[11px]", active ? "text-terracotta" : "text-brown-soft")}>
                <Icon className="h-[22px] w-[22px]" aria-hidden />
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
