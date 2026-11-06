"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ChevronDown, Heart, LogOut, Menu, Package, Search, ShoppingBag, User as UserIcon, X } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { useToast } from "@/context/ToastContext";
import { useWishlist } from "@/context/WishlistContext";
import { CATEGORY_LIST, NAV_LINKS } from "@/lib/constants";
import { cn } from "@/lib/format";
import Logo from "../ui/Logo";
import SearchBox from "./SearchBox";

function Badge({ n }: { n: number }) {
  if (n <= 0) return null;
  return (
    <span className="absolute -right-1.5 -top-1.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-terracotta px-1 text-[10px] font-semibold text-white">
      {n > 99 ? "99+" : n}
    </span>
  );
}

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const toast = useToast();
  const { user, logout } = useAuth();
  const { count } = useCart();
  const { ids } = useWishlist();
  const [drawer, setDrawer] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [menu, setMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setDrawer(false);
    setSearchOpen(false);
    setMenu(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = drawer ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [drawer]);

  useEffect(() => {
    const close = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenu(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  const doLogout = async () => {
    await logout();
    toast("You've been logged out.", "info");
    router.push("/");
  };

  const iconBtn = "relative flex h-10 w-10 items-center justify-center rounded-full text-brown transition hover:bg-beige/70";

  return (
    <header className="sticky top-0 z-40 border-b border-beige/80 bg-ivory/95 backdrop-blur">
      <div className="container-page flex h-16 items-center gap-3 md:h-[76px] md:gap-6">
        <button className={cn(iconBtn, "lg:hidden")} onClick={() => setDrawer(true)} aria-label="Open menu">
          <Menu className="h-6 w-6" />
        </button>

        <Logo className="mr-auto lg:mr-0" />

        <nav className="ml-2 hidden items-center gap-0.5 lg:flex" aria-label="Main">
          {NAV_LINKS.map((l) =>
            l.hasMenu ? (
              <div key={l.href} className="group relative">
                <Link href={l.href} className="flex items-center gap-1 whitespace-nowrap rounded-full px-3 py-2 text-sm font-medium hover:bg-beige/70 xl:px-4">
                  {l.label} <ChevronDown className="h-3.5 w-3.5 transition group-hover:rotate-180" aria-hidden />
                </Link>
                <div className="invisible absolute left-0 top-full w-60 pt-2 opacity-0 transition group-focus-within:visible group-focus-within:opacity-100 group-hover:visible group-hover:opacity-100">
                  <ul className="rounded-2xl border border-beige bg-white p-2 shadow-lift">
                    {CATEGORY_LIST.map((c) => (
                      <li key={c.slug}>
                        <Link href={`/shop?category=${c.slug}`} className="block rounded-xl px-3 py-2 text-sm hover:bg-beige/60">
                          {c.name}
                        </Link>
                      </li>
                    ))}
                    <li className="mt-1 border-t border-beige pt-1">
                      <Link href="/categories" className="block rounded-xl px-3 py-2 text-sm font-medium text-terracotta hover:bg-beige/60">
                        View all categories
                      </Link>
                    </li>
                  </ul>
                </div>
              </div>
            ) : (
              <Link
                key={l.href}
                href={l.href}
                className={cn("whitespace-nowrap rounded-full px-3 py-2 text-sm font-medium hover:bg-beige/70 xl:px-4", pathname.startsWith(l.href) && "text-terracotta")}
              >
                {l.label}
              </Link>
            ),
          )}
        </nav>

        <div className="ml-auto hidden w-full max-w-xs lg:block xl:max-w-sm">
          <SearchBox />
        </div>

        <div className="flex items-center gap-0.5">
          <button className={cn(iconBtn, "lg:hidden")} onClick={() => setSearchOpen((v) => !v)} aria-label="Search" aria-expanded={searchOpen}>
            <Search className="h-5 w-5" />
          </button>
          <Link href="/wishlist" className={cn(iconBtn, "hidden sm:flex")} aria-label={`Wishlist, ${ids.length} items`}>
            <Heart className="h-5 w-5" />
            <Badge n={ids.length} />
          </Link>
          <Link href="/cart" className={iconBtn} aria-label={`Cart, ${count} items`}>
            <ShoppingBag className="h-5 w-5" />
            <Badge n={count} />
          </Link>
          <div ref={menuRef} className="relative hidden sm:block">
            {user ? (
              <>
                <button onClick={() => setMenu((v) => !v)} className={iconBtn} aria-label="Account menu" aria-expanded={menu}>
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-forest text-xs font-semibold text-white">
                    {user.name.charAt(0).toUpperCase()}
                  </span>
                </button>
                {menu && (
                  <div className="absolute right-0 top-full mt-2 w-56 rounded-2xl border border-beige bg-white p-2 shadow-lift">
                    <p className="truncate px-3 py-2 text-sm font-medium">{user.name}</p>
                    <Link href="/account" className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm hover:bg-beige/60">
                      <UserIcon className="h-4 w-4" /> My account
                    </Link>
                    <Link href="/account/orders" className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm hover:bg-beige/60">
                      <Package className="h-4 w-4" /> My orders
                    </Link>
                    <button onClick={doLogout} className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm hover:bg-beige/60">
                      <LogOut className="h-4 w-4" /> Log out
                    </button>
                  </div>
                )}
              </>
            ) : (
              <Link href="/login" className={iconBtn} aria-label="Log in or sign up">
                <UserIcon className="h-5 w-5" />
              </Link>
            )}
          </div>
        </div>
      </div>

      {searchOpen && (
        <div className="border-t border-beige px-4 py-3 lg:hidden">
          <SearchBox onNavigate={() => setSearchOpen(false)} />
        </div>
      )}

      {drawer && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-brown/40" onClick={() => setDrawer(false)} aria-hidden />
          <aside className="absolute left-0 top-0 flex h-full w-[84%] max-w-sm flex-col bg-ivory p-5 shadow-lift" aria-label="Menu">
            <div className="mb-6 flex items-center justify-between">
              <Logo compact />
              <button className={iconBtn} onClick={() => setDrawer(false)} aria-label="Close menu">
                <X className="h-6 w-6" />
              </button>
            </div>
            <nav className="flex flex-col gap-1 overflow-y-auto">
              {[
                { href: "/shop", label: "Shop" },
                { href: "/artisans", label: "Our Artisans" },
                { href: "/about", label: "Our Story" },
                { href: "/quality", label: "Quality Promise" },
                { href: "/wishlist", label: "Wishlist" },
                { href: "/support", label: "Help & Support" },
                { href: "/track", label: "Track an order" },
              ].map((l) => (
                <Link key={l.href} href={l.href} className="rounded-xl px-3 py-3 font-medium hover:bg-beige/70">
                  {l.label}
                </Link>
              ))}
              <p className="eyebrow mt-5 px-3">Categories</p>
              {CATEGORY_LIST.map((c) => (
                <Link key={c.slug} href={`/shop?category=${c.slug}`} className="rounded-xl px-3 py-2.5 text-sm hover:bg-beige/70">
                  {c.name}
                </Link>
              ))}
            </nav>
            <div className="mt-auto border-t border-beige pt-4">
              {user ? (
                <button onClick={doLogout} className="flex w-full items-center gap-2 rounded-xl px-3 py-3 font-medium hover:bg-beige/70">
                  <LogOut className="h-5 w-5" /> Log out ({user.name.split(" ")[0]})
                </button>
              ) : (
                <Link href="/login" className="flex items-center gap-2 rounded-xl px-3 py-3 font-medium hover:bg-beige/70">
                  <UserIcon className="h-5 w-5" /> Log in / Sign up
                </Link>
              )}
            </div>
          </aside>
        </div>
      )}
    </header>
  );
}
