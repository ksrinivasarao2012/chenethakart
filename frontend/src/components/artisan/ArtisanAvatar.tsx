import Image from "next/image";
import { cn, initials } from "@/lib/format";

const TONES = ["bg-terracotta text-white", "bg-forest text-white", "bg-sage text-forest", "bg-beige-dark text-brown"];

export default function ArtisanAvatar({
  name,
  src,
  className,
  sizes = "160px",
}: {
  name: string;
  src: string | null;
  className?: string;
  sizes?: string;
}) {
  const tone = TONES[name.length % TONES.length];
  return (
    <div className={cn("relative shrink-0 overflow-hidden rounded-full", !src && tone, className)}>
      {src ? (
        <Image src={src} alt={`Portrait of ${name}`} fill sizes={sizes} className="object-cover" />
      ) : (
        <span aria-hidden className="flex h-full w-full items-center justify-center font-serif text-[2.2em] font-semibold">
          {initials(name)}
        </span>
      )}
    </div>
  );
}
