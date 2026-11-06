import Image from "next/image";
import Link from "next/link";
import type { Category } from "@/lib/types";

export default function CategoryTiles({ categories }: { categories: Category[] }) {
  return (
    <ul className="grid grid-cols-3 gap-x-4 gap-y-8 sm:grid-cols-3 md:grid-cols-6">
      {categories.map((c) => (
        <li key={c.slug}>
          <Link href={`/shop?category=${c.slug}`} className="group flex flex-col items-center text-center">
            <span className="relative h-24 w-24 overflow-hidden rounded-full bg-beige shadow-soft ring-2 ring-transparent transition duration-300 group-hover:-translate-y-1 group-hover:ring-terracotta sm:h-28 sm:w-28">
              <Image src={c.image} alt="" fill sizes="112px" className="object-cover" />
            </span>
            <span className="mt-3 text-sm font-medium leading-tight">{c.name}</span>
            <span className="mt-0.5 text-xs text-brown-soft">{c.count} item{c.count === 1 ? "" : "s"}</span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
