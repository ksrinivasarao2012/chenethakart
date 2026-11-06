"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Minus, Plus, ShoppingBag, Zap } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useToast } from "@/context/ToastContext";
import type { Product } from "@/lib/types";
import Button from "../ui/Button";

export default function PurchasePanel({ product }: { product: Product }) {
  const router = useRouter();
  const { add } = useCart();
  const toast = useToast();
  const [qty, setQty] = useState(1);
  const max = Math.min(10, product.stock);
  const soldOut = product.stock <= 0;

  const addToCart = () => {
    const r = add(product, qty);
    if (r === "soldout") toast("This item is sold out.", "error");
    else if (r === "limit") toast(`Only ${max} available per order — we've capped your cart at that.`, "info");
    else toast(`${qty} × ${product.name} added to your cart.`);
    return r;
  };

  const stepper = "flex h-12 w-11 items-center justify-center text-brown transition hover:bg-beige/70 disabled:opacity-40";

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="flex h-12 w-fit items-stretch divide-x divide-beige-dark overflow-hidden rounded-xl border border-beige-dark bg-white" role="group" aria-label="Quantity">
          <button className={stepper} onClick={() => setQty((q) => Math.max(1, q - 1))} disabled={qty <= 1 || soldOut} aria-label="Decrease quantity">
            <Minus className="h-4 w-4" />
          </button>
          <span className="flex w-12 items-center justify-center text-sm font-semibold" aria-live="polite">{soldOut ? 0 : qty}</span>
          <button className={stepper} onClick={() => setQty((q) => Math.min(max, q + 1))} disabled={qty >= max || soldOut} aria-label="Increase quantity">
            <Plus className="h-4 w-4" />
          </button>
        </div>
        <Button size="lg" className="h-12 flex-1" onClick={addToCart} disabled={soldOut}>
          <ShoppingBag className="h-5 w-5" aria-hidden /> {soldOut ? "Sold out" : "Add to Cart"}
        </Button>
      </div>
      <Button
        size="lg"
        variant="forest"
        className="h-12 w-full"
        disabled={soldOut}
        onClick={() => {
          if (addToCart() !== "soldout") router.push("/checkout");
        }}
      >
        <Zap className="h-5 w-5" aria-hidden /> Buy Now
      </Button>
    </div>
  );
}
