import { notFound, redirect } from "next/navigation";
import { CATEGORY_LIST } from "@/lib/constants";

export default async function CategoryRedirect({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (!CATEGORY_LIST.some((c) => c.slug === slug)) notFound();
  redirect(`/shop?category=${slug}`);
}
