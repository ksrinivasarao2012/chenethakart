import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ErrorNotice } from "@/components/ui/States";
import { api } from "@/lib/api";
import type { Category } from "@/lib/types";

export const metadata: Metadata = { title: "Categories" };
export const dynamic = "force-dynamic";

export default async function CategoriesPage() {
  let categories: Category[];
  try {
    categories = await api<Category[]>("/categories");
  } catch {
    return <div className="container-page py-20"><ErrorNotice message="We couldn't load categories right now." /></div>;
  }
  return (
    <div className="container-page py-10 md:py-16">
      <p className="eyebrow mb-2">Browse</p>
      <h1 className="text-3xl font-semibold md:text-5xl">Shop by Category</h1>
      <ul className="mt-10 grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3">
        {categories.map((c) => (
          <li key={c.slug}>
            <Link href={`/shop?category=${c.slug}`} className="group relative block aspect-[4/3] overflow-hidden rounded-3xl bg-beige shadow-soft">
              <Image src={c.image} alt="" fill sizes="(min-width:768px) 33vw, 50vw" className="object-cover transition duration-500 group-hover:scale-105" />
              <span className="absolute inset-0 bg-gradient-to-t from-brown/70 via-transparent to-transparent" aria-hidden />
              <span className="absolute bottom-4 left-4 right-4 text-white">
                <span className="block font-serif text-xl font-semibold sm:text-2xl">{c.name}</span>
                <span className="text-sm text-white/85">{c.count} item{c.count === 1 ? "" : "s"}</span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
