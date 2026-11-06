"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Heart, ShoppingBag, Trash2 } from "lucide-react";
import Button from "@/components/ui/Button";
import Rating from "@/components/ui/Rating";
import { EmptyState, ErrorNotice, ProductGridSkeleton } from "@/components/ui/States";
import { useCart } from "@/context/CartContext";
import { useToast } from "@/context/ToastContext";
import { useWishlist } from "@/context/WishlistContext";
import { api, errorMessage } from "@/lib/api";
import { formatINR } from "@/lib/format";
import type { Product, ProductPage } from "@/lib/types";

export default function WishlistPage() {
  const { ids, remove } = useWishlist();
  const { add } = useCart();
  const toast = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const key = ids.join(",");

  useEffect(() => {
    if (ids.length === 0) {
      setProducts([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    api<ProductPage>(`/products?ids=${key}&page_size=48`)
      .then((d) => { setProducts(d.items); setError(""); })
      .catch((e) => setError(errorMessage(e)))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  const visible = products.filter((p) => ids.includes(p.id));

  const moveToCart = (p: Product) => {
    const r = add(p, 1);
    if (r === "soldout") return toast(`${p.name} is sold out right now.`, "error");
    remove(p.id);
    toast(`${p.name} moved to your cart.`);
  };

  return (
    <div className="container-page py-8 md:py-14">
      <p className="eyebrow mb-2">Saved for later</p>
      <h1 className="text-3xl font-semibold md:text-5xl">Your Wishlist</h1>
      <div className="mt-8">
        {loading ? <ProductGridSkeleton count={Math.max(2, ids.length)} />
        : error ? <ErrorNotice message={error} />
        : visible.length === 0 ? <EmptyState icon={<Heart className="h-8 w-8" />} title="Your wishlist is empty" text="Tap the heart on any product to save it here." actionHref="/shop" actionLabel="Discover products" />
        : (
          <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {visible.map((p) => (
              <li key={p.id} className="card flex gap-4 p-4">
                <Link href={`/product/${p.slug}`} className="relative h-36 w-28 shrink-0 overflow-hidden rounded-xl bg-beige">
                  {p.image && <Image src={p.image} alt={p.name} fill sizes="112px" className="object-cover" />}
                </Link>
                <div className="flex min-w-0 flex-1 flex-col">
                  <Link href={`/product/${p.slug}`} className="font-medium hover:text-terracotta">{p.name}</Link>
                  <p className="mt-0.5 text-xs text-brown-soft">by {p.artisan.name}</p>
                  <div className="mt-1"><Rating value={p.rating} count={p.review_count} /></div>
                  <p className="mt-1 font-semibold text-terracotta">{formatINR(p.price)}</p>
                  {p.availability === "out_of_stock" && <p className="text-xs font-semibold text-brown-soft">Sold out</p>}
                  <div className="mt-auto flex items-center gap-2 pt-3">
                    <Button size="sm" onClick={() => moveToCart(p)} disabled={p.availability === "out_of_stock"}><ShoppingBag className="h-4 w-4" aria-hidden /> Move to cart</Button>
                    <button onClick={() => { remove(p.id); toast(`${p.name} removed from your wishlist.`, "info"); }} aria-label={`Remove ${p.name} from wishlist`} className="rounded-full p-2 text-brown-soft hover:bg-beige hover:text-terracotta"><Trash2 className="h-4 w-4" /></button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
