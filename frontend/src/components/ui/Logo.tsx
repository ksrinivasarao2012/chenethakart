import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/format";

export default function Logo({ className, compact = false, light = false }: { className?: string; compact?: boolean; light?: boolean }) {
  return (
    <Link href="/" className={cn("flex items-center gap-2.5", className)} aria-label="Chenethakart — home">
      <Image src="/logo-mark.svg" alt="" width={36} height={42} className="h-9 w-auto sm:h-10" priority />
      <span className="flex flex-col leading-none">
        <span className={cn("font-serif text-[1.55rem] font-semibold tracking-tight sm:text-[1.7rem]", light ? "text-ivory" : "text-terracotta")}>
          Chenethakart
        </span>
        {!compact && (
          <span className={cn("mt-1 hidden whitespace-nowrap text-[0.62rem] sm:block", light ? "text-ivory/80" : "text-brown")}>
            Handmade Stories, Brighter Tomorrows.
          </span>
        )}
      </span>
    </Link>
  );
}
