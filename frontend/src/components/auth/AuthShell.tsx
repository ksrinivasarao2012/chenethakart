import Image from "next/image";

export default function AuthShell({ title, subtitle, children, footer }: { title: string; subtitle: string; children: React.ReactNode; footer: React.ReactNode }) {
  return (
    <div className="container-page py-8 md:py-16">
      <div className="mx-auto grid max-w-5xl overflow-hidden rounded-3xl border border-beige bg-white shadow-soft md:grid-cols-2">
        <div className="relative hidden bg-beige md:block">
          <Image src="/images/products/bunny-1.jpg" alt="" fill sizes="480px" className="object-cover" priority />
          <div className="absolute inset-0 bg-gradient-to-t from-forest/80 via-transparent to-transparent" aria-hidden />
          <p className="absolute bottom-8 left-8 right-8 font-serif text-2xl leading-snug text-white">Handmade Stories, Brighter Tomorrows.</p>
        </div>
        <div className="p-6 sm:p-10">
          <h1 className="text-3xl font-semibold">{title}</h1>
          <p className="mt-2 text-brown-soft">{subtitle}</p>
          <div className="mt-8">{children}</div>
          <div className="mt-6 text-center text-sm text-brown-soft">{footer}</div>
        </div>
      </div>
    </div>
  );
}
