import { Quote } from "lucide-react";
import { TESTIMONIALS } from "@/lib/constants";
import Rating from "../ui/Rating";

export default function Testimonials() {
  return (
    <>
      <ul className="grid gap-5 md:grid-cols-3">
        {TESTIMONIALS.map((t) => (
          <li key={t.name} className="card relative p-6">
            <Quote className="absolute right-5 top-5 h-8 w-8 text-terracotta-light" aria-hidden />
            <Rating value={5} />
            <p className="mt-4 leading-relaxed text-brown">“{t.text}”</p>
            <p className="mt-5 text-sm font-semibold">{t.name}</p>
            <p className="text-xs text-brown-soft">{t.city}</p>
          </li>
        ))}
      </ul>
      <p className="mt-4 text-center text-xs text-brown-soft">Sample testimonials written for this demo.</p>
    </>
  );
}
