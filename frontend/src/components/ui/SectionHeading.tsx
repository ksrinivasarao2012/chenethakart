import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/format";

interface Props {
  title: string;
  eyebrow?: string;
  subtitle?: string;
  href?: string;
  linkLabel?: string;
  align?: "left" | "center";
  className?: string;
}

export default function SectionHeading({ title, eyebrow, subtitle, href, linkLabel = "See All", align = "left", className }: Props) {
  return (
    <div className={cn("mb-8 flex items-end justify-between gap-4", align === "center" && "flex-col items-center text-center", className)}>
      <div className={cn(align === "center" && "mx-auto max-w-2xl")}>
        {eyebrow && <p className="eyebrow mb-2">{eyebrow}</p>}
        <h2 className="text-2xl font-semibold sm:text-3xl md:text-4xl">{title}</h2>
        {subtitle && <p className="mt-2 max-w-2xl text-brown-soft">{subtitle}</p>}
      </div>
      {href && (
        <Link href={href} className="inline-flex shrink-0 items-center gap-1 text-sm font-medium text-terracotta hover:underline">
          {linkLabel} <ArrowRight className="h-4 w-4" aria-hidden />
        </Link>
      )}
    </div>
  );
}
