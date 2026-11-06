"use client";

import Image from "next/image";
import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/format";
import WishlistButton from "./WishlistButton";

export default function ProductGallery({ images, name, productId }: { images: string[]; name: string; productId: number }) {
  const [i, setI] = useState(0);
  const go = (d: number) => setI((cur) => (cur + d + images.length) % images.length);
  const labels = ["Front view", "Close-up detail", "Lower detail"];

  return (
    <div>
      <div className="relative aspect-[5/4] overflow-hidden rounded-3xl bg-beige shadow-soft sm:aspect-square lg:aspect-[5/4]">
        <Image
          key={images[i]}
          src={images[i]}
          alt={`${name} — ${labels[i] ?? `view ${i + 1}`}`}
          fill
          priority
          sizes="(min-width:1024px) 50vw, 100vw"
          className="object-cover"
        />
        <WishlistButton productId={productId} name={name} className="absolute right-4 top-4 h-11 w-11" />
        {images.length > 1 && (
          <>
            <button onClick={() => go(-1)} aria-label="Previous image" className="absolute left-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 shadow-soft hover:bg-white">
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button onClick={() => go(1)} aria-label="Next image" className="absolute right-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 shadow-soft hover:bg-white">
              <ChevronRight className="h-5 w-5" />
            </button>
          </>
        )}
      </div>
      {images.length > 1 && (
        <>
          <div className="mt-3 flex justify-center gap-1.5 sm:hidden" aria-hidden>
            {images.map((_, n) => (
              <span key={n} className={cn("h-2 rounded-full transition-all", n === i ? "w-5 bg-terracotta" : "w-2 bg-beige-dark")} />
            ))}
          </div>
          <div className="mt-4 hidden gap-3 sm:flex">
            {images.map((src, n) => (
              <button
                key={src}
                onClick={() => setI(n)}
                aria-label={`Show ${labels[n] ?? `image ${n + 1}`}`}
                aria-current={n === i}
                className={cn("relative h-20 w-20 overflow-hidden rounded-xl border-2 bg-beige transition", n === i ? "border-terracotta" : "border-transparent opacity-80 hover:opacity-100")}
              >
                <Image src={src} alt="" fill sizes="80px" className="object-cover" />
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
