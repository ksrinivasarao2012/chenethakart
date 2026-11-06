"use client";

import Image from "next/image";
import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useToast } from "@/context/ToastContext";
import { cn, discountPercent, formatINR } from "@/lib/format";
import type { Product } from "@/lib/types";
import Rating from "../ui/Rating";
import WishlistButton from "./WishlistButton";

function StatusBadge({ p }: { p: Product }) {
  const base = "rounded-full px-2.5 py-1 text-[11px] font-semibold";
  if (p.availability === "out_of_stock") return <span className={cn(base, "bg-brown text-white")}>Sold out</span>;
  if (p.availability === "low_stock") return <span className={cn(base, "bg-terracotta-light text-terracotta-dark")}>Only {p.stock} left</span>;
  if (p.bestseller) return <span className={cn(base, "bg-forest text-white")}>Bestseller</span>;
  if (p.is_new) return <span className={cn(base, "bg-sage-light text-forest")}>New</span>;
  return null;
}

export default function ProductCard({ product: p, priority = false }: { product: Product; priority?: boolean }) {
  const { add } = useCart();
  const toast = useToast();
  const off = discountPercent(p.price, p.compare_at_price);
  const soldOut = p.availability === "out_of_stock";

  const quickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const r = add(p, 1);
    if (r === "soldout") toast(`${p.name} is sold out.`, "error");
    else if (r === "limit") toast("You've reached the maximum quantity for this item.", "info");
    else toast(`${p.name} added to your cart.`);
  };

  return (
    <article className="group">
      <div className="relative">
        <Link href={`/product/${p.slug}`} className="block" aria-label={`${p.name}, ${formatINR(p.price)}`} tabIndex={-1}>
          <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-beige shadow-soft">
            {p.image && (
              <Image
                src={p.image}
                alt={p.name}
                fill
                priority={priority}
                sizes="(min-width:1280px) 22vw, (min-width:768px) 30vw, 46vw"
                className={cn("object-cover transition duration-500 group-hover:scale-105", soldOut && "opacity-70 saturate-50")}
              />
            )}
            <div className="absolute left-3 top-3">
              <StatusBadge p={p} />
            </div>
          </div>
        </Link>
        <WishlistButton productId={p.id} name={p.name} className="absolute right-3 top-3" />
        <button
          type="button"
          onClick={quickAdd}
          disabled={soldOut}
          aria-label={soldOut ? `${p.name} is sold out` : `Add ${p.name} to cart`}
          className="absolute bottom-3 right-3 flex h-10 w-10 items-center justify-center rounded-full bg-terracotta text-white shadow-soft transition hover:bg-terracotta-dark disabled:hidden md:translate-y-2 md:opacity-0 md:group-hover:translate-y-0 md:group-hover:opacity-100 md:focus-visible:translate-y-0 md:focus-visible:opacity-100"
        >
          <ShoppingBag className="h-[18px] w-[18px]" />
        </button>
      </div>
      <Link href={`/product/${p.slug}`} className="mt-3 block px-0.5">
        <h3 className="line-clamp-1 font-sans text-[0.95rem] font-medium text-brown">{p.name}</h3>
        <p className="mt-0.5 line-clamp-1 text-xs text-brown-soft">by {p.artisan.name}</p>
        <p className="mt-1.5 flex items-baseline gap-2">
          <span className="text-base font-semibold text-terracotta">{formatINR(p.price)}</span>
          {p.compare_at_price && p.compare_at_price > p.price && (
            <>
              <span className="text-xs text-brown-soft line-through">{formatINR(p.compare_at_price)}</span>
              <span className="text-xs font-semibold text-forest">{off}% off</span>
            </>
          )}
        </p>
        <div className="mt-1">
          <Rating value={p.rating} count={p.review_count} />
        </div>
      </Link>
    </article>
  );
}
