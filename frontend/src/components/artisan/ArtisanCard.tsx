import Link from "next/link";
import { ArrowRight, MapPin } from "lucide-react";
import type { Artisan } from "@/lib/types";
import ArtisanAvatar from "./ArtisanAvatar";

export default function ArtisanCard({ artisan: a }: { artisan: Artisan }) {
  return (
    <article className="card group relative flex h-full flex-col p-6 transition hover:-translate-y-1 hover:shadow-lift">
      <div className="flex items-center gap-4">
        <ArtisanAvatar name={a.name} src={a.avatar} className="h-20 w-20 text-base" sizes="80px" />
        <div className="min-w-0">
          <h3 className="font-serif text-xl font-semibold">{a.name}</h3>
          <p className="mt-1 flex items-center gap-1 text-sm text-brown-soft">
            <MapPin className="h-3.5 w-3.5 shrink-0 text-terracotta" aria-hidden /> <span className="truncate">{a.location}</span>
          </p>
        </div>
      </div>
      <p className="mt-4 inline-block w-fit rounded-full bg-sage-light px-3 py-1 text-xs font-medium text-forest">{a.specialisation}</p>
      <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-brown-soft">{a.story}</p>
      <div className="mt-auto flex items-center justify-between pt-5">
        <span className="text-xs text-brown-soft">
          {a.product_count !== undefined ? `${a.product_count} product${a.product_count === 1 ? "" : "s"} · ` : ""}Fictional sample profile
        </span>
        <Link href={`/artisans/${a.slug}`} className="inline-flex items-center gap-1 text-sm font-medium text-terracotta after:absolute after:inset-0">
          Meet {a.name.split(" ")[0]} <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" aria-hidden />
        </Link>
      </div>
    </article>
  );
}
