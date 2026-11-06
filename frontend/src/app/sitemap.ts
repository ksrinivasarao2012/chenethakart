import type { MetadataRoute } from "next";
import { api } from "@/lib/api";
import { SITE_URL } from "@/lib/site";
import type { Artisan, ProductPage } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const pages = ["", "/shop", "/categories", "/artisans", "/about", "/quality", "/support"].map((p) => ({
    url: `${SITE_URL}${p}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: p === "" ? 1 : 0.7,
  }));

  // Product and artisan pages come from the API; if it is unreachable we still serve the static pages.
  const [products, artisans] = await Promise.all([
    api<ProductPage>("/products?page_size=48").then((d) => d.items).catch(() => []),
    api<Artisan[]>("/artisans").catch(() => [] as Artisan[]),
  ]);

  return [
    ...pages,
    ...products.map((p) => ({ url: `${SITE_URL}/product/${p.slug}`, lastModified: now, changeFrequency: "weekly" as const, priority: 0.8 })),
    ...artisans.map((a) => ({ url: `${SITE_URL}/artisans/${a.slug}`, lastModified: now, changeFrequency: "monthly" as const, priority: 0.6 })),
  ];
}
