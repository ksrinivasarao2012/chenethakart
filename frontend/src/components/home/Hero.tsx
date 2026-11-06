import Image from "next/image";
import { BadgeCheck, HandHeart } from "lucide-react";
import Button from "../ui/Button";

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-beige/70 to-ivory">
      <div className="container-page grid items-center gap-8 pb-12 pt-8 md:pb-20 md:pt-14 lg:grid-cols-[1.05fr_1fr] lg:gap-14">
        <div>
          <p className="eyebrow mb-4">Indian crochet & handloom crafts</p>
          <h1 className="text-[2.6rem] font-semibold leading-[1.05] sm:text-6xl lg:text-[4.25rem]">
            Unique Handmade <span className="text-terracotta">Treasures</span>
          </h1>
          <p className="mt-5 max-w-lg text-lg leading-relaxed text-brown-soft">
            Discover one-of-a-kind creations. Celebrate the hands behind every craft.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button href="/shop" size="lg">Shop Now</Button>
            <Button href="/artisans" size="lg" variant="outline">Meet Our Artisans</Button>
          </div>
          <ul className="mt-10 flex flex-wrap gap-x-8 gap-y-3 text-sm text-brown-soft">
            <li className="flex items-center gap-2"><BadgeCheck className="h-5 w-5 text-forest" aria-hidden /> Every piece quality checked</li>
            <li className="flex items-center gap-2"><HandHeart className="h-5 w-5 text-terracotta" aria-hidden /> Made by independent artisans</li>
          </ul>
        </div>

        <div>
          <div className="relative mx-auto grid max-w-xl grid-cols-5 grid-rows-5 gap-3 sm:gap-4" style={{ aspectRatio: "1 / 0.95" }}>
            <div className="relative col-span-3 row-span-5 overflow-hidden rounded-[2rem] bg-beige shadow-lift">
              <Image src="/images/products/bunny-1.jpg" alt="Handmade crochet bunny holding a carrot" fill priority sizes="(min-width:1024px) 28vw, 55vw" className="object-cover" />
            </div>
            <div className="relative col-span-2 row-span-3 overflow-hidden rounded-[1.6rem] bg-beige shadow-soft">
              <Image src="/images/products/turtle-1.jpg" alt="Crochet turtle toy" fill sizes="(min-width:1024px) 18vw, 35vw" className="object-cover" />
            </div>
            <div className="relative col-span-2 row-span-2 overflow-hidden rounded-[1.6rem] bg-beige shadow-soft">
              <Image src="/images/products/sunflower-1.jpg" alt="Crochet sunflower bouquet" fill sizes="(min-width:1024px) 18vw, 35vw" className="object-cover object-top" />
            </div>
            <div className="absolute -bottom-3 left-2 flex items-center gap-3 rounded-2xl bg-white px-4 py-3 shadow-lift sm:left-[-1rem]">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-forest-light text-forest"><BadgeCheck className="h-5 w-5" aria-hidden /></span>
              <span className="text-sm leading-tight"><strong className="block font-semibold">Quality checked</strong><span className="text-brown-soft">before it reaches you</span></span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
