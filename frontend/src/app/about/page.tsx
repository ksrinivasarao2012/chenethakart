import type { Metadata } from "next";
import Image from "next/image";
import { BadgeCheck, Eye, HandHeart, Leaf, Recycle, Sprout, Target } from "lucide-react";
import Button from "@/components/ui/Button";

export const metadata: Metadata = { title: "Our Story" };

const block = "card p-6 md:p-8";

export default function AboutPage() {
  return (
    <>
      <section className="bg-gradient-to-b from-beige/70 to-ivory">
        <div className="container-page grid items-center gap-10 py-12 md:py-20 lg:grid-cols-2">
          <div>
            <p className="eyebrow mb-3">Our story</p>
            <h1 className="text-4xl font-semibold leading-tight md:text-6xl">Handmade Stories, <span className="text-terracotta">Brighter Tomorrows.</span></h1>
            <p className="mt-6 text-lg leading-relaxed text-brown-soft">
              Chenethakart began with a simple belief: the people who make beautiful things by hand deserve to be seen, paid fairly and
              celebrated — and the people who buy them deserve to know the story behind every stitch.
            </p>
          </div>
          <div className="relative mx-auto aspect-[4/3] w-full max-w-lg overflow-hidden rounded-3xl shadow-lift">
            <Image src="/images/products/turtle-1.jpg" alt="A handmade crochet turtle" fill priority sizes="(min-width:1024px) 40vw, 90vw" className="object-cover" />
          </div>
        </div>
      </section>

      <section className="container-page section">
        <div className="mx-auto max-w-3xl space-y-5 text-lg leading-relaxed text-brown-soft">
          <h2 className="text-3xl font-semibold md:text-4xl">Why Chenethakart exists</h2>
          <p>Across India, thousands of crochet and handloom artisans — many of them women working from their homes — create extraordinary pieces. But reaching customers beyond their town is hard, and quality that varies from batch to batch makes it harder to earn trust.</p>
          <p>We bridge that gap. We find talented independent artisans, source their unique products, put every piece through multiple quality checks, and present approved work under the Chenethakart name with careful packaging. Customers get distinctive handmade products they can rely on. Artisans get a wider market and a more sustainable income.</p>
        </div>
      </section>

      <section className="container-page pb-12 md:pb-20" aria-label="Mission and vision">
        <div className="grid gap-6 md:grid-cols-2">
          <div className={block}>
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-terracotta-light text-terracotta"><Target className="h-6 w-6" aria-hidden /></span>
            <h2 className="mt-4 text-2xl font-semibold">Our mission</h2>
            <p className="mt-3 leading-relaxed text-brown-soft">To offer unique, quality-checked handmade crafts that celebrate Indian artisans and individuality — while helping those artisans reach wider markets and build sustainable livelihoods.</p>
          </div>
          <div className={block}>
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-forest-light text-forest"><Eye className="h-6 w-6" aria-hidden /></span>
            <h2 className="mt-4 text-2xl font-semibold">Our vision</h2>
            <p className="mt-3 leading-relaxed text-brown-soft">A world where handmade is the first choice for thoughtful gifts and homes — and where every artisan can make a good living from her craft, in her own community.</p>
          </div>
        </div>
      </section>

      <section className="bg-beige/50">
        <div className="container-page section">
          <div className="mx-auto mb-10 max-w-2xl text-center">
            <p className="eyebrow mb-2">What we stand for</p>
            <h2 className="text-3xl font-semibold md:text-4xl">Our commitments</h2>
          </div>
          <ul className="grid gap-5 md:grid-cols-2">
            {[
              { icon: HandHeart, t: "Commitment to Indian artisans", d: "We work with independent artisans directly, respect their time and skill, and aim to pay fairly. Their names and stories travel with their work." },
              { icon: BadgeCheck, t: "Quality assurance philosophy", d: "Quality is how we honour the artisan and the customer. Every product is inspected for stitching, finishing, material quality and dimensions. If it isn't ready, we send it back with kind, specific feedback — never discard it." },
              { icon: Leaf, t: "Sustainability", d: "Natural and cotton-based fibres, small-batch making, no fast-fashion waste, and packaging that is minimal and recyclable." },
              { icon: Sprout, t: "Traditional craftsmanship", d: "Crochet and handloom are living traditions passed from mother to daughter. By giving them a modern market, we help keep them alive for the next generation." },
            ].map(({ icon: Icon, t, d }) => (
              <li key={t} className={block + " flex gap-4"}>
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-sage-light text-forest"><Icon className="h-6 w-6" aria-hidden /></span>
                <div><h3 className="text-xl font-semibold">{t}</h3><p className="mt-2 text-sm leading-relaxed text-brown-soft">{d}</p></div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="container-page section text-center">
        <Recycle className="mx-auto h-9 w-9 text-terracotta" aria-hidden />
        <h2 className="mt-3 text-3xl font-semibold md:text-4xl">Every purchase makes a difference</h2>
        <p className="mx-auto mt-3 max-w-xl text-brown-soft">Meet the artisans, see how we check every piece, and find something that tells a story.</p>
        <div className="mt-7 flex flex-wrap justify-center gap-3">
          <Button href="/artisans" size="lg">Meet our artisans</Button>
          <Button href="/quality" size="lg" variant="outline">Our quality promise</Button>
        </div>
      </section>
    </>
  );
}
