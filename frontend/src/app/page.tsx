import { ShieldCheck } from "lucide-react";
import ArtisanSpotlight from "@/components/home/ArtisanSpotlight";
import CategoryTiles from "@/components/home/CategoryTiles";
import Hero from "@/components/home/Hero";
import Newsletter from "@/components/home/Newsletter";
import QualityTimeline from "@/components/home/QualityTimeline";
import Testimonials from "@/components/home/Testimonials";
import WhyChoose from "@/components/home/WhyChoose";
import ProductGrid from "@/components/product/ProductGrid";
import Button from "@/components/ui/Button";
import { ErrorNotice } from "@/components/ui/States";
import SectionHeading from "@/components/ui/SectionHeading";
import { api } from "@/lib/api";
import type { Category, HomeData } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  let data: HomeData, categories: Category[];
  try {
    [data, categories] = await Promise.all([api<HomeData>("/home"), api<Category[]>("/categories")]);
  } catch {
    return (
      <div className="container-page py-24">
        <ErrorNotice message="We couldn't load the store right now. Please make sure the API is running and refresh." />
      </div>
    );
  }

  return (
    <>
      <Hero />

      <section className="container-page section pb-4 md:pb-8" aria-labelledby="cat-title">
        <SectionHeading title="Shop by Category" href="/categories" />
        <h2 id="cat-title" className="sr-only">Categories</h2>
        <CategoryTiles categories={categories} />
      </section>

      <section className="container-page section" aria-label="Featured products">
        <SectionHeading title="Featured Products" eyebrow="Hand-picked" href="/shop?sort=popular" />
        <ProductGrid products={data.featured} />
      </section>

      <section className="bg-beige/50">
        <div className="container-page section">
          <SectionHeading title="Bestsellers" eyebrow="Loved by customers" href="/shop?sort=popular" />
          <ProductGrid products={data.bestsellers} />
        </div>
      </section>

      <section className="container-page section" aria-label="New arrivals">
        <SectionHeading title="New Arrivals" eyebrow="Fresh off the hook" href="/shop?sort=newest" />
        <ProductGrid products={data.new_arrivals} />
      </section>

      <section className="container-page pb-12 md:pb-20" aria-label="Artisan spotlight">
        <SectionHeading title="Meet the Hands Behind the Craft" eyebrow="Artisan spotlight" href="/artisans" linkLabel="All artisans" />
        <ArtisanSpotlight artisans={data.artisans} />
      </section>

      <section className="bg-ivory" aria-label="Why choose Chenethakart">
        <div className="container-page pb-12 md:pb-20">
          <SectionHeading align="center" eyebrow="Why Chenethakart" title="Why Choose Chenethakart?" subtitle="We connect you directly with India’s finest crochet and handloom artisans — and make sure every piece is worthy of them." />
          <WhyChoose />
        </div>
      </section>

      <section className="bg-forest py-14 text-ivory md:py-20" aria-labelledby="qa-title">
        <div className="container-page">
          <div className="mx-auto mb-12 max-w-2xl text-center">
            <ShieldCheck className="mx-auto h-9 w-9 text-sage" aria-hidden />
            <h2 id="qa-title" className="mt-3 text-3xl font-semibold !text-white md:text-4xl">Our Quality Assurance Promise</h2>
            <p className="mt-3 text-ivory/80">Nothing carries our name until it has passed our inspections. Pieces that don’t make the cut go back to the artisan to be perfected.</p>
          </div>
          <QualityTimeline variant="compact" />
          <div className="mt-12 text-center">
            <Button href="/quality" variant="soft">See how we check every piece</Button>
          </div>
        </div>
      </section>

      <section className="container-page section" aria-labelledby="love-title">
        <SectionHeading align="center" eyebrow="Customer love" title="What our customers say" />
        <h2 id="love-title" className="sr-only">Testimonials</h2>
        <Testimonials />
      </section>

      <section className="container-page pb-4" aria-label="Newsletter">
        <Newsletter />
      </section>
    </>
  );
}
