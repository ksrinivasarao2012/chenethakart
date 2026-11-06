"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { api } from "@/lib/api";
import { useAuth } from "./AuthContext";

const KEY = "ck_wishlist_v1";

interface WishlistState {
  ids: number[];
  has: (id: number) => boolean;
  toggle: (id: number) => boolean; // returns true if now in wishlist
  remove: (id: number) => void;
}

const WishlistContext = createContext<WishlistState | null>(null);

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const [ids, setIds] = useState<number[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const syncedFor = useRef<number | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setIds(JSON.parse(raw) as number[]);
    } catch {
      /* ignore */
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(KEY, JSON.stringify(ids));
    } catch {
      /* ignore */
    }
  }, [ids, hydrated]);

  // When a user logs in, merge the guest wishlist with the saved one and store the union.
  useEffect(() => {
    if (!hydrated || loading) return;
    if (!user) {
      if (syncedFor.current !== null) {
        syncedFor.current = null;
        setIds([]); // logged out: clear the local copy
      }
      return;
    }
    if (syncedFor.current === user.id) return;
    syncedFor.current = user.id;
    api<{ product_ids: number[] }>("/me/wishlist")
      .then(({ product_ids }) => {
        const merged = Array.from(new Set([...product_ids, ...ids]));
        setIds(merged);
        return api("/me/wishlist", { method: "PUT", json: { product_ids: merged } });
      })
      .catch(() => undefined);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, loading, hydrated]);

  const persist = useCallback(
    (next: number[]) => {
      if (user) api("/me/wishlist", { method: "PUT", json: { product_ids: next } }).catch(() => undefined);
    },
    [user],
  );

  const toggle = useCallback(
    (id: number) => {
      const exists = ids.includes(id);
      const next = exists ? ids.filter((x) => x !== id) : [...ids, id];
      setIds(next);
      persist(next);
      return !exists;
    },
    [ids, persist],
  );

  const remove = useCallback(
    (id: number) => {
      const next = ids.filter((x) => x !== id);
      setIds(next);
      persist(next);
    },
    [ids, persist],
  );

  const value = useMemo(() => ({ ids, has: (id: number) => ids.includes(id), toggle, remove }), [ids, toggle, remove]);
  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
}

export function useWishlist() {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error("useWishlist must be used inside WishlistProvider");
  return ctx;
}
