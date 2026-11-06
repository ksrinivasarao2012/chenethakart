import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BadgeCheck, Gift, HandHeart, Leaf, MapPin, RotateCcw, ShieldCheck, Sprout, Truck } from "lucide-react";
import ArtisanAvatar from "@/components/artisan/ArtisanAvatar";
import ProductGallery from "@/components/product/ProductGallery";
import ProductGrid from "@/components/product/ProductGrid";
import PurchasePanel from "@/components/product/PurchasePanel";
import Reviews from "@/components/product/Reviews";
import Rating from "@/components/ui/Rating";
import { ErrorNotice } from "@/components/ui/States";
import { ApiError, api } from "@/lib/api";
import { discountPercent, formatINR } from "@/lib/format";
import { SITE_URL } from "@/lib/site";
import type { ProductDetail } from "@/lib/types";

export const dynamic = "force-dynamic";

async function getProduct(slug: string): Promise<ProductDetail | null> {
  try {
    return await api<ProductDetail>(`/products/${slug}`);
  } catch (e) {
    if (e instanceof ApiError && e.status === 404) return null;
    throw e;
  }
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const p = await getProduct(slug).catch(() => null);
  if (!p) return { title: "Product" };
  return {
    title: p.name,
    description: p.short_description,
    alternates: { canonical: `/product/${p.slug}` },
    openGraph: { title: p.name, description: p.short_description, images: p.image ? [{ url: p.image }] : undefined },
  };
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  let p: ProductDetail | null;
  try {
    p = await getProduct(slug);
  } catch {
    return <div className="container-page py-20"><ErrorNotice message="We couldn't load this product right now. Please try again." /></div>;
  }
  if (!p) notFound();

  const off = discountPercent(p.price, p.compare_at_price);
  const stockNote =
    p.availability === "out_of_stock" ? { text: "Sold out", cls: "bg-brown text-white" }
    : p.availability === "low_stock" ? { text: `Only ${p.stock} left`, cls: "bg-terracotta-light text-terracotta-dark" }
    : { text: "In stock", cls: "bg-forest-light text-forest" };

  // Structured data so search engines can show price and availability. (Ratings are left out on purpose:
  // the demo reviews are sample content and must not be presented to search engines as real.)
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: p.name,
    description: p.short_description,
    image: p.images.map((i) => `${SITE_URL}${i}`),
    category: p.category_name,
    brand: { "@type": "Brand", name: "Chenethakart" },
    offers: {
      "@type": "Offer",
      url: `${SITE_URL}/product/${p.slug}`,
      priceCurrency: "INR",
      price: p.price,
      availability: p.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
    },
  };

  return (
    <div className="container-page py-6 md:py-10">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      <nav aria-label="Breadcrumb" className="mb-5 text-sm text-brown-soft">
        <ol className="flex flex-wrap items-center gap-1.5">
          <li><Link href="/" className="hover:text-terracotta">Home</Link></li>
          <li aria-hidden>/</li>
          <li><Link href={`/shop?category=${p.category}`} className="hover:text-terracotta">{p.category_name}</Link></li>
          <li aria-hidden>/</li>
          <li aria-current="page" className="text-brown">{p.name}</li>
        </ol>
      </nav>

      <div className="grid gap-8 lg:grid-cols-2 lg:gap-14">
        <ProductGallery images={p.images} name={p.name} productId={p.id} />

        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className={`rounded-full px-3 py-1 text-xs font-semibold ${stockNote.cls}`}>{stockNote.text}</span>
            <span className="inline-flex items-center gap-1 rounded-full bg-sage-light px-3 py-1 text-xs font-semibold text-forest">
              <BadgeCheck className="h-3.5 w-3.5" aria-hidden /> Quality checked
            </span>
          </div>
          <h1 className="mt-3 text-3xl font-semibold md:text-4xl">{p.name}</h1>
          <a href="#reviews" className="mt-2 inline-block"><Rating value={p.rating} count={p.review_count} size="md" /></a>
          <p className="mt-4 flex items-baseline gap-3">
            <span className="text-3xl font-semibold text-terracotta">{formatINR(p.price)}</span>
            {p.compare_at_price && p.compare_at_price > p.price && (
              <>
                <span className="text-lg text-brown-soft line-through">{formatINR(p.compare_at_price)}</span>
                <span className="rounded-full bg-forest-light px-2.5 py-0.5 text-sm font-semibold text-forest">{off}% off</span>
              </>
            )}
          </p>
          <p className="mt-1 text-xs text-brown-soft">Inclusive of all taxes.</p>
          <p className="mt-5 leading-relaxed text-brown-soft">{p.description}</p>

          <ul className="mt-6 grid grid-cols-3 gap-3 text-center text-xs sm:text-sm">
            {[{ i: Leaf, t: "Handmade by artisans" }, { i: HandHeart, t: "Eco-friendly materials" }, { i: Sprout, t: "Supports rural livelihoods" }].map(({ i: Icon, t }) => (
              <li key={t} className="flex flex-col items-center gap-2 rounded-2xl bg-beige/60 px-2 py-4">
                <Icon className="h-6 w-6 text-forest" aria-hidden /> {t}
              </li>
            ))}
          </ul>

          <div className="mt-7"><PurchasePanel product={p} /></div>

          <div className="mt-6 space-y-3 rounded-2xl border border-beige bg-white p-5 text-sm">
            <p className="flex items-start gap-3"><Truck className="mt-0.5 h-5 w-5 shrink-0 text-terracotta" aria-hidden /><span><strong>Delivery:</strong> Standard 5–7 business days (free above ₹999, otherwise ₹60). Express 2–3 business days for ₹149.</span></p>
            <p className="flex items-start gap-3"><RotateCcw className="mt-0.5 h-5 w-5 shrink-0 text-terracotta" aria-hidden /><span><strong>Easy returns:</strong> 7-day returns on unused items. <Link href="/support#returns" className="font-medium text-terracotta underline">Read the policy</Link></span></p>
            <p className="flex items-start gap-3"><Gift className="mt-0.5 h-5 w-5 shrink-0 text-terracotta" aria-hidden /><span><strong>Gift-ready:</strong> Branded Chenethakart packaging with a care card.</span></p>
          </div>
        </div>
      </div>

      <div className="mt-14 grid gap-6 lg:grid-cols-3">
        <section className="card p-6" aria-labelledby="spec-title">
          <h2 id="spec-title" className="text-xl font-semibold">Materials & specifications</h2>
          <ul className="mt-3 list-inside list-disc space-y-1 text-sm text-brown-soft">
            {p.materials.map((m) => <li key={m}>{m}</li>)}
          </ul>
          <dl className="mt-4 divide-y divide-beige text-sm">
            {Object.entries(p.specs).map(([k, v]) => (
              <div key={k} className="flex justify-between gap-4 py-2"><dt className="text-brown-soft">{k}</dt><dd className="text-right font-medium">{v}</dd></div>
            ))}
          </dl>
          <p className="mt-4 rounded-xl bg-beige/60 p-3 text-xs leading-relaxed text-brown-soft"><strong className="text-brown">Care:</strong> {p.care}</p>
        </section>

        <section className="card p-6" aria-labelledby="qc-title">
          <h2 id="qc-title" className="flex items-center gap-2 text-xl font-semibold"><ShieldCheck className="h-6 w-6 text-forest" aria-hidden /> Quality check</h2>
          <p className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-forest-light px-3 py-1 text-sm font-semibold text-forest"><BadgeCheck className="h-4 w-4" aria-hidden /> {p.qc.status}</p>
          <p className="mt-2 text-xs text-brown-soft">Last inspected on {p.qc.checked_on}</p>
          <ul className="mt-4 space-y-2 text-sm">
            {p.qc.checks.map((c) => <li key={c} className="flex items-center gap-2"><BadgeCheck className="h-4 w-4 text-forest" aria-hidden /> {c}</li>)}
          </ul>
          <Link href="/quality" className="mt-4 inline-block text-sm font-medium text-terracotta underline">How we inspect every piece</Link>
        </section>

        <section className="card p-6" aria-labelledby="art-title">
          <h2 id="art-title" className="text-xl font-semibold">Made by</h2>
          <div className="mt-4 flex items-center gap-4">
            <ArtisanAvatar name={p.artisan.name} src={p.artisan.avatar} className="h-20 w-20 text-base" sizes="80px" />
            <div>
              <p className="font-serif text-xl font-semibold">{p.artisan.name}</p>
              <p className="flex items-center gap-1 text-sm text-brown-soft"><MapPin className="h-3.5 w-3.5 text-terracotta" aria-hidden /> {p.artisan.location}</p>
            </div>
          </div>
          <p className="mt-3 text-sm font-medium text-forest">{p.artisan.specialisation}</p>
          <p className="mt-2 line-clamp-4 text-sm leading-relaxed text-brown-soft">{p.artisan.story}</p>
          <p className="mt-2 text-xs text-brown-soft">Fictional sample profile.</p>
          <Link href={`/artisans/${p.artisan.slug}`} className="mt-3 inline-block text-sm font-medium text-terracotta underline">Meet {p.artisan.name.split(" ")[0]}</Link>
        </section>
      </div>

      <div className="mt-16"><Reviews slug={p.slug} rating={p.rating} reviewCount={p.review_count} initial={p.reviews} /></div>

      {p.related.length > 0 && (
        <section className="mt-16" aria-labelledby="rel-title">
          <h2 id="rel-title" className="mb-6 text-2xl font-semibold md:text-3xl">You may also love</h2>
          <ProductGrid products={p.related} />
        </section>
      )}
    </div>
  );
}
