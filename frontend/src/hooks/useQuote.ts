"use client";

import { useEffect, useMemo, useState } from "react";
import { api, errorMessage } from "@/lib/api";
import type { CartItem, Quote, ShippingMethod } from "@/lib/types";

export interface QuoteResult extends Quote {
  lines: { product_id: number; name: string; price: number; quantity: number; stock: number }[];
}

/** Server-priced totals for the cart. The API is the single source of truth for shipping and coupon rules. */
export function useQuote(items: CartItem[], method: ShippingMethod, coupon: string) {
  const [quote, setQuote] = useState<QuoteResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const key = useMemo(
    () => JSON.stringify([items.map((i) => [i.productId, i.quantity]), method, coupon.trim().toUpperCase()]),
    [items, method, coupon],
  );

  useEffect(() => {
    if (items.length === 0) {
      setQuote(null);
      setError("");
      return;
    }
    let cancelled = false;
    setLoading(true);
    const t = setTimeout(() => {
      api<QuoteResult>("/pricing/quote", {
        method: "POST",
        json: {
          items: items.map((i) => ({ product_id: i.productId, quantity: i.quantity })),
          shipping_method: method,
          coupon: coupon.trim() || null,
        },
      })
        .then((q) => !cancelled && (setQuote(q), setError("")))
        .catch((e) => !cancelled && setError(errorMessage(e)))
        .finally(() => !cancelled && setLoading(false));
    }, 180);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  return { quote, loading, error };
}
