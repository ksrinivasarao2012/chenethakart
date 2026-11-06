import type { Metadata } from "next";
import { Clock, Mail, MessageCircle, RotateCcw, Truck } from "lucide-react";
import ContactForm from "@/components/support/ContactForm";
import { CONTACT, FAQS } from "@/lib/constants";

export const metadata: Metadata = { title: "Help & Support" };

export default function SupportPage() {
  return (
    <div className="container-page py-10 md:py-16">
      <header className="max-w-2xl">
        <p className="eyebrow mb-2">Customer support</p>
        <h1 className="text-3xl font-semibold md:text-5xl">How can we help?</h1>
        <p className="mt-4 text-lg text-brown-soft">Questions about an order, a product or becoming an artisan partner? We’re happy to help.</p>
      </header>

      <section className="mt-10 grid gap-8 lg:grid-cols-[1fr_380px]" aria-label="Contact">
        <ContactForm />
        <aside className="space-y-4">
          <a href={`mailto:${CONTACT.email}`} className="card flex items-center gap-4 p-5 transition hover:-translate-y-0.5 hover:shadow-lift">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-terracotta-light text-terracotta"><Mail className="h-6 w-6" aria-hidden /></span>
            <span><span className="block font-semibold">Email support</span><span className="text-sm text-brown-soft">{CONTACT.email}</span></span>
          </a>
          <a href={`https://wa.me/${CONTACT.whatsapp}?text=${encodeURIComponent("Hi Chenethakart, I need help with…")}`} target="_blank" rel="noopener noreferrer" className="card flex items-center gap-4 p-5 transition hover:-translate-y-0.5 hover:shadow-lift">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-forest-light text-forest"><MessageCircle className="h-6 w-6" aria-hidden /></span>
            <span><span className="block font-semibold">WhatsApp support</span><span className="text-sm text-brown-soft">{CONTACT.whatsappDisplay}</span></span>
          </a>
          <div className="card flex items-center gap-4 p-5">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-beige text-brown"><Clock className="h-6 w-6" aria-hidden /></span>
            <span><span className="block font-semibold">Support hours</span><span className="text-sm text-brown-soft">{CONTACT.hours}</span></span>
          </div>
          <p className="text-xs text-brown-soft">Contact details shown are placeholders for this demo.</p>
        </aside>
      </section>

      <section id="shipping" className="scroll-mt-28 pt-16" aria-labelledby="ship-t">
        <h2 id="ship-t" className="flex items-center gap-3 text-2xl font-semibold md:text-3xl"><Truck className="h-7 w-7 text-terracotta" aria-hidden /> Shipping & delivery</h2>
        <div className="mt-5 grid gap-5 md:grid-cols-3">
          {[
            ["Standard delivery", "5–7 business days. Free on orders of ₹999 and above, otherwise ₹60."],
            ["Express delivery", "2–3 business days for a flat ₹149."],
            ["Before it ships", "Each order is quality checked and packed in Chenethakart packaging, so dispatch may take 1–2 business days."],
          ].map(([t, d]) => <div key={t} className="card p-5"><h3 className="font-sans text-base font-semibold text-brown">{t}</h3><p className="mt-2 text-sm leading-relaxed text-brown-soft">{d}</p></div>)}
        </div>
        <p className="mt-4 text-sm text-brown-soft">You can follow an order from your account, or with your order number on the <a className="font-medium text-terracotta underline" href="/track">Track an order</a> page.</p>
      </section>

      <section id="returns" className="scroll-mt-28 pt-16" aria-labelledby="ret-t">
        <h2 id="ret-t" className="flex items-center gap-3 text-2xl font-semibold md:text-3xl"><RotateCcw className="h-7 w-7 text-terracotta" aria-hidden /> Returns & refunds</h2>
        <ul className="mt-5 list-disc space-y-2 pl-6 text-brown-soft">
          <li>Request a return within <strong className="text-brown">7 days of delivery</strong> if the item is unused and in its original packaging.</li>
          <li>Items damaged in transit, or not as described, are replaced or fully refunded — share a photo within 48 hours of delivery.</li>
          <li>Refunds go back to your original payment method within 5–7 business days of us receiving the item. Cash on delivery refunds are made by bank transfer.</li>
          <li>Because each piece is handmade, small differences in size, colour and stitch are natural and are not a reason for return.</li>
        </ul>
      </section>

      <section id="faq" className="scroll-mt-28 pt-16" aria-labelledby="faq-t">
        <h2 id="faq-t" className="text-2xl font-semibold md:text-3xl">Frequently asked questions</h2>
        <div className="mt-5 divide-y divide-beige rounded-2xl border border-beige bg-white">
          {FAQS.map((f) => (
            <details key={f.q} className="group px-5 py-4">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-medium">
                {f.q}
                <span className="text-xl text-terracotta transition group-open:rotate-45" aria-hidden>+</span>
              </summary>
              <p className="mt-3 leading-relaxed text-brown-soft">{f.a}</p>
            </details>
          ))}
        </div>
      </section>
    </div>
  );
}
