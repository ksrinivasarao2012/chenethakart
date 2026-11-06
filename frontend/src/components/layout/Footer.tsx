import Link from "next/link";
import { Mail, MessageCircle } from "lucide-react";
import { BRAND, CATEGORY_LIST, CONTACT } from "@/lib/constants";
import Logo from "../ui/Logo";

const col = "space-y-2.5 text-sm text-ivory/80";
const link = "hover:text-white hover:underline underline-offset-4";

export default function Footer() {
  return (
    <footer className="mt-12 bg-forest pb-24 text-ivory md:mt-20 md:pb-0">
      <div className="container-page grid gap-10 py-14 md:grid-cols-2 lg:grid-cols-5">
        <div className="lg:col-span-2">
          <Logo light />
          <p className="mt-5 max-w-sm text-sm leading-relaxed text-ivory/80">
            {BRAND.tagline} Chenethakart brings quality-checked crochet and handloom crafts from independent Indian artisans to your home,
            and helps them earn a sustainable income.
          </p>
          <ul className="mt-6 space-y-2 text-sm text-ivory/80">
            <li>
              <a href={`mailto:${CONTACT.email}`} className={`inline-flex items-center gap-2 ${link}`}>
                <Mail className="h-4 w-4" aria-hidden /> {CONTACT.email}
              </a>
            </li>
            <li>
              <a href={`https://wa.me/${CONTACT.whatsapp}`} target="_blank" rel="noopener noreferrer" className={`inline-flex items-center gap-2 ${link}`}>
                <MessageCircle className="h-4 w-4" aria-hidden /> WhatsApp {CONTACT.whatsappDisplay}
              </a>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="mb-4 font-serif text-lg text-white">Shop</h3>
          <ul className={col}>
            {CATEGORY_LIST.map((c) => (
              <li key={c.slug}>
                <Link href={`/shop?category=${c.slug}`} className={link}>{c.name}</Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="mb-4 font-serif text-lg text-white">Company</h3>
          <ul className={col}>
            <li><Link href="/about" className={link}>Our Story</Link></li>
            <li><Link href="/artisans" className={link}>Our Artisans</Link></li>
            <li><Link href="/quality" className={link}>Quality Promise</Link></li>
            <li><Link href="/support" className={link}>Contact Us</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="mb-4 font-serif text-lg text-white">Help</h3>
          <ul className={col}>
            <li><Link href="/track" className={link}>Track an order</Link></li>
            <li><Link href="/support#shipping" className={link}>Shipping & delivery</Link></li>
            <li><Link href="/support#returns" className={link}>Returns & refunds</Link></li>
            <li><Link href="/support#faq" className={link}>FAQs</Link></li>
            <li><Link href="/account" className={link}>My account</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-ivory/15">
        <div className="container-page flex flex-col items-center justify-between gap-2 py-5 text-xs text-ivory/70 sm:flex-row">
          <p>© {new Date().getFullYear()} Chenethakart. Made with care in India.</p>
          <p>Demo store: payments and artisan profiles are simulated sample data.</p>
        </div>
      </div>
    </footer>
  );
}
