import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Briefcase, HeartHandshake, MapPin } from "lucide-react";
import ArtisanAvatar from "@/components/artisan/ArtisanAvatar";
import ProductGrid from "@/components/product/ProductGrid";
import Button from "@/components/ui/Button";
import { ErrorNotice } from "@/components/ui/States";
import { ApiError, api } from "@/lib/api";
import type { Artisan } from "@/lib/types";

export const dynamic = "force-dynamic";

async function getArtisan(slug: string): Promise<Artisan | null> {
  try {
    return await api<Artisan>(`/artisans/${slug}`);
  } catch (e) {
    if (e instanceof ApiError && e.status === 404) return null;
    throw e;
  }
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const a = await getArtisan(slug).catch(() => null);
  return { title: a ? `${a.name} — Artisan` : "Artisan" };
}

export default async function ArtisanPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  let a: Artisan | null;
  try {
    a = await getArtisan(slug);
  } catch {
    return <div className="container-page py-20"><ErrorNotice message="We couldn't load this artisan right now." /></div>;
  }
  if (!a) notFound();
  const first = a.name.split(" ")[0];

  return (
    <div className="container-page py-8 md:py-14">
      <nav aria-label="Breadcrumb" className="mb-6 text-sm text-brown-soft">
        <Link href="/artisans" className="hover:text-terracotta">← All artisans</Link>
      </nav>

      <p className="eyebrow mb-2">Meet the artisan</p>
      <h1 className="text-4xl font-semibold md:text-6xl">{a.name}</h1>

      <section className="mt-8 grid items-center gap-8 md:grid-cols-[320px_1fr] md:gap-12">
        <ArtisanAvatar name={a.name} src={a.avatar} className="mx-auto h-64 w-64 text-lg shadow-lift md:h-80 md:w-80" sizes="320px" />
        <div>
          <p className="flex items-center gap-2 text-lg text-brown-soft"><MapPin className="h-5 w-5 text-terracotta" aria-hidden /> {a.location}, India</p>
          <p className="mt-2 flex items-center gap-2 text-sm text-brown-soft"><Briefcase className="h-4 w-4 text-forest" aria-hidden /> {a.specialisation} · {a.years_experience} years of experience</p>
          <p className="mt-5 font-serif text-xl italic text-forest">“{a.tagline}”</p>
          <p className="mt-4 text-lg leading-relaxed text-brown-soft">{a.story}</p>
          <p className="mt-3 text-xs text-brown-soft">Fictional sample profile for demonstration — real artisan stories will replace this.</p>
        </div>
      </section>

      <section className="mt-12 grid gap-6 md:grid-cols-2" aria-label="Journey and impact">
        <div className="card p-6">
          <h2 className="text-2xl font-semibold">{first}’s journey</h2>
          <ol className="relative mt-5 space-y-5 border-l-2 border-sage pl-6">
            {a.journey.map((step) => (
              <li key={step} className="relative text-brown-soft">
                <span className="absolute -left-[31px] top-1.5 h-3 w-3 rounded-full bg-terracotta ring-4 ring-ivory" aria-hidden />
                {step}
              </li>
            ))}
          </ol>
        </div>
        <div className="flex gap-4 rounded-2xl bg-beige/70 p-6">
          <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-white text-terracotta"><HeartHandshake className="h-7 w-7" aria-hidden /></span>
          <div>
            <h2 className="text-2xl font-semibold">Your purchase makes a difference</h2>
            <p className="mt-2 leading-relaxed text-brown-soft">Every product you buy helps artisans like {first} earn a sustainable income and continue their craft.</p>
          </div>
        </div>
      </section>

      <section className="mt-14" aria-labelledby="more-title">
        <h2 id="more-title" className="mb-6 text-2xl font-semibold md:text-3xl">More from {first}</h2>
        {a.products && a.products.length > 0 ? <ProductGrid products={a.products} /> : <p className="text-brown-soft">New pieces are on the way.</p>}
        <div className="mt-10 text-center"><Button href="/shop" size="lg">View All Products</Button></div>
      </section>
    </div>
  );
}
