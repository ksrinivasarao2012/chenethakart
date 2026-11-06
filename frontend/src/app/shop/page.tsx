import type { Metadata } from "next";
import { Suspense } from "react";
import ShopClient from "@/components/shop/ShopClient";
import { ProductGridSkeleton } from "@/components/ui/States";
import { api } from "@/lib/api";
import type { Category } from "@/lib/types";

export const metadata: Metadata = { title: "Shop handmade crochet & handloom crafts" };
export const dynamic = "force-dynamic";

export default async function ShopPage() {
  const categories = await api<Category[]>("/categories").catch(() => [] as Category[]);
  const counts = Object.fromEntries(categories.map((c) => [c.slug, c.count]));
  return (
    <Suspense fallback={<div className="container-page py-12"><ProductGridSkeleton /></div>}>
      <ShopClient counts={counts} />
    </Suspense>
  );
}
