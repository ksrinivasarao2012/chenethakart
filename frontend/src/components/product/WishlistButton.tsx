"use client";

import { Heart } from "lucide-react";
import { useToast } from "@/context/ToastContext";
import { useWishlist } from "@/context/WishlistContext";
import { cn } from "@/lib/format";

export default function WishlistButton({ productId, name, className }: { productId: number; name: string; className?: string }) {
  const { has, toggle } = useWishlist();
  const toast = useToast();
  const active = has(productId);

  return (
    <button
      type="button"
      aria-pressed={active}
      aria-label={active ? `Remove ${name} from wishlist` : `Add ${name} to wishlist`}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        const added = toggle(productId);
        toast(added ? `${name} added to your wishlist.` : `${name} removed from your wishlist.`, added ? "success" : "info");
      }}
      className={cn("flex h-9 w-9 items-center justify-center rounded-full bg-white/95 shadow-soft transition hover:scale-105", className)}
    >
      <Heart className={cn("h-[18px] w-[18px] transition", active ? "fill-terracotta text-terracotta" : "text-terracotta")} />
    </button>
  );
}
