"use client";

import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, ShoppingBag, Trash2, Truck } from "lucide-react";
import CouponBox from "@/components/cart/CouponBox";
import Totals from "@/components/cart/Totals";
import Button from "@/components/ui/Button";
import { EmptyState, ErrorNotice, Skeleton } from "@/components/ui/States";
import { useCart } from "@/context/CartContext";
import { useToast } from "@/context/ToastContext";
import { useQuote } from "@/hooks/useQuote";
import { formatINR } from "@/lib/format";

export default function CartPage() {
  const { items, ready, setQuantity, remove, coupon } = useCart();
  const toast = useToast();
  const { quote, loading, error } = useQuote(items, "standard", coupon);

  if (!ready) {
    return <div className="container-page py-12"><Skeleton className="h-64 w-full" /></div>;
  }
  if (items.length === 0) {
    return (
      <div className="container-page py-10">
        <EmptyState icon={<ShoppingBag className="h-8 w-8" />} title="Your cart is empty" text="Find something handmade and wonderful — every piece is quality checked." actionHref="/shop" actionLabel="Continue Shopping" />
      </div>
    );
  }

  const stepper = "flex h-9 w-9 items-center justify-center rounded-full hover:bg-beige disabled:opacity-40";
  const gap = quote?.free_shipping_gap ?? 0;
  const progress = quote ? Math.min(100, Math.round((quote.subtotal / 999) * 100)) : 0;

  return (
    <div className="container-page py-8 md:py-14">
      <h1 className="text-3xl font-semibold md:text-5xl">Your Cart</h1>
      <p className="mt-1 text-brown-soft">{items.reduce((n, i) => n + i.quantity, 0)} item(s)</p>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_400px]">
        <div>
          <ul className="space-y-4">
            {items.map((i) => (
              <li key={i.productId} className="card flex gap-4 p-4 sm:p-5">
                <Link href={`/product/${i.slug}`} className="relative h-28 w-24 shrink-0 overflow-hidden rounded-xl bg-beige sm:h-32 sm:w-28">
                  {i.image && <Image src={i.image} alt={i.name} fill sizes="112px" className="object-cover" />}
                </Link>
                <div className="flex min-w-0 flex-1 flex-col">
                  <div className="flex items-start justify-between gap-3">
                    <Link href={`/product/${i.slug}`} className="font-medium hover:text-terracotta">{i.name}</Link>
                    <p className="shrink-0 font-semibold">{formatINR(i.price * i.quantity)}</p>
                  </div>
                  <p className="mt-0.5 text-sm text-brown-soft">{formatINR(i.price)} each</p>
                  <div className="mt-auto flex items-center justify-between pt-3">
                    <div className="flex items-center rounded-full border border-beige-dark" role="group" aria-label={`Quantity for ${i.name}`}>
                      <button className={stepper} onClick={() => setQuantity(i.productId, i.quantity - 1)} disabled={i.quantity <= 1} aria-label="Decrease quantity"><Minus className="h-4 w-4" /></button>
                      <span className="w-8 text-center text-sm font-semibold" aria-live="polite">{i.quantity}</span>
                      <button className={stepper} onClick={() => setQuantity(i.productId, i.quantity + 1)} disabled={i.quantity >= Math.min(10, i.stock)} aria-label="Increase quantity"><Plus className="h-4 w-4" /></button>
                    </div>
                    <button onClick={() => { remove(i.productId); toast(`${i.name} removed from your cart.`, "info"); }} className="inline-flex items-center gap-1.5 text-sm text-brown-soft hover:text-terracotta">
                      <Trash2 className="h-4 w-4" aria-hidden /> Remove
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
          <Button href="/shop" variant="ghost" className="mt-6">← Continue Shopping</Button>
        </div>

        <aside className="card h-fit p-6 lg:sticky lg:top-28" aria-label="Order summary">
          <h2 className="text-2xl font-semibold">Order summary</h2>
          {quote && (
            <div className="mt-4 rounded-xl bg-beige/60 p-4 text-sm">
              <p className="flex items-center gap-2 font-medium"><Truck className="h-4 w-4 text-terracotta" aria-hidden />
                {gap > 0 ? `Add ${formatINR(gap)} more for free shipping` : "You've unlocked free shipping!"}
              </p>
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-white" role="progressbar" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100} aria-label="Progress to free shipping">
                <div className="h-full rounded-full bg-forest transition-all" style={{ width: `${progress}%` }} />
              </div>
            </div>
          )}
          <div className="mt-5"><CouponBox quote={quote} /></div>
          <div className="mt-6">
            {error ? <ErrorNotice message={error} /> : quote ? <Totals quote={quote} loading={loading} /> : <Skeleton className="h-32 w-full" />}
          </div>
          <Button href="/checkout" size="lg" className="mt-6 w-full" aria-disabled={!quote}>Proceed to Checkout</Button>
          <p className="mt-3 text-center text-xs text-brown-soft">Shipping shown is for Standard delivery. Choose Express at checkout.</p>
        </aside>
      </div>
    </div>
  );
}
