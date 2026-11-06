import { BadgeCheck, HandHeart, Leaf, Sprout } from "lucide-react";

const ITEMS = [
  { icon: HandHeart, title: "Truly handmade", text: "Every product is crocheted or woven by an independent Indian artisan — no factory lines." },
  { icon: BadgeCheck, title: "Quality checked", text: "Multiple inspections for stitching, finishing, materials and size before anything ships." },
  { icon: Sprout, title: "Supports livelihoods", text: "Your purchase helps artisans, many from rural communities, earn a sustainable income." },
  { icon: Leaf, title: "Gentle on the planet", text: "Soft cotton and natural fibres, small-batch making and minimal, recyclable packaging." },
];

export default function WhyChoose() {
  return (
    <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
      {ITEMS.map(({ icon: Icon, title, text }) => (
        <li key={title} className="rounded-2xl bg-beige/60 p-6">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-terracotta shadow-soft">
            <Icon className="h-6 w-6" aria-hidden />
          </span>
          <h3 className="mt-4 text-xl font-semibold">{title}</h3>
          <p className="mt-2 text-sm leading-relaxed text-brown-soft">{text}</p>
        </li>
      ))}
    </ul>
  );
}
