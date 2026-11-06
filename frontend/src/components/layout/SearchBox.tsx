"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Search, X } from "lucide-react";
import { api } from "@/lib/api";
import { formatINR } from "@/lib/format";
import type { Product, ProductPage } from "@/lib/types";

export default function SearchBox({ onNavigate }: { onNavigate?: () => void }) {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [results, setResults] = useState<Product[]>([]);
  const [searching, setSearching] = useState(false);
  const wrap = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const term = q.trim();
    if (term.length < 2) {
      setResults([]);
      return;
    }
    setSearching(true);
    const t = setTimeout(() => {
      api<ProductPage>(`/products?q=${encodeURIComponent(term)}&page_size=5`)
        .then((d) => setResults(d.items))
        .catch(() => setResults([]))
        .finally(() => setSearching(false));
    }, 250);
    return () => clearTimeout(t);
  }, [q]);

  useEffect(() => {
    const close = (e: MouseEvent) => {
      if (wrap.current && !wrap.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const term = q.trim();
    if (!term) return;
    setOpen(false);
    onNavigate?.();
    router.push(`/shop?q=${encodeURIComponent(term)}`);
  };

  const showPanel = open && q.trim().length >= 2;

  return (
    <div ref={wrap} className="relative w-full">
      <form onSubmit={submit} role="search" className="relative">
        <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-brown-soft" aria-hidden />
        <input
          type="search"
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={(e) => e.key === "Escape" && setOpen(false)}
          placeholder="Search crochet, bags, artisans…"
          aria-label="Search products"
          className="w-full rounded-full border border-beige-dark bg-white py-2.5 pl-11 pr-10 text-sm placeholder:text-brown-soft/70 focus:border-terracotta focus:outline-none focus:ring-2 focus:ring-terracotta/20"
        />
        {q && (
          <button type="button" onClick={() => { setQ(""); setResults([]); }} aria-label="Clear search" className="absolute right-3 top-1/2 -translate-y-1/2 text-brown-soft hover:text-brown">
            <X className="h-4 w-4" />
          </button>
        )}
      </form>
      {showPanel && (
        <div className="absolute left-0 right-0 top-full z-50 mt-2 overflow-hidden rounded-2xl border border-beige bg-white shadow-lift">
          {searching && results.length === 0 ? (
            <p className="px-4 py-4 text-sm text-brown-soft">Searching…</p>
          ) : results.length === 0 ? (
            <p className="px-4 py-4 text-sm text-brown-soft">No products match “{q.trim()}”.</p>
          ) : (
            <ul>
              {results.map((p) => (
                <li key={p.id}>
                  <Link
                    href={`/product/${p.slug}`}
                    onClick={() => {
                      setOpen(false);
                      onNavigate?.();
                    }}
                    className="flex items-center gap-3 px-4 py-2.5 hover:bg-beige/50"
                  >
                    {p.image && <Image src={p.image} alt="" width={44} height={44} className="h-11 w-11 rounded-lg object-cover" />}
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium">{p.name}</span>
                      <span className="text-xs text-brown-soft">{p.category_name}</span>
                    </span>
                    <span className="text-sm font-semibold text-terracotta">{formatINR(p.price)}</span>
                  </Link>
                </li>
              ))}
              <li className="border-t border-beige">
                <button onClick={submit} className="w-full px-4 py-3 text-left text-sm font-medium text-terracotta hover:bg-beige/50">
                  See all results for “{q.trim()}”
                </button>
              </li>
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
