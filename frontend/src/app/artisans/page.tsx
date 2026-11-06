import type { Metadata } from "next";
import ArtisanCard from "@/components/artisan/ArtisanCard";
import { ErrorNotice } from "@/components/ui/States";
import { api } from "@/lib/api";
import type { Artisan } from "@/lib/types";

export const metadata: Metadata = { title: "Our Artisans" };
export const dynamic = "force-dynamic";

export default async function ArtisansPage() {
  let artisans: Artisan[];
  try {
    artisans = await api<Artisan[]>("/artisans");
  } catch {
    return <div className="container-page py-20"><ErrorNotice message="We couldn't load our artisans right now." /></div>;
  }
  return (
    <div className="container-page py-10 md:py-16">
      <header className="max-w-2xl">
        <p className="eyebrow mb-2">Our artisans</p>
        <h1 className="text-3xl font-semibold md:text-5xl">The hands behind every craft</h1>
        <p className="mt-4 text-lg leading-relaxed text-brown-soft">
          Every Chenethakart product is made by an independent Indian artisan. Meet the people whose skill and patience fill your home with warmth.
        </p>
        <p className="mt-4 rounded-xl bg-beige/60 px-4 py-2.5 text-sm text-brown-soft">
          The artisan profiles below are <strong>fictional sample data</strong> until real artisan information is supplied.
        </p>
      </header>
      <ul className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {artisans.map((a) => <li key={a.slug}><ArtisanCard artisan={a} /></li>)}
      </ul>
    </div>
  );
}
