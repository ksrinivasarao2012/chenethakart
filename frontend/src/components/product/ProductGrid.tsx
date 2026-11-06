import type { Product } from "@/lib/types";
import { cn } from "@/lib/format";
import ProductCard from "./ProductCard";

export default function ProductGrid({ products, className, columns = 4 }: { products: Product[]; className?: string; columns?: 3 | 4 }) {
  return (
    <div
      className={cn(
        "grid grid-cols-2 gap-x-4 gap-y-8 sm:gap-x-6 md:grid-cols-3",
        columns === 4 && "xl:grid-cols-4",
        className,
      )}
    >
      {products.map((p, i) => (
        <ProductCard key={p.id} product={p} priority={i < 4} />
      ))}
    </div>
  );
}
