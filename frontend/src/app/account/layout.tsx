"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { Heart, LogOut, MapPin, Package, Settings, User } from "lucide-react";
import { Skeleton } from "@/components/ui/States";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { cn } from "@/lib/format";

const LINKS = [
  { href: "/account", label: "Profile", icon: User, exact: true },
  { href: "/account/orders", label: "Orders", icon: Package },
  { href: "/account/addresses", label: "Addresses", icon: MapPin },
  { href: "/wishlist", label: "Wishlist", icon: Heart },
  { href: "/account/settings", label: "Settings", icon: Settings },
];

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const toast = useToast();

  useEffect(() => {
    if (!loading && !user) router.replace(`/login?next=${encodeURIComponent(pathname)}`);
  }, [loading, user, pathname, router]);

  if (loading || !user) {
    return <div className="container-page py-12"><Skeleton className="h-80 w-full" /></div>;
  }

  return (
    <div className="container-page py-8 md:py-14">
      <p className="eyebrow mb-1">My account</p>
      <h1 className="text-3xl font-semibold md:text-4xl">Hello, {user.name.split(" ")[0]}</h1>
      <div className="mt-8 grid gap-8 lg:grid-cols-[240px_1fr]">
        <nav aria-label="Account" className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-2 lg:mx-0 lg:flex-col lg:overflow-visible lg:px-0">
          {LINKS.map(({ href, label, icon: Icon, exact }) => {
            const active = exact ? pathname === href : pathname.startsWith(href);
            return (
              <Link key={href} href={href} aria-current={active ? "page" : undefined} className={cn("flex shrink-0 items-center gap-3 rounded-full px-4 py-2.5 text-sm font-medium transition lg:rounded-xl", active ? "bg-forest text-white" : "bg-white text-brown shadow-soft hover:bg-beige")}>
                <Icon className="h-4 w-4" aria-hidden /> {label}
              </Link>
            );
          })}
          <button onClick={async () => { await logout(); toast("You've been logged out.", "info"); router.push("/"); }} className="flex shrink-0 items-center gap-3 rounded-full bg-white px-4 py-2.5 text-sm font-medium text-terracotta shadow-soft hover:bg-terracotta-light lg:rounded-xl">
            <LogOut className="h-4 w-4" aria-hidden /> Log out
          </button>
        </nav>
        <div className="min-w-0">{children}</div>
      </div>
    </div>
  );
}
