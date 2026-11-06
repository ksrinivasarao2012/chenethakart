import type { Metadata } from "next";
import { ShieldCheck } from "lucide-react";
import QualityTimeline from "@/components/home/QualityTimeline";
import Button from "@/components/ui/Button";

export const metadata: Metadata = { title: "Our Quality Promise" };

export default function QualityPage() {
  return (
    <div className="container-page py-10 md:py-16">
      <header className="mx-auto max-w-2xl text-center">
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-forest-light text-forest"><ShieldCheck className="h-7 w-7" aria-hidden /></span>
        <p className="eyebrow mt-4 mb-2">Quality assurance</p>
        <h1 className="text-3xl font-semibold md:text-5xl">Checked by hand, before it reaches yours</h1>
        <p className="mt-4 text-lg leading-relaxed text-brown-soft">
          Handmade should never mean “hit or miss”. Every piece follows the same seven-step journey from the artisan’s hands to your door.
        </p>
      </header>
      <div className="mt-12"><QualityTimeline variant="full" /></div>
      <div className="mx-auto mt-14 max-w-2xl rounded-3xl bg-beige/70 p-8 text-center">
        <h2 className="text-2xl font-semibold">What happens when a piece fails?</h2>
        <p className="mt-3 leading-relaxed text-brown-soft">It is never sold. We return it to the artisan with specific notes, she corrects it, and it goes through inspection again. Only approved pieces receive the Chenethakart label.</p>
        <Button href="/shop" className="mt-6">Shop quality-checked crafts</Button>
      </div>
    </div>
  );
}
