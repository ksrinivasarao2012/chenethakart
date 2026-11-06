"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { CartItem, Product } from "@/lib/types";

const KEY = "ck_cart_v1";
const COUPON_KEY = "ck_coupon_v1";
const MAX_QTY = 10;

interface CartState {
  items: CartItem[];
  ready: boolean;
  count: number;
  subtotal: number;
  coupon: string;
  setCoupon: (c: string) => void;
  add: (p: Product, qty?: number) => "added" | "limit" | "soldout";
  setQuantity: (productId: number, qty: number) => void;
  remove: (productId: number) => void;
  clear: () => void;
}

const CartContext = createContext<CartState | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [coupon, setCouponState] = useState("");
  const [ready, setReady] = useState(false);

  // Hydrate from localStorage after mount (avoids SSR/CSR mismatch).
  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setItems(JSON.parse(raw) as CartItem[]);
      setCouponState(localStorage.getItem(COUPON_KEY) ?? "");
    } catch {
      /* storage unavailable or corrupt: start with an empty cart */
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    try {
      localStorage.setItem(KEY, JSON.stringify(items));
    } catch {
      /* ignore quota errors */
    }
  }, [items, ready]);

  const setCoupon = useCallback((c: string) => {
    setCouponState(c);
    try {
      localStorage.setItem(COUPON_KEY, c);
    } catch {
      /* ignore */
    }
  }, []);

  const add = useCallback((p: Product, qty = 1) => {
    if (p.stock <= 0) return "soldout" as const;
    let result: "added" | "limit" = "added";
    setItems((cur) => {
      const cap = Math.min(MAX_QTY, p.stock);
      const existing = cur.find((i) => i.productId === p.id);
      if (existing) {
        const next = Math.min(cap, existing.quantity + qty);
        if (existing.quantity + qty > cap) result = "limit";
        return cur.map((i) => (i.productId === p.id ? { ...i, quantity: next, stock: p.stock } : i));
      }
      if (qty > cap) result = "limit";
      return [...cur, { productId: p.id, slug: p.slug, name: p.name, price: p.price, image: p.image, quantity: Math.min(qty, cap), stock: p.stock }];
    });
    return result;
  }, []);

  const setQuantity = useCallback((productId: number, qty: number) => {
    setItems((cur) =>
      cur.map((i) => (i.productId === productId ? { ...i, quantity: Math.max(1, Math.min(qty, MAX_QTY, i.stock)) } : i)),
    );
  }, []);

  const remove = useCallback((productId: number) => setItems((cur) => cur.filter((i) => i.productId !== productId)), []);
  const clear = useCallback(() => {
    setItems([]);
    setCoupon("");
  }, [setCoupon]);

  const value = useMemo<CartState>(
    () => ({
      items,
      ready,
      count: items.reduce((n, i) => n + i.quantity, 0),
      subtotal: items.reduce((n, i) => n + i.price * i.quantity, 0),
      coupon,
      setCoupon,
      add,
      setQuantity,
      remove,
      clear,
    }),
    [items, ready, coupon, setCoupon, add, setQuantity, remove, clear],
  );
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside CartProvider");
  return ctx;
}
