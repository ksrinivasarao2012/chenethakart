"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { PackageSearch, SlidersHorizontal, X } from "lucide-react";
import ProductGrid from "@/components/product/ProductGrid";
import Button from "@/components/ui/Button";
import { EmptyState, ErrorNotice, ProductGridSkeleton } from "@/components/ui/States";
import { api, errorMessage } from "@/lib/api";
import { CATEGORY_LIST } from "@/lib/constants";
import { cn } from "@/lib/format";
import type { Product, ProductPage } from "@/lib/types";

const SORTS = [
  { value: "popular", label: "Most popular" },
  { value: "newest", label: "Newest" },
  { value: "price_asc", label: "Price: low to high" },
  { value: "price_desc", label: "Price: high to low" },
];
const PRICE_PRESETS = [
  { label: "Under ₹300", min: "", max: "299" },
  { label: "₹300 – ₹600", min: "300", max: "600" },
  { label: "₹600 – ₹900", min: "600", max: "900" },
  { label: "Above ₹900", min: "901", max: "" },
];
const PAGE_SIZE = 8;

export default function ShopClient({ counts }: { counts: Record<string, number> }) {
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();

  const q = sp.get("q") ?? "";
  const category = sp.get("category") ?? "";
  const min = sp.get("min") ?? "";
  const max = sp.get("max") ?? "";
  const sort = sp.get("sort") ?? "popular";
  const inStock = sp.get("stock") === "1";

  const [items, setItems] = useState<Product[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState("");
  const [drawer, setDrawer] = useState(false);
  const [minDraft, setMinDraft] = useState(min);
  const [maxDraft, setMaxDraft] = useState(max);

  useEffect(() => {
    setMinDraft(min);
    setMaxDraft(max);
  }, [min, max]);

  const setParams = useCallback(
    (patch: Record<string, string | null>) => {
      const next = new URLSearchParams(sp.toString());
      Object.entries(patch).forEach(([k, v]) => (v ? next.set(k, v) : next.delete(k)));
      const qs = next.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [sp, router, pathname],
  );

  const queryString = useMemo(() => {
    const p = new URLSearchParams();
    if (q) p.set("q", q);
    if (category) p.set("category", category);
    if (min) p.set("min_price", min);
    if (max) p.set("max_price", max);
    if (inStock) p.set("in_stock", "true");
    p.set("sort", sort);
    p.set("page_size", String(PAGE_SIZE));
    return p.toString();
  }, [q, category, min, max, sort, inStock]);

  const load = useCallback(() => {
    setLoading(true);
    setError("");
    api<ProductPage>(`/products?${queryString}&page=1`)
      .then((d) => {
        setItems(d.items);
        setTotal(d.total);
        setPage(1);
        setPages(d.pages);
      })
      .catch((e) => setError(errorMessage(e)))
      .finally(() => setLoading(false));
  }, [queryString]);

  useEffect(load, [load]);

  const loadMore = async () => {
    setLoadingMore(true);
    try {
      const d = await api<ProductPage>(`/products?${queryString}&page=${page + 1}`);
      setItems((cur) => [...cur, ...d.items]);
      setPage(d.page);
      setPages(d.pages);
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setLoadingMore(false);
    }
  };

  const activePreset = PRICE_PRESETS.find((p) => p.min === min && p.max === max);
  const activeCount = [q, category, min || max, inStock].filter(Boolean).length;
  const clearAll = () => router.replace(pathname, { scroll: false });
  const activeCategoryName = CATEGORY_LIST.find((c) => c.slug === category)?.name;

  const applyCustom = (e: React.FormEvent) => {
    e.preventDefault();
    let lo = minDraft.replace(/\D/g, "");
    let hi = maxDraft.replace(/\D/g, "");
    if (lo && hi && Number(lo) > Number(hi)) [lo, hi] = [hi, lo];
    setParams({ min: lo || null, max: hi || null });
  };

  const filters = (
    <div className="space-y-8">
      <section aria-labelledby="f-cat">
        <h3 id="f-cat" className="mb-3 font-sans text-sm font-semibold uppercase tracking-wider text-brown">Category</h3>
        <ul className="space-y-1">
          <li>
            <button onClick={() => setParams({ category: null })} className={cn("flex w-full items-center justify-between rounded-xl px-3 py-2 text-sm hover:bg-beige/60", !category && "bg-beige font-semibold")}>
              All products <span className="text-xs text-brown-soft">{Object.values(counts).reduce((a, b) => a + b, 0)}</span>
            </button>
          </li>
          {CATEGORY_LIST.map((c) => (
            <li key={c.slug}>
              <button onClick={() => setParams({ category: c.slug })} aria-pressed={category === c.slug} className={cn("flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-sm hover:bg-beige/60", category === c.slug && "bg-beige font-semibold")}>
                {c.name} <span className="text-xs text-brown-soft">{counts[c.slug] ?? 0}</span>
              </button>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="f-price">
        <h3 id="f-price" className="mb-3 font-sans text-sm font-semibold uppercase tracking-wider text-brown">Price</h3>
        <div className="flex flex-wrap gap-2">
          {PRICE_PRESETS.map((p) => (
            <button
              key={p.label}
              aria-pressed={activePreset === p}
              onClick={() => (activePreset === p ? setParams({ min: null, max: null }) : setParams({ min: p.min || null, max: p.max || null }))}
              className={cn("rounded-full border px-3.5 py-1.5 text-xs font-medium transition", activePreset === p ? "border-forest bg-forest text-white" : "border-beige-dark bg-white hover:border-forest")}
            >
              {p.label}
            </button>
          ))}
        </div>
        <form onSubmit={applyCustom} className="mt-4 flex items-end gap-2">
          <label className="flex-1 text-xs text-brown-soft">Min ₹
            <input inputMode="numeric" value={minDraft} onChange={(e) => setMinDraft(e.target.value)} className="input mt-1 !py-2" placeholder="0" />
          </label>
          <label className="flex-1 text-xs text-brown-soft">Max ₹
            <input inputMode="numeric" value={maxDraft} onChange={(e) => setMaxDraft(e.target.value)} className="input mt-1 !py-2" placeholder="Any" />
          </label>
          <Button type="submit" size="sm" variant="soft">Go</Button>
        </form>
      </section>

      <section aria-labelledby="f-avail">
        <h3 id="f-avail" className="mb-3 font-sans text-sm font-semibold uppercase tracking-wider text-brown">Availability</h3>
        <label className="flex cursor-pointer items-center gap-3 text-sm">
          <input type="checkbox" checked={inStock} onChange={(e) => setParams({ stock: e.target.checked ? "1" : null })} className="h-4 w-4 accent-terracotta" />
          In stock only
        </label>
      </section>

      {activeCount > 0 && (
        <Button variant="outline" size="sm" onClick={clearAll} className="w-full">Clear all filters</Button>
      )}
    </div>
  );

  return (
    <div className="container-page py-8 md:py-12">
      <header className="mb-8">
        <p className="eyebrow mb-2">Shop</p>
        <h1 className="text-3xl font-semibold md:text-5xl">{q ? `Results for “${q}”` : activeCategoryName ?? "All Handmade Treasures"}</h1>
      </header>

      <div className="grid gap-10 lg:grid-cols-[250px_1fr]">
        <aside className="hidden lg:block" aria-label="Filters">{filters}</aside>

        <div>
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-beige pb-4">
            <p className="text-sm text-brown-soft" aria-live="polite">{loading ? "Loading…" : `${total} product${total === 1 ? "" : "s"}`}</p>
            <div className="flex items-center gap-3">
              <button onClick={() => setDrawer(true)} className="inline-flex items-center gap-2 rounded-full border border-beige-dark bg-white px-4 py-2 text-sm font-medium lg:hidden">
                <SlidersHorizontal className="h-4 w-4" aria-hidden /> Filters{activeCount > 0 && ` (${activeCount})`}
              </button>
              <label className="flex items-center gap-2 text-sm">
                <span className="hidden text-brown-soft sm:inline">Sort by</span>
                <select value={sort} onChange={(e) => setParams({ sort: e.target.value === "popular" ? null : e.target.value })} className="rounded-full border border-beige-dark bg-white px-4 py-2 text-sm focus:border-terracotta focus:outline-none">
                  {SORTS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
                </select>
              </label>
            </div>
          </div>

          {activeCount > 0 && (
            <ul className="mb-6 flex flex-wrap gap-2">
              {q && <Chip label={`“${q}”`} onRemove={() => setParams({ q: null })} />}
              {category && <Chip label={activeCategoryName ?? category} onRemove={() => setParams({ category: null })} />}
              {(min || max) && <Chip label={`₹${min || 0} – ${max ? "₹" + max : "any"}`} onRemove={() => setParams({ min: null, max: null })} />}
              {inStock && <Chip label="In stock" onRemove={() => setParams({ stock: null })} />}
            </ul>
          )}

          {loading ? (
            <ProductGridSkeleton count={PAGE_SIZE} />
          ) : error ? (
            <ErrorNotice message={error} onRetry={load} />
          ) : items.length === 0 ? (
            <EmptyState icon={<PackageSearch className="h-8 w-8" />} title="No products found" text="Try a different search or remove a filter or two." actionLabel="Clear filters" onAction={clearAll} />
          ) : (
            <>
              <ProductGrid products={items} columns={3} />
              <div className="mt-12 text-center">
                <p className="mb-3 text-sm text-brown-soft">Showing {items.length} of {total}</p>
                {page < pages && <Button variant="outline" size="lg" onClick={loadMore} loading={loadingMore}>Load more</Button>}
              </div>
            </>
          )}
        </div>
      </div>

      {drawer && (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label="Filters">
          <div className="absolute inset-0 bg-brown/40" onClick={() => setDrawer(false)} aria-hidden />
          <div className="absolute bottom-0 left-0 right-0 max-h-[88vh] overflow-y-auto rounded-t-3xl bg-ivory p-6 shadow-lift">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-2xl">Filters</h2>
              <button onClick={() => setDrawer(false)} aria-label="Close filters" className="rounded-full p-2 hover:bg-beige"><X className="h-6 w-6" /></button>
            </div>
            {filters}
            <Button className="mt-6 w-full" onClick={() => setDrawer(false)}>Show {total} result{total === 1 ? "" : "s"}</Button>
          </div>
        </div>
      )}
    </div>
  );
}

function Chip({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <li>
      <button onClick={onRemove} aria-label={`Remove filter ${label}`} className="inline-flex items-center gap-1.5 rounded-full bg-forest-light px-3 py-1.5 text-xs font-medium text-forest hover:bg-sage-light">
        {label} <X className="h-3.5 w-3.5" aria-hidden />
      </button>
    </li>
  );
}
