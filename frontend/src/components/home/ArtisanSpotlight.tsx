import Link from "next/link";
import { ArrowRight, MapPin } from "lucide-react";
import type { Artisan } from "@/lib/types";
import ArtisanAvatar from "../artisan/ArtisanAvatar";
import Button from "../ui/Button";

export default function ArtisanSpotlight({ artisans }: { artisans: Artisan[] }) {
  const [lead, ...rest] = artisans;
  if (!lead) return null;
  return (
    <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
      <article className="card flex flex-col items-center gap-6 p-6 sm:flex-row sm:p-8">
        <ArtisanAvatar name={lead.name} src={lead.avatar} className="h-44 w-44 shrink-0 text-lg sm:h-52 sm:w-52" sizes="208px" />
        <div className="text-center sm:text-left">
          <p className="eyebrow">Artisan spotlight</p>
          <h3 className="mt-1 text-3xl font-semibold">{lead.name}</h3>
          <p className="mt-1 flex items-center justify-center gap-1 text-sm text-brown-soft sm:justify-start">
            <MapPin className="h-4 w-4 text-terracotta" aria-hidden /> {lead.location}
          </p>
          <p className="mt-4 leading-relaxed text-brown-soft">{lead.story}</p>
          <p className="mt-2 text-xs text-brown-soft">Fictional sample profile for demonstration.</p>
          <Button href={`/artisans/${lead.slug}`} className="mt-5">Read {lead.name.split(" ")[0]}’s story <ArrowRight className="h-4 w-4" aria-hidden /></Button>
        </div>
      </article>
      <div className="grid gap-4">
        {rest.map((a) => (
          <Link key={a.slug} href={`/artisans/${a.slug}`} className="card group flex items-center gap-4 p-5 transition hover:-translate-y-0.5 hover:shadow-lift">
            <ArtisanAvatar name={a.name} src={a.avatar} className="h-16 w-16 text-sm" sizes="64px" />
            <div className="min-w-0 flex-1">
              <h3 className="font-serif text-lg font-semibold">{a.name}</h3>
              <p className="text-sm text-brown-soft">{a.location}</p>
              <p className="mt-1 truncate text-xs font-medium text-forest">{a.specialisation}</p>
            </div>
            <ArrowRight className="h-5 w-5 text-terracotta transition group-hover:translate-x-1" aria-hidden />
          </Link>
        ))}
        <Button href="/artisans" variant="outline" className="self-start">See all artisans</Button>
      </div>
    </div>
  );
}
